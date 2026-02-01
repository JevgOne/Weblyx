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
  Zap,
  Shield,
  Code2,
  Search,
  Lock,
  BarChart3,
  Server,
  DollarSign,
  Check,
  X,
  ArrowRight,
  AlertTriangle,
  Gauge,
  TrendingUp,
  Eye,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "WordPress Alternative 2026 | Next.js vs WordPress Vergleich | Seitelyx",
  description:
    "⚡ WordPress ist langsam, unsicher und teuer. Datenbasierter Vergleich WordPress vs Next.js: Core Web Vitals, Sicherheit, Kosten. Moderne WordPress Alternative ab 320 €.",
  keywords: [
    "wordpress alternative",
    "wordpress alternative 2026",
    "next.js vs wordpress",
    "wordpress vs nextjs",
    "wordpress ersatz",
    "wordpress nachteile",
    "website ohne wordpress",
    "moderne website erstellen",
    "next.js website",
    "wordpress ablösen",
  ],
  openGraph: {
    title: "WordPress Alternative 2026 | Next.js vs WordPress | Seitelyx",
    description:
      "⚡ Datenbasierter Vergleich WordPress vs Next.js: Core Web Vitals, Sicherheit, Kosten. Ab 320 €.",
    url: "https://seitelyx.de/wordpress-alternative",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Seitelyx - WordPress Alternative" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WordPress Alternative 2026 | Next.js vs WordPress | Seitelyx",
    description:
      "⚡ WordPress ist langsam, unsicher und teuer. Moderne Alternative ab 320 €.",
  },
  alternates: {
    canonical: "https://seitelyx.de/wordpress-alternative",
    languages: getAlternateLanguages("/wordpress-alternative"),
  },
};

const CORE_WEB_VITALS = [
  { metric: "Largest Contentful Paint (LCP)", wordpress: "4.2–8.0 s ❌", nextjs: "0.8–1.5 s ✅", threshold: "≤ 2.5 s" },
  { metric: "First Input Delay (FID)", wordpress: "150–400 ms ❌", nextjs: "10–50 ms ✅", threshold: "≤ 100 ms" },
  { metric: "Cumulative Layout Shift (CLS)", wordpress: "0.15–0.45 ❌", nextjs: "0.00–0.05 ✅", threshold: "≤ 0.1" },
  { metric: "First Contentful Paint (FCP)", wordpress: "2.8–4.5 s ❌", nextjs: "0.4–0.8 s ✅", threshold: "≤ 1.8 s" },
  { metric: "Time to First Byte (TTFB)", wordpress: "800–2500 ms ❌", nextjs: "50–200 ms ✅", threshold: "≤ 800 ms" },
  { metric: "PageSpeed Score (Mobil)", wordpress: "28–55 ❌", nextjs: "90–100 ✅", threshold: "≥ 90" },
];

const SECURITY_ISSUES = [
  {
    icon: AlertTriangle,
    title: "2.000+ Sicherheitslücken/Jahr",
    description: "WordPress-Plugins sind für über 90 % aller gehackten Websites verantwortlich. Jedes Plugin ist ein potenzielles Einfallstor.",
  },
  {
    icon: Lock,
    title: "Brute-Force auf wp-login.php",
    description: "Die WordPress-Login-Seite ist das häufigste Angriffsziel im Internet. Automatisierte Bots versuchen Millionen Passwörter pro Stunde.",
  },
  {
    icon: Server,
    title: "PHP-Server Abhängigkeit",
    description: "WordPress benötigt PHP und MySQL — zwei Technologien, die regelmäßig Sicherheitsupdates erfordern. Eine verpasste Aktualisierung = offenes Tor.",
  },
  {
    icon: Shield,
    title: "Next.js: Kein Angriffspunkt",
    description: "Statisch generierte Seiten, kein öffentlicher Login, keine Datenbank, keine Plugins. Es gibt schlicht nichts zu hacken.",
  },
];

const COST_COMPARISON = [
  { item: "Hosting (jährlich)", wordpress: "300–1.500 €", nextjs: "0 € (Vercel Free)" },
  { item: "Premium-Plugins", wordpress: "200–800 €/Jahr", nextjs: "0 € (nativ eingebaut)" },
  { item: "Sicherheit (SSL, WAF, Backup)", wordpress: "200–600 €/Jahr", nextjs: "0 € (inklusive)" },
  { item: "Wartung & Updates", wordpress: "500–2.000 €/Jahr", nextjs: "0 € (statischer Build)" },
  { item: "Gesamtkosten pro Jahr", wordpress: "1.200–4.900 €", nextjs: "0–200 €" },
];

const FAQS = [
  {
    question: "Ist Next.js wirklich besser als WordPress?",
    answer:
      "Für Unternehmenswebsites, E-Commerce und Portfolio-Seiten — eindeutig ja. Next.js erreicht PageSpeed 90–100 (WordPress durchschnittlich 35–55), hat keine Sicherheitslücken durch Plugins und verursacht keine laufenden Hostingkosten. Für reine Blogs mit zehntausenden Artikeln kann WordPress noch Sinn machen.",
  },
  {
    question: "Was sind Core Web Vitals und warum sind sie wichtig?",
    answer:
      "Core Web Vitals sind Googles offizielle Metriken für Nutzererfahrung: LCP (Ladezeit), FID (Interaktivität) und CLS (visuelle Stabilität). Seit 2021 sind sie ein direkter Google-Rankingfaktor. WordPress-Seiten scheitern häufig an diesen Metriken — Next.js besteht sie mühelos.",
  },
  {
    question: "Wie viel kostet der Umstieg von WordPress zu Next.js?",
    answer:
      "Die Migration von WordPress zu einer Next.js-Website beginnt ab 320 € Festpreis. Inklusive Inhaltsübernahme, neuem Design, SEO-Einrichtung und 301-Weiterleitungen. Wir garantieren keinen Ausfall in der Indexierung.",
  },
  {
    question: "Kann ich meine Website selbst bearbeiten wie bei WordPress?",
    answer:
      "Ja. Wir liefern ein übersichtliches Admin-Panel mit WYSIWYG-Editor für Texte, Bilder und Blog-Artikel. So intuitiv wie WordPress, aber ohne die Nachteile.",
  },
];

