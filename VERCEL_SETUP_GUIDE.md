# 🚀 Vercel Setup - Krok za krokem

## 📋 Co budeš potřebovat:

- [ ] Přístup na https://vercel.com
- [ ] GitHub repo: JevgOne/Weblyx (už máš)
- [ ] Turso DB credentials (už máš z weblyx.cz)
- [ ] 15 minut času

---

## ✅ Krok 1: Uprav STÁVAJÍCÍ projekt (weblyx.cz)

### **1.1 Otevři Vercel dashboard**
```
https://vercel.com/dashboard
```

### **1.2 Najdi svůj projekt weblyx**
- Klikni na projekt (weblyx nebo jak se jmenuje)

### **1.3 Přidej env var**
```
Settings → Environment Variables → Add Another

Name: NEXT_PUBLIC_DOMAIN
Value: weblyx.cz
Environment: Production, Preview, Development (všechny)

→ Save
```

### **1.4 Redeploy**
```
Deployments → (najdi poslední deployment) → ... → Redeploy
```

**✅ Hotovo!** weblyx.cz je připravený.

---

## 🆕 Krok 2: Vytvoř NOVÝ projekt (seitelyx.de)

### **2.1 Otevři nový projekt**
```
https://vercel.com/new
```

### **2.2 Import repository**
```
1. Klikni: "Import Git Repository"
2. Najdi: JevgOne/Weblyx (STEJNÝ repo jako weblyx.cz!)
3. Klikni: "Import"
```

### **2.3 Configure Project**
```
Project Name: seitelyx-de  ← Důležité! Jiný název než weblyx

Framework Preset: Next.js (automaticky detekováno)

Root Directory: ./  (ponech default)

Build Command: npm run build  (ponech default)

Output Directory: .next  (ponech default)
```

**→ Zatím NEKLÍKEJ "Deploy"!**

---

## 🔧 Krok 3: Nastav Environment Variables

### **3.1 Rozklikni "Environment Variables"**

Přidej tyto (klikni "Add Another" pro každou):

### **A) Multi-domain config:**

```env
Name: NEXT_PUBLIC_DOMAIN
Value: seitelyx.de
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: NEXT_PUBLIC_SITE_NAME
Value: Seitelyx
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: NEXT_PUBLIC_SITE_URL
Value: https://seitelyx.de
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### **B) Database (STEJNÉ jako weblyx.cz):**

**→ Otevři v NOVÉM TABU svůj weblyx.cz projekt:**
```
https://vercel.com/dashboard
→ weblyx projekt → Settings → Environment Variables
→ Zkopíruj hodnoty:
```

```env
Name: TURSO_DATABASE_URL
Value: <zkopíruj z weblyx.cz projektu>
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: TURSO_AUTH_TOKEN
Value: <zkopíruj z weblyx.cz projektu>
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### **C) Admin credentials (STEJNÉ):**

```env
Name: ADMIN_EMAIL
Value: <zkopíruj z weblyx.cz projektu>
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: ADMIN_PASSWORD
Value: <zkopíruj z weblyx.cz projektu>
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### **D) Email & AI (pokud máš):**

```env
Name: RESEND_API_KEY
Value: <zkopíruj z weblyx.cz projektu, pokud tam je>
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: RESEND_FROM_EMAIL
Value: <zkopíruj z weblyx.cz projektu>
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: GEMINI_API_KEY
Value: <zkopíruj z weblyx.cz projektu, pokud tam je>
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### **E) Analytics (pokud máš):**

```env
Name: NEXT_PUBLIC_FB_PIXEL_ID
Value: <zkopíruj z weblyx.cz, nebo nechej prázdné>
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: NEXT_PUBLIC_GA_ID
Value: <zkopíruj z weblyx.cz, nebo přidej NOVÉ pro DE>
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### **F) PWA & Push (pokud máš):**

```env
Name: NEXT_PUBLIC_VAPID_PUBLIC_KEY
Value: <zkopíruj z weblyx.cz projektu>
Environments: ✅ Production ✅ Preview ✅ Development
```

```env
Name: VAPID_PRIVATE_KEY
Value: <zkopíruj z weblyx.cz projektu>
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## 🚀 Krok 4: Deploy!

