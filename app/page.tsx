import dynamic from "next/dynamic";
import { Hero } from "@/components/home/hero";
import { TrustBar } from "@/components/home/trust-bar";
import { BeforeAfter } from "@/components/home/before-after";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { Portfolio } from "@/components/home/portfolio";
import { Reviews } from "@/components/home/reviews";
import { CaseStudy } from "@/components/home/case-study";
import { FAQ } from "@/components/home/faq";

// Revalidate every 60 seconds
export const revalidate = 60;

// Dynamic imports for heavy below-the-fold client components (code splitting)
const loadingSpinner = <div className="py-24 bg-muted/30"><div className="container mx-auto px-4 text-center"><div className="h-6 w-6 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div></div>;
const Pricing = dynamic(() => import("@/components/home/pricing").then(mod => ({ default: mod.Pricing })), { loading: () => loadingSpinner });
const ContactWow = dynamic(() => import("@/components/home/contact-wow").then(mod => ({ default: mod.ContactWow })), { loading: () => loadingSpinner });
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateOffersSchema,
  generateLocalBusinessSchema,
} from "@/lib/schema-org";
import { generateServiceSchema } from "@/lib/schema-generators";
import {
  getAllFAQItems,
  getAllPricingTiers,
  getSocialProofData,
  getBeforeAfterData,
  getTrustBadgesData,
} from "@/lib/turso/cms";
import { PricingTier, FAQItem } from "@/types/cms";
import { getPublishedReviews } from "@/lib/turso/reviews";
import { getLocale } from "next-intl/server";
import { NovaHome } from "@/components/nova/home";
import { getPricingData } from "@/lib/pricing/server";

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
  const isCzech = locale === "cs";

  const [faqItems, pricingTiers, reviews, socialProofData, beforeAfterData, trustBadgesData, configuratorPricing] = await Promise.all([
    getFAQItems(),
    getPricingTiers(),
    getPublishedReviews(locale).catch(() => []),
    getSocialProofData().catch(() => null),
    getBeforeAfterData().catch(() => null),
    getTrustBadgesData().catch(() => null),
    getPricingData(),
  ]);

  // Resolve locale-specific CMS data
  const socialProof = socialProofData?.[locale] || null;
  const beforeAfter = beforeAfterData?.[locale] || null;
  const trustBadges = trustBadgesData?.[locale] || null;

  const enabledFaqs = faqItems;

  // Generate schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  // No aggregateRating and no Review blocks here.
  //
  // Google has not shown stars for self-serving reviews — a business rating
  // itself on its own site — since 2019, so this earned nothing. It did carry
  // risk: the markup declared five reviews while three were visible on the
  // page, which is exactly the mismatch the spam policy names. The real
  // reviews are on the Google Business Profile, which `sameAs` now points at
  // by place id, and the review markup lives on /recenze where the text of
  // every review is actually on the page.
  const localBusinessSchema = generateLocalBusinessSchema({
    priceRange: "7990 Kč - 29900 Kč",
    openingHours: ["Mo-Fr 08:00-18:00"],
  });
  const faqSchema = enabledFaqs.length > 0 ? generateFAQSchema(enabledFaqs) : null;
  const offersSchema = pricingTiers.length > 0 ? generateOffersSchema(pricingTiers) : null;

  const serviceSchema = generateServiceSchema({
    serviceName: "Profesionální tvorba webových stránek",
    description: "Tvorba webových stránek pro živnostníky a firmy. Dodání za 5-7 dní, garantované načítání pod 2 sekundy, SEO optimalizace v ceně. Česká agentura.",
    serviceType: "Web Development",
    areaServed: "Česká republika",
    offers: {
      priceCurrency: "CZK",
      priceRange: "7990-29900",
    },
  });


  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={localBusinessSchema} />
      {/* Both homepages carry a visible FAQ section again, so the schema has
          content behind it on either branch. */}
      {faqSchema && <JsonLd data={faqSchema} />}
      {offersSchema && offersSchema.map((offer, index) => (
        <JsonLd key={index} data={offer} />
      ))}
      <JsonLd data={serviceSchema} />
      {isCzech ? (
        /* weblyx.cz — the redesign. It ships its own header, footer and font;
           SiteChrome keeps the shared ones off this route. */
        <NovaHome pricing={configuratorPricing} now={new Date()} />
      ) : (
        /* seitelyx.de — unchanged. The redesign is Czech-only copy, so putting
           it here would serve German visitors a Czech homepage. */
        <main className="min-h-screen">
          {/* 1. Hero — value proposition + CTA */}
          <Hero />

          {/* 2. Trust Bar — stats + badges + client logos (merged) */}
          <TrustBar socialProofData={socialProof} trustBadgesData={trustBadges} />

          {/* 3. Problem → Solution — before/after comparison + case study metrics */}
          <BeforeAfter cmsData={beforeAfter} />
          <CaseStudy />

          {/* 4. Services */}
          <Services />

          {/* 5. Process */}
          <Process />

          {/* 6. Portfolio + Reviews */}
          <Portfolio />
          <Reviews />

          {/* 7. Pricing */}
          <Pricing serverTiers={pricingTiers} />

          {/* 8. FAQ */}
          <FAQ />

          {/* 9. Contact */}
          <ContactWow />
        </main>
      )}
    </>
  );
}
