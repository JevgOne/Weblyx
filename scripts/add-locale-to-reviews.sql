-- Add locale support to reviews table
-- This allows each review to be tied to a specific language (cs/de)

-- Add locale column (default 'cs' for existing reviews)
ALTER TABLE reviews ADD COLUMN locale TEXT DEFAULT 'cs';

-- Create index for faster locale filtering
CREATE INDEX IF NOT EXISTS idx_reviews_locale ON reviews(locale);

-- Create index for locale + published filtering
CREATE INDEX IF NOT EXISTS idx_reviews_locale_published ON reviews(locale, published);

-- Update existing reviews to Czech locale (existing Weblyx reviews)
UPDATE reviews SET locale = 'cs' WHERE locale IS NULL;
