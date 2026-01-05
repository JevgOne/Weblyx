import dynamic from "next/dynamic";
import { Hero } from "@/components/home/hero";
import { SocialProofStats } from "@/components/home/social-proof-stats";
import { TargetAudience } from "@/components/home/target-audience";
import { BeforeAfter } from "@/components/home/before-after";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { Portfolio } from "@/components/home/portfolio";
import { Reviews } from "@/components/home/reviews";
import { TrustBadges } from "@/components/home/trust-badges";
import { Pricing } from "@/components/home/pricing";
import { FAQ } from "@/components/home/faq";
import { CTASection } from "@/components/home/cta-section";

// Revalidate every 60 seconds
export const revalidate = 60;

// Dynamic import for heavy Contact component (code splitting)
const ContactWow = dynamic(() => import("@/components/home/contact-wow").then(mod => ({ default: mod.ContactWow })), {
  loading: () => <div className="py-24 bg-muted/30"><div className="container mx-auto px-4 text-center">Načítání...</div></div>,
});
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateOffersSchema,
  generateLocalBusinessSchema,
} from "@/lib/schema-org";
import { generateServiceSchema } from "@/lib/schema-generators";
import { getAllFAQItems } from "@/lib/turso/cms";
import { getAllPricingTiers } from "@/lib/turso/cms";
import { PricingTier, FAQItem } from "@/types/cms";

async function getPricingTiers(): Promise<PricingTier[]> {
  try {
    const tiers = await getAllPricingTiers();
    return tiers.filter(tier => tier.enabled);
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return [];
  }
}

async function getFAQItems(): Promise<FAQItem[]> {
  try {
    const items = await getAllFAQItems();
    return items.filter(item => item.enabled);
  } catch (error) {
    console.error('Error fetching FAQ items:', error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch data for schemas
  const [faqItems, pricingTiers] = await Promise.all([
    getFAQItems(),
    getPricingTiers(),
  ]);

  // Already filtered enabled items in fetch functions
  const enabledFaqs = faqItems;

  // Generate schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const localBusinessSchema = generateLocalBusinessSchema({
    priceRange: "10000 Kč - 85000 Kč",
    openingHours: ["Mo-Fr 09:00-18:00"],
  });
  const faqSchema = enabledFaqs.length > 0 ? generateFAQSchema(enabledFaqs) : null;
  const offersSchema = pricingTiers.length > 0 ? generateOffersSchema(pricingTiers) : null;

  // Service schema WITH AggregateRating
  // Now includes reviews since we have visible Google Reviews widget
  const serviceSchema = generateServiceSchema({
    serviceName: "Profesionální tvorba webových stránek",
    description: "Rychlý vývoj moderních webových stránek pomocí Next.js s garancí rychlosti načítání pod 2 sekundy",
    serviceType: "Web Development",
    areaServed: "Česká republika",
    offers: {
      priceCurrency: "CZK",
      priceRange: "10000-85000",
    },
    aggregateRating: {
      ratingValue: 5.0,
      reviewCount: 7,
      bestRating: 5,
      worstRating: 1,
    },
  });

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={localBusinessSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {offersSchema && offersSchema.map((offer, index) => (
        <JsonLd key={index} data={offer} />
      ))}

      {/* Enhanced Service schema with AggregateRating (2025/2026) */}
      <JsonLd data={serviceSchema} />

      <main className="min-h-screen">
        <Hero />
        <SocialProofStats />
        <TargetAudience />
        <BeforeAfter />
        <Services />
        <Process />
        <Portfolio />
        <Reviews />
        <TrustBadges />
        <Pricing />
        <FAQ />
        <CTASection />
        <ContactWow />
      </main>
    </>
  );
}
