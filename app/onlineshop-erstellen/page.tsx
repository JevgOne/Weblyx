import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LeadButton } from "@/components/tracking/LeadButton";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  CreditCard,
  Truck,
  BarChart3,
  Shield,
  Search,
  Smartphone,
  Zap,
  Check,
  X,
  ArrowRight,
  Package,
  Globe,
  Lock,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Onlineshop erstellen lassen | Ab 320 € Festpreis | Seitelyx",
  description:
    "⚡ Professionellen Onlineshop erstellen lassen ab 320 €. 3× schneller als Shopify & WooCommerce, PageSpeed 90+, DSGVO-konform. E-Commerce ohne monatliche Kosten.",
  keywords: [
    "onlineshop erstellen lassen",
    "onlineshop erstellen",
    "e-commerce website erstellen",
    "webshop erstellen lassen",
    "onlineshop kosten",
    "shopify alternative",
    "woocommerce alternative",
    "onlineshop erstellen lassen kosten",
    "professioneller onlineshop",
    "onlineshop agentur",
  ],
  openGraph: {
    title: "Onlineshop erstellen lassen | Ab 320 € | Seitelyx",
    description:
      "⚡ Professionellen Onlineshop erstellen lassen ab 320 €. 3× schneller als Shopify & WooCommerce.",
    url: "https://seitelyx.de/onlineshop-erstellen",
    type: "website",
    images: [{ url: "/images/og/og-tvorba-eshopu.png", width: 1200, height: 630, alt: "Seitelyx - Onlineshop erstellen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onlineshop erstellen lassen | Ab 320 € | Seitelyx",
    description:
      "⚡ Professionellen Onlineshop erstellen lassen ab 320 €. 3× schneller als Shopify & WooCommerce.",
  },
  alternates: {
    canonical: "https://seitelyx.de/onlineshop-erstellen",
    languages: getAlternateLanguages("/onlineshop-erstellen"),
  },
};

const PLATFORM_COMPARISON = [
  { feature: "PageSpeed (Mobil)", shopify: "40–60", woocommerce: "25–50", seitelyx: "90–100" },
  { feature: "Monatliche Kosten", shopify: "32–384 €/Mo.", woocommerce: "20–100 €/Mo.", seitelyx: "0 € (Festpreis)" },
  { feature: "Transaktionsgebühren", shopify: "0,5–2 %", woocommerce: "0 %", seitelyx: "0 %" },
  { feature: "DSGVO-Konformität", shopify: "Eingeschränkt", woocommerce: "Plugin-abhängig", seitelyx: "Vollständig" },
  { feature: "Individuelles Design", shopify: "Templates", woocommerce: "Theme-basiert", seitelyx: "100% individuell" },
  { feature: "Sicherheit", shopify: "Gut (SaaS)", woocommerce: "Schwach (Plugins)", seitelyx: "Sehr hoch (statisch)" },
];

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Produktkatalog",
    description: "Übersichtlicher Katalog mit Filtern, Varianten und Kategorien. Ihre Kunden finden in Sekunden, was sie suchen.",
  },
  {
    icon: CreditCard,
    title: "Zahlungsanbieter",
    description: "Stripe, PayPal, Klarna, SEPA-Lastschrift und Sofortüberweisung. Sichere Bezahlung mit einem Klick.",
  },
  {
    icon: Truck,
    title: "Versand & Tracking",
    description: "Integration mit DHL, DPD, Hermes und GLS. Automatische Sendungsverfolgung für Ihre Kunden.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Verkaufsübersicht, Konversionsraten und Kundenverhalten. Daten für bessere Entscheidungen.",
  },
  {
    icon: Shield,
    title: "DSGVO-konform",
    description: "Cookie-Consent, Datenschutzerklärung, Auftragsverarbeitung. Vollständig DSGVO-konform ab Tag 1.",
  },
  {
    icon: Search,
    title: "SEO-Optimierung",
    description: "Strukturierte Produktdaten, blitzschnelles Laden und optimierte URLs. Google findet Ihre Produkte.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Über 70 % der Online-Käufe erfolgen mobil. Ihr Shop ist auf jedem Gerät perfekt.",
  },
  {
    icon: Zap,
    title: "Blitzschnelle Ladezeit",
    description: "Next.js-Technologie sorgt für Ladezeiten unter 2 Sekunden. Kein Kundenverlust durch langsame Seiten.",
  },
];

