// Update IBAN and SWIFT in company_settings
import { config } from 'dotenv';
config({ path: '.env.local' });

import { turso } from '../lib/turso';

async function main() {
  try {
    console.log('🔄 Updating banking details...');

    // Show current values
    const before = await turso.execute('SELECT bank_account, iban, swift FROM company_settings WHERE id = ?', ['weblyx']);
    if (before.rows[0]) {
      const row = before.rows[0] as any;
      console.log(`📊 Current: account=${row.bank_account}, iban=${row.iban}, swift=${row.swift}`);
    }

    // Update IBAN and SWIFT
    const newIban = 'CZ5555000000006424423004';
    const newSwift = 'RZBCCZPP';

    await turso.execute({
      sql: 'UPDATE company_settings SET iban = ?, swift = ? WHERE id = ?',
      args: [newIban, newSwift, 'weblyx']
    });

    // Verify
    const after = await turso.execute('SELECT bank_account, iban, swift FROM company_settings WHERE id = ?', ['weblyx']);
    if (after.rows[0]) {
      const row = after.rows[0] as any;
      console.log(`✅ Updated: account=${row.bank_account}, iban=${row.iban}, swift=${row.swift}`);
    }

    console.log('🎉 Banking details updated!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
