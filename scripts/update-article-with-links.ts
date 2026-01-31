import { config } from 'dotenv';
config({ path: '.env.local' });

import { updateBlogPost, getBlogPostBySlug } from '../lib/turso/blog';

const content = String.raw`WordPress pohání zhruba 40 % všech webů na internetu. Tahle čísla znáš — opakuje je každý druhý článek o tvorbě webů. Ale víš, co ti tyhle články neřeknou? Že většina těch webů je pomalá, děravá a majitele stojí víc peněz, než si myslí.

Jsem vývojář, který strávil roky tvorbou WordPress webů. A pak s tím přestal. Ne proto, že by mě WordPress přestal bavit — ale proto, že jsem svým klientům nemohl dál s čistým svědomím říkat, že je to ta nejlepší volba.

V roce 2026 existují lepší nástroje. A tvoje agentura ti to buď neřekne, nebo to sama neví.

## Slona v místnosti pojmenujme: WordPress má problémy

Než mě ukamenujete v komentářích — nesnažím se říct, že WordPress je na nic. Byl revoluční. Demokratizoval web. Jenže svět se hnul dál a WordPress zůstal stát.

### Rychlost? Spíš pomalost.

Průměrný WordPress web se načítá **4 až 8 sekund**. A to ještě mluvím o webech, které jsou "optimalizované". Bez optimalizace? Klidně 10+.

Google říká, že pokud se stránka nenačte do 3 sekund, **53 % mobilních uživatelů odejde**. Takže tvůj krásný WordPress web s parallax efekty a dvaceti pluginy vidí ve skutečnosti jen polovina lidí, kteří na něj kliknou.

Proč je to tak pomalé? WordPress generuje každou stránku dynamicky. Pokaždé, když někdo přijde na tvůj web, server musí:
1. Přečíst požadavek
2. Spustit PHP
3. Dotázat se databáze
4. Složit stránku dohromady
5. Odeslat výsledek

A to se děje **při každém načtení**. Ano, existuje caching. Ale to je jako lepit náplast na zlomenou nohu.

### Bezpečnost? Plugin roulette.

WordPress sám o sobě je relativně bezpečný. Problém jsou pluginy. A pluginy potřebuješ na všechno — kontaktní formulář, SEO, bezpečnost, galerii, rychlost, zálohy...

Průměrný WordPress web má **20-30 pluginů**. Každý z nich je potenciální zadní vrátka do tvého webu. V roce 2024 bylo přes WordPress pluginy kompromitováno **přes 1 milion webů** (zdroj: Wordfence). V roce 2025 se to nezlepšilo.

Jenže bez pluginů WordPress nic neumí. Je to takový Frankensteinův web — funguje, ale je poskládaný z kusů, které spolu komunikují víc díky štěstí než díky designu.

### Údržba — tvůj nový part-time job

Máš WordPress web? Gratuluju, právě jsi získal neplacený druhý zaměstnání:

- **Aktualizace WordPressu** — každý měsíc
- **Aktualizace pluginů** — každý týden (a modlit se, že se nic nerozbije)
- **Aktualizace šablony** — občas, a když ji aktualizuješ, tvoje úpravy se přepíšou
- **Zálohy** — protože viz výše
- **Monitoring bezpečnosti** — protože viz výše výše

A co se stane, když aktualizuješ plugin a rozbije se ti web? Voláš agenturu. A ta ti naúčtuje "údržbu".

### Skryté náklady — WordPress není zadarmo

"WordPress je zdarma!" — tohle je největší mýtus, který koluje. Technicky ano. Prakticky ne.

Reálné náklady typického WordPress webu za rok:

- **Hosting** — 1 200-6 000 Kč/rok (a ten levný je pomalý)
- **Premium šablona** — 1 000-3 000 Kč (jednorázově, ale aktualizace...)
- **Premium pluginy** — 3 000-15 000 Kč/rok (SEO, formuláře, page builder, bezpečnost)
- **SSL certifikát** — často v ceně hostingu, ale ne vždy
- **Údržba / agentura** — 500-3 000 Kč/měsíc
- **Řešení problémů** — nepředvídatelné, ale nevyhnutelné

Sečteno podtrženo: **10 000 až 50 000 Kč ročně** za web, který je pořád pomalejší než by měl být. A to nepočítám tu prvotní tvorbu. Chceš vědět, kolik stojí [moderní web na míru](/sluzby)? Překvapivě míň.

## Co je Next.js — a proč by tě to mělo zajímat

Teď si říkáš: "Dobře, WordPress je problém. Ale co místo něj?"

Next.js. A ne, nemusíš být programátor, abys pochopil, proč je lepší.

### Vysvětlení pro normální lidi

Představ si WordPress jako restauraci. Pokaždé, když si objednáš jídlo, kuchař začne vařit od nuly. Čekáš. A čekáš.

Next.js je jako restaurace, kde je jídlo **předem připravené a čeká na tebe**. Objednáš → dostaneš. Hned.

Technicky tomu říkáme **statická generace** (Static Site Generation). Tvůj web se "sestaví" předem a servíruje se jako hotové HTML soubory. Žádný PHP. Žádná databáze, do které se pokaždé šťourá. Žádné pluginy.

### Co to znamená v praxi?

- **Rychlost pod 1 sekundu** — stránky se načítají okamžitě
- **Bezpečnost by default** — žádné pluginy = žádné zranitelnosti. Není co hacknout.
- **Nulová údržba** — žádné aktualizace, žádné konflikty, žádné "web nejede"
- **Hosting zdarma nebo velmi levně** — platformy jako Vercel nabízejí hosting pro tyto weby zdarma
- **Dokonalé SEO** — Google miluje rychlé weby. A statické weby jsou nejrychlejší.

### Ale... nemůžu si tam přece sám měnit texty?

Můžeš. Existují tzv. headless CMS systémy (Sanity, Strapi, Contentful a další), které ti dají stejné pohodlí jako WordPress admin — ale bez nevýhod. Píšeš text v přehledném editoru, zmáčkneš publikovat, web se automaticky aktualizuje.

Nebo — a to je náš přístup u Weblyx — ti prostě nastavíme správu obsahu přesně na míru. Žádné desítky tlačítek, která nepotřebuješ. Jen to, co reálně používáš. Podívej se, jak [tvorba webových stránek](/sluzby) u nás funguje v praxi.

## Reálné srovnání: WordPress vs Next.js

Dost řečí, pojďme na čísla. Takhle vypadá srovnání ve skutečnosti:

| Kritérium | WordPress | Next.js |
|---|---|---|
| **Rychlost načtení** | 4-8 sekund | Pod 1 sekundu |
| **Bezpečnost** | Závislá na pluginech, časté zranitelnosti | Vysoká by default, minimální attack surface |
| **Údržba** | Pravidelná (aktualizace, zálohy, monitoring) | Minimální až žádná |
| **Roční náklady** | 10 000-50 000 Kč | 0-5 000 Kč |
| **SEO výkon** | Průměrný (bez drahých pluginů) | Vynikající (rychlost + čistý kód) |
| **Flexibilita designu** | Omezená šablonou | Neomezená |
| **Učící křivka pro správu** | Nízká (známé prostředí) | Nízká (s headless CMS) |
| **Škálovatelnost** | Problematická (čím víc obsahu, tím pomalejší) | Vynikající |
| **Potřeba vývojáře** | Na počáteční nastavení | Na počáteční nastavení |

Ano, vidíš správně. Next.js vyhrává skoro ve všech kategoriích. Ale tady přichází ta férová část...

## Kdy WordPress DÁVÁ smysl

Bylo by nefér říct, že je WordPress na všechno špatný. Není. Existují scénáře, kde stále dává smysl:

### 1. Obrovské publikační platformy
Pokud provozuješ zpravodajský server s tisíci články denně a desítkami editorů — WordPress (nebo spíš WordPress VIP) je stále silná volba. Ale... ty nejsi zpravodajský server, že?

### 2. E-shopy na WooCommerce (s výhradami)
WooCommerce je zralý ekosystém. Pokud máš e-shop s tisíci produkty a specifickými potřebami, migrace může být drahá. Ale pro nový e-shop? Podívej se na Shopify.

### 3. Když máš existující web a funguje
Pokud tvůj WordPress web běží, je rychlý, bezpečný a nepotřebuješ změnu — neměň ho. "Ain't broke, don't fix it." Ale pokud uvažuješ o novém webu, čti dál.

### 4. Když potřebuješ extrémně specifické pluginy
Některé niche pluginy nemají v Next.js ekosystému ekvivalent. Ale upřímně — pro 95 % firemních webů je to irelevantní.

## Pro koho je Next.js (a Weblyx)

A teď k jádru věci. Pokud se v následujícím popisu poznáš, Next.js je pravděpodobně správná volba:

### Živnostníci a freelanceři
Potřebuješ web, který vypadá profesionálně, načítá se rychle a nemusíš se o něj starat. Nechceš řešit aktualizace, hacky a hosting. Chceš mít web a věnovat se svému podnikání.

### Malé a střední firmy
Firemní prezentace, portfolio služeb, kontaktní formulář, maybe blog. To je 80 % toho, co potřebuješ. A na to je Next.js *dokonalý*. Mrkni na [naše realizace](/portfolio) — většina z nich běží na Next.js a načítá se pod sekundu.

### Landing pages a kampaně
Spouštíš produkt? Potřebuješ konverzní stránku? Rychlost a výkon jsou tady klíčové. Každá sekunda navíc tě stojí konverze. Next.js ti dá tu rychlost, kterou WordPress nikdy nedosáhne.

### Kdokoli, koho štve pomalý web
Pokud otevřeš svůj web na mobilu a čekáš... a čekáš... a pak odejdeš a pořád čekáš — je čas na změnu.

## Co to znamená pro tebe?

Podívej, nebavím se o tom z pozice akademického srovnání technologií. Bavím se o tom jako někdo, kdo denně vidí, jak malí podnikatelé platí tisíce měsíčně za weby, které jim aktivně škodí.

Pomalý web = míň zákazníků. To není názor, to je matematika.

**Pokud ti agentura říká, že WordPress je jediná cesta — buď neví o alternativách, nebo na WordPressu víc vydělá.** Oboje je problém.

Moderní web v roce 2026 by měl být:
- ⚡ Rychlý (pod 2 sekundy, ideálně pod 1)
- 🔒 Bezpečný (bez stovek pluginů jako potenciálních děr)
- 💰 Úsporný (nízké provozní náklady)
- 🎯 Efektivní (konvertuje návštěvníky na zákazníky)
- 😌 Bezstarostný (žádná údržba z tvé strany)

A přesně tohle děláme ve Weblyx. Stavíme weby na Next.js, které splňují všechny tyhle body. Žádný upsell na údržbu. Žádné skryté náklady na pluginy. Prostě web, který funguje.

## Shrnutí

WordPress změnil internet. Za to mu patří respekt. Ale svět se hnul dál. V roce 2026 existují nástroje, které jsou rychlejší, bezpečnější, levnější a méně náročné na údržbu.

Pro většinu malých firem a živnostníků je WordPress zbytečně komplexní, drahý a pomalý. Next.js nabízí všechno, co potřebuješ — a nic z toho, co nepotřebuješ.

**Nech svůj web pracovat pro tebe, ne naopak.**

---

## Chceš vědět, jak by vypadal tvůj nový web?

Bez závazků, bez bullshitu. Prostě se ozvi a řekneme ti, co pro tebe dává smysl — jestli Next.js, nebo třeba i ten WordPress. Záleží na tvé situaci, ne na tom, co prodáváme.

📩 [Pošli nezávaznou poptávku](/poptavka) — ozveme se do 24 hodin.

Nebo se nejdřív podívej, [jak pracujeme a co nabízíme](/sluzby), případně na [projekty, které jsme dodali](/portfolio). A kdyby tě cokoli zajímalo, klidně nám [napiš napřímo](/kontakt).`;

async function main() {
  console.log('Updating blog article with internal links + setting as DRAFT...\n');

  const post = await getBlogPostBySlug('wordpress-vs-nextjs-srovnani-2026');
  if (!post) {
    console.error('Blog post not found!');
    process.exit(1);
  }

  console.log('Found post:', post.id);
  console.log('Current published:', post.published);

  await updateBlogPost(post.id, {
    content,
    published: false,
  });

  const updated = await getBlogPostBySlug('wordpress-vs-nextjs-srovnani-2026');
  if (!updated) {
    console.error('Could not verify update!');
    process.exit(1);
  }

  const linkMatches = [...content.matchAll(/\[([^\]]+)\]\(\/([^)]+)\)/g)];

  console.log('\nArticle updated successfully!');
  console.log('Published:', updated.published, '(DRAFT)');
  console.log('Content length:', content.length, 'chars');
  console.log('Word count: ~' + content.split(/\s+/).length);
  console.log('\nInternal links (' + linkMatches.length + '):');
  linkMatches.forEach(m => {
    console.log('  -> "' + m[1] + '" -> /' + m[2]);
  });
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
