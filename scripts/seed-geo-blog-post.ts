#!/usr/bin/env tsx
// Seed script: Insert GEO blog post about AI search trends
import { createBlogPost } from '../lib/turso/blog';

const BLOG_CONTENT = `## 37 % spotřebitelů hledá přes AI — a vaše firma tam možná není

Představte si, že **každý třetí potenciální zákazník** hledá vaše služby pomocí ChatGPT nebo Perplexity místo Googlu. A AI mu doporučí konkurenci, protože o vaší firmě nemá dostatek informací.

Přesně to se děje právě teď. Podle nejnovějších dat **37 % spotřebitelů** již pravidelně používá AI nástroje jako primární zdroj pro vyhledávání informací, produktů a služeb. A tento trend roste každý měsíc.

## Co je AI vyhledávání a proč na něm záleží?

AI vyhledávání znamená, že místo zadání dotazu do Google a procházení desítek výsledků, uživatel položí otázku AI nástroji a dostane **jednu komplexní odpověď**. Hlavní AI vyhledávače:

- **ChatGPT** — 200+ milionů aktivních uživatelů, stále více lidí ho používá pro hledání produktů a služeb
- **Perplexity AI** — vyhledávač postavený na AI, který cituje zdroje a poskytuje strukturované odpovědi
- **Google AI Overviews** — Google sám přidává AI odpovědi na začátek výsledků vyhledávání

Klíčový rozdíl? V klasickém Googlu se uživatel proklikne na váš web. V AI vyhledávání dostane odpověď **přímo** — a buď jste v ní zmíněni, nebo ne.

## 93 % odpovědí bez kliknutí — co to znamená pro firmy

Tady přichází **nejdůležitější číslo**: 93 % odpovědí v AI vyhledávačích je tzv. **zero-click**. Uživatel dostane odpověď, aniž by klikl na jakýkoliv web.

Co to znamená v praxi:

- **Pokud AI vaši firmu nezná** — nemáte šanci získat zákazníka
- **Pokud AI zná vaši konkurenci** — ta dostane doporučení místo vás
- **Tradiční SEO nestačí** — být na první stránce Google je skvělé, ale AI vyhledávače fungují jinak

## Co je GEO — Generative Engine Optimization?

**GEO (Generative Engine Optimization)** je nová disciplína digitálního marketingu. Zatímco SEO optimalizuje web pro tradiční vyhledávače, GEO optimalizuje pro AI vyhledávače.

### Klíčové rozdíly SEO vs. GEO:

| Aspekt | SEO | GEO |
|--------|-----|-----|
| Cíl | Vyšší pozice v Google | Být citován v AI odpovědích |
| Metriky | Pozice, CTR, traffic | Zmínky, citace, AI visibility |
| Obsah | Keywords, meta tagy | Strukturovaná data, entity |
| Výsledek | Klik na web | Doporučení od AI |

## Proč je GEO důležité pro české firmy

Možná si říkáte: "To se týká hlavně zahraničních trhů." Ale data ukazují opak:

1. **ChatGPT rozumí česky** — a stále více Čechů ho používá pro hledání lokálních služeb
2. **Google AI Overviews přichází** — Google postupně nasazuje AI odpovědi i na české dotazy
3. **Early adopter výhoda** — firmy, které začnou s GEO teď, budou mít obrovský náskok
4. **Generace Z a mileniálové** — mladší zákazníci preferují AI nad klasickým vyhledáváním

## 5 klíčových kroků k GEO optimalizaci

### 1. Implementujte strukturovaná data (Schema.org)

AI modely "čtou" strukturovaná data mnohem lépe než běžný text. Přidejte na web JSON-LD schémata:
- **Organization** — kdo jste
- **LocalBusiness** — kde působíte
- **Product/Service** — co nabízíte
- **FAQ** — odpovědi na časté otázky
- **Review/AggregateRating** — co o vás říkají zákazníci

### 2. Pište obsah jako odpovědi na otázky

AI vyhledávače hledají **jasné, strukturované odpovědi**. Místo vágních marketingových textů pište konkrétně:
- Používejte H2/H3 headingy jako otázky
- Odpovídejte v prvním odstavci pod headingem
- Uvádějte konkrétní čísla, fakta a příklady

### 3. Budujte svou digitální entitu

AI modely pracují s **entitami** — propojenými informacemi o vaší firmě. Propojte:
- Web, Google Business profil, sociální sítě
- Oborové katalogy a registrace (Firmy.cz, Zivefirmy.cz)
- Reference a zmínky na jiných webech

### 4. Získávejte citace a reference

AI modely preferují informace z **důvěryhodných zdrojů**. Čím více kvalitních zmínek o vaší firmě existuje, tím spíše vás AI doporučí:
- PR články na oborových webech
- Recenze na Google, Firmy.cz
- Zmínky v médiích a na sociálních sítích

### 5. Monitorujte svou AI viditelnost

Pravidelně kontrolujte, jak o vaší firmě mluví AI:
- Zadejte do ChatGPT a Perplexity dotazy, které vaši zákazníci používají
- Sledujte, zda jste zmíněni v odpovědích
- Porovnávejte se s konkurencí

## Začněte s GEO optimalizací ještě dnes

AI vyhledávání není budoucnost — je to **přítomnost**. Každý den, kdy vaše firma není optimalizovaná pro AI, ztrácíte potenciální zákazníky.

**Weblyx nabízí kompletní GEO optimalizaci od 5 000 Kč/měsíc** — od Schema.org auditu přes implementaci strukturovaných dat až po monitoring AI viditelnosti.

[Zjistěte více o GEO optimalizaci](/geo-optimalizace) nebo [nás kontaktujte](/poptavka) pro nezávaznou konzultaci. Ukážeme vám, jak jste na tom v AI vyhledávačích a co můžete zlepšit.
`;

async function seedGeoBlogPost() {
  console.log('Seeding GEO blog post...');

  try {
    const post = await createBlogPost({
      title: '37 % spotřebitelů hledá přes AI: Co to znamená pro váš byznys',
      slug: 'ai-vyhledavani-nahrazuje-google-geo-optimalizace',
      content: BLOG_CONTENT,
      excerpt: '37 % spotřebitelů už hledá přes AI místo Googlu. 93 % odpovědí v AI vyhledávačích je bez kliknutí. Zjistěte, co je GEO optimalizace a jak připravit web na AI vyhledávání.',
      authorName: 'Weblyx',
      published: true,
      publishedAt: new Date(),
      tags: ['GEO', 'AI vyhledávání', 'SEO', 'ChatGPT', 'marketing'],
      metaTitle: '37 % spotřebitelů hledá přes AI: Co to znamená pro váš byznys | Weblyx',
      metaDescription: '37 % spotřebitelů používá AI místo Googlu. Zjistěte, co je GEO optimalizace a jak připravit web na AI vyhledávání (ChatGPT, Perplexity, Google AI).',
      language: 'cs',
    });

    console.log(`Blog post created successfully!`);
    console.log(`  ID: ${post.id}`);
    console.log(`  Slug: ${post.slug}`);
    console.log(`  URL: /blog/${post.slug}`);
  } catch (error) {
    console.error('Failed to seed blog post:', error);
    process.exit(1);
  }
}

seedGeoBlogPost();
