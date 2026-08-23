import { getPublishedPortfolio } from "@/lib/turso/portfolio";
import { getPublishedReviews } from "@/lib/turso/reviews";
import { safeRead } from "@/lib/safe-read";
import { DEFAULT_TIER_ID } from "@/lib/nova/pricing";
import type { PricingData } from "@/lib/pricing/types";

/**
 * Numbers are counted, not typed.
 *
 * The bar used to claim "15+ dokončených projektů" and a flat "5.0" while the
 * CMS held thirteen projects — a figure nobody would ever go back and correct,
 * drifting further from the truth with every publish. Counting the same rows
 * the portfolio and reviews sections render means the bar cannot overstate
 * what the page below it shows.
 *
 * Delivery comes from the price list for the same reason: it is quoted in the
 * configurator, so it must not be restated by hand here.
 */
const BADGES = [
  "Zabezpečený HTTPS",
  "PageSpeed 90+ garance",
  "Dodání v termínu",
  "Bez skrytých poplatků",
];

/** Counts read better rounded down to a round number the claim can outlive. */
function projectsLabel(count: number): string {
  if (count >= 10) return `${Math.floor(count / 5) * 5}+`;
  return String(count);
}

export async function NovaStatsBar({ pricing }: { pricing: PricingData }) {
  const [projects, reviews] = await Promise.all([
    safeRead(() => getPublishedPortfolio("cs"), [], "nova stats: portfolio"),
    safeRead(() => getPublishedReviews("cs"), [], "nova stats: reviews"),
  ]);

  const rating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const defaultTier =
    pricing.tiers.find((t) => t.id === DEFAULT_TIER_ID) ?? pricing.tiers[0];

  // A stat with nothing behind it is dropped rather than shown as a zero.
  const stats = [
    projects.length > 0 && {
      value: projectsLabel(projects.length),
      label: "Dokončených projektů",
    },
    rating && { value: rating, label: "Google hodnocení" },
    { value: "< 2s", label: "Průměrná rychlost" },
    defaultTier?.deliveryDays && {
      value: `${defaultTier.deliveryDays} dní`,
      label: "Průměrná doba dodání",
    },
  ].filter(Boolean) as Array<{ value: string; label: string }>;

  return (
    <section
      className="border-y"
      style={{ background: "var(--n-bg-alt)", borderColor: "var(--n-border-soft)" }}
    >
      <dl
        className="nova-container nova-col4 grid gap-6 py-11 text-center"
        style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
      >
        {stats.map((stat) => (
          <div key={stat.label}>
            <dd
              className="text-[32px] font-extrabold"
              style={{ letterSpacing: "-.03em", color: "var(--n-brand-dark)" }}
            >
              {stat.value}
            </dd>
            <dt className="mt-1.5 text-sm font-medium" style={{ color: "var(--n-text-muted)" }}>
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      <div
        className="nova-container flex flex-wrap justify-center gap-x-10 gap-y-4 pb-10 text-sm font-medium"
        style={{ color: "var(--n-text-muted)" }}
      >
        {BADGES.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
    </section>
  );
}
