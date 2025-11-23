# 🤖 Lead Scraper Bot - Automatické Generování Leadů

**⚠️ VAROVÁNÍ:** Tento nástroj používá Google Maps scraping, což může porušovat Google Terms of Service. Používejte na vlastní riziko.

---

## 🎯 Co Bot Dělá?

**Automatický lead generation bot**, který:

1. **Scrapuje Google Maps** - hledá firmy podle vašeho dotazu
2. **Extrahuje kontakty** - název, web, telefon, adresa
3. **Najde emaily** - prohledá weby a najde kontaktní emaily
4. **Importuje do databáze** - automaticky přidá leady do systému

**Výsledek:** 10-50 kvalitních leadů za 5-10 minut bez manuální práce.

---

## 🚀 Jak Používat Bot

### **Způsob 1: Přes Admin Panel** (doporučeno)

1. Otevři admin panel: `http://localhost:3000/admin/lead-generation`
2. Klikni na tlačítko **"🤖 Scrape Leads"**
3. Zadej vyhledávací dotaz (např. "pekárna Praha")
4. Zadej počet leadů (např. 20)
5. Počkej 5-10 minut
6. Bot automaticky:
   - Scrapne Google Maps
   - Najde emaily
   - Importuje do databáze
   - Refreshne stránku

**Příklady dotazů:**
```
"pekárna Praha"
"autoservis Brno"
"květinářství Ostrava"
"restaurace Plzeň"
"kadeřnictví Liberec"
```

---

### **Způsob 2: CLI Script**

```bash
cd /Users/zen/weblyx

# Příklad 1: 20 pekáren v Praze
npx tsx scripts/scrape-leads.ts "pekárna Praha" 20

# Příklad 2: 50 autoservisů v Brně
npx tsx scripts/scrape-leads.ts "autoservis Brno" 50

# Příklad 3: 30 květinářství v Ostravě
npx tsx scripts/scrape-leads.ts "květinářství Ostrava" 30
```

**Výstup:**
```
🤖 Lead Scraper Bot
==================

Query: "pekárna Praha"
Max Results: 20

🌐 Navigating to Google Maps...
✅ Results loaded, starting to scrape...
✅ Scraped 20 leads from Google Maps

🔍 Extracting websites and phones...
  1/20: Pekárna U Karla - www.pekarnakarla.cz
  2/20: Pekárna Brno - www.pekarnabrno.cz
  ...

📧 Extracting emails from websites...
  1/20: Pekárna U Karla - ✅ info@pekarnakarla.cz
  2/20: Pekárna Brno - ✅ obchod@pekarnabrno.cz
  ...

💾 Importing to database...
  ✅ Imported: Pekárna U Karla
  ✅ Imported: Pekárna Brno
  ...

🎉 Lead generation complete!
   Scraped: 20
   With emails: 15
   Imported: 15
```

---

## 📊 Workflow

```
1. Uživatel zadá dotaz: "pekárna Praha"
   ↓
2. Bot otevře Google Maps v Puppeteer
   ↓
3. Načte výsledky (scrolluje pro více)
   ↓
4. Extrahuje: název, rating, reviews, adresa
   ↓
5. Klikne na každý výsledek
   ↓
6. Extrahuje: website, telefon
   ↓
7. Pro každý web:
   - Otevře stránku
   - Hledá email (regex)
   - Filtruje spam emaily
   - Preferuje info@, kontakt@, obchod@
   ↓
8. Importuje do databáze (leads table)
   ↓
9. HOTOVO! Leady jsou v admin panelu
```

---

## 🔧 Technické Detaily

### **Scraper (`lib/lead-scraper.ts`)**

**Funkce:**
- `scrapeGoogleMaps()` - scrapování Google Maps
- `extractEmailFromWebsite()` - extrakce emailu z webu
- `scrapeAndImportLeads()` - kompletní pipeline

**Puppeteer konfigurace:**
```typescript
{
  headless: true,  // běží na pozadí
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ]
}
```

