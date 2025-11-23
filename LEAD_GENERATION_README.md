# 📧 Lead Generation System - MVP Documentation

Kompletní lead generation systém pro Weblyx. Umožňuje import leadů, analýzu webů, generování personalizovaných emailů pomocí GPT a tracking kliknutí.

## 🎯 Co systém dělá?

### 1. **CSV Import Leadů**
- Importujte leady z CSV souboru
- Automatická validace emailů
- Šablona CSV ke stažení

### 2. **Web Analýza**
- Automatická analýza webu každého leadu
- Používá váš existující Web Analyzer
- SEO skóre, load time, mobilní responzivita
- Identifikace problémů (critical, warning, info)

### 3. **GPT Email Generátor**
- Personalizované emaily pomocí Google Gemini API
- Emaily generované na základě výsledků analýzy
- Automatické tracking linky

### 4. **Manuální Odesílání**
- Emaily připravené k manuálnímu odeslání přes Titan
- Žádné automatické odesílání = žádný spam risk
- Kontrola každého emailu před odesláním

### 5. **Tracking Systém**
- Tracking linky ve formátu `https://weblyx.cz/t/ABC123`
- Automatické zaznamenávání kliknutí
- Update lead statusu při interakci

### 6. **Dashboard & Statistiky**
- Přehled všech leadů
- Email open rate, click rate, conversion rate
- Rozdělení leadů podle statusu

---

## 📁 Struktura Projektu

```
/Users/zen/weblyx/
├── scripts/
│   └── migrate-lead-generation.ts         # Databázová migrace
├── types/
│   └── lead-generation.ts                  # TypeScript types
├── lib/
│   ├── turso/
│   │   └── lead-generation.ts              # CRUD funkce pro Turso
│   ├── csv-import.ts                       # CSV import/export
│   ├── email-generator.ts                  # GPT email generátor
│   └── web-analyzer.ts                     # Web analýza (existující)
├── app/
│   ├── api/
│   │   └── lead-generation/
│   │       ├── route.ts                    # GET/POST leads
│   │       ├── import/route.ts             # CSV import
│   │       ├── analyze/route.ts            # Web analýza
│   │       ├── generate-email/route.ts     # Email generátor
│   │       └── stats/route.ts              # Statistiky
│   ├── t/
│   │   └── [code]/route.ts                 # Tracking redirect
│   └── admin/
│       └── lead-generation/
│           ├── page.tsx                    # Admin panel
│           └── stats/page.tsx              # Statistiky dashboard
```

---

## 🗄️ Databázové Schéma

### **leads** (hlavní tabulka)
```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  phone TEXT,
  contact_person TEXT,

  -- Web analysis data
  analysis_score INTEGER DEFAULT 0,
  analysis_result TEXT,  -- JSON
  analyzed_at INTEGER,

  -- Lead scoring (0-100)
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT DEFAULT 'new',  -- new, contacted, interested, converted, rejected

  -- Email tracking
  email_sent INTEGER DEFAULT 0,
  email_sent_at INTEGER,
  email_opened INTEGER DEFAULT 0,
  email_opened_at INTEGER,
  link_clicked INTEGER DEFAULT 0,
  link_clicked_at INTEGER,

  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### **campaigns** (kampaně)
```sql
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',  -- draft, active, paused, completed

  -- Stats
  total_leads INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  links_clicked INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  started_at INTEGER,
  completed_at INTEGER
);
```

### **generated_emails** (vygenerované emaily)
```sql
CREATE TABLE generated_emails (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  campaign_id TEXT,

  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  tracking_code TEXT UNIQUE NOT NULL,

  sent INTEGER DEFAULT 0,
  sent_at INTEGER,
  opened INTEGER DEFAULT 0,
  opened_at INTEGER,
  clicked INTEGER DEFAULT 0,
  clicked_at INTEGER,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);
```

### **tracking_events** (tracking události)
```sql
CREATE TABLE tracking_events (
  id TEXT PRIMARY KEY,
  tracking_code TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- click, open, convert

  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  country TEXT,
  city TEXT,

  created_at INTEGER NOT NULL,

  FOREIGN KEY (tracking_code) REFERENCES generated_emails(tracking_code) ON DELETE CASCADE
);
```

---

## 🚀 Jak Používat Systém

### 1. **Inicializace Databáze**

```bash
cd /Users/zen/weblyx
chmod +x scripts/migrate-lead-generation.ts

