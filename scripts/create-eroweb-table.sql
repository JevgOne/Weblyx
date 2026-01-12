-- EroWeb Analysis Table
-- Stores website analysis results for adult industry (massage, privat, escort)

CREATE TABLE IF NOT EXISTS eroweb_analyses (
  -- Primary identification
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK(business_type IN ('massage', 'privat', 'escort')),
  status TEXT NOT NULL CHECK(status IN ('pending', 'analyzing', 'completed', 'failed')),

  -- Analysis timestamp
  analyzed_at INTEGER, -- Unix timestamp

  -- Scores (0-100 scale)
  speed_score INTEGER DEFAULT 0,
  mobile_score INTEGER DEFAULT 0,
  security_score INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0,
  geo_score INTEGER DEFAULT 0,
  design_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,

  -- Analysis details (JSON)
  details TEXT, -- JSON object with AnalysisDetails
  findings TEXT, -- JSON array of Finding[]
  recommendation TEXT,
  recommended_package TEXT CHECK(recommended_package IN ('basic', 'premium', 'enterprise')),

  -- Screenshot
  screenshot_url TEXT,

  -- Contact information (optional)
  contact_name TEXT,
  contact_email TEXT,

  -- Email tracking
  email_sent INTEGER DEFAULT 0, -- Boolean (0 or 1)
  email_sent_at INTEGER, -- Unix timestamp
  email_opened INTEGER DEFAULT 0, -- Boolean (0 or 1)
  email_opened_at INTEGER, -- Unix timestamp

  -- Admin notes
  notes TEXT,

  -- Metadata
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_eroweb_domain ON eroweb_analyses(domain);
CREATE INDEX IF NOT EXISTS idx_eroweb_status ON eroweb_analyses(status);
CREATE INDEX IF NOT EXISTS idx_eroweb_business_type ON eroweb_analyses(business_type);
CREATE INDEX IF NOT EXISTS idx_eroweb_created_at ON eroweb_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eroweb_email_sent ON eroweb_analyses(email_sent);
CREATE INDEX IF NOT EXISTS idx_eroweb_total_score ON eroweb_analyses(total_score);
