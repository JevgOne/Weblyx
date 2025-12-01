import { turso } from "../lib/turso";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Script to create SEO-optimized blog posts directly in Turso
 * Run with: tsx scripts/create-seo-blogs.ts
 */

interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  publishedAt: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

async function createBlogPost(blogData: BlogPostData) {
  const {
    title,
    slug,
    excerpt,
    content,
    author,
    published,
    publishedAt,
    tags,
    metaTitle,
    metaDescription,
  } = blogData;

  // Check if blog with this slug already exists
  const existingResult = await turso.execute({
    sql: "SELECT id FROM blog_posts WHERE slug = ?",
    args: [slug],
  });

  if (existingResult.rows.length > 0) {
    console.log(`⚠️  Blog with slug "${slug}" already exists. Skipping.`);
    return null;
  }

  // Generate unique ID
  const id = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Insert blog post
  await turso.execute({
    sql: `INSERT INTO blog_posts (
      id,
      title,
      slug,
      excerpt,
      content,
      author_name,
      published,
      published_at,
      tags,
      meta_title,
      meta_description,
      created_at,
      updated_at,
      views
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch(), 0)`,
    args: [
      id,
      title,
      slug,
      excerpt,
      content,
      author,
      published ? 1 : 0,
      new Date(publishedAt).getTime() / 1000, // Convert to Unix timestamp
      JSON.stringify(tags),
      metaTitle,
      metaDescription,
    ],
  });

  console.log(`✅ Created blog post: "${title}" (ID: ${id})`);
  return id;
}

