# 🚀 Weblyx - Claude Code Projekt Config

**Toto nastavení platí POUZE pro Weblyx projekt.**

---

## 📦 Projekt Info

- **Name:** Weblyx
- **Path:** `/Users/zen/weblyx`
- **GitHub:** `https://github.com/JevgOne/Weblyx`
- **Branch:** `main`
- **Vercel:** `https://vercel.com/jevg-ones-projects/weblyx`

---

## 🎯 Základní principy (Weblyx-specific)

### 1. Priorita nástrojů: ZDARMA → OMEZENÉ → PLACENÉ

**Vždy používej v tomto pořadí:**
1. **WebFetch** - NEOMEZENÝ, zdarma → první volba pro známé URL
2. **WebSearch** - NEOMEZENÝ, zdarma → druhá volba pro vyhledávání
3. **Puppeteer** - NEOMEZENÝ, zdarma → pro interakci s browserem
4. **Brave Search** - LIMITOVANÝ (66x/den) → pouze když ostatní nefungují

### 2. Autonomie - vždy zvol řešení BEZ účasti uživatele

**KRITICKÉ PRAVIDLO:**
Pokud existuje více variant řešení a jedna z nich NEZAHRNUJE moji účast, **VŽDY automaticky zvolíš tuto možnost**.

### 3. Čestnost před vymýšlením

**NIKDY si nevymýšlej:**
- ❌ Nepřidávej informace, které nevíš
- ❌ Nehádej API endpointy nebo formáty

**VŽDY raději řekni:**
- ✅ "Nevím, potřebuji to ověřit"

### 4. Multilingual Processing - Angličtina pro lepší kvalitu

**KRITICKÉ: AI modely mají 15-20% lepší výkon v angličtině než v češtině**

**Research data (2025):**
- English performance: **70.9%** úspěšnost
- Czech performance: **55.3%** úspěšnost
- **Gap: -15.6% horší kvalita v češtině!**

**WORKFLOW:**

```
User input (CZ)
    ↓
[Internal translation to EN]
    ↓
[Reasoning & processing in EN] ← 15-20% LEPŠÍ KVALITA
    ↓
[Web searches in EN] ← 10x více kvalitních výsledků
    ↓
[Translate output back to CZ]
    ↓
User output (CZ)
```

**PRAVIDLA:**

1. **Input:** Přijmi v češtině (pro pohodlí uživatele)
2. **Processing:**
   - Interně přelož do EN
   - Reasoning v EN
   - Web searches VŽDY v EN
3. **Output:** Přelož zpět do CZ pro uživatele

**PŘÍKLADY:**

❌ **ŠPATNĚ:**
```
User: "Najdi best practices pro Next.js ISR"
Claude: WebSearch("nejlepší postupy ISR Next.js 2025")
→ Málo výsledků, nižší kvalita
```

✅ **SPRÁVNĚ:**
```
User: "Najdi best practices pro Next.js ISR"
Claude:
  [Internal] Translate: "Next.js Incremental Static Regeneration best practices"
  WebSearch("Next.js ISR best practices revalidation on-demand 2025")
  [Process results in EN]
  [Translate output]: "Našel jsem tyto best practices pro ISR..."
→ 10x více kvalitních výsledků, lepší reasoning
```

**TECHNICKÉ VÝJIMKY (vždy EN, i v odpovědi):**
- Code: proměnné, funkce, komentáře v kódu
- Tech terms: Next.js, Vercel, Firebase, Turso, API, route
- File paths: `/app/api/auth/route.ts`
- Git commits: `git commit -m "Fix auth bug"`

---

## 🛠 Weblyx Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** Turso (libSQL)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS
- **Colors:** Teal (#14B8A6) - main brand color

---

## 📁 Weblyx Structure

```
/Users/zen/weblyx/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             # Utilities, DB clients
├── public/          # Static assets
├── scripts/         # Build/migration scripts
└── .claude/         # Tento config (project-specific)
```

---

## 🔗 Weblyx Connections

### GitHub
```bash
cd /Users/zen/weblyx
git remote -v
# origin: git@github.com:JevgOne/Weblyx.git
```

### Vercel
```bash
cd /Users/zen/weblyx
vercel link  # Link to existing project "weblyx"
vercel env pull  # Pull environment variables
vercel --prod  # Deploy to production
```

---

## ⚙️ Weblyx Setup & Commands

### Initial Setup
```bash
cd /Users/zen/weblyx
npm install                    # Install dependencies
vercel link                    # Link to Vercel project
vercel env pull                # Pull environment variables to .env.local
chmod +x scripts/*.ts          # Make scripts executable
```

### Development
```bash
npm run dev                    # Start dev server (http://localhost:3000)
npm run build                  # Build for production
npm run lint                   # Run ESLint
```

### Database (Turso)
```bash
# View/manage database
turso db shell [database-name]         # Open database shell
turso db show [database-name]          # Show database info
```

### Deployment
```bash
vercel --prod                  # Deploy to production
vercel --prod --yes            # Deploy without confirmation
```

---

## 🎯 Weblyx-Specific Rules

1. **Vždy pracuj v `/Users/zen/weblyx`**
2. **Používej Teal (#14B8A6) pro brand colors**
3. **ISR revalidation:** Homepage a portfolio používají ISR
4. **Image uploads:** Hero a Services mají image upload support
5. **Database:** Turso credentials jsou v env variables

---

**Verze:** 1.0 (Weblyx-specific)
**Datum:** 2025-01-22
