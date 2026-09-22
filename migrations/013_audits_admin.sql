-- Migration: keep the analyses staff run too, in the same place
-- Created: 2026-09-22
--
-- Two tools were doing the same job and neither kept a record.
--
-- /audit on the public site collects a visitor's URL and e-mail, mails them a
-- report and forgets it (fixed by migration 012). The admin analyser at
-- /admin/tools/web-analyzer runs a far deeper analysis of a prospect's site —
-- SEO, performance, security, accessibility, GEO, screenshots, a drafted
-- outreach e-mail — and saves none of it: the route carries a TODO saying so.
-- Close the tab and the work is gone, which makes it useless for calling
-- someone back.
--
-- Both now land in `audits`, told apart by `source`, so the panel has one list
-- of "sites we have looked at and who to contact about them".

ALTER TABLE audits ADD COLUMN source TEXT NOT NULL DEFAULT 'web';
-- Who the analysis is about, when staff typed it in.
ALTER TABLE audits ADD COLUMN company_name TEXT;
ALTER TABLE audits ADD COLUMN contact_name TEXT;
ALTER TABLE audits ADD COLUMN phone TEXT;
-- The deep analysis as returned by lib/web-analyzer: category scores, issues,
-- technology. Stored whole so the panel can show it without re-running a
-- crawl that takes half a minute.
ALTER TABLE audits ADD COLUMN analysis TEXT;
-- The drafted outreach message, so whoever calls has the argument to hand.
ALTER TABLE audits ADD COLUMN outreach TEXT;
-- Free notes from the call.
ALTER TABLE audits ADD COLUMN note TEXT;
-- Call state: new | called | interested | rejected
ALTER TABLE audits ADD COLUMN call_status TEXT NOT NULL DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_audits_source ON audits (source, created_at DESC);
