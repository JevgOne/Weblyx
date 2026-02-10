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
  Heart,
  Shield,
  Users,
  CalendarCheck,
  FileText,
  Search,
  Smartphone,
  Zap,
  Check,
  Lock,
  Clock,
  Star,
  Stethoscope,
  MapPin,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Website für Ärzte | Homepage Arztpraxis ab 320 € | Seitelyx",
  description:
    "⚡ Professionelle Website für Ärzte und Arztpraxen ab 320 €. DSGVO-konform, Online-Terminbuchung, Patientenportal. Homepage für Ihre Arztpraxis in 2 Wochen.",
  keywords: [
    "website für ärzte",
    "homepage arztpraxis",
    "arzt website erstellen",
    "arzt homepage",
    "website arztpraxis",
    "praxiswebsite",
    "homepage für ärzte",
    "arztpraxis website erstellen lassen",
    "dsgvo website arzt",
    "online terminbuchung arzt",
  ],
  openGraph: {
    title: "Website für Ärzte | Homepage Arztpraxis ab 320 € | Seitelyx",
    description:
      "⚡ Professionelle Website für Ärzte und Arztpraxen ab 320 €. DSGVO-konform, Online-Terminbuchung.",
    url: "https://seitelyx.de/website-fuer-aerzte",
    type: "website",
    images: [{ url: "/images/og/og-homepage.png", width: 1200, height: 630, alt: "Seitelyx - Website für Ärzte" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website für Ärzte | Ab 320 € | Seitelyx",
    description:
      "⚡ Professionelle Website für Ärzte und Arztpraxen ab 320 €. DSGVO-konform, Online-Terminbuchung.",
  },
  alternates: {
    canonical: "https://seitelyx.de/website-fuer-aerzte",
    languages: getAlternateLanguages("/website-fuer-aerzte"),
  },
};

const FEATURES = [
  {
    icon: Stethoscope,
    title: "Leistungsübersicht",
    description: "Strukturierte Darstellung Ihrer medizinischen Leistungen und Fachgebiete. Patienten wissen sofort, ob Sie der richtige Arzt sind.",
  },
  {
    icon: CalendarCheck,
    title: "Online-Terminbuchung",
    description: "Patienten buchen Termine direkt über Ihre Website. 24/7 verfügbar, automatische Bestätigungen und Erinnerungen.",
  },
  {
    icon: Lock,
    title: "DSGVO-Konformität",
    description: "Vollständige DSGVO-Compliance: Cookie-Consent, Datenschutzerklärung, verschlüsselte Formulare. Keine Kompromisse bei Patientendaten.",
  },
  {
    icon: Users,
    title: "Team-Vorstellung",
    description: "Individuelle Profile für jeden Arzt und Mitarbeiter mit Fotos, Qualifikationen und Schwerpunkten. Schafft Vertrauen vor dem ersten Besuch.",
  },
  {
    icon: FileText,
    title: "Patienteninformationen",
    description: "Download-Bereich für Formulare, Aufklärungsbögen und Vorbereitung auf Untersuchungen. Spart Zeit in der Praxis.",
  },
  {
    icon: Shield,
    title: "SSL & Datensicherheit",
    description: "256-Bit SSL-Verschlüsselung, sichere Kontaktformulare und DSGVO-konforme Datenverarbeitung. Patientendaten sind geschützt.",
  },
  {
    icon: Search,
    title: "Lokales SEO",
    description: "Werden Sie gefunden für \u201EArzt [Stadt]\u201C und Ihre Fachgebiete. Google Maps Integration und strukturierte Praxis-Daten.",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimierung",
    description: "Über 65 % der Patienten suchen Ärzte vom Smartphone. Ihre Praxiswebsite funktioniert perfekt auf jedem Gerät.",
  },
];

const TRUST_FACTORS = [
  {
    icon: Heart,
    title: "Vertrauenswürdigkeit",
    description: "Eine professionelle Website signalisiert Kompetenz. Patienten vertrauen Ärzten mit moderner Online-Präsenz 3× mehr.",
  },
  {
    icon: Clock,
    title: "Zeitersparnis",
    description: "Online-Terminbuchung und Patienteninformationen sparen Ihrer Praxis 5–10 Stunden pro Woche an Telefonzeit.",
  },
  {
    icon: MapPin,
    title: "Neue Patienten",
    description: "87 % der Patienten suchen online nach Ärzten. Ohne professionelle Website verlieren Sie täglich potenzielle Patienten.",
  },
];

const FAQS = [
  {
    question: "Was kostet eine Website für eine Arztpraxis?",
    answer:
      "Eine professionelle Arztpraxis-Website beginnt ab 320 € Festpreis. Inklusive DSGVO-konformer Gestaltung, Leistungsübersicht, Team-Vorstellung und Kontaktformular. Mit Online-Terminbuchung ab 490 €. Keine monatlichen Kosten.",
  },
  {
    question: "Ist die Website DSGVO-konform?",
    answer:
      "Ja, zu 100 %. Wir implementieren einen rechtskonformen Cookie-Consent-Manager, eine vollständige Datenschutzerklärung, verschlüsselte Kontaktformulare und Auftragsverarbeitungsverträge. Die Website erfüllt alle Anforderungen der DSGVO und des Telemediengesetzes.",
  },
  {
    question: "Wie funktioniert die Online-Terminbuchung?",
    answer:
      "Patienten wählen Leistung, Arzt und freien Zeitslot direkt auf Ihrer Website. Automatische E-Mail-Bestätigung und Erinnerung 24h vorher. Integration mit Ihrem Praxisverwaltungssystem möglich.",
  },
  {
    question: "Können wir die Website selbst aktualisieren?",
    answer:
      "Ja. Jede Website wird mit einem übersichtlichen Admin-Panel geliefert, über das Sie Texte, Sprechzeiten, Teamfotos und Neuigkeiten selbst verwalten können. Keine technischen Vorkenntnisse erforderlich.",
  },
];

export default function WebsiteFuerAerztePage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Startseite", url: "https://seitelyx.de" },
    { name: "Website für Ärzte", url: "https://seitelyx.de/website-fuer-aerzte" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Website für Ärzte",
    description: "Professionelle Website für Ärzte und Arztpraxen ab 320 €. DSGVO-konform, Online-Terminbuchung.",
    url: "https://seitelyx.de/website-fuer-aerzte",
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
        <Breadcrumbs items={[{ label: "Website für Ärzte", href: "/website-fuer-aerzte" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Für Ärzte & Arztpraxen
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Website für Ärzte —{" "}
              <span className="text-primary">vertrauenswürdige Praxis-Homepage</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professionelle <strong>Homepage für Ihre Arztpraxis</strong> — DSGVO-konform,
              mit <strong>Online-Terminbuchung</strong> und Patientenportal. Ab{" "}
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

        {/* WARUM ÄRZTE EINE WEBSITE BRAUCHEN */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Warum Ihre Praxis eine <span className="text-primary">professionelle Website</span> braucht
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <strong>87 % der Patienten</strong> suchen online nach Ärzten. Ihre Praxis-Website ist der erste Eindruck — und in der Medizin zählt Vertrauen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TRUST_FACTORS.map((factor) => (
                <Card key={factor.title} className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-6 space-y-3">
                    <factor.icon className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">{factor.title}</h3>
                    <p className="text-muted-foreground">{factor.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Maßgeschneiderte Funktionen
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Was Ihre <span className="text-primary">Praxis-Website</span> beinhaltet
              </h2>
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

        {/* DSGVO SECTION */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">100 % DSGVO-konform</span> — garantiert
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Als Arztpraxis verarbeiten Sie besonders <strong>sensible Patientendaten</strong>.
                Unsere Websites erfüllen höchste Datenschutzstandards.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" /> Was wir implementieren
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Rechtskonformer Cookie-Consent-Manager",
                      "Vollständige Datenschutzerklärung",
                      "SSL/TLS 256-Bit Verschlüsselung",
                      "Verschlüsselte Kontaktformulare",
                      "Auftragsverarbeitungsvertrag (AVV)",
                      "Impressum nach TMG §5",
                      "Keine externen Tracking-Dienste ohne Einwilligung",
                      "DSGVO-konforme Einbindung von Google Maps & Fonts",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary" /> Patientenvertrauen aufbauen
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Professionelles, medizinisch seriöses Design",
                      "Transparente Darstellung von Qualifikationen",
                      "Erfahrungsberichte zufriedener Patienten",
                      "Barrierefreie Website (WCAG-konform)",
                      "Mehrsprachige Inhalte (Deutsch, Englisch, Türkisch)",
                      "Google-Bewertungen prominent eingebunden",
                      "Virtuelle Praxistour (optional)",
                      "Notfall-Kontaktinformationen gut sichtbar",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Preise für <span className="text-primary">Arztpraxis-Websites</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Praxis-Präsenz</h3>
                  <p className="text-3xl font-black text-primary">ab 320 €</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-left">
                    {["Leistungsübersicht", "Team-Vorstellung", "Kontaktformular", "SEO-Optimierung", "DSGVO-konform", "Mobile Optimierung"].map((f) => (
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
                <CardHeader className="space-y-2 text-center">
                  <Badge className="w-fit mx-auto">Empfohlen</Badge>
                  <h3 className="text-xl font-bold">Praxis mit Buchung</h3>
                  <p className="text-3xl font-black text-primary">ab 490 €</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-left">
                    {["Alles aus Praxis-Präsenz", "Online-Terminbuchung", "Patienteninformationen", "Blog-Bereich", "Google Maps Integration", "Erfahrungsberichte"].map((f) => (
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
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Erfahren Sie mehr über unsere{" "}
              <Link href="/leistungen" className="text-primary hover:underline">Leistungen</Link>{" "}
              oder warum{" "}
              <Link href="/wordpress-alternative" className="text-primary hover:underline">Next.js besser als WordPress ist</Link>.
            </p>
          </div>
        </section>

        {/* RELATED */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Weitere Branchen-Websites
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/onlineshop-erstellen" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Onlineshop erstellen</h3>
                    <p className="text-sm text-muted-foreground mt-1">E-Commerce-Lösung ab 320 €</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/wordpress-alternative" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">WordPress Alternative</h3>
                    <p className="text-sm text-muted-foreground mt-1">Warum Next.js die bessere Wahl ist</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/portfolio" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Portfolio & Referenzen</h3>
                    <p className="text-sm text-muted-foreground mt-1">Unsere realisierten Projekte</p>
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
                Häufige Fragen — <span className="text-primary">Website für Ärzte</span>
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
              <Link href="/kontakt" className="text-primary hover:underline">kontaktieren Sie uns direkt</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Bereit für Ihre <span className="text-primary">neue Praxis-Website</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Senden Sie eine <Link href="/anfrage" className="text-primary hover:underline font-semibold">unverbindliche Anfrage</Link> und erhalten Sie innerhalb von 24 Stunden ein individuelles Angebot für Ihre Arztpraxis-Website.
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
