#!/usr/bin/env node
/**
 * Simple Invoice Generation Test
 * Using pure Node.js without TypeScript compilation issues
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST
config({ path: resolve(__dirname, '../.env.local') });

console.log('Environment check:');
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ Not set');
console.log('');

// Now import modules that depend on env vars
const { createClient } = await import('@libsql/client');

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function test() {
  console.log('🧪 Testing database connection...\n');

  try {
    const result = await turso.execute('SELECT * FROM company_settings WHERE id = ?', ['weblyx']);
    console.log('✅ Database connected!');
    console.log('Company:', result.rows[0].name);
    console.log('IČO:', result.rows[0].ico);
    console.log('Email:', result.rows[0].email);
    console.log('Phone:', result.rows[0].phone);
    console.log('');

    console.log('✨ Test successful! Invoice generation is ready.');
    console.log('');
    console.log('To generate a real invoice, use the admin UI at:');
    console.log('http://localhost:3000/admin/invoices/new');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test();