```
→ Klikni "Deploy" (velké modré tlačítko)

→ Počkej ~2 minuty (sleduj build log)

→ Mělo by se objevit: "Deployment Complete! 🎉"
```

---

## 🌐 Krok 5: Připoj doménu seitelyx.de

### **5.1 V projektu seitelyx-de:**
```
Settings → Domains → Add Domain
```

### **5.2 Zadej doménu:**
```
Domain: seitelyx.de

→ Add
```

### **5.3 Vercel ti ukáže DNS nastavení:**

**Pokud máš doménu u registrátora (např. Wedos, GoDaddy):**

```
Type: A
Name: @
Value: 76.76.21.21  (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**→ Přidej tyto DNS záznamy u svého registrátora**

**→ Počkej 5-60 minut (propagace DNS)**

---

## ✅ Krok 6: Ověř že to funguje

### **6.1 Test Preview URL (hned):**
```
Deployments → klikni na poslední deployment
→ Otevři "Visit" link

→ Měl bys vidět web v NĚMČINĚ!
```

### **6.2 Test produkční domény (až propaguje DNS):**
```
Otevři: https://seitelyx.de

→ Měl bys vidět:
- Německý header (Leistungen, Über uns...)
- Německý footer (Seitelyx, Alle Rechte...)
- Německé cookies (Wir verwenden Cookies...)
```

---

## 🧪 Verify Checklist

Po úspěšném deployu zkontroluj:

### **weblyx.cz (starý projekt):**
- [ ] Otevři: https://weblyx.cz
- [ ] Header: "Služby", "Portfolio", "Kontakt" ✅
- [ ] Footer: "© 2024 Weblyx" ✅
- [ ] Cookies: "Používáme cookies" ✅

### **seitelyx.de (nový projekt):**
- [ ] Otevři: https://seitelyx.de (nebo preview URL)
- [ ] Header: "Leistungen", "Portfolio", "Kontakt" ✅
- [ ] Footer: "© 2024 Seitelyx" ✅
- [ ] Cookies: "Wir verwenden Cookies" ✅

### **Admin panel (funguje na OBOU):**
- [ ] https://weblyx.cz/admin → přihlášení funguje ✅
- [ ] https://seitelyx.de/admin → přihlášení funguje ✅
- [ ] Data jsou STEJNÁ (sdílená DB) ✅

---

## 🐛 Troubleshooting

### **Problém: Build failed**

**Řešení:**
```
Deployments → klikni na failed deployment → "View Build Logs"

→ Pošli mi error log, pomůžu ti
```

---

### **Problém: Stále vidím češtinu i na seitelyx.de**

**Řešení:**
```
1. Settings → Environment Variables
2. Zkontroluj: NEXT_PUBLIC_DOMAIN=seitelyx.de ✅
3. Deployments → Redeploy
```

---

### **Problém: Admin panel nefunguje**

**Řešení:**
```
Zkontroluj že máš STEJNÉ credentials v obou projektech:
- TURSO_DATABASE_URL ✅
- TURSO_AUTH_TOKEN ✅
- ADMIN_EMAIL ✅
- ADMIN_PASSWORD ✅
```

---

### **Problém: DNS nepropaguje**

**Řešení:**
```
1. Zkontroluj DNS záznamy u registrátora
2. Test DNS: https://dnschecker.org
3. Počkej 1-24 hodin (normální čas propagace)
4. Mezitím používej Vercel preview URL
```

---

## 📊 Final Architecture

Po dokončení budeš mít:

```
GitHub:
└── JevgOne/Weblyx (1 repo, main branch)
    │
    ├─────────────┬─────────────┐
    │             │             │
Vercel:       Vercel:      Database:
weblyx-cz     seitelyx-de  Turso (shared)
│             │             │
weblyx.cz     seitelyx.de  ├─ Leads (CZ+DE)
(Czech)       (German)     ├─ Blog posts
                           └─ Services
```

---

## ✅ Jsi hotový!

**Co teď:**
1. Test oba weby
2. Sleduj analytics
3. Přidej německý obsah (blog, services)
4. Profit! 🚀

---

**Datum:** 2024-12-06
**Verze:** 1.0

**🤖 Generated with Claude Code**
