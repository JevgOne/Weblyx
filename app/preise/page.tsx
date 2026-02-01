import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Webseite erstellen lassen - Transparente Preise ohne versteckte Kosten | Seitelyx",
  description: "Website erstellen lassen ab 320 € Festpreis. Professionelle Webdesign Agentur mit transparenten Preisen. Alle Leistungen inklusive: Design, SEO, DSGVO. Keine monatlichen Kosten.",
  keywords: [
    "website erstellen lassen preise",
    "webseite erstellen lassen kosten",
    "homepage erstellen lassen kosten",
    "website kosten",
    "webdesign preise",
    "festpreis website",
  ],
  twitter: {
    card: "summary_large_image",
    title: "Webseite erstellen lassen - Transparente Preise | Seitelyx",
    description: "Website erstellen lassen ab 320 € Festpreis. Design, SEO, DSGVO inklusive. Keine monatlichen Kosten.",
  },
};

const pricingTiers = [
  {
    name: "Starter",
    price: "ab 320 €",
    description: "Perfekt für Freelancer, Selbstständige und kleine Unternehmen",
    popular: false,
    features: [
      "Bis zu 5 Seiten (z.B. Home, Über uns, Leistungen, Kontakt, Impressum)",
      "Responsive Design (Desktop, Tablet, Mobile)",
      "SEO-Optimierung (Lighthouse Score 95+)",
      "DSGVO-konform (Impressum, Datenschutz, Cookie-Banner)",
      "SSL-Zertifikat inklusive",
      "Kontaktformular",
      "Google Analytics Integration",
      "3-7 Tage Lieferzeit",
      "1 Monat kostenloser Support",
    ],
    cta: "Jetzt starten",
    href: "/poptavka",
  },
  {
    name: "Professional",
    price: "699€",
    description: "Für Unternehmen mit höheren Anforderungen und mehr Content",
    popular: true,
    features: [
      "Bis zu 15 Seiten",
      "Responsive Design (Desktop, Tablet, Mobile)",
      "SEO-Optimierung Premium (technisches SEO, On-Page)",
      "DSGVO-konform mit erweiterten Features",
      "SSL-Zertifikat inklusive",
      "Erweiterte Kontaktformulare",
      "Blog-System / Aktualitäten",
      "Portfolio / Galerie",
      "Google Analytics & Tag Manager",
      "Social Media Integration",
      "5-10 Tage Lieferzeit",
      "3 Monate kostenloser Support",
    ],
    cta: "Jetzt beraten lassen",
    href: "/poptavka",
  },
  {
    name: "E-Commerce",
    price: "1.299€",
    description: "Professioneller Online-Shop für Ihr Business",
    popular: false,
    features: [
      "Unbegrenzte Produktseiten",
      "E-Commerce Funktionalität (Warenkorb, Checkout)",
      "Zahlungsintegration (Stripe, PayPal)",
      "Produktverwaltung (Admin-Panel)",
      "Bestellabwicklung",
      "Responsive Design (Desktop, Tablet, Mobile)",
      "SEO-Optimierung für E-Commerce",
      "DSGVO-konform (E-Commerce spezifisch)",
      "SSL-Zertifikat inklusive",
      "Blog-System",
      "Erweiterte Analytics (Conversion Tracking)",
      "10-14 Tage Lieferzeit",
      "6 Monate kostenloser Support",
    ],
    cta: "E-Shop Beratung",
    href: "/poptavka",
  },
];

