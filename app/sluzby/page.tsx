import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Globe,
  ShoppingCart,
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
import { Service as ServiceType } from "@/types/cms";
import { Pricing } from "@/components/home/pricing";
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
import { getLocale } from 'next-intl/server';

// Force dynamic rendering to avoid build timeout
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Tvorba webových stránek | Od 7 990 Kč | E-shopy a SEO | Weblyx",
  description: "⚡ Profesionální tvorba webových stránek od 7 990 Kč. Web za 5-7 dní, garantované načítání pod 2 sekundy. E-shopy na míru, SEO optimalizace. Česká agentura.",
  keywords: [
    "tvorba webových stránek",
    "tvorba webu",
    "tvorba e-shopu",
    "SEO optimalizace",
    "redesign webu",
    "web pro živnostníky",
    "optimalizace rychlosti webu",
    "údržba webu"
  ],
  openGraph: {
    title: "Tvorba webových stránek | Od 7 990 Kč | Weblyx",
    description: "⚡ Profesionální tvorba webových stránek od 7 990 Kč. Web za 5-7 dní, garantované načítání pod 2 sekundy. Česká agentura.",
    url: "https://www.weblyx.cz/sluzby",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Weblyx - Služby"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tvorba webových stránek | Od 7 990 Kč | Weblyx",
    description: "⚡ Profesionální tvorba webových stránek od 7 990 Kč. Web za 5-7 dní, garantované načítání pod 2 sekundy. Česká agentura.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/sluzby",
    languages: getAlternateLanguages('/sluzby')
  }
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

// Helper function to transform database services to pricing packages
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
    price: service.priceFrom!,
    priceNote: "jednorázově",
    // Mark "Základní Web" as popular
    popular: service.title.toLowerCase().includes("základní"),
    // For cards: show only service's own features
    // For table: show all features with true/false
    features: Array.from(allFeatureNames).map(featureName => ({
      name: featureName,
      included: service.features.includes(featureName),
    })),
    cta: `Objednat ${service.title}`,
    ideal: service.description, // Use description as "ideal for" text
  }));
}

// Additional services (secondary)
const ADDITIONAL_SERVICES = [
  {
    icon: TrendingUp,
    title: "SEO optimalizace",
    slug: "seo",
    price: "od 5 000 Kč/měsíc",
    description:
      "Dostaňte se na přední pozice ve vyhledávačích. Kompletní on-page i off-page SEO pro lepší viditelnost.",
    includes: [
      "Keyword research a analýza konkurence",
      "On-page optimalizace (meta tags, headings, content)",
      "Technické SEO (rychlost, Core Web Vitals)",
      "Link building a off-page optimalizace",
      "Měsíční reporty a analytics",
    ],
  },
  {
    icon: Palette,
    title: "Redesign webu",
    slug: "redesign",
    price: "od 15 000 Kč",
    description:
      "Modernizace zastaralých webů. Nový design, lepší UX, vyšší konverze při zachování vaší značky.",
    includes: [
      "Analýza současného webu a UX audit",
      "Nový moderní design respektující brand identity",
      "Zlepšení UX/UI a konverzního designu",
      "Migrace obsahu a SEO redirecty",
      "3 měsíce podpora zdarma",
    ],
  },
  {
    icon: Zap,
    title: "Optimalizace rychlosti",
    slug: "speed",
    price: "od 8 000 Kč",
    description:
      "Zrychlení načítání webu pro lepší SEO a uživatelskou zkušenost. Cíl: < 2 sekundy.",
    includes: [
      "Audit výkonu webu (Lighthouse, PageSpeed)",
      "Optimalizace obrázků a médií",
      "Caching strategie a CDN implementace",
      "Core Web Vitals optimalizace",
      "Lighthouse score > 90",
    ],
  },
  {
    icon: HeadphonesIcon,
    title: "Údržba a podpora",
    slug: "maintenance",
    price: "od 2 000 Kč/měsíc",
    description:
      "Pravidelné aktualizace, zálohy a technická podpora. Váš web bude vždy funkční a bezpečný.",
    includes: [
      "Pravidelné aktualizace systému a pluginů",
      "Bezpečnostní zálohy a monitoring",
      "Technická podpora (email, telefon)",
      "Malé úpravy obsahu",
      "Měsíční reporty o výkonu webu",
    ],
  },
];