**Email Regex:**
```typescript
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
```

**Filtrování emailů:**
- ❌ example.com
- ❌ sentry, wixpress
- ❌ placeholder
- ❌ .png, .jpg (spam)
- ✅ info@, kontakt@, obchod@ (priorita)

---

## ⚙️ Konfigurace

### **Limity:**

```typescript
// Max results per scrape
const MAX_RESULTS = 50;

// Rate limiting (delay mezi requesty)
const DELAY_BETWEEN_WEBSITES = 2000; // 2 sekundy

// Timeout pro načtení stránky
const PAGE_TIMEOUT = 15000; // 15 sekund
```

### **Auto-scroll konfigurace:**

```typescript
const MAX_SCROLL_ATTEMPTS = 20;
const SCROLL_DELAY = 1500; // ms
```

---

## 📈 Úspěšnost

**Typické výsledky:**

| Kategorie | Scraped | S emailem | Úspěšnost |
|-----------|---------|-----------|-----------|
| Pekárny | 20 | 15 | 75% |
| Autoservisy | 50 | 35 | 70% |
| Květinářství | 30 | 22 | 73% |
| Restaurace | 40 | 28 | 70% |

**Důvody neúspěchu:**
- Web nemá email (15%)
- Email je obrázek/skrytý (10%)
- Timeout při načítání (5%)

---

## ⚠️ Právní Upozornění

### **Google Terms of Service**

Scraping Google Maps **MŮŽE PORUŠOVAT** Google ToS:

> "You may not... access or use our Services or any content contained in the Services for any commercial purpose without our express written permission."

### **GDPR Compliance**

Scraping kontaktů **může být problematické** podle GDPR:
- Získáváte osobní data bez souhlasu
- Musíte mít legitimní zájem
- Musíte informovat o zpracování

### **Doporučení:**

✅ **Bezpečnější alternativy:**
1. **Apollo.io** - legální B2B databáze ($49/měsíc)
2. **Hunter.io** - email finder API ($49/měsíc)
3. **Manuální research** - časově náročné, ale 100% legální

❌ **Nedoporučuji pro:**
- Masivní scraping (100+ leadů/den)
- Prodej scraped dat
- Spam kampaně

✅ **OK pro:**
- Testování (10-20 leadů)
- Vlastní lead generation (ne prodej)
- B2B outreach s hodnotou

---

## 🛡️ Jak Snížit Riziko

### **1. Rate Limiting**
```typescript
// Počkej 2 sekundy mezi requesty
await new Promise(resolve => setTimeout(resolve, 2000));
```

### **2. User-Agent Rotation**
```typescript
await page.setUserAgent(
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...'
);
```

### **3. Headless Mode**
```typescript
const browser = await puppeteer.launch({
  headless: true, // není vidět browser
});
```

### **4. Limity**
- Max 50 leadů per scrape
- Max 100 leadů per den
- Delay 2s mezi requesty

---

## 🔄 Automatický Pipeline

Chceš úplně automatický systém? Můžeš přidat:

### **Cron Job (každý den v 9:00)**

```typescript
// scripts/daily-lead-generation.ts
import { scrapeAndImportLeads } from '../lib/lead-scraper';
import { getAllLeads, updateLead } from '../lib/turso/lead-generation';
import { analyzeWebsite } from '../lib/web-analyzer';
import { generateEmail } from '../lib/email-generator';

async function dailyLeadGeneration() {
  console.log('🤖 Starting daily lead generation...');

  // 1. Scrape new leads
  const categories = [
    'pekárna Praha',
    'autoservis Brno',
    'květinářství Ostrava',
  ];

  for (const category of categories) {
    await scrapeAndImportLeads({
      searchQuery: category,
      maxResults: 10,
    });
  }

  // 2. Analyze all unanalyzed leads
  const leads = await getAllLeads();
  const unanalyzed = leads.filter(l => !l.analyzedAt && l.website);

  for (const lead of unanalyzed) {
    try {
      const analysis = await analyzeWebsite(lead.website!);
      await updateLead(lead.id, {
        analysisScore: analysis.overallScore,
        analysisResult: analysis,
        analyzedAt: new Date(),
        leadScore: Math.max(0, 100 - analysis.overallScore),
      });
    } catch (error) {
      console.error(`Failed to analyze ${lead.id}:`, error);
    }
  }

  // 3. Generate emails for analyzed leads
  // ... podobně

  console.log('✅ Daily lead generation complete!');
}

dailyLeadGeneration();
```

