-- Migration: Add push_subscriptions table for Web Push notifications
-- Created: 2025-01-30

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  subscription TEXT NOT NULL,
  platform TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
