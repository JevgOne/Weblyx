-- Turso Database Schema for Weblyx
-- Migration from Firebase Firestore to Turso (SQLite)

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    website TEXT,
    budget_range TEXT,
    timeline TEXT,
    project_type TEXT,
    message TEXT,
    services TEXT, -- JSON array
    promo_code TEXT,
    status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
    source TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    converted_at INTEGER,
    project_id TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    description TEXT,
    status TEXT DEFAULT 'planning', -- planning, in_progress, review, completed, on_hold, cancelled
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    budget REAL,
    start_date INTEGER,
    deadline INTEGER,
    completion_date INTEGER,
    progress INTEGER DEFAULT 0, -- 0-100
    tags TEXT, -- JSON array
    notes TEXT,
    assigned_to TEXT, -- Admin user ID who is assigned to this project
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);

-- Project Todos
CREATE TABLE IF NOT EXISTS project_todos (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    priority TEXT DEFAULT 'medium',
    assignee TEXT,
    due_date INTEGER,
    completed_at INTEGER,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_todos_project ON project_todos(project_id);
CREATE INDEX IF NOT EXISTS idx_todos_status ON project_todos(status);

-- Project Files
CREATE TABLE IF NOT EXISTS project_files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT, -- image, document, video, other
    size INTEGER,
    uploaded_by TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_files_project ON project_files(project_id);

-- Project Timeline Events
CREATE TABLE IF NOT EXISTS project_timeline (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- status_change, comment, file_upload, milestone, etc.
    title TEXT NOT NULL,
    description TEXT,
    user_id TEXT,
    user_name TEXT,
    metadata TEXT, -- JSON for additional data
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_project ON project_timeline(project_id, created_at DESC);

-- Project Milestones
CREATE TABLE IF NOT EXISTS project_milestones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date INTEGER,
    completed BOOLEAN DEFAULT 0,
    completed_at INTEGER,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);

-- Emails table (for email tracking)
CREATE TABLE IF NOT EXISTS emails (
    id TEXT PRIMARY KEY,
    to_email TEXT NOT NULL,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    html_body TEXT,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    sent_at INTEGER,
    error TEXT,
    metadata TEXT, -- JSON for additional data
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_to ON emails(to_email);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    all_day BOOLEAN DEFAULT 0,
    location TEXT,
    attendees TEXT, -- JSON array
    project_id TEXT,
    lead_id TEXT,
    event_type TEXT, -- meeting, deadline, reminder, etc.
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_start ON calendar_events(start_time);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id TEXT,
    author_name TEXT,
    featured_image TEXT,
    published BOOLEAN DEFAULT 0,
    published_at INTEGER,
    tags TEXT, -- JSON array
    meta_title TEXT,
    meta_description TEXT,
    views INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    subscribed BOOLEAN DEFAULT 1,
    subscribed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    unsubscribed_at INTEGER,
    source TEXT,
    tags TEXT -- JSON array
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(subscribed);

-- Settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Homepage Sections (CMS)
CREATE TABLE IF NOT EXISTS homepage_sections (
    id TEXT PRIMARY KEY DEFAULT 'current',
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_cta_text TEXT,
    hero_cta_link TEXT,
    hero_image TEXT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Services (CMS)
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    features TEXT, -- JSON array
    price_from REAL,
    price_to REAL,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_services_order ON services("order");

-- Pricing Tiers (CMS)
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'CZK',
    billing_period TEXT DEFAULT 'monthly', -- monthly, yearly, one-time
    features TEXT, -- JSON array
    highlighted BOOLEAN DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_pricing_order ON pricing_tiers("order");

-- Process Steps (CMS)
CREATE TABLE IF NOT EXISTS process_steps (
    id TEXT PRIMARY KEY,
    number TEXT DEFAULT '1',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_process_order ON process_steps("order");

-- Process Section Meta
CREATE TABLE IF NOT EXISTS process_section (
    id TEXT PRIMARY KEY DEFAULT 'current',
    title TEXT,
    subtitle TEXT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- FAQ Items (CMS)
CREATE TABLE IF NOT EXISTS faq_items (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_faq_order ON faq_items("order");

-- FAQ Section Meta
CREATE TABLE IF NOT EXISTS faq_section (
    id TEXT PRIMARY KEY DEFAULT 'current',
    title TEXT,
    subtitle TEXT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- CTA Section (CMS)
CREATE TABLE IF NOT EXISTS cta_section (
    id TEXT PRIMARY KEY DEFAULT 'current',
    title TEXT,
    description TEXT,
    button_text TEXT,
    button_link TEXT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Contact Info (CMS)
CREATE TABLE IF NOT EXISTS contact_info (
    id TEXT PRIMARY KEY DEFAULT 'current',
    email TEXT,
    phone TEXT,
    address TEXT,
    business_hours TEXT,
    social_links TEXT, -- JSON object
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    project_url TEXT,
    image_url TEXT,
    technologies TEXT, -- JSON array
    category TEXT,
    featured BOOLEAN DEFAULT 0,
    published BOOLEAN DEFAULT 1,
    "order" INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio(featured, "order");
CREATE INDEX IF NOT EXISTS idx_portfolio_published ON portfolio(published);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    author_name TEXT NOT NULL,
    author_image TEXT,
    author_role TEXT,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    date INTEGER NOT NULL,
    source TEXT DEFAULT 'manual', -- manual, google
    source_url TEXT,
    published BOOLEAN DEFAULT 0,
    featured BOOLEAN DEFAULT 0,
    "order" INTEGER DEFAULT 0,
    portfolio_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(published, "order");
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_portfolio ON reviews(portfolio_id);

-- Media Library (for Vercel Blob integration)
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    blob_url TEXT, -- Vercel Blob URL
    type TEXT, -- image, video, document
    mime_type TEXT,
    size INTEGER,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    uploaded_by TEXT,
    tags TEXT, -- JSON array
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media(created_at DESC);

-- EroWeb Analysis (adult industry website analyzer)
CREATE TABLE IF NOT EXISTS eroweb_analyses (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    business_type TEXT NOT NULL CHECK(business_type IN ('massage', 'privat', 'escort')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'analyzing', 'completed', 'failed')),
    analyzed_at INTEGER,

    -- Scores (0-100 total, individual max varies)
    speed_score INTEGER DEFAULT 0,
    mobile_score INTEGER DEFAULT 0,
    security_score INTEGER DEFAULT 0,
    seo_score INTEGER DEFAULT 0,
    geo_score INTEGER DEFAULT 0,
    design_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,

    -- Analysis data (JSON)
    details TEXT, -- JSON: AnalysisDetails
    findings TEXT, -- JSON: Finding[]

    -- Recommendation
    recommendation TEXT,
    recommended_package TEXT CHECK(recommended_package IN ('basic', 'premium', 'enterprise')),

    -- Screenshot
    screenshot_url TEXT,

    -- Contact info (optional)
    contact_name TEXT,
    contact_email TEXT,

    -- Email tracking
    email_sent INTEGER DEFAULT 0,
    email_sent_at INTEGER,
    email_opened INTEGER DEFAULT 0,
    email_opened_at INTEGER,

    -- Admin notes
    notes TEXT,

    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_eroweb_domain ON eroweb_analyses(domain);
CREATE INDEX IF NOT EXISTS idx_eroweb_status ON eroweb_analyses(status);
CREATE INDEX IF NOT EXISTS idx_eroweb_total_score ON eroweb_analyses(total_score);
CREATE INDEX IF NOT EXISTS idx_eroweb_created ON eroweb_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eroweb_business_type ON eroweb_analyses(business_type);
