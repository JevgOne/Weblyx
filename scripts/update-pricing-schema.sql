-- Add missing columns to pricing_tiers table
ALTER TABLE pricing_tiers ADD COLUMN interval TEXT DEFAULT 'month';
ALTER TABLE pricing_tiers ADD COLUMN cta_text TEXT DEFAULT 'Vybrat balíček';
ALTER TABLE pricing_tiers ADD COLUMN cta_link TEXT DEFAULT '#contact';

-- Update billing_period values to match new interval field if needed
-- This is a one-time migration
UPDATE pricing_tiers SET interval =
  CASE
    WHEN billing_period = 'monthly' THEN 'month'
    WHEN billing_period = 'yearly' THEN 'year'
    WHEN billing_period = 'one-time' THEN 'one-time'
    ELSE 'month'
  END
WHERE interval IS NULL OR interval = 'month';
