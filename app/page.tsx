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
import { generateServiceSchema, generateSpecialAnnouncementSchema } from "@/lib/schema-generators";
import { getAllFAQItems } from "@/lib/turso/cms";
import { getAllPricingTiers } from "@/lib/turso/cms";
import { PricingTier, FAQItem } from "@/types/cms";
import { getPublishedReviews } from "@/lib/turso/reviews";

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
  const [faqItems, pricingTiers, reviews] = await Promise.all([
    getFAQItems(),
    getPricingTiers(),
    getPublishedReviews('cs').catch(() => []),
  ]);

  // Already filtered enabled items in fetch functions
  const enabledFaqs = faqItems;

  // Generate schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  // Calculate real aggregate rating from published reviews
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : null;

  const localBusinessSchema = generateLocalBusinessSchema({
    priceRange: "10000 Kč - 85000 Kč",
    openingHours: ["Mo-Fr 09:00-18:00"],
    ...(avgRating && reviewCount >= 1 ? {
      aggregateRating: {
        ratingValue: avgRating,
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  });
  const faqSchema = enabledFaqs.length > 0 ? generateFAQSchema(enabledFaqs) : null;
  const offersSchema = pricingTiers.length > 0 ? generateOffersSchema(pricingTiers) : null;

  // Service schema WITHOUT AggregateRating (Google doesn't support it for Service type in rich results)
  // AggregateRating is on LocalBusiness schema instead
  const serviceSchema = generateServiceSchema({
    serviceName: "Profesionální tvorba webových stránek",
    description: "Tvorba webových stránek pro živnostníky a firmy. Dodání za 5-7 dní, garantované načítání pod 2 sekundy, SEO optimalizace v ceně. Česká agentura.",
    serviceType: "Web Development",
    areaServed: "Česká republika",
    offers: {
      priceCurrency: "CZK",
      priceRange: "10000-85000",
    },
  });

  // SpecialAnnouncement schema for promotional offer
  const specialAnnouncementSchema = generateSpecialAnnouncementSchema({
    name: "AKCE: Profesionální web od 7 990 Kč",
    text: "Tvorba webových stránek od 7 990 Kč. Moderní web s garantovaným načítáním pod 2 sekundy a SEO optimalizací v ceně. Česká agentura.",
    datePosted: "2026-01-01",
    expires: "2026-12-31",
    spatialCoverage: "Czech Republic",
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

      {/* SpecialAnnouncement schema for promotional offer (2025/2026) */}
      <JsonLd data={specialAnnouncementSchema} />

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
        <ContactWow />
      </main>
    </>
  );
}
