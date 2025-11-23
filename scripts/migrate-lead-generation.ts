#!/usr/bin/env tsx
/**
 * Lead Generation System Migration Script
 * Creates tables: leads, campaigns, generated_emails, tracking_events
 */

import { turso } from '../lib/turso';

async function migrateLeadGenerationTables() {
  console.log('🚀 Starting Lead Generation tables migration...');

  try {
    // Drop existing tables if they exist (for clean migration)
    console.log('\n🗑️  Dropping existing tables...');
    await turso.execute(`DROP TABLE IF EXISTS tracking_events`);
    await turso.execute(`DROP TABLE IF EXISTS generated_emails`);
    await turso.execute(`DROP TABLE IF EXISTS campaigns`);
    await turso.execute(`DROP TABLE IF EXISTS leads`);
    console.log('✅ Existing tables dropped');

    // 1. Create leads table
    console.log('\n📋 Creating leads table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        email TEXT NOT NULL,
        website TEXT,
        industry TEXT,
        phone TEXT,
        contact_person TEXT,

        -- Web analysis data
        analysis_score INTEGER DEFAULT 0,
        analysis_result TEXT,
        analyzed_at INTEGER,

        -- Lead scoring (0-100)
        lead_score INTEGER DEFAULT 0,
        lead_status TEXT DEFAULT 'new',

        -- Email tracking
        email_sent INTEGER DEFAULT 0,
        email_sent_at INTEGER,
        email_opened INTEGER DEFAULT 0,
        email_opened_at INTEGER,
        link_clicked INTEGER DEFAULT 0,
        link_clicked_at INTEGER,

        -- Notes
        notes TEXT,

        -- Timestamps
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    console.log('✅ leads table created');

    // Create indexes for leads
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_website ON leads(website)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score DESC)
    `);
    console.log('✅ Created indexes on leads table');

    // 2. Create campaigns table
    console.log('\n📋 Creating campaigns table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'draft',

        -- Stats
        total_leads INTEGER DEFAULT 0,
        emails_sent INTEGER DEFAULT 0,
        emails_opened INTEGER DEFAULT 0,
        links_clicked INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,

        -- Timestamps
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        started_at INTEGER,
        completed_at INTEGER
      )
    `);
    console.log('✅ campaigns table created');

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)
    `);
    console.log('✅ Created index on campaigns table');

    // 3. Create generated_emails table
    console.log('\n📋 Creating generated_emails table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS generated_emails (
        id TEXT PRIMARY KEY,
        lead_id TEXT NOT NULL,
        campaign_id TEXT,

        -- Email content
        subject TEXT NOT NULL,
        body TEXT NOT NULL,

        -- Tracking
        tracking_code TEXT UNIQUE NOT NULL,

        -- Status
        sent INTEGER DEFAULT 0,
        sent_at INTEGER,
        opened INTEGER DEFAULT 0,
        opened_at INTEGER,
        clicked INTEGER DEFAULT 0,
        clicked_at INTEGER,

        -- Timestamps
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,

        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ generated_emails table created');

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_emails_lead_id ON generated_emails(lead_id)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_emails_campaign_id ON generated_emails(campaign_id)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_emails_tracking_code ON generated_emails(tracking_code)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_emails_sent ON generated_emails(sent, sent_at DESC)
    `);
    console.log('✅ Created indexes on generated_emails table');

    // 4. Create tracking_events table
    console.log('\n📋 Creating tracking_events table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id TEXT PRIMARY KEY,
        tracking_code TEXT NOT NULL,
        event_type TEXT NOT NULL,

        -- Request data
        ip_address TEXT,
        user_agent TEXT,
        referer TEXT,

        -- Geolocation (optional)
        country TEXT,
        city TEXT,

        -- Timestamp
        created_at INTEGER NOT NULL,

        FOREIGN KEY (tracking_code) REFERENCES generated_emails(tracking_code) ON DELETE CASCADE
      )
    `);
    console.log('✅ tracking_events table created');

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_tracking_code ON tracking_events(tracking_code)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_tracking_event_type ON tracking_events(event_type)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_tracking_created_at ON tracking_events(created_at DESC)
    `);
    console.log('✅ Created indexes on tracking_events table');

    console.log('\n🎉 Lead Generation migration completed successfully!');
    console.log('\n📊 Created tables:');
    console.log('  - leads (with 4 indexes)');
    console.log('  - campaigns (with 1 index)');
    console.log('  - generated_emails (with 4 indexes)');
    console.log('  - tracking_events (with 3 indexes)');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateLeadGenerationTables();
