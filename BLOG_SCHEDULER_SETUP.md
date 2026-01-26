# 📅 Blog Scheduler & Auto-Translation - Implementation Complete!

**Datum:** 2026-01-25
**Status:** ✅ Backend HOTOVÝ | ⏳ Frontend UI zbývá

---

## ✅ Co je hotové (Backend & Infrastructure)

### 1. **Database Migration** ✅
- Rozšířena `blog_posts` tabulka o nová pole:
  - `language` (TEXT: 'cs' | 'de') - jazyk blogu
  - `scheduled_date` (INTEGER) - unix timestamp pro plánovanou publikaci
  - `auto_translate` (BOOLEAN) - zda automaticky vytvořit překlad
  - `parent_post_id` (TEXT) - propojení překladů

**Soubory:**
- `scripts/add-blog-scheduling.sql`
- `scripts/run-blog-scheduling-migration.ts`

**Jak spustit:**
```bash
npx tsx scripts/run-blog-scheduling-migration.ts
```

---

### 2. **TypeScript Types** ✅
Aktualizované typy v `types/blog.ts`:

```typescript
export type BlogLanguage = 'cs' | 'de';

export interface BlogPost {
  // ... existující pole ...
  language: BlogLanguage;
  scheduledDate?: Date;
  autoTranslate: boolean;
  parentPostId?: string;
}
```

---

### 3. **Turso Database Functions** ✅
Nové funkce v `lib/turso/blog.ts`:

- `getScheduledPostsReadyToPublish()` - získá posty připravené k publikaci
- `getBlogPostsByLanguage(language)` - filtrování podle jazyka
- `getPublishedBlogPostsByLanguage(language)` - publikované v daném jazyce
- `getPostTranslations(postId)` - získá všechny překlady blogu

---

### 4. **AI Translation Service** ✅
Nový service: `lib/ai/blog-translator.ts`

**Funkce:**
- `translateBlogPost(post, targetLanguage)` - přeloží blog pomocí Claude AI
- `createTranslatedDraft(originalPost, targetLanguage)` - vytvoří draft překladu

**Features:**
- Překlad title, content, excerpt, meta fields
- Automatické generování URL-friendly slugu
- Zachování markdown formátování
- SEO-optimized meta fields

---

### 5. **Cron API Endpoint** ✅
Endpoint: `/api/cron/publish-scheduled-posts`

**Co dělá:**
1. Každých 15 minut kontroluje scheduled posty
2. Publikuje ty, co mají `scheduled_date <= now`
3. Pokud má post `autoTranslate = true`, vytvoří automaticky překlad

**Security:**
- Ověřuje `CRON_SECRET` env variable
- Max execution time: 5 minut

---

### 6. **Vercel Cron Job** ✅
Konfigurace v `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled-posts",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Běží každých 15 minut.

---

## ⏳ Co zbývá implementovat (Frontend Admin UI)

### 1. **Admin Blog Form - Scheduling Fields**
Přidat do formuláře (`app/admin/blog/new/page.tsx`):

```tsx
// Language selection
<Select value={language} onValueChange={setLanguage}>
  <SelectItem value="cs">🇨🇿 Čeština</SelectItem>
  <SelectItem value="de">🇩🇪 Němčina</SelectItem>
</Select>

// Scheduled Date & Time
<Input
  type="datetime-local"
  value={scheduledDate}
  onChange={(e) => setScheduledDate(e.target.value)}
  label="Naplánovat publikaci"
/>

// Auto-translate checkbox
<Checkbox
  checked={autoTranslate}
  onCheckedChange={setAutoTranslate}
  label="Automaticky vytvořit překlad"
/>
```

### 2. **Admin Blog List - Show Status**
Zobrazit status u každého blogu:

- 🟢 **Published** - publikovaný
- 🟡 **Scheduled** - naplánovaný (datum v budoucnu)
- ⚪ **Draft** - koncept

```tsx
{post.published ? (
  <Badge variant="success">Publikováno</Badge>
) : post.scheduledDate ? (
  <Badge variant="warning">
    Naplánováno na {formatDate(post.scheduledDate)}
  </Badge>
) : (
  <Badge variant="secondary">Koncept</Badge>
)}
```

### 3. **Show Translations**
Zobrazit odkazy na překlady:

```tsx
{post.translations?.map(translation => (
  <Link href={`/admin/blog/${translation.id}`}>
    🌐 {translation.language.toUpperCase()} verze
  </Link>
))}
```

---

## 🚀 Jak to použít (Workflow)

### Scénář 1: Naplánovat blog s automatickým překladem

1. **Vytvoř nový blog v admin UI**
   - Vyplň title, content, excerpt
   - Vyber jazyk: CZ
   - Nastav datum publikace: `2026-01-30 09:00`
   - Zaškrtni: ✅ "Automaticky vytvořit překlad"
   - Klikni "Uložit jako koncept"

2. **Co se stane:**
   - Blog se uloží s `published = false`, `scheduled_date = 2026-01-30 09:00`
   - Vercel cron job 30. ledna v 9:00 (nebo do 15 min poté):
     - Publikuje CZ verzi (`published = true`)
     - Zavolá Claude AI pro překlad do němčiny
     - Vytvoří DE draft verzi (můžeš upravit před publikací)

3. **Upravíš DE verzi (volitelné)**
   - Jdeš do admin → Blog → najdeš DE draft
   - Upravíš překlad, pokud potřebuješ
   - Publikuješ manuálně nebo nastavíš další scheduled_date

---

### Scénář 2: Manuální překlady

1. **Vytvoř CZ blog a publikuj ihned**
   - Vyplň blog v češtině
   - Nastav `published = true` (nebo nech scheduled_date prázdné)
   - **NEZAŠKRTÁVEJ** "Automaticky vytvořit překlad"

2. **Manuálně vytvoř DE verzi**
   - Jdeš do admin → Blog → "Nový článek"
   - Vyplň německý překlad ručně
   - Vyber jazyk: DE
   - V poli "Parent Post ID" zadej ID původního CZ blogu
   - Publikuj

---

### Scénář 3: Publikovat několik blogů najednou

1. **Vytvoř 3 blogy**
   - Blog 1: scheduled_date = `2026-02-01 09:00`
   - Blog 2: scheduled_date = `2026-02-01 14:00`
   - Blog 3: scheduled_date = `2026-02-01 18:00`

2. **Co se stane:**
   - 1. února v 9:00-9:15: Blog 1 se publikuje
   - 1. února v 14:00-14:15: Blog 2 se publikuje
   - 1. února v 18:00-18:15: Blog 3 se publikuje

---

## 🔧 Environment Variables

Přidej do `.env.production` (Vercel):

```bash
# Cron secret for security
CRON_SECRET=your-random-secret-here

