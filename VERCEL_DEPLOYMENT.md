# 🚀 Vercel Deployment Guide

Kompletní návod pro nasazení Weblyx na Vercel s Turso DB a Vercel Blob.

## 📦 Co už je hotové

### ✅ 1. Vercel Blob Storage
- **Status:** ✅ Nakonfigurováno
- **Token:** `BLOB_READ_WRITE_TOKEN` už existuje v `.env.vercel`
- **API Endpoints:**
  - `/api/upload` - Upload souborů
  - `/api/media/list` - Seznam souborů
  - `/api/media/delete` - Smazání souboru

### ✅ 2. Turso Database
- **Připraveno:**
  - ✅ SQL schema (`turso-schema.sql`)
  - ✅ Turso client (`lib/turso.ts`)
  - ✅ CMS functions (`lib/turso-cms.ts`)
  - ✅ Setup script (`scripts/setup-turso.sh`)

- **Potřeba dokončit:**
  - ⏳ Turso login a aplikace schématu
  - ⏳ Získání `TURSO_AUTH_TOKEN`

## 🔧 Deployment Steps

### Krok 1: Turso Database Setup

1. **Přihlas se do Turso:**
   ```bash
   turso auth login --headless
   ```
   Otevři: https://api.turso.tech?redirect=false

2. **Spusť setup script:**
   ```bash
   ./scripts/setup-turso.sh
   ```

   Tento skript:
   - Zkontroluje databázi `titanboxing`
   - Aplikuje SQL schema
   - Vygeneruje auth token

3. **Zkopíruj env variables:**
   ```bash
   # Z výstupu skriptu zkopíruj do .env.local:
   TURSO_DATABASE_URL=libsql://titanboxing-jevgone.aws-ap-south-1.turso.io
   TURSO_AUTH_TOKEN=<your-token>
   ```

### Krok 2: Vercel Environment Variables

Přidej všechny env variables do Vercel:

```bash
# Turso
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN

# Vercel Blob (už by měl být)
vercel env add BLOB_READ_WRITE_TOKEN

# Firebase (pokud chceš zachovat)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# Google Gemini
vercel env add GEMINI_API_KEY

# Resend (email)
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
```

Nebo přes Vercel Dashboard:
1. Otevři projekt na https://vercel.com
2. Jdi do **Settings → Environment Variables**
3. Přidej všechny variables pro **Production**, **Preview**, **Development**

### Krok 3: Deploy

```bash
# 1. Build lokálně (test)
npm run build

# 2. Deploy na Vercel
vercel --prod
```

Nebo automatický deploy:
```bash
# Push do git repo
git add .
git commit -m "feat: Migrate to Vercel + Turso DB"
git push origin main
```

## 📋 Checklist před deploymentem

- [ ] Turso login dokončen
- [ ] SQL schema aplikováno na Turso DB
- [ ] `.env.local` obsahuje `TURSO_DATABASE_URL` a `TURSO_AUTH_TOKEN`
- [ ] Vercel environment variables nastaveny
- [ ] Lokální build funguje (`npm run build`)
- [ ] Test API endpoints lokálně
- [ ] Git repository připojen na Vercel

## 🧪 Testování

### Lokální test
```bash
# 1. Nastav .env.local
cp .env.example .env.local
# Přidej TURSO_* variables

# 2. Run dev server
npm run dev

# 3. Test endpoints
curl http://localhost:3000/api/status
curl http://localhost:3000/api/services
```

### Produkční test
Po deploy na Vercel:
```bash
# Test hlavní stránka
curl https://your-app.vercel.app

# Test API
curl https://your-app.vercel.app/api/status
curl https://your-app.vercel.app/api/services
```

## 🔄 Migrace dat z Firebase (volitelné)

Pokud máš data ve Firebase Firestore a chceš je přenést do Turso:

```typescript
// scripts/migrate-data.ts
import * as admin from 'firebase-admin';
import { createService, createPricingTier } from '@/lib/turso-cms';

async function migrateServices() {
  const snapshot = await admin.firestore().collection('services').get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    await createService({
      title: data.title,
      description: data.description,
      icon: data.icon,
      features: data.features,
      order: data.order,
    });
  }
}

// Spusť: npx tsx scripts/migrate-data.ts
```

## 📊 Monitoring

### Vercel Analytics
Automaticky dostupné na: https://vercel.com/your-project/analytics

### Turso Monitoring
```bash
# Database info
turso db show titanboxing

# Database stats
turso db inspect titanboxing
```

## 🆘 Troubleshooting

### Build error na Vercel
```
Error: TURSO_DATABASE_URL is not defined
```
➡️ **Řešení:** Zkontroluj Environment Variables ve Vercel Dashboard

### Database connection error
```
Error: Authentication failed
```
➡️ **Řešení:** Vygeneruj nový token: `turso db tokens create titanboxing`

### Vercel Blob upload fails
```
Error: BLOB_READ_WRITE_TOKEN is not defined
```
➡️ **Řešení:**
```bash
vercel env pull .env.local
vercel env add BLOB_READ_WRITE_TOKEN
```

## 🎯 Next Steps po deployu

1. **Custom Domain:**
   - Vercel Dashboard → Domains
   - Přidej `www.weblyx.cz` a `weblyx.cz`

2. **SSL Certificate:**
   - Automaticky Vercel generuje Let's Encrypt cert

3. **Analytics & Monitoring:**
   - Zapni Vercel Analytics
   - Nastav Vercel Web Vitals

4. **Admin Panel:**
   - Přidej admin uživatele do Turso:
   ```sql
   INSERT INTO admins (id, email, name)
   VALUES ('admin1', 'your@email.com', 'Your Name');
   ```

## 📚 Odkazy

- [Vercel Docs](https://vercel.com/docs)
- [Turso Docs](https://docs.turso.tech)
- [Vercel + Turso Integration](https://vercel.com/docs/storage/vercel-turso)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

## 🎉 Hotovo!

Po dokončení všech kroků budeš mít:
- ✅ Weblyx běžící na Vercel
- ✅ Turso DB jako databáze
- ✅ Vercel Blob pro media storage
- ✅ Automatické deployment z Git
- ✅ Edge runtime s nízkou latencí
