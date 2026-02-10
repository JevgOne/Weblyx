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
  Factory,
  Lightbulb,
  BarChart3,
  ChevronDown,
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
  title: "Tvorba webových stránek Ostrava | Weby od 7 990 Kč | Weblyx",
  description:
    "Profesionální tvorba webových stránek v Ostravě. Moderní weby na Next.js s PageSpeed 90+, dodání za 5–7 dní. Od 7 990 Kč. Pomáháme ostravským firmám růst online.",
  keywords: [
    "tvorba webových stránek Ostrava",
    "tvorba webu Ostrava",
    "webové stránky Ostrava",
    "webdesign Ostrava",
    "webová agentura Ostrava",
    "tvorba e-shopu Ostrava",
    "SEO optimalizace Ostrava",
    "web pro firmy Ostrava",
    "moderní web Ostrava",
    "weby Moravskoslezský kraj",
  ],
  openGraph: {
    title: "Tvorba webových stránek Ostrava | Od 7 990 Kč | Weblyx",
    description:
      "Profesionální tvorba webových stránek v Ostravě. Next.js weby s PageSpeed 90+, dodání za 5–7 dní.",
    url: "https://www.weblyx.cz/tvorba-webu-ostrava",
    type: "website",
    images: [
      {
        url: "/images/og/og-tvorba-webu-ostrava.png",
        width: 1200,
        height: 630,
        alt: "Weblyx - Tvorba webových stránek Ostrava",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tvorba webových stránek Ostrava | Od 7 990 Kč | Weblyx",
    description:
      "Profesionální tvorba webových stránek v Ostravě. Next.js weby s PageSpeed 90+, dodání za 5–7 dní.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/tvorba-webu-ostrava",
    languages: getAlternateLanguages("/tvorba-webu-ostrava"),
  },
};

const SERVICES = [
  {
    icon: Globe,
    title: "Webové stránky pro ostravské firmy",
    description:
      "Reprezentativní prezentační weby, které přesvědčí zákazníky na první pohled. Moderní design, rychlé načítání, optimalizace pro mobily — základ úspěchu v digitální éře Ostravy.",
  },
  {
    icon: ShoppingCart,
    title: "E-shopy pro regionální prodejce",
    description:
      "Online prodej nejen pro Ostravu, ale celý Moravskoslezský kraj. Napojení na české platební brány, DPD, Zásilkovna — vše připravené k prodeji od prvního dne.",
  },
  {
    icon: Search,
    title: "SEO pro ostravský trh",
    description:
      "Lokální SEO optimalizace, která vás zviditelní v Ostravě a okolí. Google Moje firma, lokální citace, klíčová slova specifická pro Moravskoslezský kraj.",
  },
  {
    icon: BarChart3,
    title: "Digitální transformace",
    description:
      "Pomáháme tradičním ostravským firmám přejít do digitálního světa. Od prvního webu po komplexní online strategii — krok za krokem, bez zbytečných nákladů.",
  },
];

const FAQS = [
  {
    question: "Kolik stojí tvorba webových stránek v Ostravě?",
    answer:
      "Profesionální web pro ostravskou firmu pořídíte od 7 990 Kč. Za tuto cenu dostanete moderní responzivní design, SEO optimalizaci, rychlé načítání a 30 dní podpory. Oproti ostravským agenturám nabízíme technologicky pokročilejší řešení za srovnatelnou nebo nižší cenu.",
  },
  {
    question:
      "Jak můžete pracovat pro firmy v Ostravě, když sídlíte v Praze?",
    answer:
      "V roce 2025 není vzdálenost překážkou. Komunikujeme přes video hovory, sdílené nástroje a jsme dostupní na telefonu po celý pracovní den. S klienty z Ostravy spolupracujeme stejně efektivně jako s pražskými — jen ušetříte čas na zbytečné schůzky. Pracujeme s klienty z celé ČR.",
  },
  {
    question: "Proč by si ostravská firma měla vybrat Weblyx?",
    answer:
      "Ostrava prochází ekonomickou transformací a firmy zde potřebují moderní online prezentaci. Nabízíme Next.js technologii, která je 3× rychlejší než WordPress, garantujeme PageSpeed 90+ a dodáme web za 5–7 dní. Kvalita pražské agentury za férovou cenu.",
  },
  {
    question: "Děláte i redesign starých webů?",
    answer:
      "Určitě. Mnoho ostravských firem má weby z roku 2015 a dřív, které nefungují dobře na mobilech a mají pomalé načítání. Provedeme kompletní redesign se zachováním SEO pozic, migrací obsahu a přesměrováním URL. Výsledek: moderní web, lepší konverze.",
  },
];

export default function TvorbaWebuOstravaPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    {
      name: "Tvorba webu Ostrava",
      url: "https://www.weblyx.cz/tvorba-webu-ostrava",
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    name: "Weblyx – Tvorba webových stránek Ostrava",
    url: "https://www.weblyx.cz/tvorba-webu-ostrava",
    description:
      "Profesionální tvorba webových stránek pro firmy v Ostravě. Moderní Next.js weby od 7 990 Kč.",
    addressLocality: "Praha",
    addressCountry: "CZ",
    streetAddress: "Revoluční 8, Praha 1",
    postalCode: "110 00",
    priceRange: "7990 Kč - 50000 Kč",
    locale: "cs",
  });

  const webpageSchema = generateWebPageSchema({
    name: "Tvorba webových stránek Ostrava",
    description:
      "Profesionální tvorba webových stránek pro firmy v Ostravě od 7 990 Kč.",
    url: "https://www.weblyx.cz/tvorba-webu-ostrava",
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
            { label: "Tvorba webu Ostrava", href: "/tvorba-webu-ostrava" },
          ]}
        />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              <Factory className="h-3 w-3 mr-1" />
              Ocelové srdce Moravy, digitální budoucnost
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Tvorba webových stránek{" "}
              <span className="text-primary">Ostrava</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ostrava se mění — a s ní i místní firmy. Pomáháme ostravským
              podnikatelům vybudovat <strong>silnou online přítomnost</strong> s moderními weby,
              které přitahují zákazníky z celého Moravskoslezského kraje.
              Věděli jste, že{" "}
              <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                průměrný PageSpeed českých webů je pouhých 43 bodů
              </Link>?
              S námi budete výrazně nad průměrem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka zdarma
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Prohlédněte si naše realizace</Link>
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

        {/* PROČ OSTRAVA? */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">
                Proč Ostrava potřebuje moderní weby
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ostrava prochází{" "}
                <span className="text-primary">digitální transformací</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Factory className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Z průmyslu do digitálu</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Ostrava se transformuje z průmyslového města na{" "}
                    <strong>moderní hub služeb a technologií</strong>. Dolní oblast Vítkovice
                    se stala symbolem této změny — a místní firmy potřebují
                    weby, které odrážejí tuto novou identitu. Přečtěte si{" "}
                    <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                      proč stavíme na Next.js místo WordPressu
                    </Link>.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Lightbulb className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">
                    Méně konkurence online
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Oproti Praze a Brnu je v Ostravě <strong>výrazně nižší konkurence
                    ve vyhledávání</strong>. S kvalitním SEO se na první stránku Googlu
                    dostanete rychleji a levněji — ideální příležitost pro
                    lokální podnikatele.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">300 000+ obyvatel</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Třetí největší město ČR s obrovským potenciálem. Přidejte
                    k tomu celý Moravskoslezský kraj a máte{" "}
                    <strong>trh s milionem potenciálních zákazníků</strong>, kteří hledají
                    služby online.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                <MapPin className="h-4 w-4 inline mr-1" />
                Sídlíme na adrese Revoluční 8, Praha 1 —{" "}
                <strong>pracujeme s klienty z celé ČR</strong>. Poznejte{" "}
                <Link href="/o-nas" className="text-primary hover:underline">
                  náš tým a příběh agentury Weblyx
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES GRID */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Webové služby pro{" "}
                <span className="text-primary">ostravské podnikatele</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Komplexní řešení od jednoduchého webu po <strong>digitální transformaci celé firmy</strong>.
                Mrkněte na{" "}
                <Link href="/sluzby" className="text-primary hover:underline">
                  ceník a přehled všech služeb
                </Link>.
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
                <Link href="/sluzby">
                  Kompletní nabídka webových služeb →
                </Link>
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
                    <Badge variant="secondary">Ceny bez překvapení</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">
                      Moderní web od{" "}
                      <span className="text-primary">7 990 Kč</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>Pražská technologie a kvalita</strong> za ceny přístupné
                      ostravským podnikatelům. Žádné měsíční poplatky, žádné
                      skryté náklady. Nenechte se nachytat na{" "}
                      <Link href="/blog/predrazene-sablony-webovych-agentur-jak-je-poznat" className="text-primary hover:underline">
                        předražené šablony, které agentury vydávají za web na míru
                      </Link>.
                    </p>
                    <LeadButton href="/poptavka" showArrow>
                      Poptat web pro ostravskou firmu
                    </LeadButton>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Next.js — 3× rychlejší než WordPress",
                      "Responzivní design pro všechna zařízení",
                      "Lokální SEO pro Ostravu a MSK",
                      "PageSpeed 90+ garantováno",
                      "Bez měsíčních poplatků za hosting",
                      "30 dní podpory zdarma po spuštění",
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
                { value: "5–7", label: "Dní do spuštění" },
                { value: "0 Kč", label: "Měsíčně za hosting" },
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
                naše portfolio a realizované projekty
              </Link>{" "}
              nebo si přečtěte{" "}
              <Link href="/faq" className="text-primary hover:underline">
                odpovědi na nejčastější dotazy
              </Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Nejčastější dotazy —{" "}
                <span className="text-primary">tvorba webu Ostrava</span>
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
              Potřebujete vědět víc? Projděte si{" "}
              <Link href="/faq" className="text-primary hover:underline">
                celý seznam často kladených otázek
              </Link>{" "}
              nebo se nám{" "}
              <Link href="/kontakt" className="text-primary hover:underline">
                ozvěte přes kontaktní formulář
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
              <Link href="/tvorba-webu-praha" className="group">
                <Card className="border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md h-full">
                  <CardContent className="p-5 text-center">
                    <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">Praha</p>
                    <p className="text-sm text-muted-foreground">Webové stránky pro pražské firmy</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tvorba-webu-brno" className="group">
                <Card className="border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md h-full">
                  <CardContent className="p-5 text-center">
                    <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">Brno</p>
                    <p className="text-sm text-muted-foreground">Tvorba webu pro brněnské firmy</p>
                  </CardContent>
                </Card>
              </Link>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-bold text-lg">Ostrava</p>
                  <p className="text-sm text-muted-foreground">Právě se díváte</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Rozjeďte svůj byznys{" "}
                  <span className="text-primary">v Ostravě online</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte krátký dotazník a do 24 hodin vám pošleme{" "}
                  <strong>cenovou nabídku na míru</strong>. Spolupracujeme
                  vzdáleně — efektivně a bez zbytečného cestování.
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
