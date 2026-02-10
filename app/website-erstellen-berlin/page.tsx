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
  Rocket,
  Shield,
  Palette,
  ChevronDown,
  Monitor,
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
  title: "Website erstellen lassen Berlin | Ab 320 € Festpreis | Seitelyx",
  description:
    "Professionelle Website erstellen lassen in Berlin. Moderne Next.js Websites ab 320 € — 3× schneller als WordPress, DSGVO-konform, Lieferung in 5–7 Tagen. Ohne monatliche Kosten.",
  keywords: [
    "website erstellen lassen Berlin",
    "webdesign Berlin",
    "homepage erstellen Berlin",
    "webdesign Agentur Berlin",
    "website kosten Berlin",
    "professionelle website Berlin",
    "webentwicklung Berlin",
    "website erstellen Berlin Preis",
    "responsive webdesign Berlin",
    "SEO Agentur Berlin",
  ],
  openGraph: {
    title: "Website erstellen lassen Berlin | Ab 320 € | Seitelyx",
    description:
      "Professionelle Website erstellen lassen in Berlin. Next.js Websites ab 320 €, DSGVO-konform, Lieferung in 5–7 Tagen.",
    url: "https://seitelyx.de/website-erstellen-berlin",
    type: "website",
    images: [
      {
        url: "/images/og/og-homepage.png",
        width: 1200,
        height: 630,
        alt: "Seitelyx - Website erstellen lassen Berlin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website erstellen lassen Berlin | Ab 320 € | Seitelyx",
    description:
      "Professionelle Website erstellen lassen in Berlin. Next.js Websites ab 320 €, DSGVO-konform.",
  },
  alternates: {
    canonical: "https://seitelyx.de/website-erstellen-berlin",
    languages: getAlternateLanguages("/website-erstellen-berlin"),
  },
};

const SERVICES = [
  {
    icon: Globe,
    title: "Unternehmenswebsites",
    description:
      "Repräsentative Websites für Berliner Unternehmen und Startups. Responsive Design, blitzschnelle Ladezeiten und SEO-Optimierung — alles aus einer Hand.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce & Online-Shops",
    description:
      "Verkaufen Sie online an Kunden in Berlin und deutschlandweit. Anbindung an deutsche Zahlungsanbieter, automatisierte Rechnungen, Bestandsverwaltung.",
  },
  {
    icon: Search,
    title: "SEO für den Berliner Markt",
    description:
      "Lokale SEO-Optimierung für Berlin. Sichtbar werden bei Google für 'website erstellen Berlin' und weitere relevante Suchbegriffe in Ihrer Branche.",
  },
  {
    icon: Shield,
    title: "DSGVO-konforme Websites",
    description:
      "Alle Websites sind von Anfang an DSGVO-konform. Cookie-Banner, Datenschutzerklärung, AV-Verträge — kein Risiko für Ihr Unternehmen.",
  },
];

const FAQS = [
  {
    question: "Was kostet eine professionelle Website in Berlin?",
    answer:
      "Berliner Agenturen verlangen oft 3.000–10.000 € für eine Website. Bei Seitelyx starten Sie ab 320 € Festpreis für eine professionelle Next.js Website inkl. Responsive Design, SEO-Grundoptimierung und PageSpeed 90+. Keine versteckten Kosten, keine monatlichen Hosting-Gebühren.",
  },
  {
    question: "Wie kann Seitelyx so günstige Preise anbieten?",
    answer:
      "Wir arbeiten mit modernen Technologien (Next.js) und effizienten Prozessen. Kein WordPress-Overhead, keine überflüssigen Plugins, keine teuren Büros in Berlin-Mitte. Das Ergebnis: Premium-Qualität zum Bruchteil des üblichen Preises.",
  },
  {
    question: "Seid ihr eine Berliner Agentur?",
    answer:
      "Wir sind eine europäische Digital-Agentur mit Sitz in Prag. Unsere Zusammenarbeit läuft komplett online — Videocalls, geteilte Design-Tools und schnelle Kommunikation. Unsere Berliner Kunden schätzen die Effizienz der Remote-Zusammenarbeit und die deutlich niedrigeren Preise.",
  },
  {
    question: "Wie lange dauert die Erstellung einer Website?",
    answer:
      "Eine Standard-Unternehmenswebsite liefern wir in 5–7 Werktagen. Komplexere Projekte mit Online-Shop oder individuellen Funktionen dauern 2–3 Wochen. Nach Abschluss erhalten Sie 30 Tage kostenlosen Support.",
  },
];

export default function WebsiteErstellenBerlinPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Startseite", url: "https://seitelyx.de" },
    {
      name: "Website erstellen Berlin",
      url: "https://seitelyx.de/website-erstellen-berlin",
    },
  ];

  const localBusinessSchema = generateLocalBusinessSchema({
    name: "Seitelyx – Website erstellen lassen Berlin",
    url: "https://seitelyx.de/website-erstellen-berlin",
    description:
      "Professionelle Websites für Berliner Unternehmen. Moderne Next.js Entwicklung ab 320 €.",
    addressLocality: "Prag",
    addressCountry: "DE",
    streetAddress: "Revoluční 8, Prag 1",
    postalCode: "110 00",
    priceRange: "320€ - 1299€",
    locale: "de",
  });

  const webpageSchema = generateWebPageSchema({
    name: "Website erstellen lassen Berlin",
    description:
      "Professionelle Website erstellen lassen in Berlin ab 320 €. Moderne Next.js Technologie.",
    url: "https://seitelyx.de/website-erstellen-berlin",
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
              label: "Website erstellen Berlin",
              href: "/website-erstellen-berlin",
            },
          ]}
        />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              <Rocket className="h-3 w-3 mr-1" />
              Startup-Hauptstadt Europas
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Website erstellen lassen{" "}
              <span className="text-primary">Berlin</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Berlin denkt digital — und Ihre Website sollte das widerspiegeln.
              Wir erstellen <strong>moderne, blitzschnelle Websites auf Next.js</strong> für
              Berliner Unternehmen, Startups und Freelancer. Ohne WordPress,{" "}
              <strong>ohne monatliche Kosten</strong>. Lesen Sie in unserem{" "}
              <Link href="/blog" className="text-primary hover:underline">
                Webdesign-Blog
              </Link>
              , warum Next.js die Zukunft ist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/anfrage" size="lg" showArrow>
                Unverbindliche Anfrage stellen
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Unsere Referenzen ansehen</Link>
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

        {/* WARUM BERLIN? */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline">Warum Berlin?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Berlin ist die{" "}
                <span className="text-primary">Digital-Hauptstadt</span>{" "}
                Deutschlands
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Rocket className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Startup-Metropole</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Berlin beherbergt über <strong>3.500 Startups</strong> und zieht jährlich
                    Milliarden an Risikokapital an. In diesem hart umkämpften
                    Markt brauchen Sie eine Website, die sofort überzeugt —{" "}
                    <strong>schnell, modern und professionell</strong>.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Users className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">3,7 Mio. Einwohner</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Berlins riesiger Markt mit <strong>internationaler Community</strong> bietet
                    enormes Potenzial. Eine professionelle, mehrsprachige Website
                    erschließt Ihnen Kunden aus aller Welt — direkt in der
                    Hauptstadt. Erfahren Sie mehr{" "}
                    <Link href="/uber-uns" className="text-primary hover:underline">
                      über unsere Agentur und unser Team
                    </Link>.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-3">
                  <Palette className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-bold">Kreativszene</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Von Kreuzberg bis Prenzlauer Berg — <strong>Berlins Kreativwirtschaft
                    boomt</strong>. Designer, Fotografen, Agenturen brauchen Websites,
                    die ihre Arbeit perfekt in Szene setzen. Genau dafür sind
                    wir da.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                <Monitor className="h-4 w-4 inline mr-1" />
                Wir arbeiten <strong>100 % remote</strong> — effizient, flexibel
                und deutlich günstiger als Berliner Vor-Ort-Agenturen.
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
                <span className="text-primary">Berlin</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Von der Unternehmenswebsite bis zum Online-Shop — alles auf{" "}
                <strong>modernster Technologie ohne WordPress</strong>.
                Entdecken Sie unser{" "}
                <Link href="/leistungen" className="text-primary hover:underline">
                  vollständiges Leistungsangebot und Preise
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
                <Link href="/leistungen">
                  Alle Webdesign-Leistungen im Überblick →
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
                    <Badge variant="secondary">Transparente Preise</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">
                      Website ab{" "}
                      <span className="text-primary">320 €</span>
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Berliner Agenturen verlangen oft das 10-fache. Wir
                      liefern <strong>Premium-Qualität zum Festpreis</strong> — ohne versteckte
                      Kosten, ohne monatliche Hosting-Gebühren. Einmal zahlen,
                      Website gehört Ihnen. Schauen Sie sich unsere{" "}
                      <Link href="/preise" className="text-primary hover:underline">
                        transparente Preisübersicht
                      </Link>{" "}
                      an.
                    </p>
                    <LeadButton href="/anfrage" showArrow>
                      Angebot für Berliner Unternehmen
                    </LeadButton>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Next.js — 3× schneller als WordPress",
                      "Responsive Design für alle Geräte",
                      "SEO-Grundoptimierung inklusive",
                      "PageSpeed 90+ garantiert",
                      "DSGVO-konform ab Werk",
                      "30 Tage Support nach Launch",
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
                { value: "15+", label: "Abgeschlossene Projekte" },
                { value: "90+", label: "PageSpeed Score" },
                { value: "5–7", label: "Tage bis zur Lieferung" },
                { value: "0 €", label: "Monatliche Hosting-Kosten" },
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
              Sehen Sie sich unsere{" "}
              <Link href="/portfolio" className="text-primary hover:underline">
                abgeschlossenen Projekte im Portfolio
              </Link>{" "}
              an oder lesen Sie die{" "}
              <Link href="/faq" className="text-primary hover:underline">
                häufig gestellten Fragen zu Webdesign
              </Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Häufige Fragen —{" "}
                <span className="text-primary">Website Berlin</span>
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
              Weitere Antworten finden Sie in unseren{" "}
              <Link href="/faq" className="text-primary hover:underline">
                FAQ zum Thema Website erstellen lassen
              </Link>{" "}
              oder{" "}
              <Link href="/kontakt" className="text-primary hover:underline">
                kontaktieren Sie uns direkt
              </Link>.
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
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-5 text-center">
                  <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-bold text-lg">Berlin</p>
                  <p className="text-sm text-muted-foreground">
                    Sie sind hier
                  </p>
                </CardContent>
              </Card>
              <Link href="/website-erstellen-muenchen" className="group">
                <Card className="border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md h-full">
                  <CardContent className="p-5 text-center">
                    <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">
                      München
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Website erstellen lassen in München
                    </p>
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
                  Bereit für Ihre neue{" "}
                  <span className="text-primary">Website in Berlin</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Füllen Sie unseren kurzen Fragebogen aus und erhalten Sie
                  innerhalb von 24 Stunden ein{" "}
                  <strong>individuelles Angebot</strong>.
                  Unverbindlich und kostenlos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/anfrage" size="lg" showArrow>
                    Kostenloses Angebot anfordern
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
