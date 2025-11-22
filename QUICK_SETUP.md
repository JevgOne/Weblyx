# ⚡ Quick Setup - Weblyx na Vercel + Turso

**Rychlý návod pro nasazení za 5 minut**

## 🔐 1. Turso Login (1 min)

```bash
# Otevři nový terminál a přihlaš se:
turso auth login --headless
```

Otevři v browseru: **https://api.turso.tech?redirect=false**

Po přihlášení pokračuj dalšími příkazy v **TOMTO** terminálu.

---

## 📊 2. Turso Database Setup (2 min)

```bash
# Zkontroluj, že jsi přihlášen
turso auth whoami

# Zobraz info o databázi titanboxing
turso db show titanboxing

# Vygeneruj nový auth token
turso db tokens create titanboxing

# ZKOPÍRUJ tento token - budeš ho potřebovat!
```

**Aplikuj SQL schema:**
```bash
# Přejdi do weblyx složky
cd /Users/zen/weblyx

# Aplikuj schema
turso db shell titanboxing < turso-schema.sql

# Ověř, že se vytvořily tabulky
turso db shell titanboxing "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 🔧 3. Environment Variables (1 min)

**Přidej do `.env.local`:**
```bash
# Zkopíruj database URL a auth token
TURSO_DATABASE_URL=libsql://titanboxing-jevgone.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=<token-z-kroku-2>

# Vercel Blob (už máš v .env.vercel)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_1oB30eS9bXBog4Ii_GTJ6AxztkEygn3lNAAy8Dnv2OQK4vA
```

---

## 🚀 4. Vercel Environment Variables (1 min)

**Přidej do Vercel Dashboard:**

Jdi na: https://vercel.com/jevg-ones-projects/weblyx/settings/environment-variables

Přidej tyto proměnné pro **Production**, **Preview** i **Development**:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://titanboxing-jevgone.aws-ap-south-1.turso.io` |
| `TURSO_AUTH_TOKEN` | `<tvůj-token>` |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_1oB30eS9bXBog4Ii_GTJ6AxztkEygn3lNAAy8Dnv2OQK4vA` |
| `GEMINI_API_KEY` | `<tvůj-gemini-key>` |

Nebo přes CLI:
```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
```

---

## 🧪 5. Test Lokálně (30 sec)

```bash
# Build
npm run build

# Dev server
npm run dev

# Test v browseru:
# http://localhost:3000
```

---

## 🎯 6. Deploy na Vercel (30 sec)

**Automatický deploy z Gitu:**
```bash
git add .
git commit -m "feat: Setup Turso DB + Vercel Blob"
git push origin main
```

Nebo **manuální deploy:**
```bash
vercel --prod
```

---

## ✅ Checklist

- [ ] Turso login dokončen (`turso auth whoami` funguje)
- [ ] SQL schema aplikováno
- [ ] `.env.local` obsahuje `TURSO_*` proměnné
- [ ] Vercel env variables nastaveny
- [ ] Lokální build úspěšný (`npm run build`)
- [ ] Deploy na Vercel dokončen

---

## 🆘 Quick Troubleshooting

**"Not logged in to Turso"**
```bash
turso auth login --headless
# Otevři: https://api.turso.tech?redirect=false
```

**"Table doesn't exist"**
```bash
turso db shell titanboxing < turso-schema.sql
```

**"TURSO_AUTH_TOKEN not set"**
```bash
turso db tokens create titanboxing
# Zkopíruj do .env.local
```

**Build error**
```bash
# Zkontroluj .env.local
cat .env.local | grep TURSO

# Restart dev server
npm run dev
```

---

## 🎉 Hotovo!

Po dokončení budeš mít:
- ✅ Turso DB (SQLite v edge)
- ✅ Vercel Blob (media storage)
- ✅ Automatický deployment
- ✅ Edge runtime pro rychlost

**Live URL:** https://weblyx.vercel.app (nebo tvoje custom domain)