export default function WordpressAlternativePage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Startseite", url: "https://seitelyx.de" },
    { name: "WordPress Alternative", url: "https://seitelyx.de/wordpress-alternative" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "WordPress Alternative 2026",
    description: "Datenbasierter Vergleich WordPress vs Next.js: Core Web Vitals, Sicherheit, Kosten.",
    url: "https://seitelyx.de/wordpress-alternative",
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
        <Breadcrumbs items={[{ label: "WordPress Alternative", href: "/wordpress-alternative" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              WordPress vs Next.js
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              WordPress Alternative 2026 —{" "}
              <span className="text-primary">schneller, sicherer, günstiger</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              WordPress powert 40 % des Internets — und die <strong>meisten davon scheitern an Core Web Vitals</strong>.
              Unsere Next.js-Websites erreichen <strong>PageSpeed 90–100</strong> ab{" "}
              <strong>320 € Festpreis</strong>. Lesen Sie den ausführlichen{" "}
              <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                WordPress vs Next.js Vergleich
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

        {/* CORE WEB VITALS */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                <Gauge className="h-4 w-4 mr-1" /> Google-Rankingfaktor
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Core Web Vitals</span>: WordPress vs Next.js
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reale Daten aus dem <strong>Chrome User Experience Report</strong>. WordPress scheitert an 5 von 6 Metriken — Next.js besteht alle.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Metrik</th>
                    <th className="text-center py-4 px-4 font-bold text-red-500">WordPress</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Next.js</th>
                    <th className="text-center py-4 px-4 font-bold text-muted-foreground">Google-Grenzwert</th>
                  </tr>
                </thead>
                <tbody>
                  {CORE_WEB_VITALS.map((row, i) => (
                    <tr key={i} className="border-b border-muted hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-sm">{row.metric}</td>
                      <td className="py-4 px-4 text-center text-red-500/80 text-sm">{row.wordpress}</td>
                      <td className="py-4 px-4 text-center text-primary font-semibold text-sm">{row.nextjs}</td>
                      <td className="py-4 px-4 text-center text-muted-foreground text-sm">{row.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Wir garantieren{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                PageSpeed 90+ für jede Website
              </Link>.
            </p>
          </div>
        </section>

        {/* SECURITY */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                WordPress-Sicherheit ist ein <span className="text-primary">Albtraum</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <strong>WordPress-Plugins</strong> sind für über 90 % aller gehackten Websites verantwortlich. Next.js hat keinen Angriffspunkt.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SECURITY_ISSUES.map((issue) => (
                <Card key={issue.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <issue.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* COST COMPARISON */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Jährliche Kosten: <span className="text-primary">WordPress vs Next.js</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                WordPress ist &quot;kostenlos&quot; — aber die <strong>tatsächlichen Betriebskosten</strong> sind überraschend hoch.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Position</th>
                    <th className="text-center py-4 px-4 font-bold text-red-500">WordPress</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Next.js (Seitelyx)</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_COMPARISON.map((row, i) => (
                    <tr key={i} className={`border-b border-muted hover:bg-muted/30 transition-colors ${i === COST_COMPARISON.length - 1 ? "font-bold bg-muted/20" : ""}`}>
                      <td className="py-4 px-4">{row.item}</td>
                      <td className="py-4 px-4 text-center text-red-500/80">{row.wordpress}</td>
                      <td className="py-4 px-4 text-center text-primary">{row.nextjs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Schauen Sie sich unsere{" "}
                <Link href="/leistungen" className="text-primary hover:underline">Leistungsübersicht</Link>{" "}
                an oder berechnen Sie Ihr Projekt mit einer{" "}
                <Link href="/anfrage" className="text-primary hover:underline">unverbindlichen Anfrage</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Weitere Leistungen
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/onlineshop-erstellen" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Onlineshop erstellen</h3>
                    <p className="text-sm text-muted-foreground mt-1">E-Commerce ohne monatliche Kosten</p>
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
              <Link href="/portfolio" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Portfolio & Referenzen</h3>
                    <p className="text-sm text-muted-foreground mt-1">Unsere erfolgreich realisierten Projekte</p>
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
                Häufige Fragen — <span className="text-primary">WordPress Alternative</span>
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
              Lesen Sie den vollständigen{" "}
              <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                WordPress vs Next.js Vergleich 2026
              </Link>{" "}
              oder besuchen Sie unsere{" "}
              <Link href="/faq" className="text-primary hover:underline">FAQ-Seite</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Steigen Sie um von <span className="text-primary">WordPress — heute noch</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Senden Sie eine <strong>unverbindliche Anfrage</strong> und erhalten Sie innerhalb von 24 Stunden ein Migrationsangebot. Kein Ausfall, SEO-Übernahme, modernes Design.
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
