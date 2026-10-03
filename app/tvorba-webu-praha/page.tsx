import type { Metadata } from "next";
import { DEPOSIT_SHORT } from "@/lib/deposit";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Globe,
  Zap,
  Search,
  ShoppingCart,
  MapPin,
  Check,
  Clock,
  TrendingUp,
  ChevronDown,
  Building2,
  Users,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateLocalBusinessSchema,
  generateWebPageSchema,
  generateBreadcrumbSchema,
  BreadcrumbItem,
} from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LeadButton } from "@/components/tracking/LeadButton";
import { isSeitelyx } from "@/lib/brand";
import { countPublishedProjects, getRatingStat, projectsLabel } from "@/lib/site-stats";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tvorba webových stránek Praha | Od 7 990 Kč",
  description:
    "Profesionální tvorba webových stránek v Praze. Moderní Next.js weby s PageSpeed 90+, dodání za 3–5 dní. Od 7 990 Kč. Sídlíme na Praze 1 — sejdeme se osobně.",
  keywords: [
    "tvorba webových stránek Praha",
    "tvorba webu Praha",
    "webové stránky Praha",
    "webdesign Praha",
    "webové studio Praha",
    "tvorba e-shopu Praha",
    "SEO optimalizace Praha",
    "web pro firmy Praha",
    "profesionální webové stránky Praha",
    "moderní web Praha",
  ],
  openGraph: {
    title: "Tvorba webových stránek Praha | Od 7 990 Kč | Weblyx",
    description:
      "Profesionální tvorba webových stránek v Praze. Next.js weby s PageSpeed 90+, dodání za 3–5 dní. Od 7 990 Kč. Sídlíme na Praze 1.",
    url: "https://www.weblyx.cz/tvorba-webu-praha",
    type: "website",
    images: [
      {
        url: "/images/og/og-tvorba-webu-praha.png",
        width: 1200,
        height: 630,
        alt: "Weblyx - Tvorba webových stránek Praha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tvorba webových stránek Praha | Od 7 990 Kč | Weblyx",
    description:
      "Profesionální tvorba webových stránek v Praze. Next.js weby s PageSpeed 90+, dodání za 3–5 dní. Od 7 990 Kč.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/tvorba-webu-praha",
    languages: getAlternateLanguages("/tvorba-webu-praha"),
  },
};

const SERVICES = [
  {
    icon: Globe,
    title: "Firemní weby na míru",
    description:
      "Reprezentativní webové stránky pro pražské firmy. Responzivní design, rychlé načítání a optimalizace pro vyhledávače — vše v jednom.",
  },
  {
    icon: ShoppingCart,
    title: "E-shopy pro lokální prodejce",
    description:
      "Online prodej pro pražské obchody a značky. Napojení na platební brány, automatická fakturace a správa objednávek.",
  },
  {
    icon: Search,
    title: "SEO pro pražský trh",
    description:
      "Lokální SEO, které vás dostane na první stránku Googlu pro klíčová slova jako 'tvorba webu Praha'. Měřitelné výsledky od prvního měsíce.",
  },
  {
    icon: Zap,
    title: "Optimalizace výkonu",
    description:
      "Garantujeme PageSpeed skóre 90+. Vaši zákazníci nebudou čekat — průměrné načtení pod 1,5 sekundy na mobilech.",
  },
];

const FAQS = [
  {
    question: "Kolik stojí tvorba webových stránek v Praze?",
    answer:
      "Na pražském trhu zaplatíte za firemní web od 9 900 Kč u nejlevnějších dodavatelů po 120 000 až 400 000 Kč u velkých studií. U nás začínáte na 7 990 Kč za jednostránkovou vizitku, 9 990 Kč za web o 3–5 podstránkách s blogem a 24 900 Kč za web o 10+ podstránkách s plným CMS. Cenu znáte před podpisem a po spuštění neplatíte žádný měsíční paušál.",
  },
  {
    question: "Jak dlouho trvá vytvoření webu?",
    answer:
      "Landing Page dodáme za 3–5 pracovních dní, Základní Web za 5–7 a Standardní Web za 7–10. Lhůta začíná běžet, až je uhrazená záloha a zároveň máme všechny podklady — texty, loga, fotky a potřebné přístupy. Ne od prvního e-mailu. Pokud pak termín nedodržíme, platíte jen 50 % ceny. Pro srovnání: pražské agentury běžně uvádějí 2–3 týdny až 2–4 měsíce.",
  },
  {
    question: "Co přesně dostanu za 7 990 Kč?",
    answer:
      "Jednu stránku o 3–5 sekcích — vizitku, nic víc. Je v tom responzivní design, kontaktní formulář, základní SEO, napojení na Google Analytics a měsíc podpory po spuštění. Není to šablona s vyměněným logem: stavíme na Next.js a stránka se staví pro vás. Pokud potřebujete podstránky, blog nebo CMS, začíná to na 9 990 Kč — tu hranici vám řekneme dopředu, ne až u faktury.",
  },
  {
    question: "Můžeme se sejít osobně v Praze?",
    answer:
      "Ano. Sídlíme na adrese Školská 660/3, Praha 1, kousek od Národní třídy, a schůzku si můžete domluvit u nás nebo přijedeme za vámi. Stojí za to si ověřit, kde dodavatel skutečně sídlí — řada agentur, které na dotaz „tvorba webových stránek Praha“ vychází nahoře, má zapsané sídlo ve Zlíně, v Libáni nebo v Neratovicích a schůzku v Praze řeší půjčenou zasedačkou.",
  },
  {
    question: "Kdo dodá texty a fotky?",
    answer:
      "Texty a obrazový materiál dodáváte vy — je to nejrychlejší cesta, protože svému oboru rozumíte líp než my. Struktuře stránek a tomu, co kam patří, pomůžeme. Pokud texty nemáte, řekneme to na začátku a domluvíme se na copywritingu zvlášť, ať vám lhůta neuteče čekáním na podklady.",
  },
  {
    question: "Dokážete udělat web ve více jazycích?",
    answer:
      "Ano. V Praze to řeší hodně firem, které cílí na expaty a turisty — restaurace, kliniky, služby v centru. Vícejazyčnou verzi stavíme tak, aby každá jazyková mutace měla vlastní URL a vlastní SEO, ne jen přepínač, který překlopí texty. Rozsah se domlouvá individuálně, protože záleží na počtu jazyků a na tom, kdo dodá překlady.",
  },
  {
    question: "Uděláte redesign webu, který už mám?",
    answer:
      "Ano, a často to dává větší smysl než stavět od nuly — obsah, odkazy a pozice ve vyhledávání už máte. Při redesignu držíme původní URL a kde to nejde, nastavíme přesměrování, aby se nezahodilo to, co web za roky nasbíral. Zrychlení bývá u starých WordPress webů nejvíc vidět.",
  },
  {
    question: "Proč si vybrat Weblyx a ne pražskou agenturu?",
    answer:
      "Stavíme na Next.js místo WordPressu, takže weby jsou rychlejší a nepotřebují drahý hosting ani měsíční správu. Garantujeme PageSpeed 90+ nebo vracíme peníze (od balíčku Základní Web) a termín dodání kryjeme slevou 50 % z ceny, když ho nedodržíme. A skutečně sídlíme v Praze 1, ne jen v nadpisu stránky.",
  },
  {
    question: "Nabízíte i správu webu po dokončení?",
    answer:
      "Podpora po spuštění je v ceně každého balíčku — 1 až 3 měsíce podle rozsahu. Dál nabízíme roční údržbu za 24 000 Kč předplaceně: bezpečnostní aktualizace, zálohy, drobné úpravy obsahu a technickou podporu. Povinná není. Pražská konkurence si za správu běžně účtuje 500 až 1 200 Kč měsíčně a SEO od 2 000 Kč měsíčně, což za tři roky udělá 18 až 43 tisíc navíc.",
  },
];

/**
 * The three packages, written out so the page carries the whole price list.
 *
 * It used to show only "od 7 990 Kč", which is the figure a visitor is least
 * able to act on: it says what the cheapest thing costs without saying what it
 * is. The rows below mirror pricing_tiers — price, delivery and contents — so
 * the entry price can be defended rather than just advertised.
 */
const PACKAGES = [
  {
    name: "Landing Page",
    price: "7 990 Kč",
    delivery: "3–5 pracovních dní",
    summary: "Jedna stránka. Vizitka, nic víc.",
    features: [
      "1 stránka, 3–5 sekcí",
      "Responzivní design",
      "Kontaktní formulář",
      "SEO základy",
      "Google Analytics",
      "1 měsíc podpory",
    ],
  },
  {
    name: "Základní Web",
    price: "9 990 Kč",
    delivery: "5–7 pracovních dní",
    summary: "Web o několika podstránkách, který si sami plníte.",
    features: [
      "3–5 podstránek",
      "Moderní design",
      "Pokročilé SEO",
      "Blog s CMS editorem",
      "Napojení na sociální sítě",
      "2 měsíce podpory",
      "Garance PageSpeed 90+",
    ],
  },
  {
    name: "Standardní Web",
    price: "24 900 Kč",
    delivery: "7–10 pracovních dní",
    summary: "Plnohodnotný firemní web se správou obsahu.",
    features: [
      "10+ podstránek",
      "Premium design na míru",
      "Full CMS pro správu obsahu",
      "Rezervační systém",
      "Newsletter integrace",
      "3 měsíce podpory",
      "Bezplatné drobné úpravy (2 h)",
    ],
  },
];

/**
 * Prague market prices, each taken from the supplier's own published pricing
 * page in září 2026. Only figures a reader can go and check are listed — the
 * "od 200 000 Kč" bracket that circulates in agency blog posts is not sourced
 * anywhere a visitor could verify, so it is left out.
 */
const MARKET = [
  { who: "weby-praha.cz", what: "Web do 48 h na oborové šabloně", price: "9 900 Kč bez DPH", time: "48 hodin" },
  { who: "dejtonaweb.cz", what: "Základní web", price: "od 9 900 Kč", time: "2–3 týdny" },
  { who: "Weblyx", what: "Landing Page / Základní / Standardní", price: "7 990 – 24 900 Kč", time: "3–10 dní", us: true },
  { who: "create201.cz", what: "Firemní web, cca 5 stránek", price: "od 25 000 Kč", time: "3–6 týdnů" },
  { who: "wpdistro.cz", what: "Firemní web", price: "od 49 000 Kč", time: "5–10 dní" },
  { who: "pixelfield.cz", what: "Firemní web", price: "120 000 – 400 000 Kč", time: "4–6 týdnů" },
];

/** Five checks a layman can run on a quote without understanding the code. */
const RED_FLAGS = [
  {
    title: "Nabídka nemluví o nákladech na první rok",
    body: "Hosting, doména, SSL certifikát a údržba bývají zvlášť. Nechte si od každého dodavatele rozepsat, co zaplatíte za dvanáct měsíců, ne jen za dodání. U některých nabídek je první rok dvojnásobek ceny, kterou máte v e-mailu.",
  },
  {
    title: "Cena je hodinová sazba, ne pevná částka za popsaný rozsah",
    body: "Hodinovka bez stropu znamená, že odhad neplatí. Chtějte pevnou cenu za jasně vyjmenovaný rozsah a vedle toho sazbu za práci navíc. U nás je cena balíčku pevná a hodiny jsou v ní jen orientační údaj.",
  },
  {
    title: "Nikdo neřekne, kdo bude zapsaný jako držitel domény",
    body: "Nezáleží na tom, kdo doménu platí ani kdo ji spravuje — záleží, kdo je zapsaný jako držitel v registru CZ.NIC. Když je tam dodavatel a rozejdete se, doména odchází s ním. Ověřit si to jde zdarma na nic.cz. Držitelem má být vaše firma.",
  },
  {
    title: "O údržbě se mluví až po podpisu",
    body: "Roční údržba se běžně pohybuje kolem 15 až 25 % ceny vývoje. Kdo ji v nabídce nezmíní, počítá s tím, že ji doplatíte později. Naše weby měsíční paušál nemají; roční údržba je volitelná a stojí 2 990 Kč.",
  },
  {
    title: "Padne věta „to neřešte“ nebo „SEO doděláme potom“",
    body: "Obojí znamená, že se rozsah domluví, až budete zaplaceni. Technické SEO — struktura nadpisů, sitemap, rychlost, titulky — se dělá při stavbě, ne po ní. Dodělávat ho zpětně stojí víc než ho udělat rovnou.",
  },
];

/** What actually happens, including the two things nobody else writes down. */
const PROCESS = [
  { n: "01", title: "Konzultace", body: "Projdeme, co má web přinést a komu. Zdarma a nezávazně, osobně u nás na Školské nebo online." },
  { n: "02", title: "Nabídka s pevnou cenou", body: "Dostanete rozsah a cenu písemně. Cena platí pro ten rozsah — změny se domlouvají, nepřipisují." },
  { n: "03", title: "Po schválení návrhu záloha 50 %", body: "Jakmile odsouhlasíte nabídku, hradíte zálohu 50 %. Termín začíná běžet, až je uhrazená a zároveň máme všechny podklady — ne od prvního e-mailu. Záloha je na trhu běžná; nestandardní je, že vám u toho řekneme, co se stane, když termín nedodržíme: platíte jen polovinu." },
  { n: "04", title: "Design a 2 kola revizí", body: "Dvě kola úprav designu jsou v ceně. Pokud ani po nich nejste spokojeni, vracíme zálohu." },
  { n: "05", title: "Vývoj a testování", body: "Stavíme na Next.js, testujeme na mobilech i desktopu a měříme PageSpeed dřív, než web pustíme ven." },
  { n: "06", title: "Spuštění a podpora", body: "Doplatek je splatný před předáním. Podpora 1–3 měsíce podle balíčku běží od spuštění. Žádný měsíční paušál." },
];

/** Prague clients, named only where the client's own site confirms it. */
const PRAGUE_REFS = [
  { name: "AK Barbers", note: "Barbershop se čtyřmi pražskými pobočkami — Praha 1, 3, 5 a 6. Web jsme realizovali podle dodané designové předlohy.", url: "https://www.akbarber.com" },
  { name: "AK Barbers Academy", note: "Samostatný web barberské akademie a kurzů, s přihlašováním na termíny.", url: "https://www.barber-kurzy.com" },
  { name: "KAJO Studio 360", note: "360° video booth pro svatby, firemní akce a gala večery; působí v Praze, Brně a Ostravě.", url: "http://www.kajostudio360.cz" },
];

export default async function TvorbaWebuPrahaPage() {
  // Counted, never typed — see lib/site-stats.ts.
  const projects = projectsLabel(await countPublishedProjects("cs"));
  // Counted too — an unverifiable "100 %" used to sit here.
  const rating = await getRatingStat("cs");
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    {
      name: "Tvorba webu Praha",
      url: "https://www.weblyx.cz/tvorba-webu-praha",
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    name: "Weblyx – Tvorba webových stránek Praha",
    url: "https://www.weblyx.cz/tvorba-webu-praha",
    description:
      "Profesionální tvorba webových stránek v Praze. Moderní Next.js weby od 7 990 Kč s garancí PageSpeed 90+.",
    addressLocality: "Praha",
    addressCountry: "CZ",
    streetAddress: "Školská 660/3, Praha 1",
    postalCode: "110 00",
    priceRange: "7990 Kč - 24900 Kč",
    locale: "cs",
  });

  const webpageSchema = generateWebPageSchema({
    name: "Tvorba webových stránek Praha",
    description:
      "Profesionální tvorba webových stránek v Praze od 7 990 Kč. Moderní technologie, rychlé dodání.",
    url: "https://www.weblyx.cz/tvorba-webu-praha",
    breadcrumbs,
  });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={webpageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <main className="min-h-screen">
        <Breadcrumbs
          items={[
            { label: "Služby", href: "/sluzby" },
            { label: "Tvorba webu Praha", href: "/tvorba-webu-praha" },
          ]}
        />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              Praha 1, Školská 660/3
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Tvorba webových stránek{" "}
              <span className="text-primary">Praha</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sídlíme přímo v centru Prahy a tvoříme <strong>moderní weby na Next.js</strong>, které prodávají.
              Bleskové načítání, <strong>SEO optimalizace v ceně</strong> a design, který vás odliší
              od konkurence na přeplněném pražském trhu. Přečtěte si{" "}
              <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                proč je WordPress mrtvý
              </Link>{" "}
              a proč stavíme jinak.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka zdarma
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Prohlédněte si naše reference</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-primary" /> Od 7 990 Kč
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" /> Dodání za 3–5 dní
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-primary" />{" "}
                <Link href="/pagespeed-garance" className="hover:text-primary transition-colors">
                  Garance PageSpeed 90+
                </Link>
              </span>
            </div>
          </div>
        </section>

        {/* PROČ PRAHA? */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Proč zrovna Praha?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Proč řešit web{" "}
                <span className="text-primary">zvlášť pro Prahu?</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">
                    500 000+ registrovaných firem
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Praha je sídlem více než půl milionu podnikatelských
                    subjektů. V tak silné konkurenci rozhoduje <strong>první dojem</strong> — a
                    ten dnes začíná na webu. Naše{" "}
                    <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                      analýza 50 českých webů ukázala průměrný PageSpeed pouze 43
                    </Link>
                    {" "}— s naším webem budete v top 5 %.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Users className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">
                    Turisté, expati, lokální klientela
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Praha přitahuje miliony turistů ročně a je domovem velké
                    mezinárodní komunity. <strong>Vícejazyčný web s rychlým načítáním</strong>{" "}
                    vám otevírá dveře k zákazníkům, kteří hledají služby v
                    češtině i angličtině. Zjistěte více{" "}
                    <Link href="/o-nas" className="text-primary hover:underline">
                      o naší agentuře
                    </Link>.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60 md:col-span-2">
                <CardContent className="p-6 space-y-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">
                    Osobní schůzky v centru Prahy
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Na rozdíl od vzdálených agentur sídlíme přímo na{" "}
                    <strong>Školská 660/3, Praha 1</strong>. Rádi se s vámi
                    sejdeme osobně, probereme vaše potřeby a navrhneme řešení
                    přesně pro váš byznys. Dávejte si pozor na{" "}
                    <Link href="/blog/predrazene-sablony-webovych-agentur-jak-je-poznat" className="text-primary hover:underline">
                      předražené šablony webových agentur
                    </Link>{" "}
                    — u nás dostanete <strong>web na míru za férovou cenu</strong>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SERVICES GRID */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Co pro vás{" "}
                <span className="text-primary">vytvoříme?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Kompletní <strong>webové služby pro pražské firmy</strong> a živnostníky — podívejte se na{" "}
                <Link href="/sluzby" className="text-primary hover:underline">
                  kompletní přehled služeb a ceník
                </Link>
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {SERVICES.map((service) => (
                <Card
                  key={service.title}
                  className="transition-all duration-300 hover:shadow-lg hover:border-primary/20"
                >
                  <CardHeader className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{service.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/sluzby">Nabídka všech webových služeb →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PRICING HIGHLIGHT */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <Badge variant="secondary">Transparentní ceny</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">
                      Web od{" "}
                      <span className="text-primary">7 990 Kč</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Žádné skryté poplatky, <strong>žádné měsíční paušály za hosting</strong>.
                      Finální cenu znáte předem. V ceně je responzivní design,
                      SEO základ a{" "}
                      <Link href="/pagespeed-garance" className="text-primary hover:underline">
                        garance rychlého načítání pod 2 sekundy
                      </Link>.
                    </p>
                    <LeadButton href="/poptavka" showArrow>
                      Poptat web pro pražskou firmu
                    </LeadButton>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Responzivní design pro všechna zařízení",
                      "SEO optimalizace v ceně",
                      "PageSpeed 90+ garantováno (od 9 990 Kč)",
                      "Dodání za 3–10 pracovních dní podle balíčku",
                      "30 dní podpora po spuštění zdarma",
                      "Bez měsíčních poplatků za hosting",
                      DEPOSIT_SHORT,
                    ].map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* BALÍČKY */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Celý ceník, ne jen „od“</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co dostanete za{" "}
                <span className="text-primary">7 990, 9 990 a 24 900 Kč</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tři balíčky, pevná cena za vyjmenovaný rozsah. Žádný měsíční paušál
                za hosting ani povinná správa.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg) => (
                <Card key={pkg.name} className="border-border/60 flex flex-col">
                  <CardHeader className="space-y-2">
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                    <p className="text-3xl font-bold text-primary">{pkg.price}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {pkg.delivery}
                    </p>
                    <p className="text-sm text-muted-foreground">{pkg.summary}</p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8 text-sm max-w-3xl mx-auto">
              Potřebujete e-shop nebo vlastní funkce? Podívejte se na{" "}
              <Link href="/tvorba-eshopu" className="text-primary hover:underline">
                tvorbu e-shopu
              </Link>{" "}
              nebo na{" "}
              <Link href="/sluzby" className="text-primary hover:underline">
                doplňkové služby v ceníku
              </Link>.
            </p>
          </div>
        </section>

        {/* CENY NA PRAŽSKÉM TRHU */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Srovnání</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Kolik stojí web{" "}
                <span className="text-primary">v Praze?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ceny níž jsou z veřejných ceníků pražských dodavatelů, stav září 2026.
                Uvádíme jen čísla, která si můžete otevřít a ověřit.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-semibold">Dodavatel</th>
                    <th className="text-left py-3 pr-4 font-semibold">Co za to je</th>
                    <th className="text-left py-3 pr-4 font-semibold">Cena</th>
                    <th className="text-left py-3 font-semibold">Dodání</th>
                  </tr>
                </thead>
                <tbody>
                  {MARKET.map((row) => (
                    <tr
                      key={row.who}
                      className={`border-b border-border/50 ${row.us ? "bg-primary/5 font-medium" : ""}`}
                    >
                      <td className="py-3 pr-4">{row.who}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{row.what}</td>
                      <td className="py-3 pr-4">{row.price}</td>
                      <td className="py-3 text-muted-foreground">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-8 leading-relaxed max-w-3xl">
              Z té tabulky plyne jedna věc, kterou je fér říct rovnou:{" "}
              <strong>nejrychlejší nejsme</strong>. Za 9 900 Kč bez DPH (11 979 Kč s DPH)
              dostanete jinde web do osmačtyřiceti hodin — ale na připravené oborové
              šabloně. U nás stojí web o 3–5 podstránkách 9 990 Kč a je to cena konečná:
              nejsme plátci DPH. Rozdíl mezi tím a stavbou na míru je přesně ten, kvůli kterému
              tahle stránka existuje. Pokud vám šablona stačí, je to rozumná volba a
              nemá smysl platit víc.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed max-w-3xl">
              Za zvážení stojí i to, že web nemusíte kupovat vůbec. Stavebnice jako
              Webnode nebo Wix vyjdou zhruba na 2 000 až 5 000 Kč ročně, takže
              Landing Page za 7 990 Kč se proti nim zaplatí přibližně za rok a půl —
              a to bez započtení času, který nad tím strávíte. Vlastní WordPress
              stojí za pět let při započtení hostingu, šablony a pluginů zhruba
              25 000 až 65 000 Kč a údržbu si děláte sami.
            </p>
          </div>
        </section>

        {/* PŘEDRAŽENÁ NABÍDKA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Než někomu pošlete zálohu</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Jak poznáte{" "}
                <span className="text-primary">předraženou nabídku?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Pět věcí, které si na nabídce ověříte bez znalosti kódu. Platí i na nás —
                projděte si podle nich i naši nabídku.
              </p>
            </div>
            <div className="space-y-4">
              {RED_FLAGS.map((flag, i) => (
                <Card key={flag.title} className="border-border/60">
                  <CardContent className="p-6 flex gap-4">
                    <span className="shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold">{flag.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{flag.body}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PROCES */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Postup</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Jak spolupráce{" "}
                <span className="text-primary">probíhá?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Včetně dvou věcí, které jinde v nabídce nenajdete — zálohy a toho,
                co se stane, když termín nedodržíme.
              </p>
            </div>
            <ol className="grid md:grid-cols-3 gap-6">
              {PROCESS.map((step) => (
                <li key={step.n}>
                  <Card className="border-border/60 h-full">
                    <CardContent className="p-6 space-y-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {step.n}
                      </span>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {step.body}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
            <p className="text-center text-muted-foreground mt-8 text-sm">
              Závazné znění najdete v{" "}
              <Link href="/obchodni-podminky" className="text-primary hover:underline">
                obchodních podmínkách
              </Link>.
            </p>
          </div>
        </section>

        {/* PRAŽSKÉ REFERENCE */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Reference</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Jaké weby jsme udělali{" "}
                <span className="text-primary">v Praze?</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Otevřete si je a zkontrolujte. Rychlost si můžete sami změřit
                v PageSpeed Insights — u nás i u kohokoliv jiného, koho zvažujete.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {PRAGUE_REFS.map((ref) => (
                <Card key={ref.name} className="border-border/60">
                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-lg font-bold">{ref.name}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {ref.note}
                    </p>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                    >
                      Otevřít web →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8 text-sm">
              Všechny realizace najdete v{" "}
              <Link href="/portfolio" className="text-primary hover:underline">
                portfoliu
              </Link>.
            </p>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: projects, label: "Dokončených projektů" },
                { value: "90+", label: "PageSpeed skóre" },
                { value: "3–10", label: "Dní do dodání" },
                rating
                  ? { value: rating.value, label: rating.label }
                  : { value: "0 Kč", label: "Měsíční poplatky" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8">
              Podívejte se na{" "}
              <Link href="/portfolio" className="text-primary hover:underline">
                ukázky dokončených projektů v portfoliu
              </Link>{" "}
              nebo si přečtěte{" "}
              <Link href="/faq" className="text-primary hover:underline">
                často kladené otázky o tvorbě webu
              </Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Časté dotazy k tvorbě webu{" "}
                <span className="text-primary">v Praze</span>
              </h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <Card key={faq.question} className="border-border/60">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-3 flex items-start gap-2">
                      <ChevronDown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed pl-7">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8 text-sm">
              Máte další dotazy? Podívejte se na{" "}
              <Link href="/faq" className="text-primary hover:underline">
                kompletní seznam FAQ
              </Link>{" "}
              nebo nám{" "}
              <Link href="/kontakt" className="text-primary hover:underline">
                napište přes kontaktní formulář
              </Link>.
            </p>
          </div>
        </section>

        {/* MĚSTA KDE PŮSOBÍME */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8 space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold">
                Města kde <span className="text-primary">působíme</span>
              </h2>
              <p className="text-muted-foreground">
                Tvoříme webové stránky pro firmy po celé České republice
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-bold text-lg">Praha</p>
                  <p className="text-sm text-muted-foreground">Právě se díváte</p>
                </CardContent>
              </Card>
              <Link href="/tvorba-webu-brno" className="group">
                <Card className="border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md h-full">
                  <CardContent className="p-5 text-center">
                    <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">Brno</p>
                    <p className="text-sm text-muted-foreground">Tvorba webu pro brněnské firmy</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tvorba-webu-ostrava" className="group">
                <Card className="border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md h-full">
                  <CardContent className="p-5 text-center">
                    <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">Ostrava</p>
                    <p className="text-sm text-muted-foreground">Webové stránky pro ostravské podnikatele</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Připraveni na nový web?{" "}
                  <span className="text-primary">Sejdeme se v Praze</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte krátký dotazník a do 24 hodin vám pošleme{" "}
                  <strong>cenovou nabídku na míru</strong>. Nebo se zastavte
                  osobně — sídlíme na Školská 660/3, Praha 1.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/poptavka" size="lg" showArrow>
                    Odeslat nezávaznou poptávku
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Kontaktujte nás přímo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
