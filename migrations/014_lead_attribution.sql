-- Where the lead came from.
--
-- Nothing on the site captured utm or gclid, so every enquiry arrived with no
-- idea which campaign paid for it. These columns are additive and nullable —
-- existing rows stay valid and nothing already stored changes meaning.
--
-- Values are first-touch: the first campaign that brought the visitor, kept in
-- sessionStorage so it survives clicking around before the form is submitted.

ALTER TABLE leads ADD COLUMN utm_source TEXT;
ALTER TABLE leads ADD COLUMN utm_medium TEXT;
ALTER TABLE leads ADD COLUMN utm_campaign TEXT;
ALTER TABLE leads ADD COLUMN utm_term TEXT;
ALTER TABLE leads ADD COLUMN utm_content TEXT;

-- Google Ads click id. Present only on paid clicks, and the one value that
-- ties a row here to a click in the Ads account.
ALTER TABLE leads ADD COLUMN gclid TEXT;

-- The page the visitor landed on and where they came from, for the cases where
-- there is no utm at all (organic, direct, a referral).
ALTER TABLE leads ADD COLUMN landing_page TEXT;
ALTER TABLE leads ADD COLUMN referrer TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_gclid ON leads(gclid);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads(utm_campaign);