const FAQS = [
  {
    question: "Was kostet es, einen Onlineshop erstellen zu lassen?",
    answer:
      "Ein professioneller Onlineshop von Seitelyx beginnt ab 320 € Festpreis. Der endgültige Preis hängt von der Anzahl der Produkte, gewünschten Integrationen (Zahlungsanbieter, Versand) und zusätzlichen Funktionen ab. Wir erstellen Ihnen ein unverbindliches Angebot.",
  },
  {
    question: "Wie lange dauert die Erstellung eines Onlineshops?",
    answer:
      "Einen Basis-Onlineshop liefern wir in 2–3 Wochen. Komplexere Projekte mit individuellen Integrationen können 4–6 Wochen dauern. Den genauen Zeitrahmen vereinbaren wir vorab.",
  },
  {
    question: "Warum ist Seitelyx besser als Shopify oder WooCommerce?",
    answer:
      "Shopify kostet 32–384 €/Monat plus Transaktionsgebühren. WooCommerce ist langsam und unsicher (Plugins). Unser Next.js-Shop lädt 3× schneller, hat keine monatlichen Kosten, keine Transaktionsgebühren und ist vollständig DSGVO-konform.",
  },
  {
    question: "Kann ich den Shop selbst verwalten?",
    answer:
      "Ja. Jeder Shop wird mit einem übersichtlichen Admin-Panel geliefert, über das Sie Produkte, Preise und Beschreibungen einfach verwalten können. Keine technischen Kenntnisse erforderlich.",
  },
];