export default async function ServicesPage() {
  // Fetch active services from database (locale-aware)
  const locale = await getLocale();
  const dbServices = await getActiveServices(locale);

  // Transform database services to pricing packages
  const PRICING_PACKAGES = transformServicesToPricingPackages(dbServices);

  // Generate breadcrumb schema
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Domů', url: 'https://www.weblyx.cz' },
    { name: 'Služby', url: 'https://www.weblyx.cz/sluzby' },
  ];

  // Generate webpage schema
  const webpageSchema = generateWebPageSchema({
    name: 'Služby',
    description: 'Nabízíme tvorbu webových stránek, e-shopů, SEO optimalizaci, redesign, optimalizaci rychlosti a následnou podporu',
    url: 'https://www.weblyx.cz/sluzby',
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
      priceCurrency: 'CZK',
    },
    provider: {
      '@type': 'Organization',
      name: 'Weblyx',
      url: 'https://www.weblyx.cz',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Czech Republic',
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
            { label: "Služby", href: "/sluzby" }
          ]}
        />

        {/* HERO SECTION - Clean & Minimal */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Transparentní ceník
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Tvorba webových stránek —{" "}
              <span className="text-primary">transparentní ceny bez skrytých poplatků</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Profesionální webové stránky a e-shopy za férové ceny.
              Víte přesně, co dostanete a za kolik. Bez překvapení.
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
                      NEJOBLÍBENĚJŠÍ
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
                          {new Intl.NumberFormat('cs-CZ').format(pkg.price)}
                        </span>
                        <span className="text-xl text-muted-foreground font-semibold">Kč</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{pkg.priceNote}</p>
                    </div>

                    {/* CTA Button */}
                    <LeadButton
                      href="/poptavka"
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
                        Co dostanete:
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
                        Ideální pro:
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
                  Detailní <span className="text-primary">porovnání balíčků</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Přehledná tabulka všech funkcí a vlastností jednotlivých balíčků
                </p>
              </div>

              <Card className="overflow-hidden border-border/60 shadow-lg">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b-2 border-border">
                        <TableHead className="w-[280px] text-base font-bold py-4 sticky left-0 bg-background z-10">
                          Funkce / Vlastnost
                        </TableHead>
                        {PRICING_PACKAGES.map((pkg) => (
                          <TableHead key={pkg.id} className="text-center min-w-[160px] py-4">
                            <div className="space-y-2">
                              <p className="font-bold text-foreground text-base">{pkg.title}</p>
                              {pkg.popular && (
                                <Badge className="bg-primary text-white text-[10px] px-2 py-0.5 font-bold">
                                  NEJOBLÍBENĚJŠÍ
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
                    <h3 className="text-xl font-bold">Nevíte si rady s výběrem?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Každý projekt je jedinečný. Rádi vám připravíme nabídku přesně na míru
                      vašim potřebám a rozpočtu.
                    </p>
                    <LeadButton href="/poptavka" size="lg" className="mt-4">
                      Nezávazná poptávka zdarma
                    </LeadButton>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile: Simple info card instead of table */}
            <div className="block lg:hidden mt-12">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-bold">💡 Potřebujete porovnat balíčky?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Detailní porovnávací tabulku najdete na větší obrazovce, nebo nám napište
                    a my vám pomůžeme vybrat správný balíček.
                  </p>
                  <LeadButton href="/poptavka" size="default" className="w-full mt-3">
                    Nezávazná poptávka
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
                Doplňkové služby
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Doplňkové služby a <span className="text-primary">podpora</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nabízíme také další služby pro zlepšení výkonu, SEO a údržbu vašeho webu.
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
                      href="/poptavka"
                      variant="outline"
                      className="w-full"
                    >
                      Nezávazná poptávka
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
                    Nevíte si rady? Napište nám pro{" "}
                    <span className="text-primary">konzultaci zdarma</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Pomůžeme vám vybrat správný balíček a odpovíme na všechny vaše otázky.
                    Bez závazků.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/poptavka" size="lg" showArrow>
                    Vyplnit dotazník
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Kontaktovat nás</Link>
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
