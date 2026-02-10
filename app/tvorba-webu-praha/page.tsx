import type { Metadata } from "next";
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

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tvorba webových stránek Praha | Moderní weby od 7 990 Kč | Weblyx",
  description:
    "Profesionální tvorba webových stránek v Praze. Moderní Next.js weby s PageSpeed 90+, dodání za 5–7 dní. Od 7 990 Kč. Sídlíme na Praze 1 — sejdeme se osobně.",
  keywords: [
    "tvorba webových stránek Praha",
    "tvorba webu Praha",
    "webové stránky Praha",
    "webdesign Praha",
    "webová agentura Praha",
    "tvorba e-shopu Praha",
    "SEO optimalizace Praha",
    "web pro firmy Praha",
    "profesionální webové stránky Praha",
    "moderní web Praha",
  ],
  openGraph: {
    title: "Tvorba webových stránek Praha | Od 7 990 Kč | Weblyx",
    description:
      "Profesionální tvorba webových stránek v Praze. Next.js weby s PageSpeed 90+, dodání za 5–7 dní. Sídlíme na Praze 1.",
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
      "Profesionální tvorba webových stránek v Praze. Next.js weby s PageSpeed 90+, dodání za 5–7 dní.",
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
      "Ceny tvorby webu v Praze se na trhu pohybují od 10 000 Kč až po statisíce. U nás začínáte na 7 990 Kč za kompletní web s moderním designem, SEO optimalizací a PageSpeed 90+. Žádné skryté poplatky — finální cenu znáte předem.",
  },
  {
    question: "Jak dlouho trvá vytvoření webu?",
    answer:
      "Standardní firemní web dodáváme za 5–7 pracovních dní. Složitější projekty s e-shopem nebo vlastními funkcemi obvykle 2–3 týdny. Díky sídlu na Praze 1 se můžeme osobně potkat a upřesnit detaily.",
  },
  {
    question: "Proč si vybrat Weblyx a ne jinou pražskou agenturu?",
    answer:
      "Používáme Next.js místo zastaralého WordPressu — vaše stránky jsou 3× rychlejší, bezpečnější a nepotřebují drahý hosting. Navíc garantujeme PageSpeed 90+ a dodání v dohodnutém termínu, jinak vracíme peníze.",
  },
  {
    question: "Nabízíte i správu webu po dokončení?",
    answer:
      "Ano, nabízíme měsíční balíčky údržby od 2 000 Kč/měsíc. Zahrnují bezpečnostní aktualizace, zálohy, drobné úpravy obsahu a technickou podporu. Prvních 30 dní po spuštění je podpora zdarma.",
  },
];

export default function TvorbaWebuPrahaPage() {
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
    streetAddress: "Revoluční 8, Praha 1",
    postalCode: "110 00",
    priceRange: "7990 Kč - 50000 Kč",
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
              Praha 1, Revoluční 8
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
                <Clock className="h-4 w-4 text-primary" /> Dodání za 5–7 dní
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
                Praha je{" "}
                <span className="text-primary">hlavní město podnikání</span>
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
                    <strong>Revoluční 8, Praha 1</strong>. Rádi se s vámi
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
                <span className="text-primary">vytvoříme</span>
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
                      "PageSpeed 90+ garantováno",
                      "Dodání za 5–7 pracovních dní",
                      "30 dní podpora po spuštění zdarma",
                      "Bez měsíčních poplatků za hosting",
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

        {/* SOCIAL PROOF */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "15+", label: "Dokončených projektů" },
                { value: "90+", label: "PageSpeed skóre" },
                { value: "5–7", label: "Dní do dodání" },
                { value: "100%", label: "Spokojených klientů" },
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
                  osobně — sídlíme na Revoluční 8, Praha 1.
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
