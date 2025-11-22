# 🚀 SETUP NOW - 3 Příkazy

## ⚡ Rychlý Start (3 minuty)

### 1️⃣ Přihlaš se do Turso
Otevři **NOVÉ OKNO TERMINÁLU** a spusť:
```bash
turso auth login
```

Po přihlášení se **VRAŤ ZPĚT DO TOHOTO TERMINÁLU**.

---

### 2️⃣ Získej Token a Aplikuj Schema
```bash
cd /Users/zen/weblyx
./GET_TURSO_TOKEN.sh
turso db shell titanboxing < turso-schema.sql
```

---

### 3️⃣ Spusť Localhost
```bash
npm run dev
```

Otevři: **http://localhost:3000**

---

## 🎯 API Endpoints (po spuštění)

### BoxRec Import
```bash
# Import boxera z BoxRec
curl -X POST http://localhost:3000/api/boxers/import \
  -H "Content-Type: application/json" \
  -d '{
    "boxrecId": "1070292",
    "teamRole": "reprezentant",
    "featured": true
  }'
```

### Seznam Boxerů
```bash
curl http://localhost:3000/api/boxers
```

### Featured Boxeři
```bash
curl http://localhost:3000/api/boxers?featured=true
```

---

## 🚀 Deploy na Vercel

```bash
# 1. Přidej ENV variables do Vercel
vercel env add TURSO_DATABASE_URL
# Zadej: libsql://titanboxing-jevgone.aws-ap-south-1.turso.io

vercel env add TURSO_AUTH_TOKEN
# Zadej: <token z GET_TURSO_TOKEN.sh>

# 2. Deploy
vercel --prod
```

---

## 📊 Co je hotové

- ✅ **Turso Database** s boxer tabulkou
- ✅ **BoxRec Scraper** (Puppeteer)
- ✅ **API Endpoints:**
  - `GET /api/boxers` - Seznam boxerů
  - `POST /api/boxers/import` - Import z BoxRec
  - `POST /api/boxers/sync` - Sync s BoxRec
- ✅ **Vercel Blob** - Media storage

---

## 🆘 Troubleshooting

**"turso: command not found"**
```bash
brew install tursodatabase/tap/turso
```

**"Not logged in"**
```bash
turso auth login
# Pak znovu: ./GET_TURSO_TOKEN.sh
```

**"Table doesn't exist"**
```bash
turso db shell titanboxing < turso-schema.sql
```

---

## 🎉 Hotovo!

Po spuštění `npm run dev` máš:
- ✅ Localhost běží na http://localhost:3000
- ✅ BoxRec API ready
- ✅ Turso DB připojeno
- ✅ Vercel Blob funguje

**Next:** Importuj boxera přes API endpoint! 🥊