# Spustit migraci
TURSO_DATABASE_URL="libsql://weblyx-jevgone.aws-ap-south-1.turso.io" \
TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4OTY1NjksImlkIjoiNjQ0NDNiODktZTBmOC00NTUxLWFiNTItNDhkYTg4ZDIwMTcwIiwicmlkIjoiNTgyYjlkM2QtYjUxYS00NGE0LTgyZGYtMmEwY2I2OTM5N2NkIn0.U_aC0zZdrsTf3y3vz34C880xN_jVM3Mzo6qkKtmdZWqBb8Hsfho_O52rCVyTLZrHJQ2nxnuwWSZoxy7Am7poBw" \
npx tsx scripts/migrate-lead-generation.ts
```

### 2. **Příprava CSV Souboru**

Vytvořte CSV soubor s následující strukturou:

```csv
company_name,email,website,industry,phone,contact_person
"Pekárna U Karla",info@pekarnakarla.cz,www.pekarnakarla.cz,"Potraviny","+420 123 456 789","Karel Novák"
"Autoservis Brno",kontakt@autoservisbrno.cz,autoservisbrno.cz,"Automotive","+420 987 654 321","Jan Dvořák"
```

**Povinné sloupce:**
- `company_name`
- `email`

**Volitelné sloupce:**
- `website`
- `industry`
- `phone`
- `contact_person`

### 3. **Import Leadů**

1. Přihlaste se do admin panelu: `http://localhost:3007/admin/lead-generation`
2. Klikněte na tlačítko **"Importovat CSV"**
3. Vyberte váš CSV soubor
4. Systém importuje leady a zobrazí výsledky

### 4. **Analýza Webů**

Pro každý lead s URL:

1. Klikněte na tlačítko **"Analyzovat"**
2. Systém použije Web Analyzer
3. Vytvoří SEO analýzu a identifikuje problémy
4. Přiřadí lead score (čím nižší analýza skóre, tím vyšší lead score)

### 5. **Generování Emailů**

Po analýze můžete generovat email:

1. Klikněte na tlačítko **"Generovat email"**
2. Systém použije Google Gemini API
3. Vytvoří personalizovaný email na základě analýzy
4. Email se uloží do databáze s tracking kódem

### 6. **Manuální Odesílání**

Email je připravený k manuálnímu odeslání:

```
Subject: <vygenerovaný předmět>

Body:
Dobrý den,

<personalizovaný obsah na základě analýzy>

Klikněte sem pro více informací: https://weblyx.cz/t/ABC123

S pozdravem,
Tým Weblyx
```

**Postup:**
1. Otevřete Titan email (Gmail/Outlook interface)
2. Zkopírujte email obsah z admin panelu
3. Vložte do Titan
4. Odešlete ručně

### 7. **Tracking**

Když klient klikne na link `https://weblyx.cz/t/ABC123`:

1. Systém zaznamená kliknutí
2. Updatne email stats (`clicked = true`)
3. Updatne lead status na `interested`
4. Přesměruje na `/poptavka`
5. Uloží tracking event (IP, user-agent, referer)

---

## 📊 API Endpointy

### **GET /api/lead-generation**
Vrátí všechny leady.

**Response:**
```json
{
  "success": true,
  "leads": [...],
  "total": 42
}
```

### **POST /api/lead-generation**
Vytvoří nový lead.

**Body:**
```json
{
  "companyName": "Pekárna U Karla",
  "email": "info@pekarnakarla.cz",
  "website": "www.pekarnakarla.cz",
  "industry": "Potraviny",
  "phone": "+420 123 456 789",
  "contactPerson": "Karel Novák"
}
```

### **POST /api/lead-generation/import**
Importuje leady z CSV.

**Body:**
```json
{
  "csvContent": "company_name,email,website\n..."
}
```

**Response:**
```json
{
  "success": true,
  "imported": 10,
  "failed": 2,
  "errors": ["..."],
  "leads": [...]
}
```

### **POST /api/lead-generation/analyze**
Analyzuje web leadu.

**Body:**
```json
{
  "leadId": "lead_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "lead": {...},
  "analysisResult": {
    "overallScore": 45,
    "technical": {...},
    "issues": [...]
  }
}
```

### **POST /api/lead-generation/generate-email**
Vygeneruje email pro lead.

**Body:**
```json
{
  "leadId": "lead_1234567890_abc123",
  "campaignId": "campaign_xxx" // optional
}
```

**Response:**
```json
{
  "success": true,
  "email": {
    "id": "email_xxx",
    "subject": "...",
    "body": "...",
    "trackingCode": "ABC123"
  },
  "confidence": 85
}
```

### **GET /api/lead-generation/stats**
Vrátí statistiky.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalLeads": 42,
    "analyzedLeads": 30,
    "contactedLeads": 20,
    "convertedLeads": 5,
    "averageAnalysisScore": 65,
    "averageLeadScore": 35,
    "emailOpenRate": 45,
    "linkClickRate": 20,
    "conversionRate": 10,
    "leadsByStatus": {
      "new": 10,
      "contacted": 15,
      "interested": 12,
      "converted": 5,
      "rejected": 0
    }
  }
}
```

### **GET /t/[code]**
Tracking redirect.

**Příklad:** `https://weblyx.cz/t/ABC123`