export default function OnlineshopErstellenPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Startseite", url: "https://seitelyx.de" },
    { name: "Leistungen", url: "https://seitelyx.de/leistungen" },
    { name: "Onlineshop erstellen", url: "https://seitelyx.de/onlineshop-erstellen" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Onlineshop erstellen lassen",
    description: "Professionellen Onlineshop erstellen lassen ab 320 €. 3× schneller als Shopify & WooCommerce.",
    url: "https://seitelyx.de/onlineshop-erstellen",
    breadcrumbs,
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={webpageSchema} />
      <JsonLd data={faqSchema} />

      <main className="min-h-screen">
        <Breadcrumbs items={[{ label: "Leistungen", href: "/leistungen" }, { label: "Onlineshop erstellen", href: "/onlineshop-erstellen" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              E-Commerce Lösung
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Onlineshop erstellen lassen —{" "}
              <span className="text-primary">verkaufsstarker Webshop</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Wir erstellen Ihren <strong>professionellen Onlineshop</strong> mit modernster Technologie.
              Keine Templates, keine monatlichen Gebühren. Ab{" "}
              <strong>320 € Festpreis</strong> mit{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                PageSpeed-Garantie 90+
              </Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/anfrage" size="lg" showArrow>
                Unverbindliche Anfrage
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Unsere Referenzen</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PLATFORM COMPARISON */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Shopify vs WooCommerce vs Seitelyx</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Warum ein individueller Onlineshop besser ist als <strong>Standard-Plattformen</strong>.
                Lesen Sie unseren ausführlichen{" "}
                <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                  WordPress vs Next.js Vergleich
                </Link>.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Merkmal</th>
                    <th className="text-center py-4 px-4 font-bold text-muted-foreground">Shopify</th>
                    <th className="text-center py-4 px-4 font-bold text-muted-foreground">WooCommerce</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Seitelyx</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORM_COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-muted hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center text-muted-foreground text-sm">{row.shopify}</td>
                      <td className="py-4 px-4 text-center text-muted-foreground text-sm">{row.woocommerce}</td>
                      <td className="py-4 px-4 text-center text-primary font-semibold text-sm">{row.seitelyx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Komplettlösung
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Was Ihr <span className="text-primary">Onlineshop beinhaltet</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Jeder <strong>individuelle Webshop</strong> von Seitelyx enthält alles für erfolgreichen Online-Verkauf.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-muted-foreground">
                Sehen Sie unsere{" "}
                <Link href="/leistungen" className="text-primary hover:underline">vollständige Leistungsübersicht</Link>{" "}
                oder schauen Sie sich{" "}
                <Link href="/portfolio" className="text-primary hover:underline">unsere Referenzen</Link> an.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Was kostet ein <span className="text-primary">Onlineshop</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transparente Festpreise ohne versteckte Kosten. <strong>Onlineshop ab 320 €</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2">
                  <Package className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Starter Shop</h3>
                  <p className="text-3xl font-black text-primary">ab 320 €</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Bis 50 Produkte", "1 Zahlungsanbieter", "2 Versandoptionen", "Responsives Design", "SEO-Optimierung"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/anfrage" variant="outline" className="w-full">
                    Unverbindliche Anfrage
                  </LeadButton>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/60 shadow-xl transition-all hover:shadow-2xl">
                <CardHeader className="space-y-2">
                  <Badge className="w-fit">Beliebteste Wahl</Badge>
                  <ShoppingCart className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Professional Shop</h3>
                  <p className="text-3xl font-black text-primary">ab 590 €</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Bis 500 Produkte", "Mehrere Zahlungsanbieter", "Alle Versandoptionen", "Admin-Panel", "Analytics", "Erweitertes SEO"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/anfrage" className="w-full">
                    Unverbindliche Anfrage
                  </LeadButton>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Enterprise Shop</h3>
                  <p className="text-3xl font-black text-primary">Individuell</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Unbegrenzte Produkte", "Individuelle Integrationen", "ERP/CRM-Anbindung", "Mehrsprachigkeit", "Dedizierter Support"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/anfrage" variant="outline" className="w-full">
                    Unverbindliche Anfrage
                  </LeadButton>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Nicht sicher, welches Paket? Schauen Sie unsere{" "}
              <Link href="/faq" className="text-primary hover:underline">häufig gestellten Fragen</Link>{" "}
              oder{" "}
              <Link href="/anfrage" className="text-primary hover:underline">senden Sie eine unverbindliche Anfrage</Link>.
            </p>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Weitere Leistungen
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/wordpress-alternative" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">WordPress Alternative</h3>
                    <p className="text-sm text-muted-foreground mt-1">Next.js vs WordPress Vergleich 2026</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/website-fuer-aerzte" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Website für Ärzte</h3>
                    <p className="text-sm text-muted-foreground mt-1">DSGVO-konforme Arztpraxis-Website</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/leistungen" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Alle Leistungen</h3>
                    <p className="text-sm text-muted-foreground mt-1">Komplette Übersicht unserer Services</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Häufige Fragen — <span className="text-primary">Onlineshop erstellen</span>
              </h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Weitere Fragen beantworten wir auf unserer{" "}
              <Link href="/faq" className="text-primary hover:underline">FAQ-Seite</Link>{" "}
              oder{" "}
              <Link href="/kontakt" className="text-primary hover:underline">kontaktieren Sie uns</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Bereit für Ihren <span className="text-primary">verkaufsstarken Onlineshop</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Senden Sie eine <strong>unverbindliche Anfrage</strong> und erhalten Sie innerhalb von 24 Stunden ein individuelles Angebot. Ohne Verpflichtungen, ohne versteckte Kosten.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/anfrage" size="lg" showArrow>
                    Unverbindliche Anfrage
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Kontaktieren Sie uns</Link>
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
