# 🚀 Turso DB Migration Guide

Tento dokument popisuje migraci z Firebase Firestore na Turso DB (LibSQL).

## 📋 Co bylo vytvořeno

### 1. Database Schema (`turso-schema.sql`)
Kompletní SQL schéma s těmito tabulkami:
- **admins** - Admin uživatelé
- **leads** - Lead formuláře
- **projects** - Projekty s podtabulkami (todos, files, timeline, milestones)
- **emails** - Email tracking
- **calendar_events** - Kalendář
- **blog_posts** - Blog články
- **newsletter_subscribers** - Newsletter
- **settings** - Nastavení (key-value)
- **CMS tabulky**: homepage_sections, services, pricing_tiers, process_steps, faq_items, atd.
- **media** - Media library (pro Vercel Blob)

### 2. Turso Client (`lib/turso.ts`)
Helper funkce pro práci s Turso databází:
- `executeQuery()` - Spuštění SQL dotazu
- `executeOne()` - Získání jednoho záznamu
- `transaction()` - Transakce
- `dateToUnix()`, `unixToDate()` - Konverze datumů
- `parseJSON()`, `stringifyJSON()` - JSON helpers

### 3. Turso CMS (`lib/turso-cms.ts`)
Náhrada za `firestore-cms.ts` se stejným API:
- `getHomepageSections()`, `updateHeroSection()`
- `getAllServices()`, `createService()`, `updateService()`, `deleteService()`
- `getAllPricingTiers()`, `createPricingTier()`, atd.
- Všechny CMS funkce kompatibilní s původním Firestore API

## 🔧 Setup Steps

### 1. Přihlášení do Turso
```bash
turso auth login
```

### 2. Spuštění setup skriptu
```bash
./scripts/setup-turso.sh
```

Tento skript:
- Zkontroluje přihlášení
- Vytvoří/zkontroluje databázi `titanboxing`
- Aplikuje SQL schéma
- Vygeneruje auth token
- Vypíše environment variables

### 3. Přidání ENV variables
Zkopíruj výstup ze skriptu do `.env.local`:
```env
TURSO_DATABASE_URL=libsql://titanboxing-jevgone.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

### 4. Přidání do Vercel
```bash
# Nastavení pro Vercel
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
```

Nebo použij Vercel dashboard:
1. Jdi na projekt v Vercel
2. Settings → Environment Variables
3. Přidej `TURSO_DATABASE_URL` a `TURSO_AUTH_TOKEN`

## 🔄 Migrace dat z Firebase (volitelné)

Pokud máš existující data ve Firebase Firestore, můžeš vytvořit migrační skript:

```typescript
// scripts/migrate-firestore-to-turso.ts
import { getAllServices } from '@/lib/firestore-cms';
import { createService } from '@/lib/turso-cms';

async function migrate() {
  // Migrace services
  const services = await getAllServices();
  for (const service of services) {
    await createService(service);
  }

  // ... podobně pro další kolekce
}

migrate();
```

## 📝 Změny v kódu

### Před (Firestore):
```typescript
import { getAllServices } from '@/lib/firestore-cms';
```

### Po (Turso):
```typescript
import { getAllServices } from '@/lib/turso-cms';
```

API je **identické**, takže změna je pouze v importu!

## 🎯 Next Steps

1. ✅ Turso database setup
2. ✅ Schema aplikováno
3. ✅ Client library vytvořen
4. ✅ CMS functions připraveny
5. ⏳ Aktualizace API routes
6. ⏳ Migrace dat (pokud potřeba)
7. ⏳ Testování
8. ⏳ Deploy na Vercel

## 🔍 Verifikace

Test připojení:
```typescript
import { turso } from '@/lib/turso';

const result = await turso.execute('SELECT 1');
console.log('Connected:', result);
```

Test CMS funkcí:
```typescript
import { getAllServices } from '@/lib/turso-cms';

const services = await getAllServices();
console.log('Services:', services);
```

## 📚 Dokumentace

- [Turso Docs](https://docs.turso.tech/)
- [LibSQL Client](https://github.com/libsql/libsql-client-ts)
- [Vercel + Turso](https://vercel.com/docs/storage/vercel-turso)

## 🆘 Troubleshooting

### Error: "TURSO_DATABASE_URL is not set"
➡️ Zkontroluj `.env.local` a restartuj dev server

### Error: "Authentication failed"
➡️ Vygeneruj nový token: `turso db tokens create titanboxing`

### Error: "Table doesn't exist"
➡️ Aplikuj schema: `turso db shell titanboxing < turso-schema.sql`
