import dynamic from "next/dynamic";
import { Hero } from "@/components/home/hero";
import { TargetAudience } from "@/components/home/target-audience";
import { USPSection } from "@/components/home/usp-section";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { Portfolio } from "@/components/home/portfolio";
import { Reviews } from "@/components/home/reviews";
import { Pricing } from "@/components/home/pricing";
import { FAQ } from "@/components/home/faq";
import { CTASection } from "@/components/home/cta-section";

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
} from "@/lib/schema-org";
import { getServerFAQItems } from "@/lib/firestore-server";
import { adminDbInstance } from "@/lib/firebase-admin";
import { PricingTier } from "@/types/cms";

async function getPricingTiers(): Promise<PricingTier[]> {
  try {
    if (!adminDbInstance) {
      return [];
    }

    const snapshot = await adminDbInstance
      .collection('pricing_tiers')
      .orderBy('order')
      .get();

    if (snapshot.empty) {
      return [];
    }

    const tiers: PricingTier[] = [];
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      if (data.enabled) {
        tiers.push({ id: doc.id, ...data } as PricingTier);
      }
    });

    return tiers;
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch data for schemas
  const [faqItems, pricingTiers] = await Promise.all([
    getServerFAQItems(),
    getPricingTiers(),
  ]);

  // Filter enabled FAQs
  const enabledFaqs = faqItems.filter(faq => faq.enabled);

  // Generate schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const faqSchema = enabledFaqs.length > 0 ? generateFAQSchema(enabledFaqs) : null;
  const offersSchema = pricingTiers.length > 0 ? generateOffersSchema(pricingTiers) : null;

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {offersSchema && offersSchema.map((offer, index) => (
        <JsonLd key={index} data={offer} />
      ))}

      <main className="min-h-screen">
        <Hero />
        <TargetAudience />
        <USPSection />
        <Services />
        <Process />
        <Portfolio />
        <Reviews />
        <Pricing />
        <FAQ />
        <CTASection />
        <ContactWow />
      </main>
    </>
  );
}
