-- Migration: remember when the report was mailed
-- Created: 2026-10-02
--
-- The admin panel can now run an audit against a prospect's site and mail them
-- the report — what is wrong and what to do about it — straight from the
-- audits list. Without a stamp nobody can tell which prospects already have
-- the report in their inbox, and the same person gets it twice.

ALTER TABLE audits ADD COLUMN report_sent_at INTEGER;
