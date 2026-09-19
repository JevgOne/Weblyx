import { Manrope } from "next/font/google";

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
import { NovaChangelog } from "@/components/nova/changelog";
import { NovaFaq } from "@/components/nova/faq";
import { NovaContact } from "@/components/nova/contact";
import { NovaFooter } from "@/components/nova/footer";

import { pickAnnouncement } from "@/lib/nova/announcements";
import { DEFAULT_TIER_ID } from "@/lib/nova/pricing";
import { formatCzk, type PricingData } from "@/lib/pricing/types";

import "@/app/nova/nova.css";

/**
 * The whole redesigned homepage — shell included.
 *
 * It lives in a component rather than a route layout because the Czech
 * homepage now renders it at `/`, where the shared site chrome and the Inter
 * font belong to the German site. Keeping the wrapper here means the font
 * class and the `.nova` token scope travel with the sections wherever they are
 * mounted, instead of depending on which folder the route happens to sit in.
 */
const manrope = Manrope({
  subsets: ["latin", "latin-ext"], // latin-ext carries ě/š/č/ř/ž/ů
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export function NovaHome({ pricing, now }: { pricing: PricingData; now: Date }) {
  const prices = pricing.tiers.map((tier) => tier.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

  const defaultTier =
    pricing.tiers.find((tier) => tier.id === DEFAULT_TIER_ID) ?? pricing.tiers[0];

  return (
    <div className={`nova ${manrope.variable}`}>
      <NovaHeader />
      <main>
        <NovaHero
          fromPrice={`od ${formatCzk(lowestPrice)} Kč`}
          deliveryDays={defaultTier?.deliveryDays ?? ""}
          announcement={pickAnnouncement(now)}
        />
        <NovaStatsBar pricing={pricing} />
        <NovaClientLogos />
        <NovaPhilosophy />
        <NovaSpeedPledge />
        <NovaServices />
        <NovaProcess />
        <NovaPortfolio />
        <NovaPriceConfigurator pricing={pricing} />
        <NovaReviews />
        <NovaFaq />
        <NovaChangelog />
        <NovaContact />
      </main>
      <NovaFooter />
    </div>
  );
}
