import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LeadButton } from "@/components/tracking/LeadButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getActiveServices, Service } from "@/lib/turso/services";

// Force dynamic rendering to avoid build timeout
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

// CZK to EUR conversion rate
const CZK_TO_EUR = 25;

export const metadata: Metadata = {
  title: "Webseiten erstellen lassen | Ab 320 € | Online-Shops & SEO | Seitelyx",
  description: "⚡ Professionelle Webseiten ab 320 €. Website in 5–7 Tagen, garantierte Ladezeit unter 2 Sekunden. Maßgeschneiderte Online-Shops, SEO-Optimierung. Deutsche Agentur.",
  keywords: [
    "Webseiten erstellen lassen",
    "Website erstellen",
    "Online-Shop erstellen",
    "SEO-Optimierung",
    "Website-Redesign",
    "Website für Selbstständige",
    "Website Geschwindigkeit optimieren",
    "Website Wartung",
  ],
  openGraph: {
    title: "Webseiten erstellen lassen | Ab 320 € | Seitelyx",
    description: "⚡ Professionelle Webseiten ab 320 €. Website in 5–7 Tagen, garantierte Ladezeit unter 2 Sekunden. Deutsche Agentur.",
    url: "https://www.seitelyx.de/leistungen",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Seitelyx - Leistungen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webseiten erstellen lassen | Ab 320 € | Seitelyx",
    description: "⚡ Professionelle Webseiten ab 320 €. Website in 5–7 Tagen, garantierte Ladezeit unter 2 Sekunden. Deutsche Agentur.",
  },
  alternates: {
    canonical: "https://www.seitelyx.de/leistungen",
  },
};

// Interface for pricing package with features
interface PricingPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  priceNote: string;
  popular: boolean;
  features: Array<{ name: string; included: boolean | string }>;
  cta: string;
  ideal: string;
}

// Helper: convert CZK price to EUR (rounded)
function czkToEur(czk: number): number {
  return Math.round(czk / CZK_TO_EUR);
}

// Helper function to transform database services to pricing packages (German)
function transformServicesToPricingPackages(services: Service[]): PricingPackage[] {
  // Filter services that have pricing (priceFrom is not null)
  const pricingServices = services
    .filter(service => service.priceFrom !== null && service.priceFrom !== undefined)
    .sort((a, b) => a.order - b.order);

  // Collect ALL unique features across all services for comparison table
  const allFeatureNames = new Set<string>();
  pricingServices.forEach(service => {
    service.features.forEach(feature => allFeatureNames.add(feature));
  });

  // Transform each service to pricing package format
  return pricingServices.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    price: czkToEur(service.priceFrom!),
    priceNote: "einmalig",
    // Mark "Basis" package as popular
    popular: service.title.toLowerCase().includes("basis") || service.title.toLowerCase().includes("standard"),
    // For cards: show only service's own features
    // For table: show all features with true/false
    features: Array.from(allFeatureNames).map(featureName => ({
      name: featureName,
      included: service.features.includes(featureName),
    })),
    cta: `${service.title} bestellen`,
    ideal: service.description,
  }));
}

// Additional services (German)
const ADDITIONAL_SERVICES = [
  {
    icon: TrendingUp,
    title: "SEO-Optimierung",
    slug: "seo",
    price: "ab 200 €/Monat",
    description:
      "Erreichen Sie Top-Positionen in den Suchmaschinen. Komplette On-Page- und Off-Page-SEO für bessere Sichtbarkeit.",
    includes: [
      "Keyword-Recherche und Wettbewerbsanalyse",
      "On-Page-Optimierung (Meta-Tags, Überschriften, Inhalte)",
      "Technisches SEO (Geschwindigkeit, Core Web Vitals)",
      "Linkbuilding und Off-Page-Optimierung",
      "Monatliche Berichte und Analytics",
    ],
  },
  {
    icon: Palette,
    title: "Website-Redesign",
    slug: "redesign",
    price: "ab 600 €",
    description:
      "Modernisierung veralteter Websites. Neues Design, bessere UX, höhere Konversionen unter Beibehaltung Ihrer Marke.",
    includes: [
      "Analyse der bestehenden Website und UX-Audit",
      "Neues modernes Design unter Berücksichtigung der Markenidentität",
      "Verbesserung von UX/UI und Conversion-Design",
      "Content-Migration und SEO-Weiterleitungen",
      "3 Monate kostenloser Support",
    ],
  },
  {
    icon: Zap,
    title: "Geschwindigkeitsoptimierung",
    slug: "speed",
    price: "ab 320 €",
    description:
      "Schnellere Ladezeiten für besseres SEO und Nutzererlebnis. Ziel: unter 2 Sekunden.",
    includes: [
      "Performance-Audit (Lighthouse, PageSpeed)",
      "Optimierung von Bildern und Medien",
      "Caching-Strategie und CDN-Implementierung",
      "Core Web Vitals Optimierung",
      "Lighthouse Score > 90",
    ],
  },
  {
    icon: HeadphonesIcon,
    title: "Wartung und Support",
    slug: "maintenance",
    price: "ab 80 €/Monat",
    description:
      "Regelmäßige Updates, Backups und technischer Support. Ihre Website bleibt immer funktionsfähig und sicher.",
    includes: [
      "Regelmäßige System- und Plugin-Updates",
      "Sicherheits-Backups und Monitoring",
      "Technischer Support (E-Mail, Telefon)",
      "Kleine Inhaltsänderungen",
      "Monatliche Performance-Berichte",
    ],
  },
];

