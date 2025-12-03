#!/usr/bin/env tsx
/**
 * Initialize Company Settings
 *
 * Creates default Weblyx company settings in database
 * Required for invoice generation
 *
 * Usage: tsx scripts/init-company-settings.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { turso } from '../lib/turso';

async function initCompanySettings() {
  console.log('🏢 Initializing company settings...\n');

  try {
    // Check if settings already exist
    const existing = await turso.execute({
      sql: 'SELECT * FROM company_settings WHERE id = ?',
      args: ['weblyx'],
    });

    if (existing.rows.length > 0) {
      console.log('⚠️  Company settings already exist. Skipping...\n');
      console.log('Current settings:', existing.rows[0]);
      return;
    }

    // Insert default Weblyx company settings
    await turso.execute({
      sql: `INSERT INTO company_settings (
        id, name, street, city, zip, country,
        ico, dic,
        bank_account, iban, swift,
        email, phone, website,
        invoice_prefix, next_invoice_number, invoice_due_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'weblyx',
        'Weblyx s.r.o.',
        'TODO: Add street address',
        'TODO: Add city',
        'TODO: Add ZIP',
        'Česká republika',
        'TODO: Add IČO',
        null, // DIČ (optional)
        'TODO: Add bank account',
        'TODO: Add IBAN',
        'TODO: Add SWIFT',
        'info@weblyx.cz',
        '+420 TODO',
        'https://weblyx.cz',
        '', // invoice_prefix
        1, // next_invoice_number
        14, // invoice_due_days
      ],
    });

    console.log('✅ Company settings initialized!\n');
    console.log('⚠️  IMPORTANT: Update company settings with real data:');
    console.log('   - Street address');
    console.log('   - City and ZIP');
    console.log('   - IČO (company registration number)');
    console.log('   - DIČ (VAT ID, if applicable)');
    console.log('   - Bank account details (account number, IBAN, SWIFT)');
    console.log('   - Phone number\n');

    console.log('📝 To update, run SQL:');
    console.log('turso db shell weblyx');
    console.log('UPDATE company_settings SET street="...", city="...", ... WHERE id="weblyx";\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initCompanySettings();
