import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowRight,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";
import { Service as ServiceType } from "@/types/cms";

export const metadata: Metadata = {
  title: "Tvorba webových stránek, e-shopů a SEO | Od 10 000 Kč",
  description: "⚡ Rychlá tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč), e-shopy na míru, SEO optimalizace. Web do týdne (5-7 dní), Next.js místo WordPressu. Kolik stojí web? Od 10K!",
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
    title: "Tvorba webových stránek, e-shopů a SEO | Od 10 000 Kč",
    description: "⚡ Rychlá tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč). Web do týdne, Next.js místo WordPressu.",
    url: "https://weblyx.cz/sluzby",
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
    canonical: "https://weblyx.cz/sluzby"
  }
};

async function getServicesFromFirestore() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://weblyx.cz'}/api/services`, {
      cache: 'no-store',
    });
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      return result.data;
    }
  } catch (error) {
    console.error('Error fetching services:', error);
  }
  return null;
}

export default async function ServicesPage() {
  // Try to load from Firestore first
  const firestoreServices = await getServicesFromFirestore();

  // Fallback hardcoded services
  const hardcodedServices = [
    {
      icon: Globe,
      title: "Tvorba webových stránek",
      slug: "web",
      price: "od 10 000 Kč",
      imageUrl: undefined, // Optional: Add image URL from Firebase Storage
      description:
        "Vytvoříme pro vás moderní, responzivní webové stránky přizpůsobené na míru vašim potřebám a cílové skupině.",
      includes: [
        "Responzivní design (mobil, tablet, desktop)",
        "Moderní a čistý design",
        "Základní SEO optimalizace",
        "Kontaktní formulář",
        "Google Analytics integrace",
        "Rychlé načítání (< 2s)",
        "1 měsíc podpora zdarma",
        "Školení pro správu webu",
      ],
      ideal: ["Malé a střední firmy", "Živnostníci", "Neziskové organizace", "Prezentační weby"],
    },
    {
      icon: ShoppingCart,
      title: "E-shopy",
      slug: "eshop",
      price: "od 85 000 Kč",
      description:
        "Kompletní e-commerce řešení pro online prodej s platebními branami, správou produktů a objednávek.",
      includes: [
        "Katalog produktů s variantami",
        "Nákupní košík a checkout",
        "Platební brány (GoPay, Stripe, PayPal)",
        "Doprava (Zásilkovna, PPL, Česká pošta)",
        "Admin panel pro správu",
        "Správa skladu a objednávek",
        "Email notifikace",
        "SEO optimalizace pro produkty",
        "6 měsíců podpora zdarma",
      ],
      ideal: ["Online obchody", "Výrobci produktů", "Velkoobchod", "B2B i B2C prodej"],
    },
    {
      icon: TrendingUp,
      title: "SEO optimalizace",
      slug: "seo",
      price: "od 5 000 Kč/měsíc",
      description:
        "Dostaňte se na přední pozice ve vyhledávačích. Kompletní on-page i off-page SEO pro lepší viditelnost.",
      includes: [
        "Keyword research",
        "On-page optimalizace",
        "Technické SEO (rychlost, Core Web Vitals)",
        "Content optimalizace",
        "Meta tags a structured data",
        "Link building",
        "Měsíční reporty a analytics",
        "Competitor analysis",
      ],
      ideal: ["Existující weby", "E-shopy", "Blogy a magazíny", "Lokální firmy"],
    },
    {
      icon: Palette,
      title: "Redesign webu",
      slug: "redesign",
      price: "od 15 000 Kč",
      description:
        "Modernizace zastaralých webů. Nový design, lepší UX, vyšší konverze při zachování vaší značky.",
      includes: [
        "Analýza současného webu",
        "Nový moderní design",
        "Zlepšení UX/UI",
        "Optimalizace pro mobilní zařízení",
        "Migrace obsahu",
        "SEO redirecty",
        "Vyšší rychlost načítání",
        "3 měsíce podpora zdarma",
      ],
      ideal: ["Zastaralé weby", "Pomalé weby", "Non-responzivní weby", "Nízká konverze"],
    },
    {
      icon: Zap,
      title: "Optimalizace rychlosti",
      slug: "speed",
      price: "od 8 000 Kč",
      description:
        "Zrychlení načítání webu pro lepší SEO a uživatelskou zkušenost. Cíl: < 2 sekundy.",
      includes: [
        "Audit výkonu webu",
        "Optimalizace obrázků",
        "Minifikace CSS/JS",
        "Lazy loading",
        "Caching strategie",
        "CDN implementace",
        "Core Web Vitals optimalizace",
        "Lighthouse score > 90",
      ],
      ideal: ["Pomalé weby", "E-shopy", "Content-heavy weby", "Vysoká návštěvnost"],
    },
    {
      icon: HeadphonesIcon,
      title: "Údržba a podpora",
      slug: "maintenance",
      price: "od 2 000 Kč/měsíc",
      description:
        "Pravidelné aktualizace, zálohy a technická podpora. Váš web bude vždy funkční a bezpečný.",
      includes: [
        "Pravidelné aktualizace systému",
        "Bezpečnostní zálohy",
        "Monitoring výkonu a dostupnosti",
        "Technická podpora (email, telefon)",
        "Malé úpravy obsahu",
        "Opravy bugů",
        "Měsíční reporty",
        "Prioritní reakce na problémy",
      ],
      ideal: ["Všechny typy webů", "E-shopy", "Kritické weby", "Dlouhodobá spolupráce"],
    },
  ];

  // Use Firestore services if available, otherwise fallback to hardcoded
  const services = firestoreServices && firestoreServices.length > 0
    ? firestoreServices.map((fsService: any) => {
        // Map Firestore service to expected format
        // Find matching hardcoded service for additional data (price, includes, ideal)
        const hardcodedMatch = hardcodedServices.find(hs =>
          hs.title.toLowerCase().includes(fsService.title.toLowerCase().split(' ')[0])
        );

        return {
          icon: Globe, // Default icon, could be mapped based on fsService.icon
          title: fsService.title,
          slug: fsService.id,
          price: hardcodedMatch?.price || "Cena na dotaz",
          imageUrl: fsService.imageUrl,
          description: fsService.description,
          includes: fsService.features || hardcodedMatch?.includes || [],
          ideal: hardcodedMatch?.ideal || [],
        };
      })
    : hardcodedServices;

  // Generate breadcrumb schema
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Domů', url: 'https://weblyx.cz' },
    { name: 'Služby', url: 'https://weblyx.cz/sluzby' },
  ];

  // Generate webpage schema
  const webpageSchema = generateWebPageSchema({
    name: 'Služby',
    description: 'Nabízíme tvorbu webových stránek, e-shopů, SEO optimalizaci, redesign, optimalizaci rychlosti a následnou podporu',
    url: 'https://weblyx.cz/sluzby',
    breadcrumbs,
  });

  // Convert services to Service schema format
  const servicesForSchema: ServiceType[] = services.map((service) => ({
    id: service.slug,
    title: service.title,
    description: service.description,
    icon: service.icon.displayName || 'Globe',
    features: service.includes,
    order: services.indexOf(service),
    enabled: true,
  }));

  // Generate individual service schemas
  const serviceSchemas = servicesForSchema.map(service => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'Weblyx',
      url: 'https://weblyx.cz',
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
        {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Naše <span className="text-primary">služby</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Komplexní řešení pro vaši online přítomnost. Od jednoduchých webů po pokročilé
            e-shopy a SEO optimalizaci.
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl space-y-24">
          {services.map((service, index) => (
            <div
              key={index}
              id={service.slug}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {service.price}
                  </Badge>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold">{service.title}</h2>
                <p className="text-lg text-muted-foreground">{service.description}</p>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Co zahrnuje:</h3>
                  <ul className="space-y-2">
                    {service.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Pro koho je vhodné:</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.ideal.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button asChild size="lg">
                  <Link href="/poptavka">
                    Nezávazná poptávka
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <Card className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <CardContent className="p-0 aspect-square flex items-center justify-center overflow-hidden">
                  {service.imageUrl ? (
                    <div className="w-full h-full relative">
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <service.icon className="h-24 w-24 text-primary/30 mx-auto" />
                        <p className="text-sm text-muted-foreground">Visual placeholder</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Nevíte, kterou službu potřebujete?
            </h2>
            <p className="text-lg text-muted-foreground">
              Napište nám a my vám poradíme nejlepší řešení pro váš projekt.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/poptavka">Vyplnit dotazník</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/kontakt">Kontaktovat nás</Link>
            </Button>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
