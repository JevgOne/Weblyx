# 🌍 Multi-Domain Setup Guide

## Přehled architektury

Tento projekt podporuje **2 domény s lokalizací**:
- **weblyx.cz** → Čeština (cs)
- **seitelyx.de** → Němčina (de)

**Klíčové vlastnosti:**
- ✅ Single codebase (jeden zdrojový kód)
- ✅ Shared Turso database (společná databáze)
- ✅ Shared admin panel (společný admin)
- ✅ Automatická detekce domény + jazyka
- ✅ Separate Vercel deployments (oddělené deploymenty)

---

## 📁 Struktura projektu

```
/weblyx
├── i18n/
│   ├── routing.ts         # Konfigurace i18n routingu
│   └── request.ts         # Server-side i18n config
├── messages/
│   ├── cs.json            # České překlady
│   └── de.json            # Německé překlady
├── middleware.ts          # Domain detection + i18n
├── app/
│   ├── [locale]/          # BUDOUCÍ: Lokalizované stránky
│   ├── admin/             # Admin panel (sdílený, bez lokalizace)
│   └── api/               # API routes (sdílené)
└── .env.example
```

---

## 🚀 Deployment na Vercel

### **1. Vytvoř 2 projekty na Vercel:**

#### **Projekt 1: Weblyx (Czech)**
```bash
# V Vercel dashboardu:
Project name: weblyx-cz
Domain: weblyx.cz
Environment Variables:
  NEXT_PUBLIC_DOMAIN=weblyx.cz
  NEXT_PUBLIC_SITE_NAME=Weblyx
  NEXT_PUBLIC_SITE_URL=https://weblyx.cz
  # + všechny ostatní env vars z .env.example
```

#### **Projekt 2: Seitelyx (German)**
```bash
# V Vercel dashboardu:
Project name: seitelyx-de
Domain: seitelyx.de
Environment Variables:
  NEXT_PUBLIC_DOMAIN=seitelyx.de
  NEXT_PUBLIC_SITE_NAME=Seitelyx
  NEXT_PUBLIC_SITE_URL=https://seitelyx.de
  # + všechny ostatní env vars z .env.example
```

### **2. Sdílená databáze**

Oba projekty používají **STEJNÉ** Turso DB credentials:
```bash
# STEJNÉ pro oba projekty:
TURSO_DATABASE_URL=libsql://weblyx-jevgone.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your-shared-token-here
```

### **3. Sdílený Admin panel**

Admin panel je přístupný na obou doménách:
- `https://weblyx.cz/admin`
- `https://seitelyx.de/admin`

Používá **STEJNÉ** přihlašovací údaje (env vars):
```bash
ADMIN_EMAIL=zenuly3@gmail.com
ADMIN_PASSWORD=your-secure-password
```

---

## 🌐 Jak funguje detekce domény

### **1. Middleware (`middleware.ts`)**

```typescript
// Automatická detekce locale z domény:
const hostname = request.headers.get('host') || '';

let locale = 'cs'; // Default: Czech
if (hostname.includes('seitelyx.de')) {
  locale = 'de';
} else if (hostname.includes('weblyx.cz')) {
  locale = 'cs';
}
```

### **2. Routing konfigurace (`i18n/routing.ts`)**

```typescript
const isGermanDomain = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';

export const routing = defineRouting({
  locales: ['cs', 'de'],
  defaultLocale: isGermanDomain ? 'de' : 'cs',
  localePrefix: 'never', // Bez /cs nebo /de v URL
});
```

---

## 📝 Překlady (Translations)

### **Struktura messages/**

#### **`messages/cs.json`** (Czech)
```json
{
  "nav": {
    "home": "Domů",
    "about": "O nás"
  },
  "hero": {
    "title": "Tvorba webů, které opravdu prodávají"
  }
}
```

#### **`messages/de.json`** (German)
```json
{
  "nav": {
    "home": "Startseite",
    "about": "Über uns"
  },
  "hero": {
    "title": "Webseiten erstellen, die wirklich verkaufen"
  }
}
```

### **Použití v komponentách**

```typescript
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');

  return <h1>{t('title')}</h1>;
}
```

---

## 🔄 Workflow pro update obsahu

### **Scénář: Chceš změnit text na webu**

1. **Uprav translation file:**
   ```bash
   # Pro český web:
   vim messages/cs.json

   # Pro německý web:
   vim messages/de.json
   ```

2. **Commit & push:**
   ```bash
   git add messages/
   git commit -m "Update translations"
   git push
   ```

3. **Automatický deploy:**
   - Vercel automaticky deployuje OBA projekty
   - Změny se projeví na obou doménách

---

## 🗄️ Databáze s lokalizací

### **Schéma s locale fieldem**

```sql
-- Příklad: Blog posts s lokalizací
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'cs', -- 'cs' nebo 'de'
  created_at INTEGER NOT NULL
);

-- Index pro rychlé queries podle locale
CREATE INDEX idx_blog_posts_locale ON blog_posts(locale);
```

### **Query podle locale**

```typescript
// V komponentě:
import { useLocale } from 'next-intl';

const locale = useLocale(); // 'cs' nebo 'de'

// Fetch data pro aktuální jazyk:
const posts = await turso.execute({
  sql: 'SELECT * FROM blog_posts WHERE locale = ? ORDER BY created_at DESC',
  args: [locale]
});
```

---

## 🧪 Testování lokálně

### **Test Czech version:**
```bash
# .env.local
NEXT_PUBLIC_DOMAIN=weblyx.cz

npm run dev
# Otevři: http://localhost:3000
```

### **Test German version:**
```bash
# .env.local
NEXT_PUBLIC_DOMAIN=seitelyx.de

npm run dev
# Otevři: http://localhost:3000
```

### **Test s fake doménou (hosts file):**
```bash
# /etc/hosts
127.0.0.1 weblyx.cz
127.0.0.1 seitelyx.de

# Pak otevři:
http://weblyx.cz:3000
http://seitelyx.de:3000
```

---

## 🔧 Další kroky

### **1. Přesuň stránky do `[locale]` struktury**

```bash
# Aktuálně:
app/page.tsx
app/o-nas/page.tsx

# Doporučená struktura:
app/[locale]/page.tsx
app/[locale]/o-nas/page.tsx      # Pro Czech
app/[locale]/uber-uns/page.tsx   # Pro German
```

### **2. Uprav komponenty aby používaly translations**

```typescript
// Bylo:
<h1>Tvorba webů</h1>

// Bude:
const t = useTranslations('hero');
<h1>{t('title')}</h1>
```

### **3. Přidej locale do DB queries**

```typescript
// Všude kde fetches data z DB:
WHERE locale = '${locale}'
```

---

## ✅ Checklist pro nový obsah

Když přidáváš nový text/funkci:

- [ ] Přidej český text do `messages/cs.json`
- [ ] Přidej německý překlad do `messages/de.json`
- [ ] Použij `useTranslations()` v komponentě
- [ ] Pokud jde o DB data, přidej `locale` field
- [ ] Otestuj na obou doménách (local)
- [ ] Deploy & verify na produkci

---

## 📞 Kontakt & Podpora

**GitHub:** https://github.com/JevgOne/Weblyx
**Dokumentace:** next-intl.dev
**Support:** zenuly3@gmail.com

---

**🤖 Generated with Claude Code**
**Version:** 1.0
**Last updated:** 2024-12-06
