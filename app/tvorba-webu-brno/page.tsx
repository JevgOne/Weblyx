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
  Cpu,
  GraduationCap,
  Rocket,
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
  title: "Tvorba webových stránek Brno | Weby od 7 990 Kč | Weblyx",
  description:
    "Profesionální tvorba webových stránek pro firmy v Brně. Moderní Next.js technologie, PageSpeed 90+, dodání za 5–7 dní. Od 7 990 Kč. Pracujeme s klienty z celé ČR.",
  keywords: [
    "tvorba webových stránek Brno",
    "tvorba webu Brno",
    "webové stránky Brno",
    "webdesign Brno",
    "webová agentura Brno",
    "tvorba e-shopu Brno",
    "SEO optimalizace Brno",
    "web pro firmy Brno",
    "moderní web Brno",
    "weby pro startupy Brno",
  ],
  openGraph: {
    title: "Tvorba webových stránek Brno | Od 7 990 Kč | Weblyx",
    description:
      "Profesionální tvorba webových stránek v Brně. Next.js weby s PageSpeed 90+, dodání za 5–7 dní.",
    url: "https://www.weblyx.cz/tvorba-webu-brno",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Weblyx - Tvorba webových stránek Brno",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tvorba webových stránek Brno | Od 7 990 Kč | Weblyx",
    description:
      "Profesionální tvorba webových stránek v Brně. Next.js weby s PageSpeed 90+, dodání za 5–7 dní.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/tvorba-webu-brno",
    languages: getAlternateLanguages("/tvorba-webu-brno"),
  },
};

const SERVICES = [
  {
    icon: Globe,
    title: "Weby pro brněnské firmy",
    description:
      "Prezentační weby, které budují důvěru a přivádějí zákazníky. Moderní design s důrazem na rychlost a konverze — ideální pro rostoucí brněnský trh.",
  },
  {
    icon: Rocket,
    title: "Weby pro startupy a tech firmy",
    description:
      "Brno je české Silicon Valley. Stavíme weby na Next.js, které odpovídají dynamice startupového prostředí — rychlý launch, snadné škálování, zero-downtime.",
  },
  {
    icon: Search,
    title: "Lokální SEO pro Brno",
    description:
      "Dostaňte se na první stránku Googlu pro „tvorba webu Brno" a další lokální klíčová slova. Kompletní on-page i technické SEO v ceně každého projektu.",
  },
  {
    icon: ShoppingCart,
    title: "E-shopy a online prodej",
    description:
      "Od lokálních řemeslníků po moravské vinařství — pomůžeme vám prodávat online. Napojení na platební brány, automatická fakturace, správa zásob.",
  },
];

const FAQS = [
  {
    question: "Kolik stojí web pro firmu v Brně?",
    answer:
      "Profesionální firemní web pořídíte od 7 990 Kč. V ceně je moderní responzivní design, SEO optimalizace, rychlé načítání (PageSpeed 90+) a 30 dní podpory. Pro e-shopy a složitější projekty připravíme individuální nabídku.",
  },
  {
    question: "Jste z Brna, nebo pracujete vzdáleně?",
    answer:
      "Sídlíme v Praze na Revoluční 8, ale s brněnskými klienty spolupracujeme běžně online. Komunikujeme přes video hovory, sdílené nástroje a jsme k dispozici na telefonu. Na osobní schůzku do Brna rádi dojedeme. Pracujeme s klienty z celé ČR.",
  },
  {
    question: "Proč Next.js a ne WordPress?",
    answer:
      "WordPress pohání 43 % internetu, ale je pomalý a náchylný k útokům. Next.js weby jsou 3× rychlejší, nepotřebují aktualizace pluginů a jsou bezpečnější by default. Pro brněnské tech firmy to dává smysl — moderní stack pro moderní byznys.",
  },
  {
    question: "Jak probíhá spolupráce na dálku?",
    answer:
      "Po úvodním hovoru vám pošleme dotazník a připravíme návrh. Design konzultujeme přes Figma, feedback sbíráme v reálném čase. Většina klientů mimo Prahu říká, že je vzdálená spolupráce s námi pohodlnější než osobní schůzky s lokální agenturou.",
  },
];

export default function TvorbaWebuBrnoPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    {
      name: "Tvorba webu Brno",
      url: "https://www.weblyx.cz/tvorba-webu-brno",
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    name: "Weblyx – Tvorba webových stránek Brno",
    url: "https://www.weblyx.cz/tvorba-webu-brno",
    description:
      "Profesionální tvorba webových stránek pro firmy v Brně. Moderní Next.js weby od 7 990 Kč.",
    addressLocality: "Praha",
    addressCountry: "CZ",
    streetAddress: "Revoluční 8, Praha 1",
    postalCode: "110 00",
    priceRange: "7990 Kč - 50000 Kč",
    locale: "cs",
  });

  const webpageSchema = generateWebPageSchema({
    name: "Tvorba webových stránek Brno",
    description:
      "Profesionální tvorba webových stránek pro firmy v Brně od 7 990 Kč.",
    url: "https://www.weblyx.cz/tvorba-webu-brno",
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
            { label: "Tvorba webu Brno", href: "/tvorba-webu-brno" },
          ]}
        />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              <Cpu className="h-3 w-3 mr-1" />
              České Silicon Valley
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Tvorba webových stránek{" "}
              <span className="text-primary">Brno</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Brno žije technologiemi — a váš web by měl taky. Tvoříme moderní
              webové stránky na Next.js pro brněnské startupy, firmy a
              živnostníky. Rychlé, bezpečné a optimalizované pro vyhledávače.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka zdarma
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Ukázky projektů</Link>
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
                <Zap className="h-4 w-4 text-primary" /> PageSpeed 90+
              </span>
            </div>
          </div>
        </section>

        {/* PROČ BRNO? */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Proč právě Brno?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Brno je{" "}
                <span className="text-primary">technologické srdce Moravy</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Cpu className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Tech hub ČR</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Sídlo Red Hat, Kiwi.com, Y Soft a desítek dalších tech
                    firem. Brno přitahuje talenty a investice — a firmy zde
                    potřebují weby, které odpovídají jejich inovativnímu duchu.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Univerzitní město</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Masarykova univerzita, VUT, Mendelu — 90 000 studentů, kteří
                    jsou budoucí zákazníci. Mladá, digitálně gramotná populace
                    očekává rychlé a moderní weby.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Rocket className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Rostoucí byznys scéna</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    JIC, CzechInvest a lokální inkubátory pomáhají stovkám
                    startupů ročně. Kvalitní web je pro ně vstupenka k prvním
                    zákazníkům a investorům.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                <MapPin className="h-4 w-4 inline mr-1" />
                Sídlíme v Praze, ale{" "}
                <strong>pracujeme s klienty z celé ČR</strong> — včetně
                desítek firem z Brna a okolí.
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
                <span className="text-primary">brněnské firmy</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Od prezentačních webů po komplexní e-shopy — vše na moderních
                technologiích
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
                <Link href="/sluzby">Všechny služby →</Link>
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
                    <Badge variant="secondary">Férové ceny</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">
                      Profesionální web od{" "}
                      <span className="text-primary">7 990 Kč</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Pražská kvalita za férovou cenu. Bez měsíčních poplatků
                      za hosting, bez skrytých nákladů. Jednou zaplatíte, web
                      je váš navždy.
                    </p>
                    <LeadButton href="/poptavka" showArrow>
                      Získat nabídku pro Brno
                    </LeadButton>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Moderní Next.js technologie",
                      "Responzivní design (mobil, tablet, desktop)",
                      "SEO optimalizace pro lokální vyhledávání",
                      "PageSpeed 90+ garantováno",
                      "SSL certifikát zdarma",
                      "30 dní podpory po spuštění",
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
                { value: "15+", label: "Realizovaných projektů" },
                { value: "90+", label: "Průměrné PageSpeed skóre" },
                { value: "5–7", label: "Dní do spuštění" },
                { value: "3×", label: "Rychlejší než WordPress" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Otázky k tvorbě webu{" "}
                <span className="text-primary">v Brně</span>
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
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Potřebujete web pro váš{" "}
                  <span className="text-primary">brněnský byznys</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte krátký dotazník a do 24 hodin obdržíte cenovou
                  nabídku šitou na míru. Spolupracujeme online — žádné
                  zbytečné schůzky, žádné zdržení.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/poptavka" size="lg" showArrow>
                    Chci cenovou nabídku
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/blog">Čtěte náš blog</Link>
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
