# 📁 Project Structure - Weblyx

## 🗂 Migrace Soubory

```
weblyx/
│
├── 📊 Database
│   ├── turso-schema.sql            (11KB) - SQL schema pro Turso DB
│   ├── lib/turso.ts                (2KB)  - Turso client & helpers
│   └── lib/turso-cms.ts            (19KB) - CMS funkce (Firestore API compatible)
│
├── 🔧 Setup Scripts
│   └── scripts/setup-turso.sh      (1KB)  - Automatizační script
│
├── 📚 Dokumentace
│   ├── QUICK_SETUP.md              (3KB)  - ⚡ 5-min setup guide
│   ├── MIGRATION_SUMMARY.md        (6KB)  - 📦 Kompletní přehled
│   ├── VERCEL_DEPLOYMENT.md        (5KB)  - 🚀 Detailní deploy guide
│   ├── TURSO_MIGRATION.md          (4KB)  - 🔄 Migrace dat
│   ├── commands.txt                (2KB)  - 📋 Přesné příkazy
│   └── PROJECT_STRUCTURE.md        (this) - 🗂 Struktura projektu
│
├── 🎨 Frontend (Next.js 15)
│   ├── app/                        - App router
│   │   ├── page.tsx               - Homepage
│   │   ├── admin/                 - Admin panel
│   │   └── api/                   - API routes
│   │       ├── upload/            - ✅ Vercel Blob upload
│   │       ├── media/             - ✅ Media management
│   │       ├── contact/           - Contact form
│   │       ├── leads/             - Lead management
│   │       └── services/          - Services API
│   │
│   ├── components/                 - React components
│   └── public/                     - Static assets
│
├── 📦 Configuration
│   ├── .env.example               - ENV template (+ Turso vars)
│   ├── .env.local                 - Local ENV (git ignored)
│   ├── .env.vercel                - ✅ Vercel ENV (má BLOB token)
│   ├── vercel.json                - Vercel config
│   ├── next.config.ts             - Next.js config
│   └── package.json               - Dependencies (+ @libsql/client)
│
└── 🔥 Legacy (Firebase - volitelné odstranění po migraci)
    ├── lib/firebase.ts
    ├── lib/firestore-cms.ts
    └── firestore.rules
```

## 📊 Turso Database Schema

### Core Tables (25+ tabulek)

**Admin & Auth:**
- `admins` - Admin uživatelé

**Lead Management:**
- `leads` - Lead formuláře
- `projects` - Projekty
- `project_todos` - Úkoly projektů
- `project_files` - Soubory projektů
- `project_timeline` - Timeline events
- `project_milestones` - Milestones

**Communication:**
- `emails` - Email tracking
- `calendar_events` - Kalendář
- `newsletter_subscribers` - Newsletter

**Content:**
- `blog_posts` - Blog články

**CMS (Homepage):**
- `homepage_sections` - Hero sekce
- `services` - Služby
- `pricing_tiers` - Ceníky
- `process_steps` - Proces kroky
- `process_section` - Proces meta
- `faq_items` - FAQ položky
- `faq_section` - FAQ meta
- `cta_section` - CTA sekce
- `contact_info` - Kontaktní info

**Media & Settings:**
- `media` - Media library (Vercel Blob tracking)
- `settings` - Key-value settings
- `portfolio` - Portfolio položky

## 🔌 API Endpoints

### Vercel Blob (✅ Funguje)
- `POST /api/upload` - Upload souboru
- `GET /api/media/list` - Seznam médií
- `DELETE /api/media/delete` - Smazat médium

### CMS (Potřeba přepnout z Firestore na Turso)
- `GET /api/services` - Služby
- `POST /api/contact` - Kontaktní formulář
- `GET /api/leads` - Lead management
- `GET /api/admin/*` - Admin endpoints

## 🔄 Migration Path

### Před (Firebase)
```typescript
import { getAllServices } from '@/lib/firestore-cms';
```

### Po (Turso)
```typescript
import { getAllServices } from '@/lib/turso-cms';
```

**API je identické!** Pouze změna importu.

## 📈 Deployment Flow

```
1. Turso Login
   ↓
2. Apply SQL Schema
   ↓
3. Get Auth Token
   ↓
4. Set ENV Variables (.env.local)
   ↓
5. Set Vercel ENV (dashboard)
   ↓
6. npm run build (test)
   ↓
7. git push / vercel --prod
   ↓
8. Production! 🎉
```

## 🎯 Quick Start

```bash
# 1. Setup Turso
turso auth login --headless
turso db shell titanboxing < turso-schema.sql
turso db tokens create titanboxing

# 2. ENV
# Add to .env.local:
# TURSO_DATABASE_URL=libsql://titanboxing-jevgone.aws-ap-south-1.turso.io
# TURSO_AUTH_TOKEN=<your-token>

# 3. Build & Deploy
npm run build
git push origin main
```

## 📚 Dokumenty Priority

1. **QUICK_SETUP.md** - Začni tady! 5-min guide
2. **commands.txt** - Copy-paste příkazy
3. **MIGRATION_SUMMARY.md** - Kompletní přehled
4. **VERCEL_DEPLOYMENT.md** - Detaily deployment

---

**Status:** ✅ Připraveno k deploymentu
**Next:** Otevři `QUICK_SETUP.md`
