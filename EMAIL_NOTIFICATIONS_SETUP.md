# 📧 Email Notifications & AI Proposals - Setup Guide

## 🎯 Overview

Automatický systém notifikací a AI návrhů pro nové poptávky:

```
1. Nová poptávka → Firestore
   ↓
2. ⚡ OKAMŽITÁ admin notifikace (email)
   ↓
3. 🤖 AI generation na pozadí (Design + Brief)
   ↓
4. 📧 Automatický email klientovi s AI návrhy
```

---

## 🔧 Setup

### 1️⃣ Získej Resend API klíč

1. Jdi na [resend.com](https://resend.com)
2. Zaregistruj se / přihlaš se
3. Jdi do **API Keys** → **Create API Key**
4. Zkopíruj klíč (začíná `re_...`)

### 2️⃣ Získej Gemini API klíč

1. Jdi na [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Přihlaš se Google účtem
3. Klikni **Create API key**
4. Zkopíruj klíč

### 3️⃣ Nastav environment variables

**Lokálně** (`.env.local`):
```bash
# Email notifications
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@weblyx.cz
ADMIN_EMAIL=info@weblyx.cz

# AI Generation
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Na Vercelu** (produkce):
```bash
vercel env add RESEND_API_KEY
vercel env add ADMIN_EMAIL
vercel env add GEMINI_API_KEY
```

### 4️⃣ Restartuj development server

```bash
# Zastav (Ctrl+C) a znovu spusť
npm run dev
```

---

## 📧 Email Templates

### Admin Notifikace

**Kdy:** Okamžitě po přijetí nové poptávky

**Obsahuje:**
- Kontaktní údaje klienta (jméno, email, telefon)
- Detail projektu (typ, rozpočet, timeline)
- Plný popis byznysu
- Požadované funkce
- Link do admin panelu

**Email:** `ADMIN_EMAIL` (z .env)

---

### Klient - AI Návrh

**Kdy:** Automaticky po dokončení AI generace (~30-60s po odeslání poptávky)

**Obsahuje:**
- Personalizované poděkování
- 🎨 AI barevná paleta (primární, sekundární, akcent)
- 📝 Doporučená typografie
- 💡 Návrhy obsahu (headline, tagline, CTA)
- ⚙️ Doporučené funkce
- 📞 CTA pro konzultaci

**Email:** Email klienta z formuláře

**Prevence duplicity:** Email se pošle jen jednou (flag `proposalEmailSent`)

---

## 🔄 Email Flow

### Automatický flow (nová poptávka)

```typescript
// 1. Uložení leadu
POST /api/leads
  ↓
// 2. Admin email (okamžitě)
sendEmail(admin)
  ↓
// 3. AI generation (background, paralelně)
POST /api/leads/[id]/generate-design
POST /api/leads/[id]/generate-brief
  ↓
// 4. Po dokončení brief → klient email
POST /api/leads/[id]/send-proposal
```

### Manuální odeslání (z admin panelu)

Pokud chceš poslat návrh manuálně:

```bash
POST /api/leads/{leadId}/send-proposal
```

---

## 🧪 Testování

### Test admin notifikace

```bash
# Odešli testovací poptávku přes formulář
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123456789",
    "companyName": "Test Company",
    "projectType": "e-shop",
    "budget": "20-50k",
    "timeline": "1-2 měsíce",
    "businessDescription": "Test business",
    "features": ["Payment gateway", "Product catalog"]
  }'
```

**Očekávaný výsledek:**
- ✅ Lead uložen do Firestore
- ✅ Admin email doručen na `ADMIN_EMAIL`
- ✅ Console log: "✅ Admin notification email sent"

### Test AI generation

Počkej ~30-60 sekund po odeslání poptávky.

**Kontrola v console:**
```
✅ AI design generation triggered
✅ AI brief generation triggered
✅ Client proposal email triggered
```

**Kontrola v Firestore:**
```javascript
{
  aiDesignSuggestion: { ... },
  aiBrief: { ... },
  proposalEmailSent: true,
  proposalEmailSentAt: "2025-01-30T..."
}
```

---

## 🐛 Troubleshooting

### ❌ Email se neposlal

**Příčina:** Chybí `RESEND_API_KEY`

**Řešení:**
1. Zkontroluj `.env.local`:
   ```bash
   cat .env.local | grep RESEND_API_KEY
   ```
2. Nastav platný klíč z [resend.com/api-keys](https://resend.com/api-keys)
3. Restartuj dev server

---

### ❌ AI návrh se nevygeneroval

**Příčina:** Chybí nebo neplatný `GEMINI_API_KEY`

**Řešení:**
1. Zkontroluj console:
   ```
   ❌ Gemini API error: API key not configured
   ```
2. Nastav platný Gemini API klíč
3. Zkus manuálně:
   ```bash
   POST /api/leads/{leadId}/generate-design
   POST /api/leads/{leadId}/generate-brief
   ```

---

### ❌ Klient nedostal email

**Možné příčiny:**

1. **AI generace ještě nedoběhla**
   - Čekej 30-60s
   - Zkontroluj Firestore: `aiBrief` field

2. **Email už byl poslán**
   - Zkontroluj Firestore: `proposalEmailSent: true`
   - Email se pošle jen jednou

3. **Resend API selhalo**
   - Console: `❌ Failed to send proposal email`
   - Zkontroluj Resend dashboard na [resend.com/emails](https://resend.com/emails)

---

## 📊 Monitoring

### Resend Dashboard

1. Jdi na [resend.com/emails](https://resend.com/emails)
2. Vidíš všechny odeslané emaily
3. Status: Sent / Delivered / Bounced / Complained

### Firebase Console

1. Jdi na [console.firebase.google.com](https://console.firebase.google.com)
2. Firestore Database → `leads` kolekce
3. Zkontroluj fields:
   - `aiDesignSuggestion`
   - `aiBrief`
   - `proposalEmailSent`
   - `proposalEmailSentAt`

---

## 🚀 Production Deployment

### Vercel Environment Variables

```bash
# Nastav všechny production env variables
vercel env add RESEND_API_KEY production
vercel env add ADMIN_EMAIL production
vercel env add GEMINI_API_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production

# Deploy
vercel --prod
```

### Verify Domain (Resend)

Pro odesílání z vlastní domény (`noreply@weblyx.cz`):

1. Jdi na [resend.com/domains](https://resend.com/domains)
2. Přidej doménu `weblyx.cz`
3. Nastav DNS záznamy (SPF, DKIM, DMARC)
4. Počkej na verifikaci (~5-10 min)

---

## 🎉 Done!

Máš plně automatický systém:
- ✅ Admin notifikace při nové poptávce
- ✅ AI generování návrhů
- ✅ Automatický email klientovi s návrhy
- ✅ Prevence duplicitních emailů
- ✅ Error handling a logging

**Next steps:**
- Otestuj lokálně
- Deploy na Vercel
- Verify email domain
- Začni dostávat poptávky! 🚀