const faqs = [
  {
    question: "Sind das wirklich Festpreise ohne versteckte Kosten?",
    answer: "Ja, absolut. Der angezeigte Preis ist der Endpreis für die beschriebenen Leistungen. Alle Features (Design, Entwicklung, SEO, DSGVO) sind inklusive. Hosting und Domain sind optional und können separat gebucht werden (ab 5€/Monat).",
  },
  {
    question: "Was ist nach der Bezahlung mit monatlichen Kosten?",
    answer: "Anders als bei WordPress-Agenturen gibt es KEINE monatlichen Pflichtkosten. Sie zahlen nur einmal für die Entwicklung. Optional: Hosting (ab 5€/Monat) und Support-Paket (ab 49€/Monat) - aber nur wenn Sie es wünschen.",
  },
  {
    question: "Wie lange dauert es, bis meine Website online ist?",
    answer: "Starter-Paket: 3-7 Tage, Professional: 5-10 Tage, E-Commerce: 10-14 Tage. Garantiert. Anders als WordPress-Agenturen, die Wochen oder Monate brauchen.",
  },
  {
    question: "Was passiert, wenn ich mehr als 5/15 Seiten brauche?",
    answer: "Kein Problem! Jede zusätzliche Seite kostet 49€. Oder wir erstellen Ihnen ein individuelles Angebot für Ihr Projekt.",
  },
  {
    question: "Ist die Website wirklich schneller als WordPress?",
    answer: "Ja, 3× schneller. Unsere Next.js Websites laden in unter 2 Sekunden (Lighthouse Score 95+). WordPress-Seiten brauchen oft 5-10 Sekunden. Schnellere Ladezeiten = besseres SEO = mehr Kunden.",
  },
  {
    question: "Welche Zahlungsmöglichkeiten gibt es?",
    answer: "Banküberweisung, PayPal oder Ratenzahlung (bei Professional und E-Commerce). 50% Anzahlung, 50% nach Go-Live – fair und transparent.",
  },
  {
    question: "Kann ich die Website später erweitern?",
    answer: "Absolut! Next.js ist skalierbar. Sie können jederzeit neue Features hinzufügen – Blog, E-Commerce, Mehrsprachigkeit, etc. Ohne die Website neu bauen zu müssen.",
  },
  {
    question: "Brauche ich technische Kenntnisse?",
    answer: "Nein. Wir übernehmen alles – Domain, Hosting, Entwicklung, Go-Live. Sie erhalten eine fertige Website mit Anleitung für einfache Änderungen (Texte, Bilder).",
  },
];

export default function PreisePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Webseite erstellen lassen - Transparente Preise ohne versteckte Kosten
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Professionelle <strong>Website erstellen lassen</strong> von Ihrer{" "}
            <strong>Webdesign Agentur</strong>. Festpreise ohne monatliche Gebühren.
            3× schneller als WordPress, DSGVO-konform, Lieferung in 3-14 Tagen.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/poptavka">
              <Button size="lg" className="text-lg px-8">
                Jetzt kostenloses Erstgespräch
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Referenzen ansehen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unsere Preispakete</h2>
            <p className="text-xl text-muted-foreground">
              Wählen Sie das passende Paket für Ihr Projekt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative border-2 rounded-2xl p-8 ${
                  tier.popular
                    ? "border-primary shadow-xl scale-105"
                    : "border-border hover:border-primary/50"
                } transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Am beliebtesten
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold text-primary mb-2">{tier.price}</div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={tier.href} className="block">
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-muted-foreground">
            <p className="text-lg">
              Alle Preise verstehen sich zzgl. MwSt. Hosting ab 5€/Monat optional.
            </p>
            <p className="mt-2">
              Individuelle Anforderungen? Kontaktieren Sie uns für ein{" "}
              <Link href="/poptavka" className="text-primary hover:underline font-medium">
                maßgeschneidertes Angebot
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Häufig gestellte Fragen zu Preisen
            </h2>
            <p className="text-xl text-muted-foreground">
              Alles, was Sie über unsere Preise wissen müssen
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-background border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit für Ihre professionelle Website?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Lassen Sie uns gemeinsam eine Website erstellen, die Ihr Geschäft wirklich voranbringt.
            Kostenloses Erstgespräch – unverbindlich und persönlich.
          </p>
          <Link href="/poptavka">
            <Button size="lg" className="text-lg px-12">
              Jetzt kostenloses Erstgespräch vereinbaren
            </Button>
          </Link>
          <p className="mt-6 text-sm text-muted-foreground">
            Antwort innerhalb von 24 Stunden · Keine Verpflichtungen
          </p>
        </div>
      </section>
    </main>
  );
}
