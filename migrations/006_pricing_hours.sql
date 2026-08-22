-- Migration: hour-based pricing
-- Created: 2026-08-17
--
-- Packages are priced as hours x hourly rate. Hours become the input, price is
-- derived, so the configurator, the website and the admin editor cannot drift
-- apart. Additive only (ADD COLUMN / INSERT), so the code can be rolled back.

ALTER TABLE pricing_tiers ADD COLUMN hours INTEGER;
ALTER TABLE pricing_tiers ADD COLUMN delivery_days TEXT;
ALTER TABLE pricing_tiers ADD COLUMN short_desc TEXT;

-- Backfill the three active packages (hours x 500 Kc, no charm ending)
UPDATE pricing_tiers SET hours = 16, delivery_days = '3–5', short_desc = '1 stránka, 3–5 sekcí', price = 8000 WHERE id = 'tier-1';
UPDATE pricing_tiers SET hours = 20, delivery_days = '5–7', short_desc = '3–5 podstránek, blog', price = 10000 WHERE id = 'tier-2';
UPDATE pricing_tiers SET hours = 50, delivery_days = '10–14', short_desc = '10+ podstránek, na míru', price = 25000 WHERE id = 'tier-3';

-- Packages are one-off payments; 'month' was wrong on every row
UPDATE pricing_tiers SET interval = 'one-time';

CREATE TABLE IF NOT EXISTS pricing_addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hours INTEGER NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO pricing_addons (id, name, hours, "order") VALUES ('addon-blog', 'Blog s CMS editorem', 6, 0);
INSERT OR IGNORE INTO pricing_addons (id, name, hours, "order") VALUES ('addon-booking', 'Rezervační systém', 9, 1);
INSERT OR IGNORE INTO pricing_addons (id, name, hours, "order") VALUES ('addon-language', 'Druhý jazyk webu', 7, 2);
INSERT OR IGNORE INTO pricing_addons (id, name, hours, "order") VALUES ('addon-eshop', 'Napojení na e-shop', 12, 3);
INSERT OR IGNORE INTO pricing_addons (id, name, hours, "order") VALUES ('addon-copywriting', 'Copywriting textů', 5, 4);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('hourly_rate', '500');
