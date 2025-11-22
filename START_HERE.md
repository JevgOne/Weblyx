# 🚀 START HERE - Weblyx Deployment

**Status:** ✅ **Připraveno k deploymentu na Vercel + Turso DB**

---

## ⚡ Quick Start (5 minut)

### 1️⃣ Turso Login
```bash
turso auth login --headless
```
👉 Otevři v browseru: **https://api.turso.tech?redirect=false**

### 2️⃣ Setup Database
```bash
cd /Users/zen/weblyx
turso db shell titanboxing < turso-schema.sql
turso db tokens create titanboxing
```
📝 **ZKOPÍRUJ TOKEN!** Budeš ho potřebovat v dalším kroku.

### 3️⃣ Environment Variables
Přidej do `.env.local`:
```env
TURSO_DATABASE_URL=libsql://titanboxing-jevgone.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=<token-z-kroku-2>
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_1oB30eS9bXBog4Ii_GTJ6AxztkEygn3lNAAy8Dnv2OQK4vA
```

### 4️⃣ Vercel Settings
Jdi na: **https://vercel.com/jevg-ones-projects/weblyx/settings/environment-variables**

Přidej tyto proměnné:
- `TURSO_DATABASE_URL` = `libsql://titanboxing-jevgone.aws-ap-south-1.turso.io`
- `TURSO_AUTH_TOKEN` = `<tvůj-token>`

### 5️⃣ Deploy!
```bash
npm run build
git add .
git commit -m "feat: Migrate to Turso + Vercel"
git push origin main
```

---

## 📚 Dokumentace

| Dokument | Kdy použít |
|----------|-----------|
| **QUICK_SETUP.md** | 🎯 Potřebuješ rychlé instrukce |
| **commands.txt** | 📋 Chceš copy-paste příkazy |
| **MIGRATION_SUMMARY.md** | 📦 Chceš kompletní přehled |
| **VERCEL_DEPLOYMENT.md** | 🔧 Detaily o deploymentu |
| **PROJECT_STRUCTURE.md** | 🗂 Přehled struktury projektu |

---

## ✅ Co je hotové

- ✅ **Turso DB Schema** (25+ tabulek)
- ✅ **Turso Client** (`lib/turso.ts`)
- ✅ **CMS Functions** (`lib/turso-cms.ts`)
- ✅ **Vercel Blob** (už nakonfigurováno)
- ✅ **Setup Scripts** (`scripts/setup-turso.sh`)
- ✅ **Kompletní dokumentace**

---

## 🎯 Co potřebuješ udělat

1. [ ] Přihlásit se do Turso
2. [ ] Aplikovat SQL schema
3. [ ] Získat auth token
4. [ ] Nastavit ENV variables
5. [ ] Deploy na Vercel

**Odhadovaný čas:** 5 minut ⏱️

---

## 🆘 Pomoc

Narazil jsi na problém?

1. **Nejdřív zkontroluj:** `QUICK_SETUP.md`
2. **Všechny příkazy:** `commands.txt`
3. **Troubleshooting:** `VERCEL_DEPLOYMENT.md`

---

## 📊 Výsledek

Po dokončení budeš mít:

```
✅ Production website na Vercel
✅ Turso DB (SQLite v edge)
✅ Vercel Blob (media storage)
✅ Edge runtime (~20-50ms latence)
✅ Automatický CI/CD
✅ Free tier hosting
```

---

**👉 NEXT STEP:** Otevři `QUICK_SETUP.md` nebo spusť první příkaz:

```bash
turso auth login --headless
```

**Let's go! 🚀**
