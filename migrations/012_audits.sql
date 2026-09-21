-- Migration: keep the free website audits
-- Created: 2026-09-21
--
-- /audit asks a visitor for their website and their e-mail address, runs a
-- PageSpeed report against it and mails them the result. Then it forgets
-- everything: no row anywhere, nothing in the admin panel.
--
-- That is the strongest signal this business can receive — someone handing
-- over the address of a site they are unhappy with, plus a way to reach them —
-- and it was being thrown away. Nobody could follow up, and nobody even knew
-- how many had been run.
--
-- The score and metrics are stored with it because the audit is the sales
-- argument: "your site scores 34, here is what we would fix".

CREATE TABLE IF NOT EXISTS audits (
  id          TEXT PRIMARY KEY,
  url         TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  -- Lighthouse performance score, 0-100.
  score       INTEGER,
  -- JSON: [{ label, value, rating }] as shown in the report.
  metrics     TEXT,
  issue_count INTEGER,
  -- The lead this audit created, so the admin can jump straight to it.
  lead_id     TEXT,
  -- 'ok' | 'failed'; a failed run is still worth keeping, it is still a lead.
  status      TEXT    NOT NULL DEFAULT 'ok',
  error       TEXT,
  ip_address  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_audits_created ON audits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_email   ON audits (email);
