-- Migration: Add extended fields for enhanced lead form
-- Created: 2025-12-16

-- Add new business context fields
ALTER TABLE leads ADD COLUMN existing_website TEXT;
ALTER TABLE leads ADD COLUMN company_size TEXT;
ALTER TABLE leads ADD COLUMN industry TEXT;

-- Add marketing & technical fields
ALTER TABLE leads ADD COLUMN marketing_tech TEXT; -- JSON: {needsAnalytics, needsFacebookPixel, needsGoogleAds, integrations[], languages[]}

-- Create indexes for new filterable fields
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_company_size ON leads(company_size);
