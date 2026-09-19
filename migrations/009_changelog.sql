-- Migration: changelog ("Archiv změn")
-- Created: 2026-09-17
--
-- A second, deliberately separate log from `activity_logs`.
--
-- `activity_logs` is a forensic audit trail: it records who called what, keyed
-- by action verbs ('portfolio_updated') and entity ids. It is written on every
-- admin action, including logins, and nothing in it is meant for a customer.
--
-- This table is the opposite: a short, human-readable history of what changed
-- on the *site*, written in the language a client reads ("Přidán projekt
-- NovaDom"), with a public/internal switch so part of it can be shown on the
-- landing page as proof the site is looked after. Folding the two together
-- would mean either leaking audit noise onto the public page or teaching the
-- audit trail to hold marketing copy; both are worse than one extra table.

CREATE TABLE IF NOT EXISTS changelog (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  -- review | project | pricing | content | lead | system
  type       TEXT    NOT NULL,
  title      TEXT    NOT NULL,
  detail     TEXT,
  author     TEXT,
  -- 0/1. `lead` and `pricing` are forced to 0 by the writer, never by a form.
  is_public  INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- The admin list is "newest first, optionally filtered by type"; the public
-- list is "newest first, public only". One index each.
CREATE INDEX IF NOT EXISTS idx_changelog_created ON changelog (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_public  ON changelog (is_public, created_at DESC);
