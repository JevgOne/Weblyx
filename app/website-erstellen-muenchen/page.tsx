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
  Check,
  Clock,
  Shield,
  Briefcase,
  Building,
  Award,
  ChevronDown,
  Monitor,
  Car,
  MapPin,
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
  title: "Website erstellen lassen München | Ab 320 € Festpreis | Seitelyx",
  description:
    "Professionelle Website erstellen lassen in München. Moderne Next.js Websites ab 320 € — PageSpeed 90+, DSGVO-konform, Lieferung in 5–7 Tagen. Qualität, die Münchner Ansprüchen genügt.",
  keywords: [
    "website erstellen lassen München",
    "webdesign München",
    "homepage erstellen München",
    "webdesign Agentur München",
    "website kosten München",
    "professionelle website München",
    "webentwicklung München",
    "website erstellen München Preis",
    "responsive webdesign München",
    "SEO München",
  ],
  openGraph: {
    title: "Website erstellen lassen München | Ab 320 € | Seitelyx",
    description:
      "Professionelle Website erstellen lassen in München. Next.js Websites ab 320 €, DSGVO-konform, Lieferung in 5–7 Tagen.",
    url: "https://seitelyx.de/website-erstellen-muenchen",
    type: "website",
    images: [
      {
        url: "/images/og/og-tvorba-webu-brno.png",
        width: 1200,
        height: 630,
        alt: "Seitelyx - Website erstellen lassen München",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website erstellen lassen München | Ab 320 € | Seitelyx",
    description:
      "Professionelle Website erstellen lassen in München. Next.js Websites ab 320 €, DSGVO-konform.",
  },
  alternates: {
    canonical: "https://seitelyx.de/website-erstellen-muenchen",
    languages: getAlternateLanguages("/website-erstellen-muenchen"),
  },
};

const SERVICES = [
  {
    icon: Globe,
    title: "Premium-Unternehmenswebsites",
    description:
      "Hochwertige Websites für Münchner Unternehmen — vom Handwerksbetrieb bis zur Unternehmensberatung. Design und Technik auf höchstem Niveau, das Ihrem Qualitätsanspruch gerecht wird.",
  },
  {
    icon: Search,
    title: "SEO für München & Bayern",
    description:
      "Lokale SEO-Optimierung für den Münchner Markt. Werden Sie sichtbar bei Suchanfragen wie 'website erstellen München' und generieren Sie qualifizierte Anfragen aus der Region.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce für den bayerischen Markt",
    description:
      "Online-Shops mit deutscher Zahlungsabwicklung, rechtssicherer Kaufabwicklung und automatisierter Buchhaltung. Perfekt für Münchner Einzelhändler und Manufakturen.",
  },
  {
    icon: Zap,
    title: "Performance-Optimierung",
    description:
      "PageSpeed 90+ garantiert. Ihre Münchner Kunden erwarten Qualität — auch bei der Ladegeschwindigkeit. 3× schneller als WordPress, messbar und nachweisbar.",
  },
];

const FAQS = [
  {
    question: "Was kostet eine Website in München?",
    answer:
      "Münchner Webdesign-Agenturen berechnen typischerweise 5.000–15.000 € für eine Unternehmenswebsite. Bei Seitelyx starten professionelle Next.js Websites ab 320 € Festpreis. Inklusive Responsive Design, SEO-Grundoptimierung, PageSpeed 90+ und DSGVO-Konformität. Ohne versteckte Kosten.",
  },
  {
    question: "Warum ist Seitelyx so viel günstiger als Münchner Agenturen?",
    answer:
      "München hat die höchsten Agentur-Preise Deutschlands — bedingt durch Büromieten, Gehälter und Overhead. Wir arbeiten remote aus Europa mit modernsten Tools und Technologien. Das bedeutet: gleiche oder bessere Qualität, aber ohne den Münchner Preisaufschlag.",
  },
  {
    question: "Ist die Qualität vergleichbar mit einer Münchner Agentur?",
    answer:
      "Absolut. Unsere Websites basieren auf Next.js — der gleichen Technologie, die Nike, Netflix und Porsche verwenden. PageSpeed 90+ garantiert, DSGVO ab Werk, und ein Design-Prozess mit Figma-Previews, den Sie in Echtzeit verfolgen können.",
  },
  {
    question: "Wie läuft die Zusammenarbeit ab?",
    answer:
      "Alles läuft digital: 1) Sie füllen unseren Fragebogen aus. 2) Wir erstellen ein Angebot innerhalb von 24h. 3) Design-Preview in Figma zur Abstimmung. 4) Entwicklung und Launch in 5–7 Tagen. 5) 30 Tage Support nach Go-Live. Einfach, transparent, effizient.",
  },
];

export default function WebsiteErstellenMuenchenPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Startseite", url: "https://seitelyx.de" },
    {
      name: "Website erstellen München",
      url: "https://seitelyx.de/website-erstellen-muenchen",
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    name: "Seitelyx – Website erstellen lassen München",
    url: "https://seitelyx.de/website-erstellen-muenchen",
    description:
      "Professionelle Websites für Münchner Unternehmen. Moderne Next.js Entwicklung ab 320 €.",
    addressLocality: "Prag",
    addressCountry: "DE",
    streetAddress: "Revoluční 8, Prag 1",
    postalCode: "110 00",
    priceRange: "320€ - 1299€",
    locale: "de",
  });

  const webpageSchema = generateWebPageSchema({
    name: "Website erstellen lassen München",
    description:
      "Professionelle Website erstellen lassen in München ab 320 €. Moderne Next.js Technologie.",
    url: "https://seitelyx.de/website-erstellen-muenchen",
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
            { label: "Leistungen", href: "/leistungen" },
            {
              label: "Website erstellen München",
              href: "/website-erstellen-muenchen",
            },
          ]}
        />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              <Award className="h-3 w-3 mr-1" />
              Premium-Qualität, fairer Preis
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Website erstellen lassen{" "}
              <span className="text-primary">München</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              München steht für Qualität und Präzision — genau wie unsere
              Websites. <strong>Moderne Next.js Technologie</strong>,
              blitzschnelle Ladezeiten und ein Design, das Ihre Münchner Kunden
              begeistert. Zum Festpreis,{" "}
              <strong>ohne Münchner Agentur-Aufschlag</strong>. Erfahren Sie in
              unserem{" "}
              <Link href="/blog" className="text-primary hover:underline">
                Webdesign-Blog
              </Link>
              , warum wir kein WordPress verwenden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/anfrage" size="lg" showArrow>
                Kostenloses Angebot anfordern
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Unsere Arbeiten im Portfolio</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-primary" /> Ab 320 € Festpreis
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" /> Lieferung in 5–7
                Tagen
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-primary" /> DSGVO-konform
              </span>
            </div>
          </div>
        </section>

        {/* WARUM MÜNCHEN? */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Warum München?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                München —{" "}
                <span className="text-primary">Wirtschaftsmotor</span> mit
                höchsten Ansprüchen
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Kaufkraft-Champion</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    München hat die{" "}
                    <strong>höchste Kaufkraft aller deutschen Großstädte</strong>
                    . Ihre Kunden erwarten Premium-Qualität — auch online. Eine
                    langsame oder veraltete Website kostet Sie hier bares Geld.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Car className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Starke Branchen</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    BMW, Siemens, Allianz — München ist Heimat von{" "}
                    <strong>Weltkonzernen und tausenden Mittelständlern</strong>.
                    Ob Automotive, Finanzen oder IT: Jede Branche braucht eine
                    digitale Visitenkarte, die überzeugt. Erfahren Sie mehr{" "}
                    <Link
                      href="/uber-uns"
                      className="text-primary hover:underline"
                    >
                      über unser Team und unsere Arbeitsweise
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Building className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">
                    Tradition trifft Digital
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Viele traditionsreiche Münchner Unternehmen stehen vor der{" "}
                    <strong>digitalen Transformation</strong>. Der erste Schritt:
                    eine moderne Website, die Vertrauen schafft und Kunden
                    online gewinnt.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                <Monitor className="h-4 w-4 inline mr-1" />
                <strong>100 % remote</strong> — Münchner Qualität ohne Münchner
                Agenturpreise. Zusammenarbeit per Videocall und geteilten Tools.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Unsere Leistungen für{" "}
                <span className="text-primary">München</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Maßgeschneiderte Web-Lösungen für Münchner Unternehmen — vom
                Handwerker bis zur Beratung. Sehen Sie unser{" "}
                <Link
                  href="/leistungen"
                  className="text-primary hover:underline"
                >
                  vollständiges Leistungsspektrum
                </Link>
                .
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
                <Link href="/leistungen">
                  Alle Leistungen und Preise ansehen →
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <Badge variant="secondary">Festpreis-Garantie</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">
                      Professionelle Website ab{" "}
                      <span className="text-primary">320 €</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Während Münchner Agenturen 5.000–15.000 € berechnen,
                      liefern wir{" "}
                      <strong>vergleichbare Qualität ab 320 €</strong>. Gleiche
                      Technologie, gleiches Ergebnis — nur ohne den
                      Standort-Aufschlag. Alle Details finden Sie in unserer{" "}
                      <Link
                        href="/preise"
                        className="text-primary hover:underline"
                      >
                        transparenten Preisübersicht
                      </Link>
                      .
                    </p>
                    <LeadButton href="/anfrage" showArrow>
                      Angebot für Münchner Unternehmen
                    </LeadButton>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Next.js Technologie (wie Nike, Netflix)",
                      "Responsive für alle Endgeräte",
                      "SEO für den Münchner Markt",
                      "PageSpeed 90+ garantiert",
                      "DSGVO-konform ohne Zusatzkosten",
                      "30 Tage Support nach Go-Live",
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
                { value: "15+", label: "Realisierte Projekte" },
                { value: "90+", label: "PageSpeed Score" },
                { value: "5–7", label: "Tage Lieferzeit" },
                { value: "100%", label: "Zufriedene Kunden" },
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
              Überzeugen Sie sich selbst:{" "}
              <Link
                href="/portfolio"
                className="text-primary hover:underline"
              >
                realisierte Projekte in unserem Portfolio
              </Link>{" "}
              oder lesen Sie unsere{" "}
              <Link href="/faq" className="text-primary hover:underline">
                Antworten auf häufige Fragen
              </Link>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Häufige Fragen —{" "}
                <span className="text-primary">Website München</span>
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
              Noch Fragen? Besuchen Sie unsere{" "}
              <Link href="/faq" className="text-primary hover:underline">
                ausführliche FAQ-Seite
              </Link>{" "}
              oder{" "}
              <Link href="/kontakt" className="text-primary hover:underline">
                schreiben Sie uns eine Nachricht
              </Link>
              .
            </p>
          </div>
        </section>

        {/* STÄDTE WO WIR ARBEITEN */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8 space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold">
                Städte in denen wir{" "}
                <span className="text-primary">tätig sind</span>
              </h2>
              <p className="text-muted-foreground">
                Wir erstellen Websites für Unternehmen in ganz Deutschland
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link href="/website-erstellen-berlin" className="group">
                <Card className="border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md h-full">
                  <CardContent className="p-5 text-center">
                    <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">
                      Berlin
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Website erstellen lassen in Berlin
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-bold text-lg">München</p>
                  <p className="text-sm text-muted-foreground">
                    Sie sind hier
                  </p>
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
                  Ihre neue Website für{" "}
                  <span className="text-primary">München</span> wartet
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Münchner Qualität muss nicht Münchner Preise bedeuten. Fordern
                  Sie jetzt Ihr <strong>kostenloses Angebot</strong> an —
                  innerhalb von 24 Stunden erhalten Sie eine maßgeschneiderte
                  Offerte.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/anfrage" size="lg" showArrow>
                    Unverbindliches Angebot anfordern
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Direkt Kontakt aufnehmen</Link>
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
