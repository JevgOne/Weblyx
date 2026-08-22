/**
 * Shared pricing shapes. Pure data + arithmetic so client components can import
 * them; database access lives in `lib/pricing/server.ts`.
 *
 * Price is stored per package and per add-on, not derived from hours. Hours are
 * shown as a statement of scope, but the hourly rate is deliberately not on the
 * page: quoting one invites haggling over hours and caps what we can charge
 * later. Keeping price independent also lets the packages sit where the market
 * wants them instead of wherever `hours x rate` happens to land.
 */

export interface PricingPackage {
  id: string;
  name: string;
  shortDesc: string;
  hours: number;
  deliveryDays: string;
  supportMonths: number;
  price: number;
}

export interface PricingAddon {
  id: string;
  name: string;
  hours: number;
  price: number;
  /** Tier ids that may offer this add-on; a tier that includes it is absent. */
  availableTiers: string[];
}

export interface PricingData {
  tiers: PricingPackage[];
  addons: PricingAddon[];
}

/** Exactly what gets stored on the lead and shown in the admin panel. */
export interface LeadConfiguration {
  tierId: string;
  tierName: string;
  tierHours: number;
  deliveryDays: string;
  supportMonths: number;
  addons: Array<{ id: string; name: string; hours: number; price: number }>;
  totalHours: number;
  totalPrice: number;
}

/** Add-ons this package may be sold with — the rest it already includes. */
export function addonsForTier(pricing: PricingData, tierId: string): PricingAddon[] {
  return pricing.addons.filter((addon) => addon.availableTiers.includes(tierId));
}

/**
 * Delivery grows with the work added. A package's range was quoted for its own
 * hours, so leaving it untouched while the basket grows turns the summary into
 * a promise we would miss — a landing page with three add-ons is more than
 * twice the original job but used to still read "3–5 dní".
 *
 * One working day per 8 add-on hours, applied to both ends so the range keeps
 * its width.
 */
export function deliveryWithAddons(deliveryDays: string, addonHours: number): string {
  if (addonHours <= 0) return deliveryDays;

  const extra = Math.ceil(addonHours / 8);
  // Ranges come from the CMS as "3–5" (en dash) but tolerate a hyphen too.
  const match = deliveryDays.match(/^(\d+)\s*[–-]\s*(\d+)$/);
  if (match) return `${Number(match[1]) + extra}–${Number(match[2]) + extra}`;

  const single = deliveryDays.match(/^(\d+)$/);
  if (single) return String(Number(single[1]) + extra);

  // Unparseable range: better to say nothing new than to invent a number.
  return deliveryDays;
}

/**
 * Builds a configuration from IDs. Add-ons the chosen package does not offer
 * are dropped along with unknown ones, and an unknown package falls back to the
 * first, so a tampered URL can never produce a price that is not in the list —
 * nor bill for a blog on a tier that already includes one.
 */
export function buildConfiguration(
  pricing: PricingData,
  tierId: string | null | undefined,
  addonIds: string[] = []
): LeadConfiguration | null {
  if (pricing.tiers.length === 0) return null;

  const tier = pricing.tiers.find((t) => t.id === tierId) ?? pricing.tiers[0];
  const offered = addonsForTier(pricing, tier.id);
  const addons = addonIds
    .map((id) => offered.find((a) => a.id === id))
    .filter((a): a is PricingAddon => Boolean(a));

  const addonHours = addons.reduce((sum, a) => sum + a.hours, 0);

  return {
    tierId: tier.id,
    tierName: tier.name,
    tierHours: tier.hours,
    deliveryDays: deliveryWithAddons(tier.deliveryDays, addonHours),
    supportMonths: tier.supportMonths,
    addons: addons.map((a) => ({ id: a.id, name: a.name, hours: a.hours, price: a.price })),
    totalHours: tier.hours + addonHours,
    totalPrice: tier.price + addons.reduce((sum, a) => sum + a.price, 0),
  };
}

/**
 * cs-CZ groups thousands with a non-breaking space; the design calls for a
 * regular one, so it wraps and measures like the rest of the type.
 */
export function formatCzk(value: number): string {
  // \u00a0 NBSP, \u202f NNBSP — written as escapes because a literal NBSP in
  // this file is invisible and one careless rewrite turns it into a plain
  // space, which silently makes the replacement a no-op.
  return value.toLocaleString('cs-CZ').replace(/[\u00a0\u202f]/g, ' ');
}

/** Czech has three plural forms: 1, 2–4, and 5+ (0 reads better as a phrase). */
export function addonCountLabel(count: number): string {
  if (count === 0) return 'bez doplňků';
  if (count === 1) return '1 doplněk';
  if (count < 5) return `${count} doplňky`;
  return `${count} doplňků`;
}

/** "1 měsíc" / "2 měsíce" / "5 měsíců" — same three plural forms. */
export function supportMonthsLabel(months: number): string {
  if (months === 1) return '1 měsíc';
  if (months < 5) return `${months} měsíce`;
  return `${months} měsíců`;
}
