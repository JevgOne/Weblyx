# 🌟 Google Reviews Workflow - Mix automatických a manuálních recenzí

## 🎯 Jak to funguje

Weblyx používá **hybridní systém** pro správu recenzí:

1. **Automatický import** Google recenzí do databáze
2. **Schvalování v admin panelu** (kontrola kvality)
3. **Manuální přidávání** vlastních recenzí
4. **Jednotné zobrazení** na webu (Google + manuální stejný styl)

---

## 📥 KROK 1: Import Google recenzí

### Lokální spuštění:

```bash
# Přidej env variables do .env.local:
GOOGLE_PLACES_API_KEY=AIzaSy...
GOOGLE_PLACE_ID=ChIJRXDG...
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=ey...

# Spusť sync:
npm run sync-google-reviews
```

### Co se stane:

✅ Script stáhne recenze z Google Places API
✅ Uloží je do Turso DB s `source='Google'`
✅ Nastaví `published=false` (čeká na schválení)
✅ Přeskočí duplicity (kontrola podle autora + data)

**Output:**
```
🔍 Fetching Google reviews...
✅ Found 7 Google reviews
   ✅ Imported: Jan Novák (5★)
   ✅ Imported: Petra Svobodová (5★)
   ...
📊 Summary:
   ✅ Imported: 5 new reviews
   ⏭️  Skipped:  2 existing reviews
```

---

## ✅ KROK 2: Schválení v admin panelu

1. **Jdi na**: `/admin/reviews`

2. **Vidíš seznam všech recenzí**:
   - 🟡 **Neschválené Google recenze** (published = false)
   - ✅ **Schválené recenze** (published = true)
   - 📝 **Manuální recenze** (source = manual)

3. **Pro každou Google recenzi můžeš**:
   - ✅ **Schválit** (publikovat na web)
   - ❌ **Zamítnout** (smazat)
   - ✏️ **Upravit text** (pokud je potřeba zkrátit)
   - ⭐ **Featured** (zvýraznit na homepage)

4. **Přidat vlastní recenzi**:
   - Klikni "Add New Review"
   - Vyplň: jméno, text, rating, foto
   - Source: automaticky "manual"
   - Published: true/false

---

## 🌐 KROK 3: Zobrazení na webu

Na **https://www.weblyx.cz/** v sekci "Co říkají naši klienti":

✅ **Zobrazí se jen schválené recenze** (`published=true`)
✅ **Mix Google + manuální** (seřazené podle `order`)
✅ **Jednotný styl** (všechny vypadají stejně)
✅ **Ikona zdroje**: Google logo u Google recenzí

---

## 🔄 Automatizace (volitelné)

### Cron job pro pravidelný sync:

**Vercel Cron** (doporučeno):

1. Vytvoř `/app/api/cron/sync-reviews/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { syncGoogleReviews } from '@/scripts/sync-google-reviews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await syncGoogleReviews();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

2. Nastav v `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/sync-reviews",
    "schedule": "0 0 * * *"
  }]
}
```

3. Přidej env var: `CRON_SECRET=random_secret_here`

**Sync bude probíhat každý den o půlnoci automaticky** ✅

---

## 📊 Database Schema

Recenze v Turso DB mají tyto sloupce:

```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_image TEXT,
  author_role TEXT,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  date INTEGER NOT NULL, -- Unix timestamp
  source TEXT NOT NULL, -- 'Google' nebo 'manual'
  source_url TEXT, -- URL profilu na Google (jen u Google recenzí)
  published INTEGER NOT NULL DEFAULT 0, -- 0 = čeká na schválení, 1 = schváleno
  featured INTEGER NOT NULL DEFAULT 0, -- 0 = normální, 1 = zvýrazněná
  "order" INTEGER NOT NULL,
  locale TEXT NOT NULL, -- 'cs' nebo 'de'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

---

## 🎨 Styling

Všechny recenze (Google + manuální) se zobrazují stejně:

- ⭐ Rating (hvězdičky)
- 📝 Text recenze
- 👤 Autor + foto
- 🔗 Odkaz na zdroj (u Google recenzí)

**Jediný rozdíl**: U Google recenzí je malé Google logo v kartě.

---

## 🔧 Maintenance

### Aktualizace recenzí:

```bash
# Spusť sync (stáhne nové recenze)
npm run sync-google-reviews

# Jdi do admin panelu
/admin/reviews

# Schval nové recenze
```

### Smazání starých recenzí:

V admin panelu můžeš smazat libovolnou recenzi (Google i manuální).

---

## 📈 Best Practices

1. **Sync 1x týdně** (nebo po každé nové Google recenzi)
2. **Schvaluj všechny** 5★ recenze
3. **Edituj dlouhé recenze** (zkrať na 2-3 věty)
4. **Featured = 3 nejlepší** (zobrazí se nahoře)
5. **Manuální recenze** pro speciální případy (klienti bez Google účtu)

---

## ❓ FAQ

**Q: Co když má recenze špatný pravopis?**
A: Můžeš ji upravit v admin panelu před schválením.

**Q: Můžu smazat Google recenzi?**
A: Ano, prostě ji neschválíš nebo smažeš z DB.

**Q: Jak často se aktualizují Google recenze?**
A: Když spustíš `npm run sync-google-reviews` (manuálně nebo cron).

**Q: Kolik to stojí?**
A: Places API je zdarma do 100k requests/měsíc. Weblyx = ~720 requests/měsíc = **ZDARMA** ✅

---

**Hotovo!** Máš plnou kontrolu nad recenzemi. 🎉