**Co se stane:**
1. Zaznamená click event
2. Updatne email & lead stats
3. Přesměruje na `/poptavka?ref=abc123`

---

## 🔑 Environment Variables

Ujistěte se, že máte tyto environment variables v `.env.local`:

```bash
# Google Gemini API (pro email generátor)
GOOGLE_API_KEY=AIzaSyAUKemEjooWExY-em3ygdg8JWq-BN82XQ4

# Turso Database
TURSO_DATABASE_URL=libsql://weblyx-jevgone.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

---

## 📈 Workflow

```
1. CSV Import
   ↓
2. Lead created (status: new)
   ↓
3. Analyze website
   ↓
4. Lead updated (analysis_score, lead_score, analyzed_at)
   ↓
5. Generate email (GPT)
   ↓
6. Email saved with tracking code
   ↓
7. Manual send via Titan
   ↓
8. Client clicks tracking link
   ↓
9. Tracking event recorded
   ↓
10. Lead status updated (interested)
   ↓
11. Client fills out form
   ↓
12. Lead status updated (converted)
```

---

## 🎨 Admin Panel Přístup

1. Přihlaste se do admin panelu: `http://localhost:3007/admin`
2. Navigujte na: **Lead Generation**
3. URL: `http://localhost:3007/admin/lead-generation`

### Funkce admin panelu:
- ✅ Import CSV leadů
- ✅ Stažení CSV šablony
- ✅ Přehled všech leadů
- ✅ Analýza webů (tlačítko "Analyzovat")
- ✅ Generování emailů (tlačítko "Generovat email")
- ✅ Zobrazení lead skóre a statusu
- ✅ Link na statistiky

### Statistiky dashboard:
URL: `http://localhost:3007/admin/lead-generation/stats`

- 📊 Celkový počet leadů
- 📊 Email open rate
- 📊 Click rate
- 📊 Conversion rate
- 📊 Rozdělení leadů podle statusu
- 📊 Průměrná skóre (analýza, lead)
- 📊 Aktivní/dokončené kampaně

---

## 🚨 Důležité Poznámky

### 1. **Žádné Automatické Odesílání**
- ❌ Systém **NEODESÍLÁ** emaily automaticky
- ✅ Všechny emaily jsou připravené k **manuálnímu odeslání**
- ✅ Žádný spam risk, žádné problémy s deliverability

### 2. **Titan Email Integration**
- Používejte Titan webmail nebo Outlook/Gmail desktop klienty
- Copy-paste vygenerovaný email
- Tracking link funguje stejně jako při automatickém odesílání

### 3. **Google API Limity**
- Gemini API má free tier limit
- Pokud překročíte limit, použije se fallback email template

### 4. **Lead Scoring Logic**
```
Lead Score = 100 - Analysis Score

Příklad:
- Analysis Score: 30/100 (hodně problémů) → Lead Score: 70/100 (vysoký potenciál)
- Analysis Score: 90/100 (málo problémů) → Lead Score: 10/100 (nízký potenciál)
```

---

## 🔧 Troubleshooting

### **Import CSV selhává**
- Zkontrolujte, že CSV má správný formát
- Ověřte, že má header řádek
- Ujistěte se, že `company_name` a `email` jsou vyplněné

### **Web analýza selhává**
- Zkontrolujte, že lead má platnou URL (`website` pole)
- Ujistěte se, že web je dostupný (není za firewallem)
- Timeouty: Web Analyzer má 10s timeout

### **Email generování selhává**
- Zkontrolujte `GOOGLE_API_KEY` v `.env.local`
- Ověřte, že lead má analýzu (`analyzedAt` a `analysisResult`)
- Pokud API limit překročen, použije se fallback template

### **Tracking nefunguje**
- Zkontrolujte, že tracking kód je unikátní
- Ověřte, že route `/t/[code]/route.ts` existuje
- Zkontrolujte Turso connection

---

## 🎉 Co Dál?

### Možná rozšíření (mimo MVP):
1. **Email Templates** - Vlastní šablony emailů
2. **Bulk Operations** - Hromadná analýza/generování
3. **Campaign Management** - Plnohodnotné kampaně s více leady
4. **Email Warming** - Postupné navyšování objemu
5. **A/B Testing** - Testování různých subject lines
6. **Integration s Titan API** - Pokud existuje
7. **Automatické follow-upy** - Reminder systém

---

**Vytvořeno:** 2025-11-23
**Verze:** MVP 1.0
**Čas vytvoření:** 3-5 hodin

---

## 📞 Support

Pokud narazíte na problém, zkontrolujte:
1. Turso databáze je správně nastavená
2. Environment variables jsou načtené
3. Dev server běží (`npm run dev`)
4. Admin autentizace funguje

**Kontakt:** admin@weblyx.cz
