# 📧 Resend Email Setup - Návod

Tento návod tě provede nastavením Resend API pro automatické odesílání faktur.

---

## 🚀 Krok 1: Vytvoř účet na Resend

1. Jdi na **https://resend.com/signup**
2. Zaregistruj se (můžeš použít GitHub login)
3. Potvrď email

---

## 🔑 Krok 2: Získej API klíč

1. Po přihlášení jdi do **Settings** → **API Keys**
2. Klikni na **"Create API Key"**
3. Název: `Weblyx Production`
4. Permission: **"Full Access"** (nebo minimálně "Sending Access")
5. Klikni **"Create"**
6. **ZKOPÍRUJ API KLÍČ** (ukáže se jen jednou!) - vypadá jako: `re_ABC123xyz...`

---

## 🌐 Krok 3: Nastav doménu (DOPORUČENO)

### Proč?
- Bez vlastní domény můžeš posílat jen na **verifikované emaily**
- S vlastní doménou můžeš posílat komukoliv

### Jak nastavit:

1. V Resend jdi do **Domains** → **Add Domain**
2. Zadej: `weblyx.cz`
3. Resend ti ukáže DNS záznamy, které musíš přidat:

```
TXT record:
resend._domainkey.weblyx.cz → [hodnota z Resend]

MX records (pokud chceš přijímat emaily):
weblyx.cz → feedback-smtp.eu-west-1.amazonses.com (priority 10)
```

4. Přidej tyto záznamy u svého DNS providera (např. CloudFlare, GoDaddy, Wedos...)
5. Počkej 5-60 minut na propagaci
6. V Resend klikni **"Verify DNS Records"**

### Alternativa (pro testování):
- Pokud nechceš nastavovat DNS hned, můžeš použít **onboarding domain**
- Ale můžeš posílat jen na **vlastní ověřený email** (např. zenuly3@gmail.com)

---

## ⚙️ Krok 4: Přidej API klíč do Vercel

### Varianta A: Přes Vercel Dashboard (GUI)

1. Jdi na **https://vercel.com/jevgone/weblyx**
2. Klikni na **Settings** → **Environment Variables**
3. Přidej tyto proměnné:

```
RESEND_API_KEY = re_ABC123xyz... (tvůj klíč z kroku 2)
RESEND_FROM_EMAIL = noreply@weblyx.cz
```

4. Vyber **Production, Preview, Development**
5. Klikni **Save**
6. **Redeploy** projekt (Settings → Deployments → ... → Redeploy)

### Varianta B: Přes Vercel CLI (Terminál)

```bash
# Přejdi do projektu
cd /Users/zen/weblyx

# Přidej API klíč (nahraď "re_ABC123xyz" svým klíčem)
vercel env add RESEND_API_KEY production
# Zadej: re_ABC123xyz...

vercel env add RESEND_FROM_EMAIL production
# Zadej: noreply@weblyx.cz

# Stáhni aktualizované env variables
vercel env pull

# Redeploy
vercel --prod
```

---

## 🧪 Krok 5: Otestuj odesílání

### Lokální test (před deployem):

1. Vytvoř `.env.local` soubor:

```bash
echo "RESEND_API_KEY=re_ABC123xyz..." >> .env.local
echo "RESEND_FROM_EMAIL=noreply@weblyx.cz" >> .env.local
```

2. Restart dev server:

```bash
npm run dev
```

3. Vytvoř testovací fakturu v admin panelu s **TVÝM EMAILEM**
4. Zkontroluj, jestli přišel email s fakturou

### Production test:

Po redeployu do Vercelu:
1. Jdi na **https://weblyx.cz/admin/invoices/new**
2. Vytvoř fakturu s emailem
3. Zkontroluj inbox

---

## 🎉 Hotovo!

Teď když vytvoříš fakturu a zadáš email klienta:
- ✅ Faktura se automaticky vygeneruje
- ✅ PDF se nahraje do Vercel Blob
- ✅ Email se odešle s PDF přílohou
- ✅ Status faktury se změní na "sent"

---

## ❓ Troubleshooting

### Problem: "Email service not configured"
**Řešení:** Chybí `RESEND_API_KEY` v env variables

```bash
vercel env ls  # Zkontroluj, jestli je nastavený
```

### Problem: Email nepřichází
**Možné příčiny:**
1. **Domain není ověřená** → Ověř DNS záznamy v Resend
2. **API klíč je špatný** → Zkontroluj, jestli jsi ho správně zkopíroval
3. **Email je v SPAM** → Zkontroluj spam folder
4. **Free tier limit** → Resend má 100 emailů/den zdarma

### Problem: "Email address not verified"
**Řešení:**
- Buď ověř doménu (Krok 3)
- Nebo přidej svůj email do **Verified Emails** v Resend

---

## 💰 Ceny Resend

- **Free tier:** 100 emailů/den, 3,000/měsíc
- **Pro:** $20/měsíc = 50,000 emailů
- Pro většinu projektů stačí free tier!

---

## 📚 Užitečné odkazy

- Resend Dashboard: https://resend.com/overview
- Resend Docs: https://resend.com/docs
- DNS Setup Guide: https://resend.com/docs/dashboard/domains/introduction

---

**🔥 Pro tip:** Nastav doménu hned od začátku, jinak budeš moci posílat jen na své vlastní emaily!
