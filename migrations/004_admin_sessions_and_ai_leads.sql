-- Migration: Admin sessions + AI lead fields
-- Created: 2025-01-30

-- Admin sessions for cookie auth
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_used_at INTEGER NOT NULL DEFAULT (unixepoch()),
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);

-- Extend leads table with AI fields
ALTER TABLE leads ADD COLUMN ai_design_suggestion TEXT; -- JSON
ALTER TABLE leads ADD COLUMN ai_brief TEXT; -- JSON
ALTER TABLE leads ADD COLUMN ai_generated_at INTEGER;
ALTER TABLE leads ADD COLUMN brief_generated_at INTEGER;
ALTER TABLE leads ADD COLUMN proposal_email_sent INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN proposal_email_sent_at INTEGER;

-- Additional lead fields from questionnaire
ALTER TABLE leads ADD COLUMN project_type_other TEXT;
ALTER TABLE leads ADD COLUMN business_description TEXT;
ALTER TABLE leads ADD COLUMN project_details TEXT; -- JSON
ALTER TABLE leads ADD COLUMN features TEXT; -- JSON array
ALTER TABLE leads ADD COLUMN design_preferences TEXT; -- JSON

-- Push subscriptions table (already created in previous migration)
-- Keeping for reference
