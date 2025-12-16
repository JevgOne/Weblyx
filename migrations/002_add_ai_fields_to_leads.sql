-- Migration: Add AI generation fields to leads table
-- Created: 2025-12-16

-- Add missing columns for questionnaire data
ALTER TABLE leads ADD COLUMN project_type_other TEXT;
ALTER TABLE leads ADD COLUMN business_description TEXT;
ALTER TABLE leads ADD COLUMN project_details TEXT; -- JSON
ALTER TABLE leads ADD COLUMN features TEXT; -- JSON array
ALTER TABLE leads ADD COLUMN design_preferences TEXT; -- JSON

-- Add AI generation fields
ALTER TABLE leads ADD COLUMN ai_design_suggestion TEXT; -- JSON
ALTER TABLE leads ADD COLUMN ai_generated_at INTEGER;
ALTER TABLE leads ADD COLUMN ai_brief TEXT; -- JSON
ALTER TABLE leads ADD COLUMN brief_generated_at INTEGER;

-- Create index for AI fields
CREATE INDEX IF NOT EXISTS idx_leads_ai_generated ON leads(ai_generated_at);
CREATE INDEX IF NOT EXISTS idx_leads_brief_generated ON leads(brief_generated_at);