export default async function LeistungenPage() {
  // Fetch active services from database (German locale)
  const dbServices = await getActiveServices('de');

  // Transform database services to pricing packages
  const PRICING_PACKAGES = transformServicesToPricingPackages(dbServices);

  // Generate breadcrumb schema
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Startseite', url: 'https://www.seitelyx.de' },
    { name: 'Leistungen', url: 'https://www.seitelyx.de/leistungen' },
  ];

  // Generate webpage schema
  const webpageSchema = generateWebPageSchema({
    name: 'Leistungen',
    description: 'Wir bieten Webseiten-Erstellung, Online-Shops, SEO-Optimierung, Redesign, Geschwindigkeitsoptimierung und laufenden Support.',
    url: 'https://www.seitelyx.de/leistungen',
    breadcrumbs,
  });

  // Generate service schemas
  const serviceSchemas = PRICING_PACKAGES.map(pkg => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pkg.title,
    description: pkg.description,
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: 'EUR',
    },
    provider: {
      '@type': 'Organization',
      name: 'Seitelyx',
      url: 'https://www.seitelyx.de',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Germany',
    },
  }));

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={webpageSchema} />
      {serviceSchemas.map((schema, index) => (
        <JsonLd key={index} data={schema} />
      ))}

      <main className="min-h-screen">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Leistungen", href: "/leistungen" }
          ]}
        />

        {/* HERO SECTION - Clean & Minimal */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Transparente Preise
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Transparente Preise.{" "}
              <span className="text-primary">Keine versteckten Kosten.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professionelle Webseiten und Online-Shops zu fairen Preisen.
              Sie wissen genau, was Sie bekommen und was es kostet. Ohne Überraschungen.
            </p>
          </div>
        </section>

        {/* PRICING CARDS - Premium Professional Design */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Pricing cards - Responsive flex layout */}
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 mb-20">
              {PRICING_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)] max-w-[380px] ${
                    pkg.popular
                      ? "border-2 border-primary/60 shadow-2xl shadow-primary/10 ring-2 ring-primary/10 lg:scale-[1.02]"
                      : "border border-border/60 hover:border-primary/40 shadow-lg"
                  }`}
                >
                  {/* Gradient background overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-[0.02] transition-opacity duration-500 ${
                    pkg.popular
                      ? "from-primary via-transparent to-primary/50 group-hover:opacity-[0.05]"
                      : "from-primary/30 via-transparent to-transparent group-hover:opacity-[0.04]"
                  }`}></div>

                  {/* Popular badge */}
                  {pkg.popular && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-2 text-xs font-bold rounded-bl-2xl shadow-lg flex items-center gap-1.5 z-10">
                      <Sparkles className="h-3.5 w-3.5" />
                      BELIEBTESTE
                    </div>
                  )}

                  <CardHeader className="relative space-y-6 pt-10 pb-6 px-6">
                    {/* Package name */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold tracking-tight">{pkg.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                        {pkg.description}
                      </p>
                    </div>

                    {/* PRICE - Bold and prominent */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl md:text-6xl font-black tracking-tight ${
                          pkg.popular ? "text-primary" : "text-foreground"
                        }`}>
                          {new Intl.NumberFormat('de-DE').format(pkg.price)}
                        </span>
                        <span className="text-xl text-muted-foreground font-semibold">€</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{pkg.priceNote}</p>
                    </div>

                    {/* CTA Button */}
                    <LeadButton
                      href="/anfrage"
                      size="lg"
                      className={`w-full font-semibold transition-all duration-300 ${
                        pkg.popular
                          ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]"
                          : "hover:scale-[1.02]"
                      }`}
                      showArrow
                    >
                      {pkg.cta}
                    </LeadButton>
                  </CardHeader>

                  <CardContent className="relative space-y-6 pb-8 px-6">
                    {/* Features list */}
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Was Sie bekommen:
                      </p>
                      <ul className="space-y-3">
                        {pkg.features.filter(f => f.included).slice(0, 8).map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 group/item">
                            <div className="mt-0.5 p-0.5 rounded-full bg-primary/10">
                              <Check className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-sm text-foreground/90 leading-relaxed group-hover/item:text-foreground transition-colors">
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ideal for section */}
                    <div className="pt-5 border-t border-border/50">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                        Ideal für:
                      </p>
                      <p className="text-sm text-muted-foreground/90 leading-relaxed italic">
                        {pkg.ideal}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* COMPARISON TABLE - Desktop view for detailed comparison */}
            <div className="hidden lg:block mt-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Detaillierter <span className="text-primary">Paketvergleich</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Übersichtliche Tabelle aller Funktionen und Eigenschaften der einzelnen Pakete
                </p>
              </div>

              <Card className="overflow-hidden border-border/60 shadow-lg">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b-2 border-border">
                        <TableHead className="w-[280px] text-base font-bold py-4 sticky left-0 bg-background z-10">
                          Funktion / Eigenschaft
                        </TableHead>
                        {PRICING_PACKAGES.map((pkg) => (
                          <TableHead key={pkg.id} className="text-center min-w-[160px] py-4">
                            <div className="space-y-2">
                              <p className="font-bold text-foreground text-base">{pkg.title}</p>
                              {pkg.popular && (
                                <Badge className="bg-primary text-white text-[10px] px-2 py-0.5 font-bold">
                                  BELIEBTESTE
                                </Badge>
                              )}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PRICING_PACKAGES[0]?.features.map((_, featureIndex) => {
                        const featureName = PRICING_PACKAGES[0].features[featureIndex].name;

                        return (
                          <TableRow
                            key={featureIndex}
                            className="hover:bg-muted/30 transition-colors border-b border-border/40"
                          >
                            <TableCell className="font-medium py-4 sticky left-0 bg-background">
                              {featureName}
                            </TableCell>
                            {PRICING_PACKAGES.map((pkg) => {
                              const feature = pkg.features[featureIndex];

                              return (
                                <TableCell key={pkg.id} className="text-center py-4">
                                  {feature?.included ? (
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                      <Check className="h-5 w-5 text-primary" />
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/30">
                                      <X className="h-5 w-5 text-muted-foreground/40" />
                                    </div>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* CTA below table */}
              <div className="text-center mt-10">
                <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-8 space-y-4">
                    <h3 className="text-xl font-bold">Unsicher bei der Wahl?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Jedes Projekt ist einzigartig. Gerne erstellen wir Ihnen ein maßgeschneidertes
                      Angebot für Ihre Bedürfnisse und Ihr Budget.
                    </p>
                    <LeadButton href="/anfrage" size="lg" className="mt-4">
                      Kostenlose unverbindliche Anfrage
                    </LeadButton>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile: Simple info card instead of table */}
            <div className="block lg:hidden mt-12">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-bold">💡 Möchten Sie die Pakete vergleichen?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Die detaillierte Vergleichstabelle finden Sie auf einem größeren Bildschirm,
                    oder schreiben Sie uns und wir helfen Ihnen bei der Auswahl des richtigen Pakets.
                  </p>
                  <LeadButton href="/anfrage" size="default" className="w-full mt-3">
                    Unverbindliche Anfrage
                  </LeadButton>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ADDITIONAL SERVICES - Clearly separated, less prominent */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Zusätzliche Leistungen
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Zusätzliche Leistungen und <span className="text-primary">Support</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Wir bieten auch weitere Dienstleistungen zur Verbesserung der Performance,
                SEO und Wartung Ihrer Website.
              </p>
            </div>

            {/* Simple grid of cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {ADDITIONAL_SERVICES.map((service) => (
                <Card
                  key={service.slug}
                  className="transition-all duration-300 hover:shadow-lg hover:border-primary/20"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {service.price}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {service.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <LeadButton
                      href="/anfrage"
                      variant="outline"
                      className="w-full"
                    >
                      Unverbindliche Anfrage
                    </LeadButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA - Final conversion */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Unsicher? Schreiben Sie uns für eine{" "}
                    <span className="text-primary">kostenlose Beratung</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Wir helfen Ihnen, das richtige Paket auszuwählen und beantworten alle Ihre Fragen.
                    Unverbindlich.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/anfrage" size="lg" showArrow>
                    Fragebogen ausfüllen
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Kontakt aufnehmen</Link>
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
