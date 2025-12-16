-- Migration: Add comprehensive lead fields for enhanced questionnaire
-- Created: 2025-12-16

-- Add project goal and reason fields
ALTER TABLE leads ADD COLUMN project_goal TEXT;
ALTER TABLE leads ADD COLUMN project_reason TEXT;

-- Add company detailed info
ALTER TABLE leads ADD COLUMN ico TEXT;
ALTER TABLE leads ADD COLUMN address TEXT;
ALTER TABLE leads ADD COLUMN years_in_business TEXT;
ALTER TABLE leads ADD COLUMN social_media TEXT; -- JSON: {facebook, instagram, linkedin}
ALTER TABLE leads ADD COLUMN customer_acquisition TEXT;
ALTER TABLE leads ADD COLUMN usp TEXT; -- Unique selling proposition
ALTER TABLE leads ADD COLUMN top_competitors TEXT; -- JSON: [{url, notes}]

-- Add extra info fields
ALTER TABLE leads ADD COLUMN additional_requirements TEXT;
ALTER TABLE leads ADD COLUMN how_did_you_hear TEXT;
ALTER TABLE leads ADD COLUMN preferred_contact TEXT;
ALTER TABLE leads ADD COLUMN preferred_meeting_time TEXT;

-- Create indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_leads_how_did_you_hear ON leads(how_did_you_hear);
CREATE INDEX IF NOT EXISTS idx_leads_preferred_contact ON leads(preferred_contact);
