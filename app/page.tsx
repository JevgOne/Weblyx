import dynamic from "next/dynamic";
import { Hero } from "@/components/home/hero";
import { SocialProofStats } from "@/components/home/social-proof-stats";
import { TargetAudience } from "@/components/home/target-audience";
import { BeforeAfter } from "@/components/home/before-after";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { Portfolio } from "@/components/home/portfolio";
import { Reviews } from "@/components/home/reviews";
import { ClientLogos } from "@/components/home/client-logos";
import { TrustBadges } from "@/components/home/trust-badges";
import { FAQ } from "@/components/home/faq";
import { CaseStudy } from "@/components/home/case-study";

// Revalidate every 60 seconds
export const revalidate = 60;

// Dynamic imports for heavy below-the-fold client components (code splitting)
const loadingSpinner = <div className="py-24 bg-muted/30"><div className="container mx-auto px-4 text-center"><div className="h-6 w-6 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div></div>;
const Pricing = dynamic(() => import("@/components/home/pricing").then(mod => ({ default: mod.Pricing })), { loading: () => loadingSpinner });
const WebPriceCalculator = dynamic(() => import("@/components/calculator/WebPriceCalculator").then(mod => ({ default: mod.WebPriceCalculator })), { loading: () => loadingSpinner });
const FreeAudit = dynamic(() => import("@/components/home/free-audit").then(mod => ({ default: mod.FreeAudit })), { loading: () => loadingSpinner });
const ContactWow = dynamic(() => import("@/components/home/contact-wow").then(mod => ({ default: mod.ContactWow })), { loading: () => loadingSpinner });
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateOffersSchema,
  generateLocalBusinessSchema,
} from "@/lib/schema-org";
import { generateServiceSchema, generateSpecialAnnouncementSchema, generateReviewsSchema } from "@/lib/schema-generators";
import {
  getAllFAQItems,
  getAllPricingTiers,
  getSocialProofData,
  getTargetAudienceData,
  getBeforeAfterData,
  getTrustBadgesData,
  getFreeAuditData,
} from "@/lib/turso/cms";
import { PricingTier, FAQItem } from "@/types/cms";
import { getPublishedReviews } from "@/lib/turso/reviews";
import { getLocale } from "next-intl/server";

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
  const locale = await getLocale() as "cs" | "de";

  // Fetch all data server-side in parallel (1 round trip)
  const [faqItems, pricingTiers, reviews, socialProofData, targetAudienceData, beforeAfterData, trustBadgesData, freeAuditData] = await Promise.all([
    getFAQItems(),
    getPricingTiers(),
    getPublishedReviews(locale).catch(() => []),
    getSocialProofData().catch(() => null),
    getTargetAudienceData().catch(() => null),
    getBeforeAfterData().catch(() => null),
    getTrustBadgesData().catch(() => null),
    getFreeAuditData().catch(() => null),
  ]);

  // Resolve locale-specific CMS data
  const socialProof = socialProofData?.[locale] || null;
  const targetAudience = targetAudienceData?.[locale] || null;
  const beforeAfter = beforeAfterData?.[locale] || null;
  const trustBadges = trustBadgesData?.[locale] || null;
  const freeAudit = freeAuditData?.[locale] || null;

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

  // Individual Review schemas for each published review
  const reviewSchemas = generateReviewsSchema(
    reviews.map(r => ({
      authorName: r.authorName,
      authorImage: r.authorImage,
      rating: r.rating,
      text: r.text,
      date: r.date,
      locale: r.locale,
    }))
  );

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

      {/* Individual Review schemas for rich snippets */}
      {reviewSchemas.map((schema, index) => (
        <JsonLd key={`review-${index}`} data={schema} />
      ))}

      <main className="min-h-screen">
        <Hero />
        <SocialProofStats cmsData={socialProof} />
        <TargetAudience cmsData={targetAudience} />
        <BeforeAfter cmsData={beforeAfter} />
        <Services />
        <Process />
        <Portfolio />
        <CaseStudy />
        <Reviews />
        <ClientLogos />
        <TrustBadges cmsData={trustBadges} />
        <Pricing serverTiers={pricingTiers} />
        <WebPriceCalculator embedded />
        <FAQ />
        <FreeAudit cmsData={freeAudit} />
        <ContactWow />
      </main>
    </>
  );
}
