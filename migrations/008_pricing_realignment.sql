-- Migration: realign pricing with the live site and the CZ market
-- Created: 2026-08-22
--
-- Three things this fixes, all of them user decisions:
--
-- 1. Migration 006 rounded the live prices (7990/9990/24990 -> 8000/10000/25000)
--    so that price = hours x 500 would come out exact. The hourly rate is no
--    longer shown to visitors, so the prices are free again and the packages
--    get a real gap between them: a 2 000 Kc step from a one-page landing to a
--    five-page site with a blog made the landing tier pointless.
-- 2. Add-ons are now priced and scoped explicitly instead of being derived from
--    hours, and each one lists the tiers that may offer it — a package must
--    never sell something it already includes (blog, booking).
-- 3. No e-shops for now, so the e-shop add-on is retired.
--
-- Hours stay visible as a statement of scope and are re-based so every tier and
-- add-on lands near 500 Kc/h; nothing on the page divides them, but the numbers
-- should survive someone who does.

-- Packages -------------------------------------------------------------------
UPDATE pricing_tiers SET price = 7990,  hours = 16, delivery_days = '3–5'  WHERE id = 'tier-1';
UPDATE pricing_tiers SET price = 14900, hours = 30, delivery_days = '5–7'  WHERE id = 'tier-2';
-- 006 stretched this to 10–14 days, which contradicted the "web za týden"
-- promise in the hero. Back to what the live site says.
UPDATE pricing_tiers SET price = 29900, hours = 60, delivery_days = '7–10' WHERE id = 'tier-3';

-- Post-launch support, per the live site's feature lists. Was missing entirely.
ALTER TABLE pricing_tiers ADD COLUMN support_months INTEGER;
UPDATE pricing_tiers SET support_months = 1 WHERE id = 'tier-1';
UPDATE pricing_tiers SET support_months = 2 WHERE id = 'tier-2';
UPDATE pricing_tiers SET support_months = 3 WHERE id = 'tier-3';

-- Add-ons --------------------------------------------------------------------
ALTER TABLE pricing_addons ADD COLUMN price INTEGER;
-- Comma-separated tier ids. Empty/NULL would be ambiguous, so every active
-- add-on names its tiers explicitly.
ALTER TABLE pricing_addons ADD COLUMN available_tiers TEXT;

-- Blog ships inside Zakladni and Standardni web, so it is only for sale on the
-- landing page tier.
UPDATE pricing_addons SET price = 3000, available_tiers = 'tier-1'
  WHERE id = 'addon-blog';

-- Booking ships inside Standardni web. Competitors charge from 40 000 Kc for a
-- booking system on its own; 4 500 read as a rounding error.
UPDATE pricing_addons SET price = 9900, hours = 20, available_tiers = 'tier-1,tier-2'
  WHERE id = 'addon-booking';

UPDATE pricing_addons SET price = 3500, available_tiers = 'tier-1,tier-2,tier-3'
  WHERE id = 'addon-language';

UPDATE pricing_addons SET price = 2500, available_tiers = 'tier-1,tier-2,tier-3'
  WHERE id = 'addon-copywriting';

-- Retired: we do not build or integrate e-shops for now.
UPDATE pricing_addons SET active = 0 WHERE id = 'addon-eshop';