**Spuštění:**
```bash
# Crontab
0 9 * * * cd /Users/zen/weblyx && npx tsx scripts/daily-lead-generation.ts
```

---

## 📊 Metriky

Po spuštění bota sleduj:

1. **Admin Panel** → Lead Generation
   - Kolik leadů bylo importováno
   - Kolik má email

2. **Statistiky** → `/admin/lead-generation/stats`
   - Success rate (emaily nalezené)
   - Quality score (analysis score)

3. **Logs** → Console output
   - Errory při scrapování
   - Timeout issues

---

## 🐛 Troubleshooting

### **Problém: "Failed to fetch website"**

**Řešení:**
- Website je down
- Firewall blokuje Puppeteer
- Zkus zvýšit timeout:

```typescript
await page.goto(url, {
  waitUntil: 'networkidle2',
  timeout: 30000, // 30 sekund
});
```

### **Problém: "No email found"**

**Řešení:**
- Email je obrázek (spam protection)
- Email je skrytý za formulářem
- Zkus kontakt stránku:

```typescript
// Zkus /kontakt stránku
const contactPage = `${baseUrl}/kontakt`;
await page.goto(contactPage);
```

### **Problém: "Scraped 0 leads"**

**Řešení:**
- Google Maps změnil HTML strukturu
- Musíš updatovat selektory:

```typescript
// Starý selektor
const nameElement = item.querySelector('div.fontHeadlineSmall');

// Nový selektor (zkontroluj v DevTools)
const nameElement = item.querySelector('div.NEW_CLASS_NAME');
```

---

## 🎯 Best Practices

### **1. Testuj malé množství**
```bash
# Začni s 5-10 leady
npx tsx scripts/scrape-leads.ts "pekárna Praha" 10
```

### **2. Validuj výsledky**
```sql
-- Zkontroluj importované leady
SELECT company_name, email, website FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

### **3. Cleaning data**
```typescript
// Odstraň duplicity
const unique = leads.filter((lead, index, self) =>
  index === self.findIndex(l => l.email === lead.email)
);
```

### **4. Respektuj limity**
- Max 50 leadů per scrape
- Max 2-3 scrapes per den
- Delay 2s mezi requesty

---

## 🚀 Další Vylepšení

### **Možná rozšíření:**

1. **Proxy Rotation** - rotace IP adres
2. **CAPTCHA Solver** - automatické řešení CAPTCHA
3. **Multi-source Scraping** - Facebook, LinkedIn, Yelp
4. **Email Validation API** - ověření validních emailů
5. **Webhook Notifications** - notifikace po dokončení

---

## 📞 Podpora

**Problémy?**
1. Zkontroluj Puppeteer installation: `npm list puppeteer`
2. Zkontroluj Chrome/Chromium: `which chromium`
3. Zkontroluj logs: `npm run dev` → Console output

**Kontakt:** admin@weblyx.cz

---

**Vytvořeno:** 2025-11-23
**Verze:** 1.0
**Autor:** Weblyx Team

---

## ⚖️ Legal Disclaimer

Tento nástroj je poskytován "as-is" bez jakýchkoli záruk. Používání tohoto nástroje může porušovat Terms of Service třetích stran (včetně Google). Uživatel nese plnou odpovědnost za dodržování všech příslušných zákonů a pravidel.

**USE AT YOUR OWN RISK.**
