-- Migration: keep the report that was mailed
-- Created: 2026-10-12
--
-- The audits list showed a score and three numbers, while the visitor received
-- a full report. Staff calling the prospect could not see what the prospect was
-- reading. Kept in its own table so listing audits does not drag ~40 kB of
-- HTML per row.

CREATE TABLE IF NOT EXISTS audit_reports (
  audit_id TEXT PRIMARY KEY,
  html TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
