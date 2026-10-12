-- Migration: a link the client can fill the consultation through
-- Created: 2026-10-12
--
-- The short questionnaire can be sent to the client as a link. The token is
-- the only thing that opens it; the stamp tells staff the client has answered.

ALTER TABLE leads ADD COLUMN consultation_token TEXT;
ALTER TABLE leads ADD COLUMN consultation_client_at INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_consultation_token ON leads(consultation_token);
