import { executeQuery } from '@/lib/turso';
import { FALLBACK_PRICING } from '@/lib/nova/pricing';
import type { PricingAddon, PricingData, PricingPackage } from './types';

/**
 * Packages and add-ons for the configurator. Price is read, not computed:
 * migration 008 moved pricing off `hours x rate` so the tiers can sit where the
 * market wants them. Falls back to the typed constants when Turso is
 * unreachable, so the configurator never renders empty.
 */
export async function getPricingData(): Promise<PricingData> {
  try {
    const tierRows = await executeQuery<any>(
      `SELECT id, name, short_desc, description, hours, delivery_days, support_months, price
         FROM pricing_tiers
        WHERE active = 1 AND hours IS NOT NULL
        ORDER BY "order" ASC`
    );

    const addonRows = await executeQuery<any>(
      `SELECT id, name, hours, price, available_tiers
         FROM pricing_addons
        WHERE active = 1
        ORDER BY "order" ASC`
    );

    const tiers: PricingPackage[] = tierRows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      shortDesc: String(row.short_desc || row.description || ''),
      hours: Number(row.hours),
      deliveryDays: String(row.delivery_days || ''),
      supportMonths: Number(row.support_months) || 0,
      price: Number(row.price),
    }));

    if (tiers.length === 0) return FALLBACK_PRICING;

    const addons: PricingAddon[] = addonRows
      // An add-on with no tiers listed is unsellable rather than sellable
      // everywhere: silently offering one on a package that already includes it
      // is the bug migration 008 exists to prevent.
      .filter((row) => String(row.available_tiers || '').trim().length > 0)
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        hours: Number(row.hours),
        price: Number(row.price),
        availableTiers: String(row.available_tiers)
          .split(',')
          .map((id: string) => id.trim())
          .filter(Boolean),
      }));

    return { tiers, addons };
  } catch (error) {
    console.error('Error loading pricing data, using fallback:', error);
    return FALLBACK_PRICING;
  }
}
