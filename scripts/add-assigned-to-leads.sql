-- Add assigned_to column to leads table
-- This allows team members to see who is handling each lead

ALTER TABLE leads ADD COLUMN assigned_to TEXT;

-- Create index for filtering by assigned user
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Create index for filtering by assigned + status
CREATE INDEX IF NOT EXISTS idx_leads_assigned_status ON leads(assigned_to, status);
