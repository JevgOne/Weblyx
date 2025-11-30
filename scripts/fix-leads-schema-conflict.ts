#!/usr/bin/env tsx
/**
 * Fix Leads Schema Conflict
 * Separates questionnaire leads from lead generation leads
 */

import { turso } from '../lib/turso';

async function fixLeadsSchemaConflict() {
  console.log('🚀 Starting schema conflict fix...');

  try {
    // 1. Rename current 'leads' table to 'lead_generation_leads'
    console.log('\n📋 Step 1: Renaming leads → lead_generation_leads...');
    await turso.execute(`
      ALTER TABLE leads RENAME TO lead_generation_leads
    `);
    console.log('✅ Table renamed successfully');

    // 2. Create NEW 'leads' table for questionnaire data
    console.log('\n📋 Step 2: Creating new questionnaire leads table...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        project_type TEXT,
        project_type_other TEXT,
        business_description TEXT,
        project_details TEXT, -- JSON
        features TEXT, -- JSON array
        design_preferences TEXT, -- JSON
        budget_range TEXT,
        timeline TEXT,
        status TEXT DEFAULT 'new', -- new, contacted, quoted, approved, converted, rejected, paused
        source TEXT DEFAULT 'questionnaire',

        -- AI Generated Data
        ai_design_suggestion TEXT, -- JSON
        ai_brief TEXT, -- JSON
        ai_generated_at INTEGER,
        brief_generated_at INTEGER,

        -- Proposal tracking
        proposal_email_sent INTEGER DEFAULT 0,
        proposal_email_sent_at INTEGER,

        -- Project conversion
        converted_to_project_id TEXT,

        -- Timestamps
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,

        FOREIGN KEY (converted_to_project_id) REFERENCES projects(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ New leads table created');

    // 3. Create indexes
    console.log('\n📋 Step 3: Creating indexes...');
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)
    `);
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)
    `);
    console.log('✅ Indexes created');

    console.log('\n🎉 Schema conflict fix completed successfully!');
    console.log('\n📊 Result:');
    console.log('  - lead_generation_leads: For web scraping system');
    console.log('  - leads: For questionnaire/contact form');
    console.log('\n⚠️  Next steps:');
    console.log('  1. Update Lead Generation code to use lead_generation_leads');
    console.log('  2. Test questionnaire form');
    console.log('  3. Deploy changes');
  } catch (error) {
    console.error('❌ Error during fix:', error);
    process.exit(1);
  }
}

// Run fix
fixLeadsSchemaConflict();
