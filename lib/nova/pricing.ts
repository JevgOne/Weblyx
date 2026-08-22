/**
 * Typed fallback for the price configurator, used only when Turso is
 * unreachable — the live numbers come from `pricing_tiers` / `pricing_addons`
 * via `lib/pricing/server.ts`.
 *
 * Keep in sync with migration 008.
 */

import type { PricingAddon, PricingData, PricingPackage } from '@/lib/pricing/types';

export const FALLBACK_TIERS: PricingPackage[] = [
  {
    id: 'tier-1',
    name: 'Landing page',
    shortDesc: '1 stránka, 3–5 sekcí',
    hours: 16,
    deliveryDays: '3–5',
    supportMonths: 1,
    price: 7990,
  },
  {
    id: 'tier-2',
    name: 'Základní web',
    shortDesc: '3–5 podstránek, blog',
    hours: 30,
    deliveryDays: '5–7',
    supportMonths: 2,
    price: 14900,
  },
  {
    id: 'tier-3',
    name: 'Standardní web',
    shortDesc: '10+ podstránek, na míru',
    hours: 60,
    deliveryDays: '7–10',
    supportMonths: 3,
    price: 29900,
  },
];

/**
 * `availableTiers` omits every package that already includes the add-on: blog
 * ships with Základní and Standardní web, booking with Standardní.
 */
export const FALLBACK_ADDONS: PricingAddon[] = [
  { id: 'addon-blog', name: 'Blog s CMS editorem', hours: 6, price: 3000, availableTiers: ['tier-1'] },
  { id: 'addon-booking', name: 'Rezervační systém', hours: 20, price: 9900, availableTiers: ['tier-1', 'tier-2'] },
  { id: 'addon-language', name: 'Druhý jazyk webu', hours: 7, price: 3500, availableTiers: ['tier-1', 'tier-2', 'tier-3'] },
  { id: 'addon-copywriting', name: 'Copywriting textů', hours: 5, price: 2500, availableTiers: ['tier-1', 'tier-2', 'tier-3'] },
];

export const FALLBACK_PRICING: PricingData = {
  tiers: FALLBACK_TIERS,
  addons: FALLBACK_ADDONS,
};

/** Default selection: Základní web, no add-ons. */
export const DEFAULT_TIER_ID = 'tier-2';
