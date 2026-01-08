import type { Metadata } from "next";
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

// Force dynamic rendering to avoid build timeout
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Tvorba webových stránek, e-shopů a SEO | Od 10 000 Kč (AKCE 7 990 Kč)",
  description: "⚡ Rychlá tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč), e-shopy na míru, SEO optimalizace. Web za 5-7 pracovních dní, Next.js místo WordPressu. Transparentní ceny.",
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
    title: "Tvorba webových stránek, e-shopů a SEO | Od 10 000 Kč (AKCE 7 990 Kč)",
    description: "⚡ Rychlá tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč). Web za 5-7 dní, Next.js místo WordPressu. Transparentní ceník.",
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
  alternates: {
    canonical: "https://www.weblyx.cz/sluzby"
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

  // Create all unique feature names from all services
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
    // Map features: included if present in this service's features array
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
  // Fetch active services from database
  const dbServices = await getActiveServices();

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
              Transparentní ceny.{" "}
              <span className="text-primary">Žádné skryté poplatky.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Profesionální webové stránky a e-shopy za férové ceny.
              Víte přesně, co dostanete a za kolik. Bez překvapení.
            </p>
          </div>
        </section>

        {/* PRICING CARDS - Side-by-side with prominent pricing */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Pricing cards grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-20">
              {PRICING_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                    pkg.popular
                      ? "border-primary/50 shadow-xl scale-105 lg:scale-110 z-10"
                      : "hover:border-primary/30"
                  }`}
                >
                  {/* Popular badge */}
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold rounded-bl-lg flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      NEJOBLÍBENĚJŠÍ
                    </div>
                  )}

                  <CardHeader className="space-y-6 pt-8">
                    {/* Package name and description */}
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{pkg.title}</h3>
                      <p className="text-sm text-muted-foreground h-10">
                        {pkg.description}
                      </p>
                    </div>

                    {/* LARGE PRICE - Very prominent */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-6xl font-black text-primary">
                          {new Intl.NumberFormat('cs-CZ').format(pkg.price)}
                        </span>
                        <span className="text-xl text-muted-foreground font-medium">
                          Kč
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pkg.priceNote}
                      </p>
                    </div>

                    {/* CTA Button - Prominent */}
                    <LeadButton
                      href="/poptavka"
                      size="lg"
                      className={`w-full ${
                        pkg.popular
                          ? "bg-primary hover:bg-primary/90 text-white shadow-lg"
                          : ""
                      }`}
                      showArrow
                    >
                      {pkg.cta}
                    </LeadButton>
                  </CardHeader>

                  <CardContent className="space-y-6 pb-8">
                    {/* Key features - First 7 most important */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Zahrnuje:
                      </p>
                      <ul className="space-y-3">
                        {pkg.features.slice(0, 7).map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            {feature.included === true || typeof feature.included === 'string' ? (
                              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/30 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <span className={`text-sm ${
                                feature.included === true || typeof feature.included === 'string'
                                  ? "text-foreground"
                                  : "text-muted-foreground/50 line-through"
                              }`}>
                                {feature.name}
                              </span>
                              {typeof feature.included === 'string' && (
                                <span className="text-sm font-semibold text-primary ml-2">
                                  {feature.included}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ideal for */}
                    <div className="pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Ideální pro:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pkg.ideal}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* COMPARISON TABLE - Desktop only */}
            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold text-center mb-8">
                Detailní <span className="text-primary">porovnání balíčků</span>
              </h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[300px] text-base font-bold">
                          Funkce
                        </TableHead>
                        {PRICING_PACKAGES.map((pkg) => (
                          <TableHead key={pkg.id} className="text-center">
                            <div className="space-y-1">
                              <p className="font-bold text-foreground">{pkg.title}</p>
                              {pkg.popular && (
                                <Badge variant="default" className="text-[10px] px-2 py-0">
                                  POPULAR
                                </Badge>
                              )}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Group features by extracting unique feature names */}
                      {PRICING_PACKAGES[0].features.map((_, featureIndex) => {
                        const featureName = PRICING_PACKAGES[0].features[featureIndex].name;

                        return (
                          <TableRow key={featureIndex}>
                            <TableCell className="font-medium">
                              {featureName}
                            </TableCell>
                            {PRICING_PACKAGES.map((pkg) => {
                              const feature = pkg.features[featureIndex];
                              const isIncluded = feature.included === true || typeof feature.included === 'string';

                              return (
                                <TableCell key={pkg.id} className="text-center">
                                  {feature.included === true ? (
                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                  ) : feature.included === false ? (
                                    <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                  ) : (
                                    <span className="text-sm font-semibold text-primary">
                                      {feature.included}
                                    </span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