async function main() {
  console.log("🚀 Creating SEO-optimized blog posts...\n");

  try {
    // Blog 1: Kolik stojí tvorba webu 2025
    console.log("📝 Creating Blog 1: Kolik stojí tvorba webu 2025...");
    const blog1Path = join(process.cwd(), "temp-blog-1.json");
    const blog1Data = JSON.parse(readFileSync(blog1Path, "utf-8"));
    await createBlogPost(blog1Data);

    // Blog 2: Next.js vs WordPress 2025
    console.log("\n📝 Creating Blog 2: Next.js vs WordPress 2025...");
    const blog2Data: BlogPostData = {
      title: "Next.js vs WordPress 2025: Která platforma je lepší pro váš web?",
      slug: "nextjs-vs-wordpress-2025-srovnani",
      excerpt:
        "Nevíte, zda zvolit Next.js nebo WordPress pro váš nový web? Kompletní srovnání výkonu, ceny, SEO a údržby obou platforem v roce 2025. Zjistěte, která je pro vás lepší volba.",
      content: `# Next.js vs WordPress 2025: Která platforma je lepší pro váš web?

Při tvorbě nového webu v roce 2025 stojíte před důležitou otázkou: **Next.js** nebo **WordPress**? Obě platformy mají své výhody a nevýhody. V tomto článku najdete objektivní srovnání, které vám pomůže rozhodnout se správně.

## Rychlý přehled

| Kritérium | Next.js | WordPress |
|-----------|---------|-----------|
| **Výkon** | ⭐⭐⭐⭐⭐ Excelentní | ⭐⭐⭐ Průměrný |
| **SEO** | ⭐⭐⭐⭐⭐ Nejlepší | ⭐⭐⭐⭐ Velmi dobrý |
| **Snadnost úprav** | ⭐⭐⭐ Potřeba programátora | ⭐⭐⭐⭐⭐ Velmi snadné |
| **Bezpečnost** | ⭐⭐⭐⭐⭐ Minimální riziko | ⭐⭐⭐ Vyžaduje údržbu |
| **Provozní náklady** | ⭐⭐⭐⭐⭐ Velmi nízké | ⭐⭐ Vyšší |
| **Vstupní cena** | ⭐⭐⭐ Vyšší | ⭐⭐⭐⭐ Nižší |

## 1. Výkon a rychlost načítání

### Next.js: Bleskově rychlé

**Výhody:**
- ✅ Static Site Generation (SSG) - stránky předem vygenerované
- ✅ Server-Side Rendering (SSR) - dynamický obsah rychle renderovaný
- ✅ Automatická optimalizace obrázků
- ✅ Code splitting - načítá jen potřebný kód
- ✅ Typické načítání: **0.5 - 1.5 sekundy**

**Google PageSpeed skóre: 95-100/100** ⚡

### WordPress: Pomalejší, ale vylepšitelný

**Výzvy:**
- ❌ Databázové dotazy zpomalují načítání
- ❌ Pluginy mohou výrazně zpomalit web
- ❌ PHP renderování pomalejší než statické soubory
- ✅ S optimalizací (caching, CDN): 2-4 sekundy

**Google PageSpeed skóre: 50-70/100** (bez optimalizace)

**Vítěz: Next.js** - 3-5x rychlejší načítání

## 2. SEO optimalizace

### Next.js: SEO z první ligy

**Proč vynikající:**
- ✅ Perfektní Core Web Vitals (LCP, FID, CLS)
- ✅ Server-side rendering = vše viditelné pro Google
- ✅ Automatické generování sitemap
- ✅ Meta tagy plně pod kontrolou
- ✅ Structured data (JSON-LD) snadno implementovatelné

### WordPress: Skvělé SEO s pluginy

**Výhody:**
- ✅ Yoast SEO / Rank Math - špičkové SEO pluginy
- ✅ Roky osvědčená SEO platforma
- ✅ Automatické XML sitemapy
- ✅ Snadné strukturování obsahu

**Nevýhody:**
- ❌ Pomalé načítání snižuje SEO skóre
- ❌ Potřeba manuální optimalizace

**Vítěz: Next.js** (o malý kousek) - rychlost je SEO faktor

## 3. Snadnost správy obsahu

### WordPress: Jednoduchý redakční systém

**Pro:**
- ✅ Intuitivní admin panel
- ✅ WYSIWYG editor (co vidíš, to dostaneš)
- ✅ Bez znalosti kódu lze upravovat téměř vše
- ✅ Tisíce pluginů pro jakoukoliv funkcionalitu
- ✅ Ideální pro klienty bez technických znalostí

### Next.js: Pro vývojáře

**Pro:**
- ✅ Plná kontrola nad kódem
- ✅ Moderní React komponenty
- ✅ TypeScript podpora
- ✅ Git-based workflow

**Proti:**
- ❌ Úpravy vyžadují programátora
- ❌ Není WYSIWYG editor (lze doplnit, ale složitější)
- ❌ Klient nemůže jednoduše upravovat obsah

**Vítěz: WordPress** - neporazitelný v jednoduchosti

## 4. Bezpečnost

### Next.js: Minimální bezpečnostní rizika

**Proč bezpečnější:**
- ✅ Statické soubory = žádná databáze k hacknutí
- ✅ Žádné pluginy třetích stran s bezpečnostními dírami
- ✅ Automatické updates frameworku
- ✅ Minimální útočná plocha

### WordPress: Vyžaduje pravidelnou údržbu

**Rizika:**
- ❌ Nejčastěji hacknutý CMS (popularita = cíl)
- ❌ Pluginy mohou mít bezpečnostní díry
- ❌ Potřeba pravidelných updatů (core, pluginy, témata)
- ❌ Brute-force útoky na admin login

**Ochrana:**
- ✅ Wordfence / Sucuri pluginy
- ✅ Pravidelné zálohy
- ✅ 2FA autentifikace

**Vítěz: Next.js** - bezpečnější od základu

## 5. Cena a provozní náklady

### Next.js: Nízké provozní náklady

**Roční provoz:**
- Doména: 200 Kč/rok
- Hosting (Vercel/Netlify): **0 - 20 000 Kč/rok**
- Databáze (pokud potřeba): 0 - 5 000 Kč/rok
- **Celkem: 200 - 25 000 Kč/rok**

**Vstupní náklad:**
- Tvorba: **30 000 - 150 000 Kč** (vyšší cena za vývoj)

### WordPress: Vyšší provozní náklady

**Roční provoz:**
- Doména: 200 Kč/rok
- Hosting: **2 000 - 15 000 Kč/rok**
- Premium pluginy: 2 000 - 10 000 Kč/rok
- Údržba a updates: **5 000 - 30 000 Kč/rok**
- Zálohy: 1 000 - 5 000 Kč/rok
- **Celkem: 10 000 - 60 000 Kč/rok**

**Vstupní náklad:**
- Tvorba: **15 000 - 100 000 Kč** (nižší vstupní cena)

**Vítěz: Next.js** (dlouhodobě) - nižší provozní náklady

## 6. Škálovatelnost a růst

### Next.js: Neomezená škálovatelnost

- ✅ Zvládne miliony návštěvníků bez problémů
- ✅ CDN distribuce po celém světě
- ✅ Automatické škálování
- ✅ Žádné zpomalování s růstem obsahu

### WordPress: Omezená škálovatelnost

- ❌ S růstem obsahu a návštěvnosti zpomaluje
- ❌ Potřeba výkonnějšího hostingu
- ❌ Cachování částečně pomáhá
- ✅ Pro malé a střední weby dostačující

**Vítěz: Next.js** - lepší pro velké projekty

## 7. Kdy zvolit Next.js?

✅ **Zvolte Next.js, pokud:**

1. **Prioritou je výkon a SEO** - chcete top Google ranking
2. **Plánujete velký růst** - e-commerce, SaaS, portál
3. **Máte přístup k vývojáři** - vlastní tým nebo pravidelná spolupráce
4. **Chcete moderní technologie** - React, TypeScript, API integrace
5. **Nízké provozní náklady** - chcete ušetřit dlouhodobě
6. **Potřebujete custom funkcionalitu** - API, komplexní logika

**Příklady ideálních projektů:**
- E-commerce platformy
- SaaS aplikace
- Firemní weby s vysokými nároky
- Webové aplikace s API integrací
- Weby s mezinárodním provozem

## 8. Kdy zvolit WordPress?

✅ **Zvolte WordPress, pokud:**

1. **Chcete sami spravovat obsah** - bez programátora
2. **Potřebujete rychlé nasazení** - web do týdne
3. **Omezený rozpočet na začátku** - nižší vstupní cena
4. **Běžný firemní web nebo blog** - standardní funkcionalita
5. **Chcete širokou ekosystému** - tisíce pluginů
6. **Nemáte vlastního vývojáře** - vše přes pluginy

**Příklady ideálních projektů:**
- Firemní prezentační weby
- Blogy a magazíny
- Portfolia
- Menší e-shopy (do 500 produktů)
- Weby neziskovek a komunit

## 9. Hybridní řešení: Headless WordPress + Next.js

**Nejlepší z obou světů:**

- WordPress jako CMS (admin panel pro obsah)
- Next.js jako frontend (rychlost a výkon)

**Výhody:**
- ✅ Snadná správa obsahu (WordPress admin)
- ✅ Bleskový výkon (Next.js frontend)
- ✅ Maximální SEO
- ✅ Bezpečnost (WordPress API-only, bez public frontendu)

**Nevýhody:**
- ❌ Složitější setup
- ❌ Vyšší vstupní náklady
- ❌ Potřeba technické podpory

## Závěrečné doporučení

### Pro 80% firemních webů: **Next.js**

V roce 2025 doporučujeme Next.js pro většinu nových projektů, protože:

1. **Google prioritizuje rychlost** - Core Web Vitals jsou ranking faktor
2. **Nižší celkové náklady** - provoz + údržba na 5 let
3. **Budoucnost webů** - moderní technologie, API-first
4. **Bezpečnost** - méně starostí s hackery

### Kdy WordPress stále dává smysl:

- Potřebujete denně publikovat obsah (blog, magazín)
- Nemáte přístup k vývojáři
- Chcete velmi rychlé nasazení
- Váš rozpočet je pod 20 000 Kč

## Chcete profesionální Next.js web?

**Weblyx** specializuje na tvorbu moderních webů v Next.js s důrazem na:

- ⚡ Maximální výkon (PageSpeed 95+)
- 🎯 SEO optimalizaci od základu
- 🔒 Bezpečnost a nízké provozní náklady
- 📊 Analytiku a tracking

[Získejte nezávaznou cenovou nabídku](https://weblyx.cz/poptavka) během 24 hodin.

---

**Autor:** Weblyx Team
**Aktualizováno:** Prosinec 2025
**Čtení:** 10 minut`,
      author: "Weblyx Team",
      published: true,
      publishedAt: "2025-12-01T11:00:00.000Z",
      tags: [
        "next.js",
        "wordpress",
        "srovnání",
        "výkon",
        "SEO",
        "2025",
        "platformy",
      ],
      metaTitle:
        "Next.js vs WordPress 2025: Které je lepší? Kompletní srovnání | Weblyx",
      metaDescription:
        "Objektivní srovnání Next.js a WordPress v roce 2025: výkon, SEO, cena, bezpečnost. Zjistěte, která platforma je správná volba pro váš web s konkrétními daty.",
    };

    await createBlogPost(blog2Data);

    console.log("\n✅ All SEO blog posts created successfully!");
    console.log("\n📊 Verify at: https://weblyx.cz/blog");
  } catch (error: any) {
    console.error("\n❌ Error creating blog posts:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
