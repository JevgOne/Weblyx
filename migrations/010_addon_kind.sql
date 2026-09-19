-- Migration: tell build add-ons apart from support add-ons
-- Created: 2026-09-18
--
-- Every add-on until now was extra build work: more hours, a longer delivery
-- window, a bigger one-off price. The configurator's maths assumed exactly
-- that — it adds each add-on's hours to the work estimate and pushes the
-- delivery range out by a day per eight hours.
--
-- "Roční údržba a podpora" breaks that assumption. Its 48 hours are spread
-- across a year *after* launch, so folding them into the build made buying
-- support delay the website by six days and inflate the work estimate for a
-- job that had not grown. It also left the summary still saying the package's
-- two months of support after the customer had just bought twelve.
--
-- So an add-on now declares which side it is on, and how much support it adds.

ALTER TABLE pricing_addons ADD COLUMN kind TEXT NOT NULL DEFAULT 'build';
ALTER TABLE pricing_addons ADD COLUMN support_months INTEGER NOT NULL DEFAULT 0;

UPDATE pricing_addons
   SET kind = 'support', support_months = 12
 WHERE id = 'addon-maintenance';
