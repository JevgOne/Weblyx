/**
 * Seed 8 new SEO blog posts + add images to 5 existing posts without images
 * Run: npx tsx scripts/seed-new-blog-posts.ts
 */

import { createClient } from '@libsql/client';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ── Image helpers ──────────────────────────────────────────────
async function downloadAndUpload(
  unsplashId: string,
  filename: string
): Promise<string> {
  const url = `https://images.unsplash.com/photo-${unsplashId}?w=1200&h=630&fit=crop&q=80`;
  console.log(`  ↓ Downloading ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const blob = await put(`blog/${filename}`, buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });
  console.log(`  ✓ Uploaded → ${blob.url}`);
  return blob.url;
}

// ── Post definitions ───────────────────────────────────────────
interface PostDef {
  title: string;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  imageId: string;      // Unsplash photo ID
  imageFilename: string;
  content: string;
}

const posts: PostDef[] = [
  // ─── 1. Jak založit e-shop v roce 2026 ───
  {
    title: 'Jak založit e-shop v roce 2026: Kompletní návod pro začátečníky',
    slug: 'jak-zalozit-eshop-2026',
    excerpt: 'Chcete prodávat online? Kompletní průvodce založením e-shopu v roce 2026 — od výběru platformy po první objednávku.',
    metaTitle: 'Jak založit e-shop v roce 2026: Kompletní návod krok za krokem',
    metaDescription: 'Návod jak založit e-shop v roce 2026. Shopify, WooCommerce nebo vlastní řešení? Kolik to stojí a co potřebujete. Praktický průvodce.',
    tags: ['e-shop', 'online prodej', 'podnikání', '2026'],
    imageId: '1556742049-0cfed4f6a45d',
    imageFilename: 'eshop-zalozeni-2026.jpg',
    content: `# Jak založit e-shop v roce 2026: Kompletní návod pro začátečníky

Prodej online už dávno není jen pro velké firmy. V roce 2026 si e-shop může založit každý — otázka je, jak na to chytře a bez zbytečných chyb.

## Proč prodávat online?

Čísla mluví jasně:

- **72 % Čechů** nakupuje online alespoň jednou měsíčně
- Trh e-commerce v ČR roste meziročně o 8–12 %
- Průměrná marže online prodeje je vyšší než v kamenném obchodě

Pokud máte produkt nebo službu, online prodej je v roce 2026 téměř nutnost.

## Krok 1: Vyberte si platformu

### Hotová řešení (SaaS)

**Shopify** — nejpopulárnější platforma na světě. Výhody: jednoduchost, spolehlivost, ekosystém aplikací. Nevýhody: měsíční poplatky (od 700 Kč/měsíc), transakční poplatky, omezená lokalizace pro ČR.

**Shoptet** — česká platforma, dominuje na českém trhu. Výhody: česká podpora, napojení na české přepravce a platební brány, znalost místního trhu. Nevýhody: méně flexibilní design, pomalejší inovace.

**WooCommerce** — plugin pro WordPress. Výhody: zdarma základ, obrovská komunita, flexibilita. Nevýhody: vyžaduje technické znalosti, pomalý bez optimalizace, bezpečnostní rizika.

### Vlastní řešení na míru

Pokud potřebujete specifické funkce nebo maximální rychlost, má smysl zvážit **e-shop na míru** (Next.js, Medusa, Saleor). Cena začíná kolem 80 000 Kč, ale získáte web, který je rychlejší než 95 % konkurence.

## Krok 2: Právní povinnosti

Než spustíte e-shop, musíte mít v pořádku:

- **Živnostenské oprávnění** — volná živnost "Velkoobchod a maloobchod"
- **Obchodní podmínky** — zákon o ochraně spotřebitele je přísný
- **GDPR** — zásady zpracování osobních údajů
- **Reklamační řád** — 14 dní na vrácení bez udání důvodu
- **EET / e-tržby** — pokud přijímáte platby kartou, povinnosti se liší

**Tip:** Obchodní podmínky nekopírujte od konkurence. Nechte si je zkontrolovat právníkem — stojí to 3 000–5 000 Kč a ušetří vám problémy s ČOI.

## Krok 3: Produktové fotografie

80 % nákupního rozhodnutí je vizuální. Kvalitní fotky jsou investice, ne náklad.

- **Profesionální fotograf**: 5 000–15 000 Kč za produktovou sérii
- **Vlastní fotografie**: smartphone s dobrým světlem + bílé pozadí
- **AI generované pozadí**: v roce 2026 umí AI nástroje vytvořit profesionální produktové fotky za zlomek ceny

## Krok 4: Platební brána a doprava

### Platební brány pro český trh

| Brána | Poplatky | Výhody |
|-------|----------|--------|
| GoPay | 1,9 % + 3 Kč | Oblíbená v ČR, rychlé nasazení |
| Comgate | 1,5–2,5 % | Široká nabídka platebních metod |
| Stripe | 1,4 % + 6 Kč | Mezinárodní, moderní API |

### Dopravci

- **Zásilkovna** — nejlevnější varianta, síť výdejních míst
- **PPL / DPD** — spolehlivá doručení domů
- **Česká pošta** — pro starší zákazníky stále důležitá

## Krok 5: Marketing a první zákazníci

E-shop bez návštěvníků je jako obchod v lese. Jak přivést první zákazníky:

1. **Google Ads** — nejrychlejší cesta. Nastavte kampaň na klíčová slova vašich produktů.
2. **Sociální sítě** — Instagram a Facebook pro vizuální produkty, LinkedIn pro B2B.
3. **SEO** — dlouhodobá strategie. Optimalizujte produktové stránky na klíčová slova, která lidé hledají.
4. **Email marketing** — sbírejte emaily od prvního dne. Nabídněte slevu za registraci.

## Kolik to celé stojí?

| Položka | Rozpočet |
|---------|----------|
| Platforma (Shoptet/Shopify) | 500–2 000 Kč/měsíc |
| Doména + hosting | 300–500 Kč/rok |
| Design/šablona | 0–15 000 Kč jednorázově |
| Právní dokumenty | 3 000–5 000 Kč |
| Produktové fotky | 5 000–15 000 Kč |
| Marketing (první měsíc) | 5 000–20 000 Kč |

**Celkem na rozjezd: 15 000–60 000 Kč** podle rozsahu.

## Nejčastější chyby začátečníků

- **Příliš mnoho produktů na začátku** — začněte s 10–20 produkty a rozšiřujte
- **Žádný marketing** — „postavím e-shop a zákazníci přijdou sami" nefunguje
- **Ignorování mobilů** — 65 % nákupů v ČR probíhá na mobilu
- **Žádná analytika** — bez dat nevíte, co funguje. Nastavte Google Analytics od prvního dne.

## Shrnutí

Založení e-shopu v roce 2026 je dostupnější než kdy dříve. Klíčem je vybrat správnou platformu, mít v pořádku právní dokumenty a investovat do marketingu. Nečekejte na „dokonalý" moment — spusťte, testujte a vylepšujte.

---

*Potřebujete pomoct s webem pro váš e-shop? [Spočítejte si orientační cenu](/kalkulacka) nebo nám [napište](/poptavka).*`,
  },

  // ─── 2. Lokální SEO pro malé firmy ───
  {
    title: 'Lokální SEO pro malé firmy: Jak se dostat na první místo v okolí',
    slug: 'lokalni-seo-male-firmy',
    excerpt: 'Naučte se, jak dostat vaši firmu na první pozice v lokálním vyhledávání. Google Mapy, recenze a lokální klíčová slova.',
    metaTitle: 'Lokální SEO pro malé firmy — jak se dostat na 1. místo v okolí',
    metaDescription: 'Lokální SEO průvodce pro malé firmy v ČR. Google Business Profile, recenze, lokální klíčová slova. Praktické tipy zdarma.',
    tags: ['SEO', 'lokální SEO', 'malé firmy', 'Google Mapy'],
    imageId: '1559136555-9303baea8ebd',
    imageFilename: 'lokalni-seo-male-firmy.jpg',
    content: `# Lokální SEO pro malé firmy: Jak se dostat na první místo v okolí

Když někdo hledá „instalatér Praha 6" nebo „kadeřnictví Brno centrum", chcete být nahoře. Lokální SEO je nejefektivnější způsob, jak přivést zákazníky z vašeho okolí — a přitom to nemusí stát ani korunu.

## Co je lokální SEO a proč na něm záleží?

Lokální SEO je optimalizace pro vyhledávání s geografickým záměrem. Když někdo hledá „restaurace poblíž" nebo „autoservis Olomouc", Google zobrazí:

1. **Map Pack** — 3 výsledky z Google Map s hvězdičkami
2. **Organické výsledky** — klasické odkazy

**46 % všech vyhledávání na Googlu** má lokální záměr. A 78 % lokálních mobilních vyhledávání vede k nákupu do 24 hodin.

Pokud nejste v Map Packu, přicházíte o zákazníky.

## 1. Google Business Profile — základ všeho

Google Business Profile (dříve Google My Business) je **nejdůležitější nástroj** pro lokální SEO. Je zdarma.

### Jak optimalizovat profil:

- **Kompletně vyplňte všechna pole** — název, adresa, telefon, web, otevírací doba, kategorie
- **Vyberte správnou hlavní kategorii** — ne „služby", ale „instalatérství" nebo „kadeřnický salon"
- **Přidejte fotografie** — firmy s 100+ fotkami dostávají 520 % více hovorů a 2 717 % více žádostí o navigaci
- **Pravidelně přidávejte příspěvky** — Google upřednostňuje aktivní profily
- **Odpovídejte na otázky** — sekce Q&A je často přehlížená

### Typické chyby:

- ❌ Nekonzistentní název firmy (jiný na webu, jiný na Googlu)
- ❌ Nesprávná kategorie
- ❌ Žádné fotografie
- ❌ Neaktuální otevírací doba

## 2. Recenze — sociální důkaz, který prodává

Recenze jsou **druhý nejdůležitější faktor** pro lokální SEO.

### Jak získat více recenzí:

- **Ptejte se osobně** — po dokončení zakázky řekněte: „Byli jste spokojeni? Bude pro nás cenné, když nám napíšete recenzi na Google."
- **Pošlete odkaz emailem** — vygenerujte si přímý odkaz na formulář recenze
- **QR kód v provozovně** — vytiskněte QR kód s odkazem na recenze
- **Odpovídejte na VŠECHNY recenze** — pozitivní i negativní. Google to sleduje.

### Jak odpovídat na negativní recenze:

1. Poděkujte za zpětnou vazbu
2. Uznejte problém (i když s ním nesouhlasíte)
3. Nabídněte řešení offline (telefon, email)
4. Nikdy se nehádejte veřejně

## 3. Lokální klíčová slova na webu

Váš web musí Googlu jasně říkat, **kde působíte** a **co děláte**.

### Kde umístit lokální klíčová slova:

- **Title tag**: „Instalatérství Praha 6 | Nonstop | Jan Novák"
- **H1 nadpis**: „Spolehlivý instalatér v Praze 6"
- **URL**: „/instalater-praha-6"
- **Text na stránce**: Přirozeně zapojte město/čtvrť do textu
- **Alt tagy obrázků**: „oprava vodovodního kohoutku Praha 6"

### Co NEDĚLAT:

- ❌ Přeplácat text klíčovými slovy: „Instalatér Praha, Praha instalatér, instalatérství v Praze, Praha 6 instalatér" — Google to penalizuje
- ❌ Vytvářet stovky stránek pro každé město v ČR, pokud tam reálně nepůsobíte

## 4. NAP konzistence

**NAP = Name, Address, Phone** (Název, Adresa, Telefon)

Vaše firemní údaje musí být **identické na všech místech**:

- Webové stránky (patička)
- Google Business Profile
- Firmy.cz
- Živéfirmy.cz
- Facebook
- Instagram
- Oborové katalogy

I drobné rozdíly (ul. vs ulice, +420 vs 420) mohou Googlu zmást.

## 5. Lokální obsah na blogu

Pište články zaměřené na vaše město/region:

- „5 nejčastějších problémů s vodou v paneláku v Praze"
- „Kolik stojí kadeřník v Brně v roce 2026"
- „Jak vybrat autoservis v Ostravě — na co se ptát"

Tento obsah přitahuje lokální vyhledávání a buduje vaši autoritu.

## 6. Budování lokálních odkazů

Odkazy z místních zdrojů pomáhají lokálnímu SEO:

- **Registrace do katalogů**: Firmy.cz, Živéfirmy.cz, Najisto.cz
- **Lokální média**: Napište tiskovou zprávu pro místní noviny
- **Partnerství**: Vzájemné odkazy s komplementárními firmami v okolí
- **Sponzoring**: Podpořte lokální akci a získejte odkaz na webu akce

## Měření výsledků

Sledujte tyto metriky v Google Business Profile:

- **Zobrazení v Mapách** — kolikrát se vaše firma zobrazila
- **Kliknutí na web** — kolik lidí přešlo na váš web
- **Žádosti o navigaci** — kolik lidí hledalo cestu k vám
- **Telefonní hovory** — kolik lidí zavolalo přímo z profilu

## Shrnutí: Checklist lokálního SEO

- [ ] Kompletní Google Business Profile
- [ ] Minimálně 20 recenzí s průměrem 4,5+
- [ ] NAP konzistence na všech platformách
- [ ] Lokální klíčová slova na webu
- [ ] Alespoň 1 lokální blog článek měsíčně
- [ ] Registrace v českých katalozích

---

*Potřebujete web optimalizovaný pro lokální vyhledávání? [Podívejte se na naše balíčky](/kalkulacka) nebo nám [napište](/poptavka).*`,
  },

  // ─── 3. Google firemní profil ───
  {
    title: 'Google firemní profil: Kompletní návod na nastavení a optimalizaci',
    slug: 'google-firemni-profil-navod',
    excerpt: 'Jak založit a optimalizovat Google Business Profile. Krok za krokem od registrace po první recenze.',
    metaTitle: 'Google firemní profil — kompletní návod na nastavení 2026',
    metaDescription: 'Jak založit Google Business Profile (firemní profil) krok za krokem. Optimalizace, fotografie, recenze. Kompletní návod 2026.',
    tags: ['Google Business Profile', 'SEO', 'lokální SEO', 'návod'],
    imageId: '1573804633927-bfcbcd909acd',
    imageFilename: 'google-firemni-profil.jpg',
    content: `# Google firemní profil: Kompletní návod na nastavení a optimalizaci

Google Business Profile (GBP) je zdarma a je to **nejdůležitější nástroj**, který může malá firma použít pro online viditelnost. Přesto ho většina firem buď nemá, nebo má nastavený špatně.

## Co je Google Business Profile?

Je to vaše vizitka na Googlu. Když někdo hledá vaši firmu nebo službu ve vašem městě, GBP se zobrazí:

- **V Google Mapách** — s navigací k vaší provozovně
- **V pravém panelu vyhledávání** — s fotografiemi, recenzemi a kontakty
- **V Map Packu** — 3 lokální výsledky nad organickými výsledky

Firmy s optimalizovaným profilem dostávají **7× více kliknutí** než firmy bez profilu.

## Krok 1: Založení profilu

1. Přejděte na [business.google.com](https://business.google.com)
2. Klikněte na „Spravovat" (nebo „Přidat firmu")
3. Zadejte **přesný název firmy** — tak jak ho máte v živnostenském rejstříku
4. Vyberte **hlavní kategorii podnikání**
5. Zadejte adresu provozovny
6. Přidejte telefonní číslo a web

### Ověření firmy

Google potřebuje ověřit, že firma existuje. Metody:

- **Poštou** — pohlednice s kódem na adresu provozovny (5–14 dní)
- **Telefonicky** — automatický hovor s kódem (ne vždy dostupné)
- **Emailem** — kód na firemní email (ne vždy dostupné)
- **Videem** — natočíte krátké video provozovny (novinka 2025+)

## Krok 2: Kompletní vyplnění profilu

Google profily, které jsou vyplněné na 100 %, mají **2,7× větší šanci** na zobrazení v Map Packu.

### Co vyplnit:

| Pole | Příklad | Důležitost |
|------|---------|------------|
| Název firmy | Kadeřnictví Krása — Brno | Kritická |
| Hlavní kategorie | Kadeřnický salon | Kritická |
| Vedlejší kategorie | Kosmetický salon | Vysoká |
| Adresa | Masarykova 15, 602 00 Brno | Kritická |
| Telefon | +420 777 888 999 | Vysoká |
| Web | www.kadernictvi-krasa.cz | Vysoká |
| Otevírací doba | Po–Pá 8:00–18:00 | Kritická |
| Popis firmy | Max 750 znaků, klíčová slova | Střední |
| Služby/produkty | Seznam s cenami | Střední |

### Popis firmy — jak ho napsat:

- **Prvních 250 znaků je nejdůležitějších** — zobrazí se v náhledu
- Zahrňte: co děláte, kde působíte, čím se odlišujete
- Nepoužívejte kapitálky ani speciální znaky
- Přirozeně zapojte klíčová slova

**Dobrý příklad:**
> Kadeřnictví Krása v centru Brna nabízí profesionální střihy, barvení a ošetření vlasů pro ženy i muže. Již 12 let se staráme o vlasy našich zákazníků s důrazem na kvalitní produkty a individuální přístup. Objednávky telefonicky nebo online.

## Krok 3: Fotografie

Fotografie jsou **#1 faktor**, proč lidé kliknou na váš profil.

### Jaké fotky přidat:

- **Logo** — čtvercové, min. 250×250 px
- **Cover foto** — hlavní foto profilu, 1080×608 px
- **Exteriér** — budova zvenku, ideálně z více úhlů
- **Interiér** — provozovna zevnitř
- **Tým** — fotky zaměstnanců (zvyšují důvěru)
- **Práce/produkty** — ukázky vaší práce

**Kolik fotek?** Minimálně 10, ideálně 30+. Firmy s více než 100 fotkami dostávají o 520 % více hovorů.

**Tip:** Přidávejte 2–3 nové fotky týdně. Google upřednostňuje profily s čerstvým obsahem.

## Krok 4: Recenze

### Jak získat první recenze:

1. **Vytvořte si krátký odkaz** — v GBP dashboardu najdete „Požádat o recenze"
2. **Pošlete odkaz spokojeným zákazníkům** — emailem nebo SMS
3. **Vytiskněte QR kód** — umístěte ho u pokladny nebo na vizitku
4. **Ptejte se osobně** — „Pokud jste byli spokojeni, budeme rádi za recenzi na Googlu"

### Odpovídání na recenze:

**Na pozitivní recenzi:**
> Děkujeme za krásnou recenzi, [jméno]! Těšíme se na další návštěvu. 😊

**Na negativní recenzi:**
> Děkujeme za zpětnou vazbu, [jméno]. Mrzí nás, že vaše zkušenost nebyla ideální. Rádi to s vámi vyřešíme — zavolejte nám prosím na [telefon].

## Krok 5: Příspěvky (Google Posts)

Pravidelné příspěvky udržují profil aktivní. Typy:

- **Aktuality** — novinky o firmě, nové služby
- **Nabídky** — akce, slevy, sezónní nabídky
- **Události** — otevírací doba o svátcích, akce

**Jak často?** Alespoň 1× týdně. Příspěvky po 7 dnech ztrácí viditelnost.

## Krok 6: Měření a optimalizace

V dashboardu sledujte:

- **Zobrazení** — kolikrát se profil zobrazil ve vyhledávání a na Mapách
- **Akce** — kolik lidí kliklo na web, zavolalo, žádalo navigaci
- **Klíčová slova** — na jaké dotazy se vaše firma zobrazuje
- **Fotografové** — kdo přidává fotky (i zákazníci mohou přidávat)

## Časté problémy a řešení

### „Moje firma se nezobrazuje v Mapách"
- Ověřte, že je profil ověřený (zelená fajfka)
- Zkontrolujte, zda nemáte duplicitní profil
- Přidejte více fotek a získejte recenze

### „Někdo přidal špatné informace"
- V dashboardu klikněte na „Navrhnout úpravu"
- Pokud jde o spam, nahlaste ho Googlu

### „Nemám provozovnu — mohu mít profil?"
Ano! Vyberte možnost „Služby na adrese zákazníka" — zobrazíte se v relevantních vyhledáváních bez zobrazení adresy.

## Shrnutí

Google Business Profile je **nejefektivnější bezplatný marketing** pro lokální firmy. Investujte 30 minut do optimalizace a pak 5 minut týdně do údržby (příspěvky, fotky, odpovědi na recenze). Výsledky uvidíte během 4–8 týdnů.

---

*Chcete web, který funguje společně s vaším Google profilem? [Spočítejte si cenu](/kalkulacka) nebo se [ozvěte](/poptavka).*`,
  },

  // ─── 4. Stačí vám Facebook? ───
  {
    title: 'Stačí vám Facebook? Proč sociální sítě nenahrazují vlastní web',
    slug: 'facebook-vs-vlastni-web',
    excerpt: 'Mnoho firem spoléhá jen na Facebook. Proč je to risk a proč vlastní web stále dává větší smysl.',
    metaTitle: 'Stačí vám Facebook? Proč sociální sítě nenahrazují web',
    metaDescription: 'Proč Facebook stránka nestačí jako firemní web. Srovnání sociálních sítí vs. vlastního webu. Co přináší více zákazníků?',
    tags: ['Facebook', 'sociální sítě', 'webové stránky', 'marketing'],
    imageId: '1611162617474-5b21e879e113',
    imageFilename: 'facebook-vs-web.jpg',
    content: `# Stačí vám Facebook? Proč sociální sítě nenahrazují vlastní web

„Na co mi je web, když mám Facebook?" Tuhle větu slyšíme minimálně dvakrát týdně. A pokaždé odpovídáme to samé: **Facebook stránka není váš web. Je to pronajatý prostor, který vám kdykoli mohou vzít.**

## Tvrdá realita: Facebook vás nemá rád

V roce 2015 vidělo průměrný firemní příspěvek na Facebooku 16 % sledujících. V roce 2026? **Méně než 2 %.**

Máte 1 000 sledujících? Váš příspěvek vidí 20 lidí. Chcete oslovit zbytek? Zaplaťte si reklamu.

Facebook je firma. Jejím produktem jste vy. A její cílem je, abyste utráceli za reklamu.

## 5 důvodů, proč Facebook nestačí

### 1. Nemáte kontrolu nad svými daty

Facebook může kdykoli:
- Změnit algoritmus (a vaše příspěvky uvidí ještě méně lidí)
- Zablokovat váš účet (stačí nahlášení od konkurence)
- Změnit pravidla pro firemní stránky
- Úplně zrušit platformu (vzpomeňte na MySpace)

Váš web? Ten je váš. Nikdo vám ho nemůže vzít.

### 2. Google neindexuje Facebook příspěvky

Když někdo hledá na Googlu „kadeřnictví Brno", vaše Facebook stránka se **nezobrazí na první straně**. Zobrazí se weby.

70 % zákazníků začíná hledání na Googlu. Bez webu jste pro ně neviditelní.

### 3. Facebook vypadá neprofesionálně

Představte si, že hledáte účetní. Najdete dvě firmy:
- **Firma A**: Profesionální web s referencemi, certifikáty a ceníkem
- **Firma B**: Facebook stránka s posledním příspěvkem z října

Komu důvěřujete víc?

**83 % spotřebitelů** říká, že webové stránky firmy ovlivňují jejich důvěru v ni.

### 4. Omezené možnosti prezentace

Na Facebooku nemůžete:
- Vytvořit vlastní design odpovídající vaší značce
- Přidat rezervační systém
- Mít blog optimalizovaný pro SEO
- Sbírat emaily efektivně
- Mít plnohodnotný ceník s kalkulačkou
- Zobrazit portfolio s filtry

Web vám dává **neomezenou kontrolu** nad tím, jak se prezentujete.

### 5. Závislost na jedné platformě

Co se stane, když:
- Facebook změní algoritmus? → Vaše příspěvky vidí méně lidí
- Váš účet zablokují? → Přijdete o všechny sledující
- Facebook zavede nové poplatky? → Nemáte alternativu

**Diverzifikace je klíč.** Web je vaše základna, sociální sítě jsou kanály.

## Kdy Facebook stačí?

Buďme féroví — existují situace, kdy Facebook postačí:

- **Hobby projekty** — prodáváte marmelády sousedům
- **Úplný začátek** — nemáte budget ani na nejlevnější web
- **Testování trhu** — ověřujete, zda o vaši službu je zájem

Ale jakmile chcete **profesionálně podnikat**, vlastní web je nutnost.

## Ideální kombinace: Web + sociální sítě

Nejlepší strategie není „web NEBO Facebook". Je to **web A sociální sítě**:

1. **Web** = vaše základna. SEO, konverze, důvěra.
2. **Facebook/Instagram** = kanál pro budování komunity a povědomí.
3. **Obsah z webu sdílíte na sítích** → přivádíte lidi na web → web konvertuje.

### Příklad flow:

1. Napíšete blog článek na web
2. Sdílíte ho na Facebooku a Instagramu
3. Lidé kliknou na odkaz → přijdou na web
4. Na webu vyplní formulář / zavolají / objednají

Sociální sítě přivádějí lidi. Web je konvertuje na zákazníky.

## Kolik stojí web vs. Facebook?

| | Facebook stránka | Vlastní web |
|---|---|---|
| Založení | Zdarma | Od 7 990 Kč |
| Měsíční náklady | 0 Kč (+ reklama) | 0 Kč (hosting v ceně) |
| Dosah | 2 % sledujících | Neomezený (SEO) |
| SEO | Minimální | Plné |
| Důvěryhodnost | Nízká | Vysoká |
| Kontrola | Žádná | Plná |
| Vlastnictví dat | Meta vlastní | Vy vlastníte |

**Za cenu jednoho měsíce Facebook reklamy** můžete mít profesionální web, který vám přivádí zákazníky roky.

## Shrnutí

Facebook je skvělý nástroj, ale není náhrada za vlastní web. Pokud stavíte svůj byznys jen na pronajatém prostoru, riskujete, že o všechno přijdete přes noc.

Investujte do vlastního webu. Je to investice, ne náklad.

---

*Web od 7 990 Kč, bez měsíčních poplatků. [Spočítejte si cenu](/kalkulacka) nebo se [ozvěte](/poptavka).*`,
  },

  // ─── 5. Email marketing pro malé firmy ───
  {
    title: 'Email marketing pro malé firmy: Jak začít a co funguje v roce 2026',
    slug: 'email-marketing-male-firmy-2026',
    excerpt: 'Email marketing má ROI 4 200 %. Jak ho rozjet v malé firmě? Nástroje, automatizace, GDPR a tipy co funguje.',
    metaTitle: 'Email marketing pro malé firmy — jak začít v roce 2026',
    metaDescription: 'Jak začít s email marketingem v malé firmě. Nejlepší nástroje, automatizace, GDPR pravidla. ROI 4 200 %. Průvodce 2026.',
    tags: ['email marketing', 'newsletter', 'malé firmy', 'automatizace'],
    imageId: '1596526131083-e8c633c948d2',
    imageFilename: 'email-marketing-firmy.jpg',
    content: `# Email marketing pro malé firmy: Jak začít a co funguje v roce 2026

Email marketing je **nejziskovější marketingový kanál**. Za každou investovanou korunu vrátí průměrně 42 Kč (ROI 4 200 %). A přesto ho většina malých firem v Česku nepoužívá.

## Proč email marketing v roce 2026?

Sociální sítě mění algoritmy. Google mění pravidla SEO. Ale emailový seznam? Ten je **váš**. Nikdo vám ho nemůže vzít.

- **4,5 miliardy** lidí na světě používá email
- **99 %** uživatelů kontroluje email každý den
- **ROI 4 200 %** — žádný jiný kanál se nepřibližuje

## Krok 1: Vyberte nástroj

### Nejlepší nástroje pro český trh

| Nástroj | Cena (do 1 000 kontaktů) | Čeština | Nejlepší pro |
|---------|--------------------------|---------|--------------|
| Ecomail | Od 350 Kč/měsíc | Ano | České firmy, automatizace |
| Mailchimp | Zdarma (do 500) | Ne | Začátečníky, jednoduchost |
| Brevo (ex Sendinblue) | Zdarma (do 300/den) | Částečně | SMS + email combo |
| SmartEmailing | Od 490 Kč/měsíc | Ano | Pokročilé segmentace |

**Naše doporučení pro malé firmy:** Ecomail — český nástroj, česká podpora, rozumné ceny, pokročilá automatizace.

## Krok 2: Sbírejte emaily (legálně)

### GDPR pravidla pro email marketing

V EU musíte mít **explicitní souhlas** s odesíláním marketingových emailů.

**Co musíte splnit:**
- Checkbox „Souhlasím se zasíláním..." — nesmí být předvyplněný
- Jasný popis, co bude odběratel dostávat
- Možnost odhlášení v každém emailu
- Evidence souhlasů (kdy, jak, odkud)

**Co nesmíte:**
- ❌ Kupovat emailové seznamy
- ❌ Předvyplňovat souhlas
- ❌ Odesílat bez souhlasu (i existujícím zákazníkům, pokud nemáte tzv. oprávněný zájem)

### Jak sbírat emaily na webu:

1. **Pop-up s nabídkou** — „Získejte 10% slevu za přihlášení k newsletteru"
2. **Lead magnet** — nabídněte něco hodnotného zdarma (e-book, checklist, kalkulačka)
3. **Formulář v patičce webu** — jednoduchý, vždy viditelný
4. **Exit-intent popup** — zobrazí se, když uživatel odchází ze stránky
5. **Blog** — na konci článku nabídněte odběr dalších tipů

## Krok 3: Co posílat?

### Typy emailů, které fungují:

**1. Uvítací série (automatizovaná)**
- Email 1 (ihned): Poděkování + slíbený bonus
- Email 2 (den 3): Představení firmy, vaše příběh
- Email 3 (den 7): Nejlepší obsah / reference

**2. Newsletter (pravidelný)**
- Frekvence: 1–2× měsíčně
- Obsah: Tipy, novinky, zákulisí firmy
- Formát: Krátký, s jedním jasným CTA

**3. Prodejní emaily (občasné)**
- Akce, slevy, nové produkty
- Maximálně 1× za 2 týdny
- Vždy s jasnou hodnotou pro příjemce

**4. Transakční emaily**
- Potvrzení objednávky, faktury, notifikace
- Mají nejvyšší open rate (80 %+)
- Přidejte cross-sell doporučení

## Krok 4: Automatizace

Automatizace šetří čas a zvyšuje konverze. Základní automace:

### Uvítací série
→ Někdo se přihlásí k newsletteru
→ Automaticky obdrží 3 emaily v následujících 7 dnech

### Opuštěný košík (e-shopy)
→ Zákazník přidá do košíku a nedokončí objednávku
→ Po 1 hodině obdrží reminder email
→ Po 24 hodinách obdrží email se slevou 5 %

### Narozeninový email
→ Den před narozeninami obdrží email se slevou / dárkem
→ Open rate narozeninových emailů: 45 % (vs. průměr 20 %)

## Krok 5: Měření

### Klíčové metriky:

| Metrika | Dobrý průměr | Co to znamená |
|---------|--------------|---------------|
| Open rate | 20–25 % | Kolik lidí email otevřelo |
| Click rate | 2–5 % | Kolik lidí kliklo na odkaz |
| Unsubscribe rate | Pod 0,5 % | Kolik lidí se odhlásilo |
| Conversion rate | 1–3 % | Kolik lidí provedlo akci |

### Jak zlepšit open rate:

- **Předmět emailu** je klíčový — testujte A/B varianty
- **Čas odeslání** — v ČR funguje úterý a čtvrtek 9:00–11:00
- **Personalizace** — „Jméno, máme pro vás tip" > „Newsletter č. 47"

## Nejčastější chyby

1. **Odesílání příliš často** — jednou týdně je maximum, ideálně 2× měsíčně
2. **Žádná segmentace** — neposílejte stejný email všem
3. **Příliš prodejní obsah** — poměr 80 % hodnota / 20 % prodej
4. **Ignorování mobilů** — 60 % emailů se otevírá na mobilu
5. **Žádné CTA** — každý email by měl mít jeden jasný cíl

## Shrnutí

Email marketing je nejefektivnější a nejlevnější způsob, jak zůstat v kontaktu se zákazníky. Začněte jednoduše: vyberte nástroj, přidejte formulář na web, nastavte uvítací sérii. A pak pravidelně posílejte hodnotný obsah.

---

*Chcete web, který sbírá emaily za vás? [Podívejte se na naše balíčky](/kalkulacka) — sbírání leadů je jednou z našich doplňkových služeb.*`,
  },

  // ─── 6. Kdy předělat web ───
  {
    title: 'Kdy předělat web: 7 signálů, že je čas na redesign',
    slug: 'kdy-predelat-web-redesign',
    excerpt: 'Jak poznáte, že váš web potřebuje redesign? 7 jasných signálů, které říkají: je čas na změnu.',
    metaTitle: 'Kdy předělat web — 7 signálů že je čas na redesign',
    metaDescription: 'Pomalý web, zastaralý design, nefunguje na mobilu? 7 signálů že je čas na redesign webu. Praktický průvodce s checklistem.',
    tags: ['redesign', 'webové stránky', 'modernizace', 'UX'],
    imageId: '1507238691740-187a5b1d37b8',
    imageFilename: 'redesign-webu-signaly.jpg',
    content: `# Kdy předělat web: 7 signálů, že je čas na redesign

Váš web funguje. Nějak. Ale přivádí zákazníky? Nebo je odhání? Průměrná životnost firemního webu je 3–4 roky. Po té době je zastaralý technicky, designově i obsahově.

Tady je 7 signálů, které říkají: **je čas na nový web.**

## 1. Web je pomalý

**PageSpeed skóre pod 50** na mobilu = problém.

Google oficiálně potvrdil, že rychlost webu je ranking faktor. Pomalý web:
- Zhoršuje pozice ve vyhledávání
- Zvyšuje bounce rate (53 % uživatelů opustí stránku, která se načítá déle než 3 sekundy)
- Snižuje konverze (každá sekunda navíc = -7 % konverzí)

### Jak zjistit rychlost:
Otevřete [PageSpeed Insights](https://pagespeed.web.dev/) a zadejte svůj web. Skóre pod 70 na mobilu znamená, že ztrácíte zákazníky.

**Typický viník:** WordPress s 20+ pluginy, neoptimalizované obrázky, levný hosting.

## 2. Nefunguje na mobilu

V roce 2026 přichází **65–70 % návštěv** z mobilních zařízení. Pokud váš web není responzivní (= nepřizpůsobí se velikosti obrazovky), ztrácíte většinu potenciálních zákazníků.

### Test:
Otevřete svůj web na telefonu. Pokud musíte:
- Zoomovat text
- Horizontálně scrollovat
- Mačkat malé tlačítka

→ Váš web není připravený na mobilní dobu.

Google od roku 2021 používá **mobile-first indexing** — hodnotí web primárně podle mobilní verze.

## 3. Design vypadá zastarale

Trendy v designu se mění. Web z roku 2018 vypadá v roce 2026 jako z jiné éry.

### Znaky zastaralého designu:
- Úzký layout (960px) místo full-width
- Stockové fotky s usmívajícími se lidmi v obleku
- Karusel/slider na homepage (dávno mrtvý trend)
- Flash elementy nebo animace z jQuery
- Tiny fonty (pod 16px)
- Žádný dark mode support

**Důležité:** Design není jen estetika. Zastaralý design signalizuje zákazníkům, že firma zaostává.

## 4. Web nepřivádí zákazníky

Pokud váš web:
- Nemá žádné konverzní prvky (kontaktní formulář, CTA tlačítka)
- Má bounce rate nad 70 %
- Přináší méně než 5 poptávek měsíčně
- Není vidět na Googlu na relevantní klíčová slova

→ Neslouží svému účelu. Web má být **obchodní nástroj**, ne online vizitka.

### Jak měřit:
Nastavte Google Analytics 4. Sledujte:
- Kolik lidí přijde z Googlu (organický traffic)
- Kolik lidí vyplní formulář (konverze)
- Jak dlouho na webu zůstávají
- Odkud odchází (exit pages)

## 5. Nemůžete web sami upravovat

Musíte kvůli každé změně textu volat vývojáři? Nemáte přístup k administraci? Změna obrázku trvá týden a stojí 2 000 Kč?

Moderní web by měl mít **CMS (Content Management System)**, který vám umožní:
- Měnit texty a obrázky bez programátora
- Přidávat blog články
- Aktualizovat ceník
- Spravovat portfolio / reference

## 6. Web není zabezpečený

### Kontrola bezpečnosti:
- **HTTPS** — má váš web zelený zámek? Bez SSL certifikátu vás Google penalizuje a Chrome zobrazuje varování.
- **Aktuální technologie** — pokud běžíte na WordPress, jsou pluginy a jádro aktuální?
- **Žádné bezpečnostní incidenty** — byl váš web hacknutý? Obsahuje spam odkazy?

V roce 2025 bylo hacknutých přes 30 000 WordPress webů denně. Zastaralý web = bezpečnostní riziko.

## 7. Firma se změnila, web ne

Rozšířili jste služby? Změnili cílovou skupinu? Přesunuli se do nového města? Rebranding?

Pokud váš web neodráží aktuální stav firmy, mate zákazníky. Web musí odpovídat tomu, **kdo jste dnes**, ne kdo jste byli před 5 lety.

## Redesign vs. drobné úpravy

Ne vždy je potřeba kompletní redesign. Někdy stačí:

| Problém | Řešení | Odhadovaná cena |
|---------|--------|----------------|
| Pomalý web | Optimalizace obrázků, caching | 3 000–8 000 Kč |
| Chybí CTA | Přidání formulářů a tlačítek | 2 000–5 000 Kč |
| Zastaralý obsah | Nové texty a fotky | 3 000–10 000 Kč |
| Nefunguje na mobilu | Responsivní redesign | 10 000–25 000 Kč |
| Všechno výše | Kompletně nový web | Od 7 990 Kč |

**Pravidlo:** Pokud potřebujete řešit 3+ problémy z tohoto seznamu, redesign je levnější než dílčí opravy.

## Jak na redesign — postup

1. **Audit současného webu** — co funguje, co ne
2. **Definujte cíle** — co má nový web dělat? (více poptávek, více hovorů, e-shop?)
3. **Vyberte technologii** — WordPress, Next.js, Webflow?
4. **Design a obsah** — nové texty, fotky, struktura
5. **Vývoj a testování** — nasazení, testování na zařízeních
6. **Spuštění** — redirect starých URL, kontrola SEO

## Shrnutí

Pokud vás na tomto seznamu zaujaly 3 a více bodů, je čas na nový web. Nemusí to být drahé — firemní web na míru začíná od 7 990 Kč.

---

*Chcete vědět, kolik by stál nový web? [Spočítejte si to](/kalkulacka) — zabere to 30 sekund.*`,
  },

  // ─── 7. Jak získat více zákazníků online ───
  {
    title: 'Jak získat více zákazníků online: 10 strategií, které fungují',
    slug: 'jak-ziskat-vice-zakazniku-online',
    excerpt: '10 ověřených strategií pro získání zákazníků přes internet. SEO, PPC, sociální sítě, emailing a další.',
    metaTitle: 'Jak získat více zákazníků online — 10 ověřených strategií',
    metaDescription: 'Jak přivést zákazníky přes internet? 10 ověřených strategií: SEO, Google Ads, sociální sítě, email marketing. Praktický průvodce.',
    tags: ['online marketing', 'zákazníci', 'strategie', 'SEO', 'PPC'],
    imageId: '1460925895917-afdab827c52f',
    imageFilename: 'ziskat-zakazniky-online.jpg',
    content: `# Jak získat více zákazníků online: 10 strategií, které fungují

Máte web, ale zákazníci nepřicházejí? Nejste sami. 80 % malých firem v ČR má web, ale jen 20 % z něj aktivně získává zákazníky. Tady je 10 strategií, jak to změnit.

## 1. Optimalizace pro vyhledávače (SEO)

**Co to je:** Úprava webu tak, aby se zobrazoval na předních pozicích v Googlu.

**Proč to funguje:** 68 % online zkušeností začíná na vyhledávači. Pokud jste na 2. stránce Googlu, prakticky neexistujete.

**Jak začít:**
- Zjistěte, na jaká slova hledají vaši zákazníci (Google Keyword Planner, Ahrefs)
- Optimalizujte title tagy a H1 nadpisy
- Pište blog články zaměřené na klíčová slova
- Získejte odkazy z relevantních webů

**Časový horizont:** 3–6 měsíců do prvních výsledků.
**Náklady:** Zdarma (vlastní práce) nebo 5 000–20 000 Kč/měsíc (agentura).

## 2. Google Ads (PPC reklama)

**Co to je:** Placená reklama ve výsledcích Googlu.

**Proč to funguje:** Okamžité výsledky. Zobrazíte se nad organickými výsledky.

**Jak začít:**
- Nastavte kampaň na klíčová slova vašich služeb
- Začněte s malým rozpočtem (3 000 Kč/měsíc)
- Optimalizujte landing page pro konverze
- Sledujte ROI a škálujte, co funguje

**Časový horizont:** Okamžitě.
**Náklady:** Od 3 000 Kč/měsíc + fee za správu.

## 3. Google Business Profile

**Co to je:** Bezplatný profil vaší firmy na Googlu a Google Mapách.

**Proč to funguje:** 46 % vyhledávání na Googlu má lokální záměr. Firmy v Map Packu dostávají 7× více kliknutí.

**Jak začít:**
- Založte a ověřte profil na business.google.com
- Vyplňte 100 % informací
- Sbírejte recenze od zákazníků
- Přidávejte fotky a příspěvky každý týden

**Časový horizont:** 4–8 týdnů.
**Náklady:** Zdarma.

## 4. Sociální sítě (organicky)

**Co to je:** Pravidelný obsah na Facebooku, Instagramu, LinkedIn.

**Proč to funguje:** Buduje povědomí o značce a vztah se zákazníky. Nejde o přímý prodej, ale o dlouhodobou důvěru.

**Jak začít:**
- Vyberte 1–2 sítě, kde jsou vaši zákazníci
- Publikujte 3–5× týdně
- Mix obsahu: 80 % hodnota, 20 % prodej
- Sdílejte zákulisí, tipy, případové studie

**Časový horizont:** 3–6 měsíců.
**Náklady:** Zdarma (+ váš čas).

## 5. Meta Ads (Facebook + Instagram reklama)

**Co to je:** Placená reklama na Facebooku a Instagramu.

**Proč to funguje:** Přesné cílení podle zájmů, demografie a chování. Skvělé pro budování povědomí.

**Jak začít:**
- Nastavte Meta Pixel na web
- Vytvořte kampaně s jasným cílem (traffic, konverze, leady)
- Testujte různé kreativy (obrázky, video, karusel)
- Remarketing na návštěvníky webu

**Časový horizont:** Okamžitě.
**Náklady:** Od 2 000 Kč/měsíc.

## 6. Email marketing

**Co to je:** Pravidelné odesílání emailů vašemu seznamu kontaktů.

**Proč to funguje:** ROI 4 200 %. Žádný jiný kanál se tomu nepřibližuje. Emailový seznam vlastníte vy.

**Jak začít:**
- Vyberte nástroj (Ecomail, Mailchimp)
- Přidejte formulář na web
- Nabídněte „lead magnet" (sleva, e-book, checklist)
- Odesílejte 2× měsíčně

**Časový horizont:** 1–3 měsíce.
**Náklady:** Od 0 Kč (Mailchimp free) do 500 Kč/měsíc.

## 7. Obsahový marketing (blog)

**Co to je:** Psaní užitečných článků, které odpovídají na otázky zákazníků.

**Proč to funguje:** Přitahuje organický traffic z Googlu, buduje autoritu a důvěru. Jeden dobrý článek může přivádět zákazníky roky.

**Jak začít:**
- Zjistěte, co vaši zákazníci hledají
- Pište 2–4 články měsíčně
- Zaměřte se na praktické rady, ne na firemní novinky
- Propagujte články na sociálních sítích a v emailech

**Časový horizont:** 3–12 měsíců.
**Náklady:** Zdarma (vlastní psaní) nebo 2 000–5 000 Kč/článek.

## 8. Reference a recenze

**Co to je:** Aktivní sbírání a prezentace recenzí od spokojených zákazníků.

**Proč to funguje:** 93 % spotřebitelů říká, že recenze ovlivňují jejich nákupní rozhodnutí.

**Jak začít:**
- Po každé zakázce požádejte o recenzi
- Vytvořte sekci referencí na webu
- Sbírejte recenze na Googlu, Heureka, Firmy.cz
- Reagujte na všechny recenze (i negativní)

**Časový horizont:** Průběžně.
**Náklady:** Zdarma.

## 9. Partnerství a cross-promotion

**Co to je:** Spolupráce s komplementárními firmami.

**Proč to funguje:** Sdílíte si zákazníky bez nákladů na reklamu.

**Jak začít:**
- Najděte firmy, které mají stejnou cílovou skupinu, ale nejsou vaši konkurenti
- Nabídněte vzájemné doporučování
- Společné akce, webináře, slevy
- Výměna odkazů na webech

**Příklad:** Kadeřnictví + kosmetický salon. Účetní + právník. Fotograf + wedding planner.

## 10. Optimalizace konverzí (CRO)

**Co to je:** Úprava webu tak, aby více návštěvníků provedlo požadovanou akci.

**Proč to funguje:** Zdvojnásobení konverzního poměru = zdvojnásobení zákazníků BEZ zvýšení rozpočtu na marketing.

**Jak začít:**
- Přidejte jasné CTA na každou stránku
- Zjednodušte kontaktní formulář (3 pole max.)
- Přidejte sociální důkaz (reference, počet zákazníků)
- A/B testujte nadpisy a tlačítka
- Zrychlete web (každá sekunda navíc = -7 % konverzí)

## Kterou strategii zvolit?

| Rozpočet | Doporučené strategie |
|----------|---------------------|
| 0 Kč | SEO, Google Business, sociální sítě organicky, reference |
| 5 000 Kč/měsíc | + Google Ads nebo Meta Ads |
| 10 000+ Kč/měsíc | + Email marketing, obsahový marketing, CRO |

**Nejdůležitější pravidlo:** Nezkoušejte vše najednou. Vyberte 2–3 strategie, ovládněte je, a pak přidávejte další.

---

*Potřebujete web, který je připravený na marketing? [Spočítejte si cenu](/kalkulacka) nebo se [ozvěte](/poptavka).*`,
  },

  // ─── 8. Váš web si nikdo neprohlíží ───
  {
    title: 'Váš web si nikdo neprohlíží — 5 brutálně upřímných důvodů proč',
    slug: 'proc-vas-web-nikdo-nenavstevuje',
    excerpt: 'Máte web, ale nikdo na něj nechodí? Tady je 5 brutálně upřímných důvodů proč — a jak to napravit.',
    metaTitle: 'Váš web si nikdo neprohlíží — 5 brutálně upřímných důvodů',
    metaDescription: 'Proč váš web nemá návštěvníky? 5 brutálně upřímných důvodů: špatné SEO, pomalý web, žádný obsah, nulový marketing.',
    tags: ['webové stránky', 'SEO', 'marketing', 'traffic', 'kontroverzní'],
    imageId: '1551288049-bebda4e38f71',
    imageFilename: 'web-nikdo-nenavstevuje.jpg',
    content: `# Váš web si nikdo neprohlíží — 5 brutálně upřímných důvodů proč

Zaplatili jste za web. Máte hezký design. Dokonce jste se pochválili na Facebooku. A pak... ticho. Žádné poptávky. Žádné hovory. Google Analytics ukazuje 12 návštěv za měsíc (z toho 8 jste vy).

**Proč?** Tady je nepříjemná pravda.

## 1. Váš web je neviditelný pro Google

Mít web bez SEO je jako mít vizitku zamčenou v šuplíku.

### Co jste udělali špatně:
- **Žádný meta title a description** — Google neví, o čem váš web je
- **Žádné texty** — máte krásný design, ale 50 slov na celém webu
- **Žádná klíčová slova** — nepíšete „instalatérství Praha", ale „naše služby"
- **Žádný blog** — web má 5 stránek od roku, kdy vznikl, a od té doby se nezměnil
- **Technické chyby** — špatná robots.txt, chybějící sitemap, chybějící alt tagy

### Řešení:
Každá stránka potřebuje minimálně 300 slov textu s relevantními klíčovými slovy. Title tag má obsahovat to, co lidé hledají. A blog? Alespoň 2 články měsíčně.

## 2. Váš web se načítá jako v roce 2005

Uživatel čeká maximálně 3 sekundy. Pak odejde. Google to ví a penalizuje pomalé weby.

### Typické problémy:
- **Obrázky v plné velikosti** — nahráli jste fotku z mobilu (4 MB) bez komprese
- **Levný hosting** — sdílený hosting za 30 Kč měsíčně nestačí
- **20 pluginů** — WordPress s pluginy na všechno zpomalí web na 8+ sekund
- **Žádné caching** — server generuje stránku znovu při každém požadavku

### Řešení:
Otestujte web na [PageSpeed Insights](https://pagespeed.web.dev/). Pokud skóre na mobilu pod 50, máte problém. Komprimujte obrázky, zrychlete hosting, nebo zvažte modernější technologii (Next.js místo WordPress).

## 3. Nemáte důvod, proč by se někdo vracel

Statický web s 5 stránkami, které se nezměnily 3 roky, nemá šanci.

### Proč Google preferuje „živé" weby:
- Čerstvý obsah = signál, že firma je aktivní
- Blog články = nové stránky = více příležitostí pro SEO
- Aktualizace = vyšší crawl frequency od Google bota

### Co s tím:
- Založte blog a publikujte alespoň 2× měsíčně
- Přidejte sekci novinek nebo aktualit
- Aktualizujte portfolio/reference
- Přidávejte případové studie

**Příklad:** Firma, která začala blogovat 2× měsíčně, zvýšila organický traffic o 340 % za 8 měsíců.

## 4. Nikdo neví, že váš web existuje

Postavili jste web a čekáte, že zákazníci přijdou sami. To je jako otevřít obchod v lese a čekat na zákazníky.

### Web potřebuje marketing:
- **Google Business Profile** — zdarma, přivede lokální zákazníky
- **Sociální sítě** — sdílejte obsah z webu na FB, IG, LinkedIn
- **Google Ads** — placená reklama pro okamžité výsledky
- **Email marketing** — sbírejte kontakty a posílejte newsletter
- **Offline propagace** — web na vizitky, auto, prodejnu

**Nemáte budget na marketing?** Začněte s Google Business Profile (zdarma) a jedním postem týdně na sociálních sítích. Stojí to jen váš čas.

## 5. Web neřeší problém zákazníka

Tohle je ten nejhorší důvod. A nejčastější.

### Jak vypadá špatný web:
> „Vítejte na stránkách naší firmy. Jsme tady od roku 2008 a nabízíme širokou škálu služeb v oblasti XY. Naším cílem je spokojenost zákazníků."

Tohle nikoho nezajímá.

### Jak by měl vypadat dobrý web:
> „Teče vám kohoutek? Opravíme ho do 2 hodin. Zavolejte 777 888 999."

**Rozdíl?** Dobrý web mluví o zákazníkovi a jeho problému. Špatný web mluví o firmě.

### Kontrolní otázky pro váš web:
- Pochopí návštěvník do 5 sekund, co děláte?
- Je jasné, co má návštěvník udělat? (zavolat, napsat, objednat)
- Řešíte problém zákazníka, nebo se chválíte?
- Máte sociální důkaz? (recenze, reference, čísla)

## Co dělat hned teď

### Priorita 1 (zdarma, ihned):
- [ ] Zkontrolujte PageSpeed → optimalizujte obrázky
- [ ] Doplňte meta title a description na každou stránku
- [ ] Založte/optimalizujte Google Business Profile
- [ ] Přepište texty — zaměřte se na zákazníka, ne na sebe

### Priorita 2 (malý budget):
- [ ] Začněte blogovat (2 články/měsíc)
- [ ] Nastavte Google Analytics 4
- [ ] Přidejte jasné CTA na každou stránku

### Priorita 3 (pokud nic nepomůže):
- [ ] Zvažte nový web na moderní technologii
- [ ] Investujte do SEO nebo Google Ads

## Shrnutí

Váš web nikdo nenavštěvuje, protože pro to nemá důvod. Změňte to: optimalizujte pro Google, přidejte hodnotný obsah, propagujte web a mluvte jazykem zákazníka.

Web není jednorázový projekt. Je to nástroj, o který se musíte starat.

---

*Chcete web, který zákazníky přivádí místo toho, aby je odháněl? [Spočítejte si cenu nového webu](/kalkulacka) — trvá to 30 sekund.*`,
  },
];

// ── Existing posts that need images ───────────────────────────
const existingPostImages = [
  {
    slug: 'kolik-stoji-webove-stranky-2026',
    imageId: '1554224154-22dec7ec8818',
    imageFilename: 'cena-webu-2026.jpg',
  },
  {
    slug: 'jak-si-nechat-udelat-web-2026',
    imageId: '1547658719-da2b51169166',
    imageFilename: 'jak-udelat-web-2026.jpg',
  },
  {
    slug: 'wordpress-wix-nebo-web-na-miru-srovnani',
    imageId: '1498050108023-c5249f4df085',
    imageFilename: 'srovnani-platforem-web.jpg',
  },
  {
    slug: 'webove-stranky-pro-zivnostniky-a-male-firmy',
    imageId: '1556761175-5973dc0f32e7',
    imageFilename: 'web-pro-zivnostniky.jpg',
  },
  {
    slug: 'web-zdarma-vs-profesionalni-web',
    imageId: '1554224155-6726b3ff858f',
    imageFilename: 'web-zdarma-vs-profi.jpg',
  },
];

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting blog seeding...\n');

  // 1. Insert new posts with images
  for (const post of posts) {
    console.log(`📝 Creating: ${post.title}`);
    try {
      const imageUrl = await downloadAndUpload(post.imageId, post.imageFilename);
      const id = nanoid();
      const now = Math.floor(Date.now() / 1000);

      await client.execute({
        sql: `INSERT INTO blog_posts (
          id, title, slug, content, excerpt, author_name,
          featured_image, published, published_at, tags, meta_title,
          meta_description, views, created_at, updated_at, language
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          post.title,
          post.slug,
          post.content,
          post.excerpt,
          'Weblyx',
          imageUrl,
          1,
          now,
          JSON.stringify(post.tags),
          post.metaTitle,
          post.metaDescription,
          0,
          now,
          now,
          'cs',
        ],
      });
      console.log(`  ✅ Done\n`);
    } catch (err: any) {
      if (err.message?.includes('UNIQUE')) {
        console.log(`  ⚠️  Already exists, skipping\n`);
      } else {
        console.error(`  ❌ Error:`, err.message, '\n');
      }
    }
  }

  // 2. Add images to existing posts
  console.log('🖼️  Updating existing posts with images...\n');
  for (const item of existingPostImages) {
    console.log(`🖼️  Adding image to: ${item.slug}`);
    try {
      const imageUrl = await downloadAndUpload(item.imageId, item.imageFilename);
      await client.execute({
        sql: `UPDATE blog_posts SET featured_image = ?, updated_at = unixepoch() WHERE slug = ? AND (featured_image IS NULL OR featured_image = '')`,
        args: [imageUrl, item.slug],
      });
      console.log(`  ✅ Done\n`);
    } catch (err: any) {
      console.error(`  ❌ Error:`, err.message, '\n');
    }
  }

  console.log('🎉 All done!');
}

main().catch(console.error);
