/**
 * Seed batch 2: 10 more SEO blog posts
 * Run: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... BLOB_READ_WRITE_TOKEN=... npx tsx scripts/seed-blog-batch2.ts
 */

import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function downloadAndUpload(unsplashId: string, filename: string): Promise<string> {
  const url = `https://images.unsplash.com/photo-${unsplashId}?w=1200&h=630&fit=crop&q=80`;
  console.log(`  ↓ Downloading ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const blob = await put(`blog/${filename}`, buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!,
    addRandomSuffix: true,
  });
  console.log(`  ✓ Uploaded → ${blob.url}`);
  return blob.url;
}

interface PostDef {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  imageId: string;
  imageFilename: string;
  content: string;
  daysAgo: number; // how many days before today to set as published_at
}

const posts: PostDef[] = [
  // ─── 1. Jak vybrat doménu ───
  {
    title: 'Jak vybrat doménu pro váš web: Kompletní průvodce',
    slug: 'jak-vybrat-domenu-pro-web',
    excerpt: 'Doména je adresa vašeho webu. Jak vybrat tu správnou? .cz nebo .com? Tipy na výběr, registraci a nejčastější chyby.',
    metaTitle: 'Jak vybrat doménu pro web — průvodce výběrem domény',
    metaDescription: 'Jak vybrat správnou doménu pro firemní web. CZ vs COM, délka, klíčová slova. Praktický průvodce s tipy a nejčastějšími chybami.',
    tags: ['doména', 'webové stránky', 'návod', 'začátečníci'],
    imageId: '1507003211169-0a1dd7228f2d',
    imageFilename: 'jak-vybrat-domenu.jpg',
    daysAgo: 2,
    content: `# Jak vybrat doménu pro váš web: Kompletní průvodce

Doména je první věc, kterou zákazník uvidí. Je to vaše adresa na internetu — a stejně jako u kamenné provozovny, na adrese záleží.

## Co je doména?

Doména je textová adresa webu, kterou zadáváte do prohlížeče. Například **weblyx.cz** — kde „weblyx" je název a „.cz" je koncovka (TLD).

Doména se skládá z:
- **Názvu** — hlavní část (weblyx)
- **Koncovky** — TLD (Top-Level Domain): .cz, .com, .eu, .sk

## .CZ nebo .COM?

### Doména .CZ
- **Pro koho:** Firmy působící v Česku
- **Výhody:** Čeští zákazníci jí důvěřují, lepší lokální SEO
- **Cena:** 150–250 Kč/rok
- **Doporučení:** Pro 90 % českých firem je .cz správná volba

### Doména .COM
- **Pro koho:** Mezinárodní firmy, tech startupy
- **Výhody:** Celosvětově známá, prestiž
- **Cena:** 250–400 Kč/rok
- **Doporučení:** Pokud cílíte i na zahraniční trhy

### Další koncovky
- **.eu** — pro firmy v EU, méně důvěryhodná v ČR
- **.sk** — pro slovenský trh
- **.online, .store, .tech** — moderní, ale méně důvěryhodné

**Tip:** Pokud je to možné, registrujte si .cz i .com variantu a .com přesměrujte na .cz.

## 7 pravidel pro výběr domény

### 1. Krátká a zapamatovatelná
- ✅ **kadernictvi-krasa.cz** (16 znaků)
- ❌ **kadernicke-studio-krasa-brno-centrum.cz** (38 znaků)

Ideální délka: **6–15 znaků** bez koncovky.

### 2. Snadno vyslovitelná
Pokud doménu nemůžete říct po telefonu bez hláskování, je příliš složitá. Zkuste „telefonní test" — řekněte doménu nahlas a představte si, že ji někdo zapisuje.

### 3. Bez háčků a čárek
České znaky v doméně (IDN domény) technicky fungují, ale:
- Lidé je neumí napsat na zahraniční klávesnici
- Mohou způsobovat problémy v emailech
- Některé systémy je nepodporují

✅ **kadernictvi.cz** (bez háčků)
❌ **kadeřnictví.cz** (s háčky)

### 4. Obsahující klíčové slovo (pokud to jde přirozeně)
Google lehce upřednostňuje domény s relevantním klíčovým slovem:
- **instalater-praha.cz** — dobré pro SEO
- **novak-services.cz** — neutrální pro SEO

Ale nepřehánějte to: **nejlevnejsi-instalater-praha-nonstop.cz** vypadá jako spam.

### 5. Bez pomlček (pokud to jde)
Jedna pomlčka je OK, více pomlček vypadá neprofesionálně:
- ✅ **web-studio.cz**
- ❌ **moje-web-design-studio.cz**

### 6. Bez čísel
Čísla v doméně matou — lidé nevědí, jestli psát „5" nebo „pět":
- ✅ **studiodesign.cz**
- ❌ **studio5design.cz**

### 7. Ověřte dostupnost na sociálních sítích
Než si doménu zaregistrujete, zkontrolujte, zda je stejný název dostupný i na Facebooku, Instagramu a dalších sítích. Konzistentní branding pomáhá.

## Kde registrovat doménu?

### České registrátory

| Registrátor | Cena .cz/rok | Výhody |
|-------------|-------------|--------|
| WEDOS | 145 Kč | Nejlevnější, spolehlivý |
| Active24 | 199 Kč | Česká podpora, snadné ovládání |
| Forpsi | 174 Kč | Dobrý poměr cena/kvalita |
| Namecheap | ~200 Kč | Mezinárodní, velký výběr TLD |

**Naše doporučení:** WEDOS nebo Active24 pro .cz domény.

## Nejčastější chyby

1. **Registrace na jméno agentury** — Doména by měla být registrovaná na VÁS, ne na agenturu. Jinak riskujete, že o ni přijdete.
2. **Zapomenutí prodloužení** — Nastavte si automatické prodlužování. Propadlá doména může být koupena někým jiným.
3. **Příliš specifická doména** — **kadernictvi-brno-stred.cz** vás omezuje, pokud se přestěhujete.
4. **Kopírování konkurence** — Doména **kadernictvi-krasa-brno.cz** vedle existujícího **kadernictvi-krasa.cz** je matoucí a může způsobit právní problémy.

## Shrnutí

Vyberte krátkou, zapamatovatelnou .cz doménu bez háčků. Registrujte ji na sebe, nastavte automatické prodlužování a zkontrolujte dostupnost na sociálních sítích.

---

*Potřebujete pomoct s výběrem domény a tvorbou webu? [Spočítejte si cenu](/kalkulacka) nebo nám [napište](/poptavka).*`,
  },

  // ─── 2. Co je SEO ───
  {
    title: 'Co je SEO: Základy optimalizace pro vyhledávače srozumitelně',
    slug: 'co-je-seo-zaklady-optimalizace',
    excerpt: 'SEO vysvětlené jednoduše. Co to je, proč je důležité a jak začít. Bez technického žargonu.',
    metaTitle: 'Co je SEO — základy optimalizace pro vyhledávače 2026',
    metaDescription: 'Co je SEO a jak funguje? Základy optimalizace pro vyhledávače vysvětlené srozumitelně. On-page, off-page, technické SEO. Průvodce pro začátečníky.',
    tags: ['SEO', 'optimalizace', 'Google', 'začátečníci'],
    imageId: '1455390582262-044cdead277a',
    imageFilename: 'co-je-seo-zaklady.jpg',
    daysAgo: 5,
    content: `# Co je SEO: Základy optimalizace pro vyhledávače srozumitelně

SEO (Search Engine Optimization) je soubor technik, díky kterým se váš web zobrazuje výše ve výsledcích Googlu. Čím výše jste, tím více lidí na váš web přijde — zdarma, bez placené reklamy.

## Proč na SEO záleží?

- **68 % online zkušeností** začíná na vyhledávači
- **75 % uživatelů** nikdy nepřejde na 2. stránku Googlu
- **Organický traffic** (z vyhledávání) je zdarma a dlouhodobý
- **Průměrný CTR** (kliknutí) na 1. pozici je 27 %, na 10. pozici jen 2,4 %

Pokud vás lidé nenajdou na Googlu, prakticky pro ně neexistujete.

## 3 pilíře SEO

### 1. On-page SEO (na vašem webu)

To je vše, co můžete ovlivnit přímo na svém webu:

**Title tag** — nejdůležitější SEO element. Je to titulek stránky, který Google zobrazuje ve výsledcích vyhledávání.
- ✅ „Instalatérství Praha 6 | Nonstop opravy | Jan Novák"
- ❌ „Úvod"

**Meta description** — popis stránky pod titulkem ve výsledcích. Neovlivňuje ranking přímo, ale ovlivňuje, kolik lidí klikne.

**H1 nadpis** — hlavní nadpis stránky. Každá stránka by měla mít právě jeden H1.

**Obsah** — Google hodnotí kvalitu a relevanci textu. Každá stránka potřebuje minimálně 300 slov unikátního textu.

**Obrázky** — alt tagy popisují obrázky pro Google a nevidomé uživatele.

**Interní odkazy** — propojte stránky mezi sebou. Pomáhá to Googlu pochopit strukturu webu.

### 2. Off-page SEO (mimo váš web)

To je vše, co se děje mimo váš web a buduje vaši autoritu:

**Zpětné odkazy (backlinks)** — odkazy z jiných webů na váš. Google je bere jako „hlasy důvěry". Čím kvalitnější web na vás odkazuje, tím lépe.

Jak získat zpětné odkazy:
- Registrace v katalozích (Firmy.cz, Živéfirmy.cz)
- Články na oborových portálech
- Partnerství s komplementárními firmami
- PR a tiskové zprávy

**Google Business Profile** — klíčový pro lokální SEO. Zdarma.

**Recenze** — Google hodnotí množství a kvalitu recenzí.

### 3. Technické SEO

Technická stránka webu, která ovlivňuje, jak dobře Google váš web „čte":

**Rychlost načítání** — pomalý web = nižší pozice. Cíl: pod 3 sekundy.

**Responzivní design** — web musí fungovat na mobilu. Google používá mobile-first indexing.

**SSL certifikát (HTTPS)** — bez zelného zámku vás Google penalizuje.

**Sitemap.xml** — mapa webu pro Google bota.

**Robots.txt** — říká Googlu, co indexovat a co ne.

## Jak Google rozhoduje o pořadí?

Google používá přes 200 faktorů. Nejdůležitější:

| Faktor | Důležitost | Co to znamená |
|--------|------------|---------------|
| Relevance obsahu | Kritická | Odpovídá váš obsah na hledaný dotaz? |
| Zpětné odkazy | Velmi vysoká | Kolik kvalitních webů na vás odkazuje? |
| Rychlost webu | Vysoká | Jak rychle se stránka načte? |
| Mobilní přívětivost | Vysoká | Funguje web na telefonu? |
| Uživatelská zkušenost | Střední | Jak dlouho lidé na webu zůstanou? |
| Stáří domény | Nízká | Jak dlouho doména existuje? |

## Jak začít s SEO (5 kroků)

### Krok 1: Keyword research
Zjistěte, co vaši zákazníci hledají. Použijte:
- **Google Suggest** — začněte psát do Googlu a sledujte návrhy
- **Google Keyword Planner** — zdarma v Google Ads
- **Answer The Public** — najde otázky, které lidé kladou

### Krok 2: Optimalizujte stránky
Pro každou stránku:
- Napište relevantní title tag (do 60 znaků)
- Napište meta description (do 155 znaků)
- Přidejte H1 nadpis s klíčovým slovem
- Napište kvalitní text (min. 300 slov)

### Krok 3: Založte blog
Blog je nejefektivnější způsob, jak přidat nový obsah a cílit na nová klíčová slova. Publikujte alespoň 2× měsíčně.

### Krok 4: Budujte zpětné odkazy
Registrujte se do katalogů, navažte partnerství s komplementárními firmami, publikujte na oborových portálech.

### Krok 5: Měřte a optimalizujte
- **Google Search Console** — zdarma, ukazuje na jaká slova se zobrazujete
- **Google Analytics** — sleduje návštěvnost a chování uživatelů

## Jak dlouho trvá, než SEO zabere?

Upřímná odpověď: **3–6 měsíců** do prvních viditelných výsledků. SEO není sprint, je to maraton. Ale výsledky jsou dlouhodobé — dobře optimalizovaná stránka přivádí zákazníky roky.

## SEO vs. PPC (Google Ads)

| | SEO | PPC |
|---|---|---|
| Cena | Čas nebo fee za agenturu | Platíte za každý klik |
| Rychlost | 3–6 měsíců | Okamžitě |
| Dlouhodobost | Roky | Dokud platíte |
| Důvěra uživatelů | Vyšší (organické výsledky) | Nižší (reklama) |

**Ideální strategie:** Kombinace obojího. PPC pro okamžité výsledky, SEO pro dlouhodobý růst.

## Shrnutí

SEO je investice do budoucnosti vašeho webu. Začněte jednoduše — optimalizujte title tagy, pište kvalitní obsah a budujte zpětné odkazy. Výsledky přijdou.

---

*Potřebujete web optimalizovaný pro vyhledávače? [Všechny naše weby jsou SEO-ready](/kalkulacka). Nebo se [ozvěte](/poptavka).*`,
  },

  // ─── 3. Jak psát texty na web ───
  {
    title: 'Jak psát texty na web, které prodávají: 10 pravidel copywritingu',
    slug: 'jak-psat-texty-na-web-copywriting',
    excerpt: 'Texty na webu rozhodují, jestli zákazník zůstane nebo odejde. 10 pravidel, jak psát webové texty, které konvertují.',
    metaTitle: 'Jak psát texty na web — 10 pravidel copywritingu',
    metaDescription: 'Jak psát texty na webové stránky, které prodávají. 10 pravidel copywritingu pro web. Nadpisy, CTA, struktura. Praktický návod.',
    tags: ['copywriting', 'webové stránky', 'texty', 'konverze'],
    imageId: '1455390582262-044cdead277a',
    imageFilename: 'copywriting-web-texty.jpg',
    daysAgo: 8,
    content: `# Jak psát texty na web, které prodávají: 10 pravidel copywritingu

Můžete mít nejhezčí web na světě. Pokud jsou na něm špatné texty, zákazníky nezískáte. 80 % návštěvníků přečte nadpis, ale jen 20 % čte dál. Tady je 10 pravidel, jak psát texty, které lidi zaujmou a přesvědčí.

## 1. Mluvte o zákazníkovi, ne o sobě

Nejčastější chyba firemních webů:

❌ **Špatně:** „Jsme firma s 15letou tradicí a nabízíme širokou škálu služeb v oblasti webového designu."

✅ **Správně:** „Potřebujete web, který přivádí zákazníky? Vytvoříme ho za týden."

**Pravidlo:** Na každé „my" nebo „naše" by mělo připadat alespoň 3× „vy" nebo „vaše".

## 2. Řešte problém, ne funkce

Lidé nekupují produkty. Kupují řešení svých problémů.

❌ „Nabízíme responzivní webdesign s moderním UI/UX."
✅ „Váš web bude vypadat skvěle na mobilu i počítači — nic se nerozsype."

❌ „SEO optimalizace s keyword analýzou."
✅ „Zákazníci vás najdou na Googlu, i když nehledají přímo váš název."

## 3. Nadpis je 80 % úspěchu

Nadpis je první (a často jediná) věc, kterou lidé přečtou. Dobrý nadpis:

- Obsahuje benefit pro čtenáře
- Budí zvědavost nebo urgenci
- Je konkrétní (čísla fungují)

**Příklady dobrých nadpisů:**
- „Web za 7 990 Kč — hotový do týdne"
- „5 důvodů proč váš web nepřivádí zákazníky"
- „Kolik stojí web v roce 2026? (Reálné ceny)"

## 4. Jeden odstavec = jedna myšlenka

Na webu nikdo nečte dlouhé bloky textu. Pravidla:

- Max. 3–4 řádky na odstavec
- Mezi odstavci mezery
- Klíčové informace na začátek odstavce
- Bullet pointy pro seznamy

## 5. Používejte čísla a konkrétní údaje

❌ „Jsme rychlí a dostupní."
✅ „Web dodáme za 5–7 pracovních dní. Od 7 990 Kč."

❌ „Máme spokojené zákazníky."
✅ „4,9/5 hvězdiček na Googlu, 50+ dokončených projektů."

Konkrétní čísla budují důvěru. Vágní tvrzení ne.

## 6. CTA — řekněte lidem, co mají udělat

Každá stránka potřebuje jasné CTA (Call To Action). Návštěvník by měl vždy vědět, co má udělat dál.

**Silná CTA:**
- „Chci nezávaznou nabídku" (ne „Odeslat")
- „Spočítat cenu webu" (ne „Kalkulačka")
- „Zavolat teď — 702 110 166" (ne „Kontakt")

**Pravidlo:** CTA by mělo být viditelné bez scrollování a opakovat se na stránce vícekrát.

## 7. Sociální důkaz — ať mluví ostatní

Reference, recenze a čísla přesvědčí víc než vaše vlastní slova:

- „Spolupracovali jsme s 50+ firmami" → konkrétní číslo
- Citace od zákazníka s jménem a firmou
- Loga firem, se kterými jste spolupracovali
- Hodnocení na Googlu

## 8. Scannable text — formátování pro oči

Lidé text na webu nečtou — skenují ho očima. Usnadněte jim to:

- **Tučné** pro klíčové informace
- Nadpisy a podnadpisy (H2, H3)
- Odrážkové seznamy
- Krátké odstavce
- Tabulky pro porovnání

## 9. Urgence a akčnost

Vytvořte pocit, že je potřeba jednat teď:

- „Akce platí do konce měsíce"
- „Zbývají 3 volná místa na tento měsíc"
- „Bezplatná konzultace — pouze tento týden"

Ale buďte upřímní — falešná urgence poškodí důvěru.

## 10. Testujte a vylepšujte

Nikdo nenapíše dokonalý text napoprvé. A/B testujte:

- Různé nadpisy na landing page
- Různé texty CTA tlačítek
- Různé uspořádání obsahu

Sledujte metriky: bounce rate, čas na stránce, konverzní poměr.

## Checklist pro webové texty

- [ ] Nadpis obsahuje benefit pro zákazníka?
- [ ] Text řeší problém zákazníka?
- [ ] Každý odstavec má max. 3–4 řádky?
- [ ] Jsou na stránce konkrétní čísla?
- [ ] Je CTA jasné a viditelné?
- [ ] Obsahuje sociální důkaz?
- [ ] Je text formátovaný pro skenování?

---

*Potřebujete web s texty, které prodávají? [Ozvěte se nám](/poptavka) — pomůžeme i s obsahem.*`,
  },

  // ─── 4. GDPR a webové stránky ───
  {
    title: 'GDPR a webové stránky: Co musíte splnit v roce 2026',
    slug: 'gdpr-webove-stranky-2026',
    excerpt: 'GDPR povinnosti pro webové stránky. Cookies, formuláře, newsletter. Co musíte mít na webu a jaké jsou pokuty.',
    metaTitle: 'GDPR a webové stránky — co musíte splnit v roce 2026',
    metaDescription: 'GDPR povinnosti pro webové stránky v ČR. Cookie lišta, formuláře, newsletter, zpracování osobních údajů. Co potřebujete a jaké hrozí pokuty.',
    tags: ['GDPR', 'právní požadavky', 'cookies', 'webové stránky'],
    imageId: '1586281380349-632531db7ed4',
    imageFilename: 'gdpr-web-2026.jpg',
    daysAgo: 11,
    content: `# GDPR a webové stránky: Co musíte splnit v roce 2026

GDPR platí od roku 2018, ale stále ho mnoho webů porušuje. Pokuty mohou být až 20 milionů EUR. Tady je praktický přehled toho, co musíte mít na svém webu.

## Co je GDPR?

GDPR (General Data Protection Regulation) je evropský zákon o ochraně osobních údajů. Platí pro každou firmu, která zpracovává osobní údaje občanů EU — tedy pro každou firmu s webem.

**Osobní údaje** jsou veškeré informace, na základě kterých lze identifikovat konkrétní osobu:
- Jméno a příjmení
- Email
- Telefonní číslo
- IP adresa
- Cookies

## Cookie lišta — povinnost č. 1

Od roku 2022 je v ČR povinný **aktivní souhlas** s cookies (opt-in). To znamená:

### Co musíte mít:
- Cookie lištu, která se zobrazí při první návštěvě
- Možnost **odmítnout** cookies (ne jen „Souhlasím")
- Rozdělení na kategorie (nezbytné, analytické, marketingové)
- Nezbytné cookies mohou běžet bez souhlasu
- Analytické a marketingové cookies NESMÍ běžet před souhlasem

### Co nesmíte:
- ❌ Předem zaškrtnuté checkboxy
- ❌ „Cookie wall" — podmínit přístup na web souhlasem
- ❌ Skrýt tlačítko „Odmítnout"
- ❌ Spouštět Google Analytics před souhlasem

### Jak implementovat správně:
1. Použijte cookie consent řešení (CookieYes, Cookiebot, vlastní)
2. Google Consent Mode v2 — propojí souhlas s GA4 a Google Ads
3. Uchovávejte záznamy o souhlasech

## Kontaktní formuláře

Každý formulář, který sbírá osobní údaje, musí splňovat:

- **Checkbox souhlasu** — „Souhlasím se zpracováním osobních údajů" (nesmí být předvyplněný)
- **Odkaz na zásady ochrany osobních údajů** — u checkboxu
- **Účel zpracování** — jasně řekněte, proč data sbíráte
- **Minimalizace dat** — nežádejte víc, než potřebujete

**Příklad správného checkboxu:**
> ☐ Souhlasím se zpracováním osobních údajů za účelem odpovědi na mou poptávku. Více v Zásadách ochrany osobních údajů.

## Newsletter / email marketing

Pokud sbíráte emaily pro newsletter, platí přísnější pravidla:

- **Double opt-in** — potvrzovací email před přidáním do seznamu
- **Jasný popis** — co bude odběratel dostávat a jak často
- **Odhlášení** — v každém emailu musí být odkaz na odhlášení
- **Evidence souhlasů** — musíte umět prokázat, kdy a jak souhlas vznikl

## Zásady ochrany osobních údajů

Každý web musí mít stránku „Zásady ochrany osobních údajů" (Privacy Policy) s těmito informacemi:

1. **Kdo jste** — identifikace správce údajů (IČO, sídlo)
2. **Jaké údaje sbíráte** — jméno, email, telefon, cookies...
3. **Proč je sbíráte** — účel zpracování
4. **Jak dlouho je uchováváte** — konkrétní doba
5. **Kdo k nim má přístup** — třetí strany (Google, hosting...)
6. **Práva subjektů** — právo na přístup, výmaz, přenositelnost
7. **Kontakt na DPO** — pokud máte pověřence pro ochranu údajů

## Google Analytics a GDPR

Google Analytics 4 (GA4) sbírá osobní údaje (IP adresa, cookies). Proto:

1. Nespouštějte GA4 před souhlasem s analytickými cookies
2. Aktivujte anonymizaci IP v GA4
3. Nastavte Google Consent Mode v2
4. Omezte dobu uchovávání dat (14 měsíců max.)
5. Uzavřete s Googlem smlouvu o zpracování údajů (DPA)

## Nejčastější GDPR chyby na webech

1. **Žádná cookie lišta** — nebo jen informační banner bez možnosti odmítnutí
2. **GA běží před souhlasem** — porušení i se zbytkem
3. **Chybí zásady ochrany** — povinná stránka
4. **Předvyplněné souhlasy** — nezákonné
5. **Žádné DPA se třetími stranami** — Google, Mailchimp, hosting
6. **Chybí SSL** — data se posílají nezašifrovaně

## Jaké hrozí pokuty?

| Porušení | Maximální pokuta |
|----------|-----------------|
| Chybějící cookie consent | Do 20 mil. EUR |
| Spam emaily bez souhlasu | Do 10 mil. EUR |
| Chybějící privacy policy | Do 20 mil. EUR |
| Únik osobních dat | Do 20 mil. EUR |

V praxi ÚOOÚ (Úřad pro ochranu osobních údajů) uděluje pokuty v řádu desítek až stovek tisíc Kč. Ale trend je rostoucí.

## GDPR checklist pro váš web

- [ ] Cookie lišta s opt-in (odmítnutí i přijmutí)
- [ ] GA4 se spouští až po souhlasu
- [ ] Formuláře mají checkbox souhlasu
- [ ] Stránka „Zásady ochrany osobních údajů"
- [ ] Newsletter s double opt-in
- [ ] SSL certifikát (HTTPS)
- [ ] DPA se třetími stranami

---

*Všechny weby od Weblyx mají GDPR vyřešené — cookie consent, formuláře i zásady ochrany. [Spočítejte si cenu](/kalkulacka).*`,
  },

  // ─── 5. Jak připravit podklady ───
  {
    title: 'Jak připravit podklady pro nový web: Checklist pro klienty',
    slug: 'jak-pripravit-podklady-pro-novy-web',
    excerpt: 'Co připravit než zadáte tvorbu webu? Texty, fotky, logo, strukturu. Kompletní checklist pro klienty.',
    metaTitle: 'Jak připravit podklady pro nový web — checklist',
    metaDescription: 'Co připravit před tvorbou webu? Texty, fotografie, logo, strukturu stránek. Praktický checklist pro klienty webových agentur.',
    tags: ['tvorba webu', 'podklady', 'příprava', 'checklist'],
    imageId: '1432888498266-38ffec3eaf0a',
    imageFilename: 'podklady-novy-web.jpg',
    daysAgo: 14,
    content: `# Jak připravit podklady pro nový web: Checklist pro klienty

Nejčastější důvod, proč se tvorba webu protahuje? Klient nemá připravené podklady. Texty dodává po kouskách, fotky chybí, logo je v nízké kvalitě. Tady je přehled toho, co připravit, než zadáte web.

## 1. Logo a vizuální identita

### Co potřebujeme:
- **Logo ve vektorovém formátu** (SVG, AI, EPS) — ne JPG z Facebooku
- **Barevná paleta** — hlavní barvy firmy (ideálně HEX kódy)
- **Fonty** — pokud máte grafický manuál

### Nemáte logo?
Není problém. Mnoho agentur (včetně nás) umí vytvořit jednoduché logo jako součást projektu. Stojí to obvykle 2 000–5 000 Kč navíc.

**Tip:** Pokud máte logo jen jako obrázek (PNG/JPG), pošlete ho — převedeme ho do vektoru.

## 2. Texty

Texty jsou **nejdůležitější podklad** a zároveň ten, který klienti připravují nejhůře.

### Co napsat pro každou stránku:

**Homepage:**
- Hlavní nadpis — co děláte, jednou větou
- 3–5 hlavních benefitů / služeb
- Krátký popis firmy (2–3 odstavce)
- Reference nebo čísla (léta na trhu, počet klientů)

**O nás:**
- Příběh firmy — proč jste začali
- Tým — kdo u vás pracuje
- Hodnoty — čím se řídíte

**Služby:**
- Pro každou službu: název, popis, co klient získá
- Ceník (pokud ho zveřejňujete)
- Postup spolupráce

**Kontakt:**
- Adresa, telefon, email
- Otevírací doba
- Fakturační údaje

### Nemáte čas psát texty?
Většina agentur nabízí copywriting jako doplňkovou službu. Cena: 1 000–3 000 Kč za stránku. Nebo můžete dodat jen hrubé body a copywriter je rozepíše.

## 3. Fotografie

### Co funguje:
- **Reálné fotografie** vašeho týmu, provozovny, produktů
- **Profesionální kvalita** — investice 5 000–10 000 Kč za focení se vyplatí
- **Dostatečná velikost** — min. 1920px na šířku

### Co nefunguje:
- ❌ Stockové fotky usmívajících se lidí v obleku (vypadají falešně)
- ❌ Fotky z mobilu v temné místnosti
- ❌ Fotky se špatným rozlišením (rozmazané po zvětšení)

### Nemáte profesionální fotky?
Moderní smartphony fotí dostatečně kvalitně. Tipy:
- Foťte ve dne, u okna (přirozené světlo)
- Foťte na šířku (landscape), ne na výšku
- Ukliďte pozadí
- Foťte v nejvyšší kvalitě

## 4. Struktura webu

Promyslete, jaké stránky potřebujete:

### Typická struktura firemního webu:
1. **Homepage** — přehled, CTA
2. **O nás** — příběh, tým
3. **Služby** — co nabízíte (1 stránka nebo podstránky)
4. **Portfolio / Reference** — ukázky práce
5. **Blog** — články (SEO)
6. **Kontakt** — formulář, mapa, údaje

### Otázky k zamyšlení:
- Kolik služeb chcete prezentovat?
- Chcete blog? (doporučujeme pro SEO)
- Potřebujete e-shop?
- Chcete vícejazyčný web?
- Potřebujete rezervační systém?

## 5. Inspirace

Připravte 3–5 webů, které se vám líbí. Nemusí být z vašeho oboru. Řekněte, co konkrétně se vám líbí:
- Design / barvy
- Uspořádání obsahu
- Animace
- Celkový feeling

To pomůže designérovi pochopit vaše preference.

## 6. Přístupy

Pokud přecházíte ze starého webu, připravte:
- **Přístup k doméně** — kde je registrovaná, login
- **Přístup ke stávajícímu hostingu** — pokud budeme migrovat
- **Přístupy k emailům** — pokud jsou na stávajícím hostingu
- **Google Analytics / Search Console** — pokud chcete zachovat data

## Kompletní checklist

### Povinné:
- [ ] Logo (ideálně SVG/AI)
- [ ] Texty pro hlavní stránky (homepage, služby, kontakt)
- [ ] Kontaktní údaje (adresa, telefon, email, IČO)
- [ ] Minimálně 5 fotografií (tým, provozovna, práce)

### Doporučené:
- [ ] Barevná paleta firmy
- [ ] 3–5 webů jako inspirace
- [ ] Reference / recenze od zákazníků
- [ ] Fakturační údaje
- [ ] Přístupy k doméně a hostingu

### Nice to have:
- [ ] Grafický manuál
- [ ] Video (představení firmy, produktu)
- [ ] Ceník služeb

## Kdy podklady dodat?

Ideálně **před zahájením tvorby**. Čím dříve máme kompletní podklady, tím rychleji web odevzdáme. Typický časový rámec:

1. **Den 1:** Obdržíme podklady
2. **Den 2–3:** Návrh designu
3. **Den 3–5:** Vývoj
4. **Den 5–7:** Testování a spuštění

Bez podkladů se celý proces protahuje — místo 7 dní trvá 3 týdny.

---

*Máte podklady připravené? [Pošlete nám poptávku](/poptavka) a web může být hotový do týdne.*`,
  },

  // ─── 6. Co je landing page ───
  {
    title: 'Co je landing page a kdy ji potřebujete?',
    slug: 'co-je-landing-page-kdy-potrebujete',
    excerpt: 'Landing page je stránka s jedním cílem — konverze. Kdy dává smysl, kolik stojí a jak by měla vypadat.',
    metaTitle: 'Co je landing page a kdy ji potřebujete — průvodce',
    metaDescription: 'Co je landing page (cílová stránka) a kdy ji potřebujete? Jak by měla vypadat, kolik stojí a jaké má výhody oproti běžnému webu.',
    tags: ['landing page', 'konverze', 'webové stránky', 'marketing'],
    imageId: '1519389950473-47ba0277781c',
    imageFilename: 'landing-page-pruvodce.jpg',
    daysAgo: 17,
    content: `# Co je landing page a kdy ji potřebujete?

Landing page (cílová stránka) je **jedna stránka s jedním cílem**. Na rozdíl od běžného webu, kde můžete navigovat mezi stránkami, landing page vede návštěvníka k jedné konkrétní akci — vyplnit formulář, zavolat, koupit.

## Proč landing page funguje?

Běžný web je jako supermarket — spousta možností, zákazník se může ztratit. Landing page je jako stánek na trhu — jeden produkt, jasná nabídka, rychlé rozhodnutí.

**Čísla:**
- Průměrný konverzní poměr webu: 2,35 %
- Průměrný konverzní poměr landing page: 5,31 %
- Nejlepší landing pages: 11,45 %+

## Kdy potřebujete landing page?

### 1. Spouštíte reklamní kampaň
Google Ads nebo Facebook Ads → lidé kliknou na reklamu → přistávají na landing page → konvertují.

Posílat reklamu na homepage je jako poslat zákazníka do supermarketu a doufat, že najde, co hledal.

### 2. Propagujete konkrétní službu / akci
- Nová služba
- Sezónní akce
- Speciální nabídka
- Event nebo webinář

### 3. Sbíráte kontakty (lead generation)
- E-book ke stažení
- Bezplatná konzultace
- Newsletter přihlášení
- Kalkulačka / cenová nabídka

### 4. Testujete nový produkt / službu
Než investujete do plného webu, vytvořte landing page a otestujte zájem trhu.

## Jak vypadá dobrá landing page?

### Struktura shora dolů:

**1. Hero sekce (nad záhybem)**
- Jasný nadpis s benefitem
- Podnadpis vysvětlující nabídku
- CTA tlačítko
- Obrázek nebo video

**2. Problém → Řešení**
- Pojmenujte bolest zákazníka
- Ukažte, jak ji řešíte

**3. Benefity**
- 3–5 klíčových výhod
- Ikony + krátký text

**4. Sociální důkaz**
- Reference zákazníků
- Loga firem
- Hodnocení, čísla

**5. Detailnější informace**
- Jak to funguje (proces)
- Co je v ceně
- FAQ

**6. Závěrečné CTA**
- Zopakujte nabídku
- Formulář nebo tlačítko
- Kontaktní údaje

### Co na landing page NEPATŘÍ:
- ❌ Navigace (menu) — odvádí pozornost
- ❌ Odkazy na jiné stránky
- ❌ Příliš mnoho textu
- ❌ Více CTA najednou (např. „zavolat" + „napsat" + „objednat" + „stáhnout")

## Landing page vs. web

| | Landing page | Web |
|---|---|---|
| Počet stránek | 1 | 5–20+ |
| Cíl | Jedna konkrétní akce | Informace, více akcí |
| Navigace | Žádná / minimální | Plné menu |
| Konverzní poměr | 5–12 % | 2–3 % |
| Cena | Od 7 990 Kč | Od 9 990 Kč |
| Ideální pro | Kampaně, akce | Prezentace firmy |

## Kolik stojí landing page?

| Typ | Cena | Obsah |
|-----|------|-------|
| Jednoduchá | 5 000–10 000 Kč | 3–5 sekcí, základní design |
| Profesionální | 10 000–25 000 Kč | Moderní design, animace, A/B testy |
| Premium | 25 000–50 000 Kč | Custom design, copywriting, optimalizace |

**U nás:** Landing page od 7 990 Kč — responsivní design, SEO základy, kontaktní formulář.

## 5 tipů pro lepší konverze

1. **Jeden jasný CTA** — ne 5 různých tlačítek
2. **Rychlost** — pod 3 sekundy, jinak lidé odejdou
3. **Mobile first** — 65 % přijde z mobilu
4. **Sociální důkaz** — recenze, čísla, loga
5. **A/B testování** — testujte nadpisy, obrázky, CTA

---

*Potřebujete landing page pro vaši kampaň? [Spočítejte si cenu](/kalkulacka) — landing page od 7 990 Kč.*`,
  },

  // ─── 7. Nejčastější chyby při tvorbě webu ───
  {
    title: 'Nejčastější chyby při tvorbě webu: 10 problémů, které stojí zákazníky',
    slug: 'nejcastejsi-chyby-tvorba-webu',
    excerpt: '10 nejčastějších chyb firemních webů, které stojí peníze. Pomalé načítání, žádné CTA, stockové fotky a další.',
    metaTitle: 'Nejčastější chyby při tvorbě webu — 10 problémů',
    metaDescription: 'Top 10 chyb firemních webů: pomalé načítání, žádné CTA, špatné texty, stockové fotky. Jak se jim vyhnout a získat více zákazníků.',
    tags: ['chyby', 'tvorba webu', 'webdesign', 'konverze'],
    imageId: '1516321318423-f06f85e504b3',
    imageFilename: 'chyby-tvorba-webu.jpg',
    daysAgo: 20,
    content: `# Nejčastější chyby při tvorbě webu: 10 problémů, které stojí zákazníky

Většina firemních webů v ČR dělá stejné chyby. Výsledek? Návštěvníci odchází, Google web nezobrazuje a telefon nezvoní. Tady je 10 nejčastějších chyb a jak se jim vyhnout.

## 1. Pomalé načítání

**Problém:** Web se načítá 5+ sekund. 53 % uživatelů odejde, pokud web trvá déle než 3 sekundy.

**Příčina:** Neoptimalizované obrázky (3 MB fotka z mobilu), levný hosting, 20+ WordPress pluginů.

**Řešení:** Komprimujte obrázky (WebP formát), použijte kvalitní hosting nebo moderní framework (Next.js), lazy loading pro obrázky.

## 2. Žádné CTA (výzva k akci)

**Problém:** Návštěvník přijde na web, podívá se a odejde. Protože neví, co má udělat dál.

**Příčina:** Chybí tlačítka „Zavolat", „Poptat", „Objednat". Kontaktní formulář je schovaný na stránce Kontakt.

**Řešení:** Na každé stránce jasné CTA tlačítko. Minimálně v hero sekci a na konci stránky. Formulář na homepage.

## 3. Není responzivní

**Problém:** Web vypadá dobře na počítači, ale na mobilu se rozpadá. Tlačítka jsou malinká, text nečitelný.

**Příčina:** Web byl navržen jen pro desktop. Nebo je responzivita „dodělána" — ne navržena od začátku.

**Řešení:** Mobile-first přístup. Designujte nejdřív pro mobil, pak pro desktop. 65 % návštěv přichází z mobilů.

## 4. Generické stockové fotky

**Problém:** Na webu jsou fotky usmívajících se lidí v obleku, kteří si podávají ruce. Vypadá to falešně a nedůvěryhodně.

**Příčina:** Klient nedodal reálné fotky, agentura použila stock.

**Řešení:** Investujte do profesionálního focení vašeho týmu a provozovny. I kvalitní fotky z mobilu jsou lepší než stock.

## 5. Texty mluví o firmě, ne o zákazníkovi

**Problém:** „Jsme firma s 15letou tradicí..." „Naším cílem je kvalita..." Nikoho to nezajímá.

**Příčina:** Texty píše majitel firmy, který přirozeně mluví o sobě.

**Řešení:** Mluvte o zákazníkovi a jeho problémech. Ne „nabízíme instalatérství", ale „Teče vám kohoutek? Opravíme ho do 2 hodin."

## 6. Žádný blog / nový obsah

**Problém:** Web má 5 stránek, které se od spuštění nezměnily. Google nemá důvod web navštěvovat.

**Příčina:** Nikdo nemá čas psát články. Web je vnímán jako „hotový projekt".

**Řešení:** Alespoň 2 články měsíčně. Pište o problémech vašich zákazníků, ne o firemních novinkách.

## 7. Chybí SSL certifikát

**Problém:** URL začíná http:// místo https://. Chrome zobrazuje varování „Nezabezpečeno".

**Příčina:** Zapomněli jste SSL nastavit, nebo hostitel ho nenabízí zdarma.

**Řešení:** Let's Encrypt nabízí SSL zdarma. Většina moderních hostingů ho má v ceně.

## 8. Nepřehledná navigace

**Problém:** Menu má 15 položek, zákazník nenajde co hledá. Nebo menu vůbec nefunguje na mobilu.

**Příčina:** Snaha dát do menu všechno. Žádná hierarchie.

**Řešení:** Maximum 7 položek v hlavním menu. Podstránky do dropdownu. Hamburger menu na mobilu.

## 9. Žádná analytika

**Problém:** Nevíte, kolik lidí na web přijde, odkud přicházejí a co dělají. Nemůžete optimalizovat to, co neměříte.

**Příčina:** Google Analytics nebyl nikdy nastavený. Nebo byl nastavený, ale nikdo se na data nedívá.

**Řešení:** Nastavte GA4 + Google Search Console. Kontrolujte data alespoň 1× měsíčně.

## 10. Web je „hotový"

**Problém:** Web se spustí a pak se na něj zapomene. Žádné aktualizace obsahu, designu, ani technologie.

**Příčina:** Web je vnímán jako jednorázový projekt, ne jako živý nástroj.

**Řešení:** Web je jako auto — potřebuje údržbu. Aktualizujte obsah, přidávejte reference, blogujte, sledujte výkon a optimalizujte.

## Quick audit vašeho webu

Odpovězte si na tyto otázky:

1. Načte se web pod 3 sekundy? → [PageSpeed test](https://pagespeed.web.dev/)
2. Je na každé stránce CTA tlačítko?
3. Funguje web na mobilu bez problémů?
4. Máte reálné fotky, ne stock?
5. Řeší texty problém zákazníka?
6. Přidali jste nový obsah v posledním měsíci?
7. Máte HTTPS?
8. Víte, kolik lidí na web přijde měsíčně?

Pokud jste odpověděli „ne" na 3 a více otázek, váš web potřebuje pozornost.

---

*Chcete web bez těchto chyb? [Spočítejte si cenu](/kalkulacka) — naše weby jsou rychlé, mobilní a SEO-optimalizované od základu.*`,
  },

  // ─── 8. AI a tvorba webů ───
  {
    title: 'AI a tvorba webů v roce 2026: Revoluce nebo hype?',
    slug: 'ai-tvorba-webu-2026',
    excerpt: 'Jak AI mění tvorbu webových stránek? ChatGPT, Midjourney, AI buildery. Co funguje a co je jen marketing.',
    metaTitle: 'AI a tvorba webů v roce 2026 — revoluce nebo hype?',
    metaDescription: 'Jak umělá inteligence mění tvorbu webů v roce 2026. AI buildery, ChatGPT pro texty, AI design. Co funguje a kde má AI limity.',
    tags: ['AI', 'umělá inteligence', 'tvorba webu', '2026', 'technologie'],
    imageId: '1677442136019-21780ecad995',
    imageFilename: 'ai-tvorba-webu-2026.jpg',
    daysAgo: 23,
    content: `# AI a tvorba webů v roce 2026: Revoluce nebo hype?

Umělá inteligence pronikla do tvorby webů. Můžete si nechat vygenerovat texty, design, obrázky i kód. Ale nahradí AI webové agentury? Upřímná odpověď.

## Co AI umí v roce 2026

### Texty a copywriting
**ChatGPT, Claude, Gemini** — AI modely umí psát texty na web, blog články, produktové popisy.

**Co funguje:**
- Generování prvních návrhů textů
- Přepis a zkrácení existujících textů
- SEO optimalizace (zakomponování klíčových slov)
- Blog články na obecná témata

**Co nefunguje:**
- Unikátní hlas značky (AI píše genericky)
- Specifické znalosti o vaší firmě
- Emocionální storytelling
- Faktická přesnost (AI halucinuje)

**Náš přístup:** AI použijeme jako výchozí bod, ale každý text projde ruční editací.

### Design
**Midjourney, DALL-E, Figma AI** — AI umí generovat designové koncepty.

**Co funguje:**
- Inspirace a mood boardy
- Generování ilustrací a ikon
- Barevné palety
- Varianty layoutů

**Co nefunguje:**
- Pixel-perfect design pro vývoj
- Konzistentní branding
- UX design (AI nerozumí uživatelskému chování)
- Responzivní design

### Kód
**GitHub Copilot, Claude, Cursor** — AI asistenti pro programování.

**Co funguje:**
- Psaní opakujícího se kódu
- Debugging a opravy chyb
- Konverze mezi technologiemi
- Generování komponent

**Co nefunguje:**
- Architektura celé aplikace
- Bezpečnostní aspekty
- Optimalizace výkonu
- Integrace s databázemi a API

### Obrázky
**Midjourney, Stable Diffusion, DALL-E** — AI generuje fotorealistické obrázky.

**Co funguje:**
- Blog header obrázky
- Ilustrace a ikony
- Pozadí a textury
- Produktové vizualizace

**Co nefunguje:**
- Fotky vašeho reálného týmu
- Specifické produktové fotografie
- Konzistentní styl napříč webem
- Text v obrázcích (AI nedokáže správně psát)

## AI web buildery — stojí za to?

### Populární AI buildery:
- **Wix ADI** — odpovíte na otázky, AI vygeneruje web
- **Framer AI** — generuje design na základě promptu
- **Durable** — web za 30 sekund
- **10Web** — WordPress s AI

### Výhody:
- Cena (často zdarma nebo levné)
- Rychlost (web za minuty)
- Jednoduchost (žádné technické znalosti)

### Nevýhody:
- Generický design (vypadá jako tisíc dalších webů)
- Omezené možnosti úprav
- Pomalé načítání
- Špatné SEO
- Závislost na platformě
- Žádná unikátnost

## Co AI NENAHRADÍ

### 1. Strategii
AI neumí pochopit váš byznys, vaše zákazníky a vaše cíle. Strategie webu — jaké stránky, jaké texty, jaký konverzní flow — vyžaduje lidské porozumění.

### 2. UX design
Jak se uživatel pohybuje po webu, kde kliká, co ho zastaví — to AI nedokáže navrhnout. UX design je založený na psychologii a testování.

### 3. Branding
Váš web musí odrážet vaši značku — ne generický template. AI neumí vytvořit unikátní vizuální identitu.

### 4. Technickou kvalitu
Rychlost, bezpečnost, SEO, přístupnost — to vše vyžaduje odborné znalosti a ruční práci. AI vygenerovaný kód je často pomalý a neoptimalizovaný.

### 5. Vztah a komunikaci
Tvorba webu je spolupráce. Potřebujete někoho, kdo vám naslouchá, ptá se a navrhuje řešení. AI to neumí.

## Jak AI používáme my

V Weblyx AI využíváme jako **nástroj, ne náhradu**:

1. **Texty:** AI generuje první návrhy, lidé editují a personalizují
2. **Kód:** AI asistenti zrychlují vývoj o 30–40 %
3. **Obrázky:** AI pro blog ilustrace a placeholdery
4. **SEO:** AI pro keyword research a meta popisy
5. **Testování:** AI pro kontrolu kódu a bezpečnosti

Výsledek: Stejná kvalita, rychlejší dodání, nižší cena.

## Budoucnost: AI + člověk

AI nenahradí webové designéry a vývojáře. Ale designéři a vývojáři, kteří **používají AI**, nahradí ty, kteří ho nepoužívají.

Budoucnost tvorby webů je **hybridní** — AI se stará o opakující se úkoly, člověk o strategii, kreativitu a kvalitu.

---

*Chcete web vytvořený s pomocí nejnovějších AI nástrojů? [Spočítejte si cenu](/kalkulacka) nebo se [ozvěte](/poptavka).*`,
  },

  // ─── 9. Kolik stojí údržba webu ───
  {
    title: 'Kolik stojí údržba webu: Co potřebujete a kolik to stojí ročně',
    slug: 'kolik-stoji-udrzba-webu-rocne',
    excerpt: 'Doména, hosting, aktualizace, bezpečnost. Kolik stojí provoz a údržba webu ročně? Reálné ceny a co opravdu potřebujete.',
    metaTitle: 'Kolik stojí údržba webu ročně — reálné náklady',
    metaDescription: 'Kolik stojí provoz a údržba webu ročně? Doména, hosting, SSL, aktualizace, bezpečnost. Reálné ceny a srovnání WordPress vs. moderní web.',
    tags: ['údržba webu', 'náklady', 'hosting', 'doména'],
    imageId: '1554224155-3a58922a22c3',
    imageFilename: 'udrzba-webu-naklady.jpg',
    daysAgo: 26,
    content: `# Kolik stojí údržba webu: Co potřebujete a kolik to stojí ročně

Web je hotový, ale náklady nekončí. Doména, hosting, aktualizace, bezpečnost — kolik to reálně stojí? A co z toho opravdu potřebujete?

## Povinné náklady (platíte vždy)

### 1. Doména
- **Cena:** 150–400 Kč/rok (záleží na koncovce)
- **.cz doména:** cca 200 Kč/rok
- **.com doména:** cca 350 Kč/rok
- **Kde:** WEDOS, Active24, Forpsi

### 2. Hosting
Kde váš web „bydlí" — server, který ho zpřístupňuje světu.

| Typ hostingu | Cena/rok | Pro koho |
|-------------|----------|----------|
| Sdílený hosting | 500–2 000 Kč | Malé weby, blogy |
| VPS | 2 000–10 000 Kč | Střední weby, e-shopy |
| Vercel / Netlify (free tier) | 0 Kč | Moderní weby (Next.js) |
| Vercel Pro | 5 000+ Kč/rok | Větší projekty |

**Tip:** Moderní weby na Next.js (jako naše) mohou běžet na Vercel free tier. Platíte 0 Kč za hosting.

### 3. SSL certifikát
- **Let's Encrypt:** Zdarma (standard)
- **Placený SSL:** 500–5 000 Kč/rok (pro e-shopy, banky)
- Většina hostingů nabízí Let's Encrypt automaticky

## Volitelné náklady

### 4. Aktualizace a bezpečnost

**WordPress web:**
- Aktualizace jádra: 4× ročně (+ urgentní bezpečnostní patche)
- Aktualizace pluginů: měsíčně
- Aktualizace šablony: 2–4× ročně
- **Riziko:** Neaktuální WP = bezpečnostní díra. 30 000 WP webů je hacknuto denně.
- **Cena údržby:** 3 000–10 000 Kč/rok (agentura) nebo vlastní čas

**Moderní web (Next.js):**
- Žádné pluginy k aktualizaci
- Staticky generované stránky = minimální bezpečnostní riziko
- **Cena údržby:** Minimální, většinou 0 Kč

### 5. Zálohy
- **WordPress:** Potřebujete pravidelné zálohy (plugin nebo hosting)
- **Moderní web:** Kód je na GitHubu, data v databázi se zálohují automaticky
- **Cena:** 0–2 000 Kč/rok

### 6. Email hosting
- **Firemní email (info@vasfirma.cz):**
  - Google Workspace: 1 700 Kč/uživatel/rok
  - Microsoft 365: 1 500 Kč/uživatel/rok
  - WEDOS mail: 300 Kč/rok

### 7. Úpravy obsahu
Pokud nemáte CMS (správu obsahu), každá textová změna vyžaduje vývojáře:
- Malá úprava: 500–1 500 Kč
- Nová stránka: 2 000–5 000 Kč
- **Tip:** Investujte do webu s CMS, ušetříte dlouhodobě

## Celkové roční náklady

### Minimální provoz (vlastní správa):

| Položka | Cena/rok |
|---------|----------|
| Doména .cz | 200 Kč |
| Hosting (Vercel free) | 0 Kč |
| SSL (Let's Encrypt) | 0 Kč |
| **Celkem** | **200 Kč/rok** |

### Typický firemní web:

| Položka | Cena/rok |
|---------|----------|
| Doména | 200 Kč |
| Hosting | 0–2 000 Kč |
| SSL | 0 Kč |
| Email (1 uživatel) | 1 500 Kč |
| Drobné úpravy | 3 000 Kč |
| **Celkem** | **4 700–6 700 Kč/rok** |

### WordPress s údržbou:

| Položka | Cena/rok |
|---------|----------|
| Doména | 200 Kč |
| Hosting | 2 000 Kč |
| SSL | 0 Kč |
| Aktualizace + bezpečnost | 6 000 Kč |
| Email (1 uživatel) | 1 500 Kč |
| Drobné úpravy | 5 000 Kč |
| **Celkem** | **14 700 Kč/rok** |

## WordPress vs. moderní web — náklady

| | WordPress | Next.js (Weblyx) |
|---|---|---|
| Hosting | 2 000–5 000 Kč/rok | 0 Kč (Vercel free) |
| Aktualizace | 3 000–10 000 Kč/rok | 0 Kč |
| Bezpečnostní riziko | Vysoké | Minimální |
| Rychlost | Průměrná | Velmi rychlá |
| **Roční náklady navíc** | **5 000–15 000 Kč** | **0–2 000 Kč** |

Za 3 roky ušetříte s moderním webem **15 000–45 000 Kč** oproti WordPressu.

## Shrnutí

Web nemusí stát tisíce ročně. S moderní technologií (Next.js + Vercel) jsou roční náklady na provoz jen 200 Kč za doménu. Investujte peníze raději do marketingu, ne do údržby.

---

*Naše weby nemají skryté měsíční poplatky. Jednorázová cena, hosting zdarma. [Spočítejte si cenu](/kalkulacka).*`,
  },

  // ─── 10. Jak získat recenze ───
  {
    title: 'Jak získat recenze od zákazníků: Kompletní návod pro firmy',
    slug: 'jak-ziskat-recenze-od-zakazniku',
    excerpt: 'Recenze jsou nejsilnější sociální důkaz. Jak je systematicky sbírat, kde je publikovat a jak reagovat na negativní recenze.',
    metaTitle: 'Jak získat recenze od zákazníků — návod pro firmy',
    metaDescription: 'Jak systematicky sbírat recenze od zákazníků. Google recenze, odpovídání na negativní recenze, QR kódy. Praktický návod pro malé firmy.',
    tags: ['recenze', 'marketing', 'Google', 'důvěra'],
    imageId: '1581291518857-4e27b48ff24e',
    imageFilename: 'jak-ziskat-recenze.jpg',
    daysAgo: 29,
    content: `# Jak získat recenze od zákazníků: Kompletní návod pro firmy

93 % spotřebitelů říká, že recenze ovlivňují jejich nákupní rozhodnutí. A přesto většina firem recenze aktivně nesbírá. Tady je návod, jak na to systematicky.

## Proč recenze tak záleží?

- **93 % lidí** čte recenze před nákupem
- **84 % důvěřuje** online recenzím stejně jako osobním doporučením
- Firmy s **4,5+ hvězdičkami** na Googlu dostávají 2× více poptávek
- Google recenze jsou **#2 faktor** pro lokální SEO

## Kde sbírat recenze?

### 1. Google Business Profile (priorita č. 1)
- Zobrazují se přímo ve vyhledávání
- Ovlivňují lokální SEO ranking
- Nejdůvěryhodnější platforma

### 2. Facebook
- Zobrazují se na vaší stránce
- Lidé je sdílejí

### 3. Oborové portály
- Firmy.cz, Živéfirmy.cz
- Heureka (pro e-shopy)
- TripAdvisor (pro gastro a ubytování)

### 4. Váš web
- Sekce reference / testimonials
- Nejvíce kontroly nad prezentací

## Jak systematicky sbírat recenze

### Metoda 1: Osobní prosba
Nejúčinnější metoda. Po dokončení zakázky:

> „Byli jste spokojeni s naší prací? Bude pro nás cenné, když nám napíšete krátkou recenzi na Google. Trvá to 2 minuty a pomůže nám to oslovit další zákazníky jako jste vy."

**Timing:** Ptejte se v momentě nejvyšší spokojenosti — hned po předání hotové práce.

### Metoda 2: Email s odkazem
24–48 hodin po dokončení zakázky pošlete email:

**Předmět:** „Jak se vám líbí nový web?"

**Obsah:**
> Dobrý den [jméno], děkujeme za spolupráci na vašem novém webu. Pokud jste spokojeni, budeme rádi za krátkou recenzi na Googlu — zabere to 2 minuty.
> [ODKAZ NA RECENZI]

**Tip:** Přímý odkaz na Google recenzi vytvoříte v Google Business Profile → „Požádat o recenze".

### Metoda 3: QR kód
Vytiskněte QR kód s odkazem na vaše Google recenze:
- Na vizitky
- Na pokladnu / recepci
- Na faktury
- Na obal produktu

### Metoda 4: SMS
Pro služby, kde máte telefonní číslo klienta:

> „Děkujeme za návštěvu! Pokud jste byli spokojeni, budeme rádi za recenzi: [odkaz] Váš [firma]"

### Metoda 5: Automatizace
Nastavte automatický email X dní po dokončení zakázky. Nástroje:
- Ecomail (automatizace)
- Mailchimp
- Vlastní CRM systém

## Jak odpovídat na recenze

### Na pozitivní recenzi:
> Mockrát děkujeme za krásnou recenzi, [jméno]! Spolupráce s vámi nás moc bavila. Kdykoliv budete potřebovat, jsme tu pro vás. 😊

**Pravidla:**
- Odpovězte do 24 hodin
- Použijte jméno
- Buďte osobní, ne šablonovití
- Poděkujte

### Na negativní recenzi:
> Děkujeme za zpětnou vazbu, [jméno]. Je nám líto, že vaše zkušenost nebyla ideální. Rádi bychom to s vámi vyřešili — můžete nás kontaktovat na [telefon/email]? Chceme se poučit a zlepšit se.

**Pravidla:**
- NIKDY se nehádejte veřejně
- Uznejte problém (i když nesouhlasíte)
- Nabídněte řešení offline
- Buďte profesionální

### Na falešnou/spam recenzi:
- Nahlaste ji Googlu (v GBP dashboardu)
- Odpovězte profesionálně (pro ostatní čtenáře)
- Nesnažte se ji „přebít" falešnými pozitivními recenzemi

## Kolik recenzí potřebujete?

| Počet recenzí | Efekt |
|--------------|-------|
| 0–5 | Nedůvěryhodné |
| 10–20 | Základ důvěry |
| 20–50 | Solidní sociální důkaz |
| 50+ | Excelentní, dominujete lokální SEO |

**Cíl:** Alespoň 20 recenzí s průměrem 4,5+ hvězdiček.

## Nejčastější chyby

1. **Kupování recenzí** — Google to pozná a penalizuje vás. Plus je to podvod.
2. **Falešné recenze** — totéž. Riskujete smazání celého profilu.
3. **Nereagování na negativní recenze** — vypadá to, jako by vám to bylo jedno.
4. **Ptaní se jen spokojenýchzákazníků** — přirozený mix je důvěryhodnější.
5. **Jednorázová akce** — sbírejte recenze průběžně, ne jednorázově.

## Jak recenze zobrazit na webu

Nejlepší formát pro webové reference:

1. **Jméno a příjmení** zákazníka
2. **Firma / pozice** (pokud je to relevantní)
3. **Fotka** (zvyšuje důvěryhodnost)
4. **Konkrétní citace** — ne „super práce", ale „Web od Weblyx nám přinesl 3× více poptávek za první měsíc"
5. **Hvězdičky** (vizuální signál)

---

*Chcete web, který buduje důvěru? Všechny naše weby mají sekci referencí. [Spočítejte si cenu](/kalkulacka) nebo se [ozvěte](/poptavka).*`,
  },
];

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting batch 2 blog seeding...\n');

  for (const post of posts) {
    console.log(`📝 Creating: ${post.title}`);
    try {
      const imageUrl = await downloadAndUpload(post.imageId, post.imageFilename);
      const id = nanoid();

      // Calculate published_at based on daysAgo
      const publishDate = new Date('2026-02-28T10:00:00Z');
      publishDate.setDate(publishDate.getDate() - post.daysAgo);
      // Random hour 8-16
      const hourOffset = Math.floor(Math.random() * 8) + 8;
      publishDate.setHours(hourOffset, Math.floor(Math.random() * 60), 0, 0);
      const publishedAt = Math.floor(publishDate.getTime() / 1000);

      await client.execute({
        sql: `INSERT INTO blog_posts (
          id, title, slug, content, excerpt, author_name,
          featured_image, published, published_at, tags, meta_title,
          meta_description, views, created_at, updated_at, language
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, post.title, post.slug, post.content, post.excerpt, 'Weblyx',
          imageUrl, 1, publishedAt, JSON.stringify(post.tags), post.metaTitle,
          post.metaDescription, 0, publishedAt, publishedAt, 'cs',
        ],
      });
      console.log(`  ✅ Done (${publishDate.toISOString().split('T')[0]})\n`);
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        console.log(`  ⚠️  Already exists, skipping\n`);
      } else {
        console.error(`  ❌ Error:`, err.message, '\n');
      }
    }
  }

  console.log('🎉 All done!');
}

main().catch(console.error);
