-- Migration: Marketing Module Tables
-- Created: 2026-01-28
-- Description: Add tables for marketing integrations (Google Ads, Meta Ads, GA4, GSC)

-- Marketing API Connections
-- Stores connection status and encrypted credentials for each platform
CREATE TABLE IF NOT EXISTS marketing_connections (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL CHECK(platform IN ('google_ads', 'meta_ads', 'ga4', 'gsc')),
    connected INTEGER NOT NULL DEFAULT 0,
    credentials_encrypted TEXT, -- Encrypted JSON with API credentials
    last_sync INTEGER, -- Unix timestamp of last successful sync
    error TEXT, -- Last error message if any
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_marketing_connections_platform ON marketing_connections(platform);
CREATE INDEX IF NOT EXISTS idx_marketing_connections_connected ON marketing_connections(connected);

-- Marketing Configuration
-- Project-wide marketing settings for ROI calculations
CREATE TABLE IF NOT EXISTS marketing_config (
    id TEXT PRIMARY KEY DEFAULT 'current',
    average_order_value REAL, -- AOV in local currency
    gross_margin_percent REAL, -- Gross margin percentage (0-100)
    target_roas REAL, -- Target Return on Ad Spend
    target_cpa REAL, -- Target Cost Per Acquisition
    monthly_budget REAL, -- Monthly marketing budget
    break_even_roas REAL, -- Break-even ROAS (calculated or manual)
    max_cpa REAL, -- Maximum acceptable CPA
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Marketing AI Recommendations
-- Stores AI-generated recommendations for campaign optimization
CREATE TABLE IF NOT EXISTS marketing_recommendations (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL CHECK(platform IN ('google_ads', 'meta_ads', 'ga4', 'gsc', 'general')),
    type TEXT NOT NULL, -- budget, bidding, targeting, creative, keyword, audience, etc.
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_impact TEXT, -- Expected improvement description or metrics
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'applied', 'dismissed')),
    applied_at INTEGER, -- When the recommendation was applied
    dismissed_at INTEGER, -- When the recommendation was dismissed
    dismissed_reason TEXT, -- Optional reason for dismissal
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_marketing_recommendations_platform ON marketing_recommendations(platform);
CREATE INDEX IF NOT EXISTS idx_marketing_recommendations_status ON marketing_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_marketing_recommendations_priority ON marketing_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_marketing_recommendations_created ON marketing_recommendations(created_at DESC);

-- Marketing AI Conversation Logs
-- Stores conversation history with AI assistant
CREATE TABLE IF NOT EXISTS marketing_ai_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL, -- Groups messages in a conversation session
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata TEXT, -- JSON for additional context (tokens used, model, etc.)
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_marketing_ai_logs_session ON marketing_ai_logs(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_marketing_ai_logs_created ON marketing_ai_logs(created_at DESC);
