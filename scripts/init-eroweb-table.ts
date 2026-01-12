// Initialize EroWeb analysis table in Turso database
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function initErowebTable() {
  console.log('🔧 Creating eroweb_analyses table...');

  try {
    // Create table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS eroweb_analyses (
        -- Primary identification
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        domain TEXT NOT NULL,
        business_type TEXT NOT NULL CHECK(business_type IN ('massage', 'privat', 'escort')),
        status TEXT NOT NULL CHECK(status IN ('pending', 'analyzing', 'completed', 'failed')),

        -- Analysis timestamp
        analyzed_at INTEGER,

        -- Scores (0-100 scale)
        speed_score INTEGER DEFAULT 0,
        mobile_score INTEGER DEFAULT 0,
        security_score INTEGER DEFAULT 0,
        seo_score INTEGER DEFAULT 0,
        geo_score INTEGER DEFAULT 0,
        design_score INTEGER DEFAULT 0,
        total_score INTEGER DEFAULT 0,

        -- Analysis details (JSON)
        details TEXT,
        findings TEXT,
        recommendation TEXT,
        recommended_package TEXT CHECK(recommended_package IN ('basic', 'premium', 'enterprise')),

        -- Screenshot
        screenshot_url TEXT,

        -- Contact information (optional)
        contact_name TEXT,
        contact_email TEXT,

        -- Email tracking
        email_sent INTEGER DEFAULT 0,
        email_sent_at INTEGER,
        email_opened INTEGER DEFAULT 0,
        email_opened_at INTEGER,

        -- Admin notes
        notes TEXT,

        -- Metadata
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    console.log('✅ Table eroweb_analyses created');

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_eroweb_domain ON eroweb_analyses(domain)',
      'CREATE INDEX IF NOT EXISTS idx_eroweb_status ON eroweb_analyses(status)',
      'CREATE INDEX IF NOT EXISTS idx_eroweb_business_type ON eroweb_analyses(business_type)',
      'CREATE INDEX IF NOT EXISTS idx_eroweb_created_at ON eroweb_analyses(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_eroweb_email_sent ON eroweb_analyses(email_sent)',
      'CREATE INDEX IF NOT EXISTS idx_eroweb_total_score ON eroweb_analyses(total_score)',
    ];

    for (const indexSql of indexes) {
      await client.execute(indexSql);
    }

    console.log('✅ All indexes created');

    // Verify table exists
    const result = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='eroweb_analyses'"
    );

    if (result.rows.length > 0) {
      console.log('✅ Verification: Table exists');
    } else {
      console.error('❌ Verification failed: Table not found');
    }

  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

initErowebTable()
  .then(() => {
    console.log('✅ EroWeb table initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });
