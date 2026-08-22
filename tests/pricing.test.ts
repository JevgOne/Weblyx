import { describe, it, expect } from 'vitest';
import {
  addonsForTier,
  buildConfiguration,
  deliveryWithAddons,
  formatCzk,
  addonCountLabel,
  supportMonthsLabel,
  type PricingData,
} from '@/lib/pricing/types';
import { FALLBACK_PRICING, DEFAULT_TIER_ID } from '@/lib/nova/pricing';

const pricing: PricingData = {
  tiers: [
    { id: 'tier-1', name: 'Landing page', shortDesc: '1 stránka', hours: 16, deliveryDays: '3–5', supportMonths: 1, price: 7990 },
    { id: 'tier-2', name: 'Základní web', shortDesc: '3–5 podstránek', hours: 30, deliveryDays: '5–7', supportMonths: 2, price: 14900 },
    { id: 'tier-3', name: 'Standardní web', shortDesc: '10+ podstránek', hours: 60, deliveryDays: '7–10', supportMonths: 3, price: 29900 },
  ],
  addons: [
    // Blog ships inside tier-2 and tier-3, so only the landing page may buy it.
    { id: 'addon-blog', name: 'Blog s CMS editorem', hours: 6, price: 3000, availableTiers: ['tier-1'] },
    { id: 'addon-booking', name: 'Rezervační systém', hours: 20, price: 9900, availableTiers: ['tier-1', 'tier-2'] },
    { id: 'addon-copy', name: 'Copywriting textů', hours: 5, price: 2500, availableTiers: ['tier-1', 'tier-2', 'tier-3'] },
  ],
};

describe('addonsForTier', () => {
  it('hides what a package already includes', () => {
    expect(addonsForTier(pricing, 'tier-1').map((a) => a.id)).toEqual([
      'addon-blog',
      'addon-booking',
      'addon-copy',
    ]);
    // tier-2 includes the blog, tier-3 includes blog and booking.
    expect(addonsForTier(pricing, 'tier-2').map((a) => a.id)).toEqual(['addon-booking', 'addon-copy']);
    expect(addonsForTier(pricing, 'tier-3').map((a) => a.id)).toEqual(['addon-copy']);
  });

  it('offers nothing for an unknown tier rather than everything', () => {
    expect(addonsForTier(pricing, 'nope')).toEqual([]);
  });
});

describe('deliveryWithAddons', () => {
  it('leaves the package range alone when nothing is added', () => {
    expect(deliveryWithAddons('3–5', 0)).toBe('3–5');
    expect(deliveryWithAddons('3–5', -1)).toBe('3–5');
  });

  it('adds one working day per 8 add-on hours, keeping the range width', () => {
    expect(deliveryWithAddons('3–5', 6)).toBe('4–6');
    expect(deliveryWithAddons('3–5', 8)).toBe('4–6');
    expect(deliveryWithAddons('3–5', 9)).toBe('5–7');
    expect(deliveryWithAddons('7–10', 31)).toBe('11–14');
  });

  it('handles a single number and a hyphen as well as an en dash', () => {
    expect(deliveryWithAddons('5', 8)).toBe('6');
    expect(deliveryWithAddons('3-5', 8)).toBe('4–6');
  });

  it('returns an unparseable range untouched instead of inventing a number', () => {
    expect(deliveryWithAddons('do týdne', 20)).toBe('do týdne');
    expect(deliveryWithAddons('', 20)).toBe('');
  });
});

describe('buildConfiguration', () => {
  it('sums the stored prices rather than recomputing them from hours', () => {
    const cfg = buildConfiguration(pricing, 'tier-2', ['addon-booking', 'addon-copy']);
    expect(cfg).not.toBeNull();
    expect(cfg!.tierId).toBe('tier-2');
    expect(cfg!.tierHours).toBe(30);
    expect(cfg!.supportMonths).toBe(2);
    expect(cfg!.totalHours).toBe(30 + 20 + 5);
    expect(cfg!.totalPrice).toBe(14900 + 9900 + 2500);
  });

  it('never bills for an add-on the chosen package already includes', () => {
    const cfg = buildConfiguration(pricing, 'tier-3', ['addon-blog', 'addon-booking', 'addon-copy']);
    expect(cfg!.addons.map((a) => a.id)).toEqual(['addon-copy']);
    expect(cfg!.totalPrice).toBe(29900 + 2500);
  });

  it('stretches delivery once add-ons are selected', () => {
    expect(buildConfiguration(pricing, 'tier-1', [])!.deliveryDays).toBe('3–5');
    // 6 + 20 + 5 = 31 add-on hours -> +4 days
    const loaded = buildConfiguration(pricing, 'tier-1', ['addon-blog', 'addon-booking', 'addon-copy']);
    expect(loaded!.deliveryDays).toBe('7–9');
  });

  it('works with no add-ons at all (default arg and empty array)', () => {
    const a = buildConfiguration(pricing, 'tier-1');
    const b = buildConfiguration(pricing, 'tier-1', []);
    expect(a!.totalPrice).toBe(7990);
    expect(a!.addons).toEqual([]);
    expect(b).toEqual(a);
  });

  it('drops unknown add-on IDs instead of throwing', () => {
    const cfg = buildConfiguration(pricing, 'tier-1', ['addon-blog', 'nope', '', 'DROP TABLE']);
    expect(cfg!.addons.map((a) => a.id)).toEqual(['addon-blog']);
    expect(cfg!.totalPrice).toBe(7990 + 3000);
  });

  it('falls back to the first package for an unknown/empty/null tier ID', () => {
    for (const bad of ['nope', '', null, undefined]) {
      const cfg = buildConfiguration(pricing, bad as any, []);
      expect(cfg!.tierId).toBe('tier-1');
      expect(cfg!.totalPrice).toBe(7990);
    }
  });

  it('returns null when there are no packages', () => {
    expect(buildConfiguration({ tiers: [], addons: [] }, 'tier-1', [])).toBeNull();
  });

  it('does not mutate the source pricing data', () => {
    const snapshot = JSON.stringify(pricing);
    buildConfiguration(pricing, 'tier-2', ['addon-booking']);
    expect(JSON.stringify(pricing)).toBe(snapshot);
  });
});

describe('formatCzk', () => {
  it('groups thousands with a plain space (U+0020), not NBSP/NNBSP', () => {
    const out = formatCzk(7990);
    expect(out).toBe('7 990');
    expect([...out].map((c) => c.codePointAt(0))).not.toContain(0x00a0);
    expect([...out].map((c) => c.codePointAt(0))).not.toContain(0x202f);
  });

  it('formats the real price points', () => {
    expect(formatCzk(14900)).toBe('14 900');
    expect(formatCzk(29900)).toBe('29 900');
    expect(formatCzk(1000000)).toBe('1 000 000');
  });

  it('handles small numbers and zero without a separator', () => {
    expect(formatCzk(0)).toBe('0');
    expect(formatCzk(999)).toBe('999');
  });
});

describe('addonCountLabel', () => {
  it('uses the three Czech plural forms', () => {
    expect(addonCountLabel(0)).toBe('bez doplňků');
    expect(addonCountLabel(1)).toBe('1 doplněk');
    expect(addonCountLabel(4)).toBe('4 doplňky');
    expect(addonCountLabel(5)).toBe('5 doplňků');
  });
});

describe('supportMonthsLabel', () => {
  it('uses the three Czech plural forms', () => {
    expect(supportMonthsLabel(1)).toBe('1 měsíc');
    expect(supportMonthsLabel(2)).toBe('2 měsíce');
    expect(supportMonthsLabel(4)).toBe('4 měsíce');
    expect(supportMonthsLabel(5)).toBe('5 měsíců');
  });
});

describe('fallback price list (lib/nova/pricing.ts)', () => {
  it('matches migration 008 and the live site', () => {
    expect(FALLBACK_PRICING.tiers.map((t) => t.price)).toEqual([7990, 14900, 29900]);
    expect(FALLBACK_PRICING.tiers.map((t) => t.hours)).toEqual([16, 30, 60]);
    expect(FALLBACK_PRICING.tiers.map((t) => t.supportMonths)).toEqual([1, 2, 3]);
    expect(FALLBACK_PRICING.tiers.map((t) => t.deliveryDays)).toEqual(['3–5', '5–7', '7–10']);
  });

  it('gives every package a real gap from the one below it', () => {
    const prices = FALLBACK_PRICING.tiers.map((t) => t.price);
    for (let i = 1; i < prices.length; i++) {
      // A 2 000 Kc step made the landing tier pointless; require at least 1.5x.
      expect(prices[i] / prices[i - 1]).toBeGreaterThan(1.5);
    }
  });

  it('no longer sells e-shop work', () => {
    expect(FALLBACK_PRICING.addons.some((a) => a.id === 'addon-eshop')).toBe(false);
  });

  it('scopes every add-on to at least one existing tier', () => {
    const ids = new Set(FALLBACK_PRICING.tiers.map((t) => t.id));
    for (const addon of FALLBACK_PRICING.addons) {
      expect(addon.availableTiers.length).toBeGreaterThan(0);
      for (const tierId of addon.availableTiers) expect(ids.has(tierId)).toBe(true);
    }
  });

  it('never offers the blog on a package that includes it', () => {
    const blog = FALLBACK_PRICING.addons.find((a) => a.id === 'addon-blog');
    expect(blog!.availableTiers).toEqual(['tier-1']);
  });

  it('the default tier ID exists in the fallback list', () => {
    expect(FALLBACK_PRICING.tiers.some((t) => t.id === DEFAULT_TIER_ID)).toBe(true);
  });
});
