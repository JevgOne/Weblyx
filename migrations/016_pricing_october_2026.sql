-- Migration: packages and add-ons repriced
-- Created: 2026-10-03
--
-- The add-ons were priced on pre-AI hour estimates. Measured on our own client
-- projects (commit history, October 2026) a booking system takes 3–6 hours,
-- not 20; a blog 2–4, not 6; a second language 1–2 plus half an hour a page.
-- Yearly maintenance at 24 000 Kč sat beside 53 promises of "no monthly fees"
-- while a typical client uses 2–10 hours of it a year.
--
-- Základní web moves under the 10 000 Kč line where the market's "firemní web"
-- sits, Standardní web to 24 900. Landing page stays at 7 990: the campaigns
-- are built on it. Our prices are final — we are not VAT payers — while the
-- competitors quote theirs before VAT.
--
-- Prices also live in copy; this migration updates the database copies (the
-- FAQ, the services table and five blog posts), the code was changed alongside.

UPDATE pricing_tiers SET price = 9990, updated_at = unixepoch() WHERE id = 'tier-2';
UPDATE pricing_tiers SET price = 24900, description = 'Web na míru za zlomek ceny agentury', updated_at = unixepoch() WHERE id = 'tier-3';

UPDATE services SET price_from = 9990, price_to = 9990, updated_at = unixepoch() WHERE id = '8F_bw8dr9YxTlyhyGv3Hf';
UPDATE services SET price_from = 24900, price_to = 24900,
  description = REPLACE(description, 'Co konkurence dělá za 40k a měsíc, my za 25k a týden', 'Web na míru za zlomek ceny agentury'),
  updated_at = unixepoch()
  WHERE id = 'ZgQzc3PpnG9A1bE-MFeDD';

UPDATE pricing_addons SET price = 1990, hours = 4, updated_at = unixepoch() WHERE id = 'addon-blog';
UPDATE pricing_addons SET price = 3990, hours = 6, updated_at = unixepoch() WHERE id = 'addon-booking';
UPDATE pricing_addons SET price = 1990, hours = 2, available_tiers = 'tier-1,tier-2', updated_at = unixepoch() WHERE id = 'addon-language';
UPDATE pricing_addons SET price = 1490, hours = 3, "order" = 6, updated_at = unixepoch() WHERE id = 'addon-copywriting';
UPDATE pricing_addons SET price = 2990, hours = 6, "order" = 7, updated_at = unixepoch() WHERE id = 'addon-maintenance';

INSERT OR IGNORE INTO pricing_addons (id, name, hours, "order", active, created_at, updated_at, price, available_tiers, kind, support_months) VALUES
  ('addon-booking-external', 'Napojení na Reservio / Notino', 1, 2, 1, unixepoch(), unixepoch(), 990, 'tier-1,tier-2', 'build', 0),
  ('addon-payments', 'Online platby kartou', 6, 3, 1, unixepoch(), unixepoch(), 2990, 'tier-2,tier-3', 'build', 0),
  ('addon-language-large', 'Druhý jazyk webu', 6, 5, 1, unixepoch(), unixepoch(), 3490, 'tier-3', 'build', 0);

UPDATE pricing_addons SET "order" = 4 WHERE id = 'addon-language';

UPDATE faq_items SET answer = REPLACE(REPLACE(answer, '14 900 Kč', '9 990 Kč'), '29 900 Kč', '24 900 Kč') WHERE answer LIKE '%14 900 Kč%' OR answer LIKE '%29 900 Kč%';
UPDATE faq_items SET answer = REPLACE(answer, 'roční údržbu a podporu za 24 000 Kč', 'roční údržbu a podporu za 2 990 Kč') WHERE answer LIKE '%24 000 Kč%';

UPDATE blog_posts
   SET content = REPLACE(REPLACE(content, '14 900 Kč', '9 990 Kč'), '29 900 Kč', '24 900 Kč'),
       updated_at = unixepoch()
 WHERE id IN ('J-PpdP8ejoiRBm1-IWDHa', '1IenmMCAMIo7lh1L4KpIE', '4fRN2903ndP2OXBNzzsxQ', 'F-9Ee7xrnI--aZSM--c6S', 'FnRdpquMFZUTWF2TQg07i');
