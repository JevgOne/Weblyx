# 🥊 BoxRec Integration - Titan Boxing

Automatické načítání profilů boxerů z BoxRec.com

---

## 🎯 Co to umí

- ✅ **Scrape BoxRec profily** pomocí Puppeteer
- ✅ **Auto-import dat:** jméno, rekord, divize, výška, dosah, atd.
- ✅ **Sync s BoxRec:** Aktualizuj data kdykoliv
- ✅ **REST API:** Jednoduché API endpoints
- ✅ **Turso DB storage:** Rychlá SQLite databáze

---

## 📊 Data která se stahují

Z BoxRec profilu (např. https://boxrec.com/en/box-pro/1070292):

```typescript
{
  name: "Jméno Boxera",
  record: {
    wins: 10,
    losses: 2,
    draws: 1
  },
  division: "Welterweight",
  stance: "Orthodox",
  height: "5′ 10″",
  reach: "72″",
  birthDate: "1995-01-01",
  birthPlace: "Prague, Czech Republic",
  debutDate: "2015-03-20",
  totalBouts: 13,
  lastFight: {
    date: "2024-11-15",
    opponent: "John Doe",
    result: "W UD"
  },
  profileImageUrl: "https://...",
  boxrecUrl: "https://boxrec.com/en/box-pro/1070292"
}
```

---

## 🚀 Použití

### 1. Import boxera z BoxRec

**API Request:**
```bash
curl -X POST http://localhost:3000/api/boxers/import \
  -H "Content-Type: application/json" \
  -d '{
    "boxrecId": "1070292",
    "teamRole": "reprezentant",
    "bio": "Něco o boxerovi...",
    "achievements": ["Mistr ČR 2023", "Zlatá medaile 2024"],
    "featured": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "boxerId": "boxer_1234567890_abc123"
  },
  "message": "Boxer imported successfully from BoxRec"
}
```

### 2. Seznam všech boxerů

```bash
# Všichni boxeři
curl http://localhost:3000/api/boxers

# Pouze aktivní
curl http://localhost:3000/api/boxers?active=true

# Pouze featured (hlavní stránka)
curl http://localhost:3000/api/boxers?featured=true
```

### 3. Sync s BoxRec (aktualizace dat)

```bash
curl -X POST http://localhost:3000/api/boxers/sync \
  -H "Content-Type: application/json" \
  -d '{
    "boxerId": "boxer_1234567890_abc123"
  }'
```

---

## 💻 Použití v kódu

### Import boxera programově

```typescript
import { importFromBoxRec } from '@/lib/turso-boxers';

const boxerId = await importFromBoxRec('1070292', {
  teamRole: 'reprezentant',
  bio: 'Profesionální boxer...',
  featured: true,
});
```

### Získání seznamu boxerů

```typescript
import { getAllBoxers, getFeaturedBoxers } from '@/lib/turso-boxers';

// Všichni aktivní boxeři
const boxers = await getAllBoxers(true);

// Pouze featured pro homepage
const featured = await getFeaturedBoxers();
```

### Sync s BoxRec

```typescript
import { syncWithBoxRec } from '@/lib/turso-boxers';

// Aktualizuj data z BoxRec
await syncWithBoxRec(boxerId);
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE boxers (
    id TEXT PRIMARY KEY,
    boxrec_id TEXT UNIQUE,
    name TEXT NOT NULL,

    -- Record
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,

    -- Physical stats
    division TEXT,
    stance TEXT,
    height TEXT,
    reach TEXT,

    -- Personal info
    birth_date TEXT,
    birth_place TEXT,
    nationality TEXT,

    -- Career info
    debut_date TEXT,
    total_bouts INTEGER DEFAULT 0,
    ko_percentage REAL,

    -- Last fight
    last_fight_date TEXT,
    last_fight_opponent TEXT,
    last_fight_result TEXT,

    -- Media
    profile_image_url TEXT,
    boxrec_url TEXT,

    -- Team info
    team_role TEXT,
    bio TEXT,
    achievements TEXT, -- JSON array
    active BOOLEAN DEFAULT 1,
    featured BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,

    -- Metadata
    last_synced_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

---

## 🎨 Frontend Komponenta (příklad)

```typescript
// components/BoxerCard.tsx
import { Boxer } from '@/lib/turso-boxers';

export function BoxerCard({ boxer }: { boxer: Boxer }) {
  return (
    <div className="boxer-card">
      {boxer.profileImageUrl && (
        <img src={boxer.profileImageUrl} alt={boxer.name} />
      )}
      <h3>{boxer.name}</h3>
      <p className="record">
        {boxer.wins}-{boxer.losses}-{boxer.draws}
      </p>
      <p className="division">{boxer.division}</p>
      {boxer.teamRole && <span className="role">{boxer.teamRole}</span>}
      {boxer.bio && <p className="bio">{boxer.bio}</p>}
      {boxer.boxrecUrl && (
        <a href={boxer.boxrecUrl} target="_blank">
          BoxRec Profile
        </a>
      )}
    </div>
  );
}

// Použití na stránce
export default async function TeamPage() {
  const response = await fetch('http://localhost:3000/api/boxers?active=true');
  const { data: boxers } = await response.json();

  return (
    <div className="team-grid">
      {boxers.map(boxer => (
        <BoxerCard key={boxer.id} boxer={boxer} />
      ))}
    </div>
  );
}
```

---

## 🔄 Automatický Sync (volitelné)

Vytvoř cron job pro pravidelný sync:

```typescript
// app/api/cron/sync-boxers/route.ts
import { getAllBoxers, syncWithBoxRec } from '@/lib/turso-boxers';

export async function GET() {
  const boxers = await getAllBoxers();

  for (const boxer of boxers) {
    if (boxer.boxrecId) {
      try {
        await syncWithBoxRec(boxer.id);
        console.log(`Synced: ${boxer.name}`);
      } catch (error) {
        console.error(`Failed to sync ${boxer.name}:`, error);
      }
    }
  }

  return Response.json({ success: true });
}
```

Pak nastav Vercel Cron:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/sync-boxers",
    "schedule": "0 0 * * *"
  }]
}
```

---

## 📋 Checklist pro použití

- [ ] Turso DB setup dokončen
- [ ] SQL schema aplikováno
- [ ] Dev server běží (`npm run dev`)
- [ ] Získej BoxRec ID boxera (z URL)
- [ ] Zavolej `/api/boxers/import` s BoxRec ID
- [ ] Zkontroluj data v DB nebo přes `/api/boxers`
- [ ] (Volitelné) Přidej bio a achievements
- [ ] Nastav `featured: true` pro homepage
- [ ] Deploy na Vercel

---

## 🆘 Troubleshooting

**"Failed to scrape BoxRec profile"**
- BoxRec může blokovat requesty → Použij rate limiting (2s delay mezi requesty)
- Zkontroluj, že Puppeteer funguje: `which chromium`

**"Table boxers doesn't exist"**
```bash
turso db shell titanboxing < turso-schema.sql
```

**BoxRec změnil strukturu stránky**
- Aktualizuj selektory v `lib/boxrec-scraper.ts`
- Otevři BoxRec profil v browseru a zkontroluj CSS třídy

---

## 🎉 Hotovo!

Teď můžeš:
1. Importovat boxery z BoxRec jediným API callem
2. Zobrazovat je na webu
3. Auto-sync jejich data
4. Mít vždy aktuální rekordy a statistiky

**Next:** Importuj první boxera pomocí `SETUP_NOW.md`! 🥊
