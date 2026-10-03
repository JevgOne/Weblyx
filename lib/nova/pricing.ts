/**
 * Typed fallback for the price configurator, used only when Turso is
 * unreachable — the live numbers come from `pricing_tiers` / `pricing_addons`
 * via `lib/pricing/server.ts`.
 *
 * Keep in sync with migrations 008, 010 and 016.
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
    price: 9990,
  },
  {
    id: 'tier-3',
    name: 'Standardní web',
    shortDesc: '10+ podstránek, na míru',
    hours: 60,
    deliveryDays: '7–10',
    supportMonths: 3,
    price: 24900,
  },
];

/**
 * `availableTiers` omits every package that already includes the add-on: blog
 * ships with Základní and Standardní web, booking with Standardní. Landing page
 * gets the link to an external booking service instead of a booking system.
 *
 * Hours are what the work actually takes with today's tooling, measured on our
 * past client projects (October 2026) — not the pre-AI estimates they replaced.
 */
export const FALLBACK_ADDONS: PricingAddon[] = [
  { id: 'addon-blog', name: 'Blog s CMS editorem', hours: 4, price: 1990, kind: 'build', supportMonths: 0, availableTiers: ['tier-1'] },
  { id: 'addon-booking', name: 'Rezervační systém', hours: 6, price: 3990, kind: 'build', supportMonths: 0, availableTiers: ['tier-2'] },
  { id: 'addon-booking-external', name: 'Napojení na rezervační systém (Reservio, Notino…)', hours: 1, price: 990, kind: 'build', supportMonths: 0, availableTiers: ['tier-1', 'tier-2'] },
  { id: 'addon-payments', name: 'Online platby kartou', hours: 6, price: 2990, kind: 'build', supportMonths: 0, availableTiers: ['tier-2', 'tier-3'] },
  { id: 'addon-language', name: 'Druhý jazyk webu', hours: 2, price: 1990, kind: 'build', supportMonths: 0, availableTiers: ['tier-1', 'tier-2'] },
  { id: 'addon-language-large', name: 'Druhý jazyk webu', hours: 6, price: 3490, kind: 'build', supportMonths: 0, availableTiers: ['tier-3'] },
  { id: 'addon-copywriting', name: 'Copywriting textů', hours: 3, price: 1490, kind: 'build', supportMonths: 0, availableTiers: ['tier-1', 'tier-2', 'tier-3'] },
  // Prepaid for a year, so "Měsíční poplatky 0 Kč" in the summary stays true.
  // Covers updates, backups, support and up to 6 hours of small edits.
  { id: 'addon-maintenance', name: 'Roční údržba a podpora', hours: 6, price: 2990, kind: 'support', supportMonths: 12, availableTiers: ['tier-1', 'tier-2', 'tier-3'] },
];

export const FALLBACK_PRICING: PricingData = {
  tiers: FALLBACK_TIERS,
  addons: FALLBACK_ADDONS,
};

/** Default selection: Základní web, no add-ons. */
export const DEFAULT_TIER_ID = 'tier-2';
