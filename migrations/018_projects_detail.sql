-- Migration: give projects the fields their detail page edits
-- Created: 2026-10-03
--
-- /admin/projects/[id] read and saved through /api/projects/[id], a route left
-- behind in the Firebase days — every "Detail" click ended on "Projekt
-- nenalezen". The page also edits payment, hosting and domain fields that the
-- table never had, so they are added here.
--
-- Projects converted from enquiries were written with status 'in-progress'
-- while the panel knows 'in_progress': the counters read zero and the status
-- showed as a raw value. The convert route now writes the canonical value.

ALTER TABLE projects ADD COLUMN price_paid INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN currency TEXT NOT NULL DEFAULT 'CZK';
ALTER TABLE projects ADD COLUMN project_type TEXT;
ALTER TABLE projects ADD COLUMN production_url TEXT;
ALTER TABLE projects ADD COLUMN staging_url TEXT;
ALTER TABLE projects ADD COLUMN github_repo TEXT;
ALTER TABLE projects ADD COLUMN hosting_provider TEXT;
ALTER TABLE projects ADD COLUMN hosting_info TEXT;
ALTER TABLE projects ADD COLUMN domain_name TEXT;
ALTER TABLE projects ADD COLUMN domain_registrar TEXT;
-- The enquiry the project came from, so its brief and configuration stay reachable.
ALTER TABLE projects ADD COLUMN lead_id TEXT;

UPDATE projects SET status = 'in_progress' WHERE status = 'in-progress';