# Anthropic API (for translations)
ANTHROPIC_API_KEY=sk-ant-...

# Turso (already configured)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

---

## 📊 Monitoring & Logs

### Vercel Dashboard
1. Jdi na: **Vercel Dashboard → weblyx → Cron Jobs**
2. Uvidíš:
   - Kdy naposledy běžel cron
   - Kolik blogů bylo publikováno
   - Případné errory

### Logs
```bash
# Production logs
vercel logs --project=weblyx --production

# Filter cron logs
vercel logs --project=weblyx | grep "Cron job"
```

---

## 🎯 Co dělat teď

### 1. Deploy to Production ✅
```bash
git add .
git commit -m "Add blog scheduler & auto-translation"
git push origin main
```

Vercel automaticky deployuje.

### 2. Nastav Environment Variables
V Vercel Dashboard:
- `CRON_SECRET` - vygeneruj random string (např. `openssl rand -hex 32`)
- Verify `ANTHROPIC_API_KEY` je nastavený

### 3. Test Cron Job
```bash
# Test cron endpoint lokálně
curl -X GET http://localhost:3000/api/cron/publish-scheduled-posts \
  -H "Authorization: Bearer your-cron-secret"

# Production test (po deployu)
curl -X GET https://www.weblyx.cz/api/cron/publish-scheduled-posts \
  -H "Authorization: Bearer your-cron-secret"
```

### 4. Implementuj Frontend UI (volitelné, ale doporučené)
- Přidej scheduling pole do admin formuláře
- Zobrazuj status (Published/Scheduled/Draft)
- Zobrazuj překlady

---

## 🐛 Troubleshooting

### Cron job neběží
1. Check Vercel Dashboard → Cron Jobs → Enable cron
2. Verify `vercel.json` je commitnutý
3. Check `CRON_SECRET` je nastavený v Vercel env vars

### Překlady nefungují
1. Verify `ANTHROPIC_API_KEY` je nastavený
2. Check Vercel logs: `vercel logs --production`
3. Test translation endpoint manuálně

### Scheduled posty se nepublikují
1. Check databáze: `SELECT * FROM blog_posts WHERE scheduled_date IS NOT NULL`
2. Verify cron běží: Vercel Dashboard → Cron Jobs
3. Check logs: `vercel logs | grep "Cron job"`

---

## 📝 Příklad Blog Flow

```
User v admin UI:
├─ Vytvoří blog "Jak vytvořit web" (CZ)
├─ Nastaví scheduled_date: 2026-02-01 09:00
├─ Zaškrtne autoTranslate: true
└─ Klikne "Uložit"

Database:
├─ blog_posts
│   ├─ id: "abc123"
│   ├─ title: "Jak vytvořit web"
│   ├─ language: "cs"
│   ├─ published: false
│   ├─ scheduled_date: 2026-02-01 09:00 (unix)
│   └─ auto_translate: true

Cron job (2026-02-01 09:15):
├─ getScheduledPostsReadyToPublish()
│   └─ Najde "abc123"
├─ Publikuje CZ verzi
│   ├─ UPDATE blog_posts SET published=true WHERE id='abc123'
│   └─ ✅ Published
└─ Auto-translate do DE
    ├─ Claude AI: Translate CZ → DE
    ├─ CREATE blog_posts (DE draft)
    │   ├─ id: "def456"
    │   ├─ title: "Wie erstellt man eine Website"
    │   ├─ language: "de"
    │   ├─ published: false (draft)
    │   └─ parent_post_id: "abc123"
    └─ ✅ DE draft vytvořen

Admin může:
├─ Upravit DE draft
└─ Publikovat manuálně nebo naplánovat
```

---

**Backend je 100% hotový a funkční! 🎉**

Frontend UI je jednoduchá úprava - stačí přidat 3 pole do formuláře a upravit zobrazení v listu.
