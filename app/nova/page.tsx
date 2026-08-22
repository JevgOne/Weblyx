import { NovaHeader } from "@/components/nova/header";
import { NovaHero } from "@/components/nova/hero";
import { NovaStatsBar } from "@/components/nova/stats-bar";
import { NovaClientLogos } from "@/components/nova/client-logos";
import { NovaPhilosophy } from "@/components/nova/philosophy";
import { NovaSpeedPledge } from "@/components/nova/speed-pledge";
import { NovaServices } from "@/components/nova/services";
import { NovaProcess } from "@/components/nova/process";
import { NovaPortfolio } from "@/components/nova/portfolio";
import { NovaPriceConfigurator } from "@/components/nova/price-configurator";
import { NovaReviews } from "@/components/nova/reviews";
import { NovaContact } from "@/components/nova/contact";
import { NovaFooter } from "@/components/nova/footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPricingData } from "@/lib/pricing/server";
import { pickAnnouncement } from "@/lib/nova/announcements";
import { formatCzk } from "@/lib/pricing/types";

export const revalidate = 300;

const localBusinessSchemaBase = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Weblyx",
  description:
    "Tvorba profesionálních webových stránek pro živnostníky a malé firmy. Dodání za 5–7 pracovních dní, načítání pod 2 sekundy, SEO v ceně.",
  url: "https://www.weblyx.cz",
  telephone: "+420702110166",
  email: "info@weblyx.cz",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Revoluční 8",
    addressLocality: "Praha 1",
    addressCountry: "CZ",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: 5,
    reviewCount: 3,
    bestRating: 5,
    worstRating: 1,
  },
};

export default async function NovaPage() {
  const pricing = await getPricingData();
  const prices = pricing.tiers.map((tier) => tier.price);
  const lowestPrice = Math.min(...prices);

  const localBusinessSchema = {
    ...localBusinessSchemaBase,
    priceRange: `${lowestPrice} Kč - ${Math.max(...prices)} Kč`,
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />

      <NovaHeader />
      <main>
        <NovaHero
          fromPrice={`od ${formatCzk(lowestPrice)} Kč`}
          announcement={pickAnnouncement(new Date())}
        />
        <NovaStatsBar />
        <NovaClientLogos />
        <NovaPhilosophy />
        <NovaSpeedPledge />
        <NovaServices />
        <NovaProcess />
        <NovaPortfolio />
        <NovaPriceConfigurator pricing={pricing} />
        <NovaReviews />
        <NovaContact />
      </main>
      <NovaFooter />
    </>
  );
}
