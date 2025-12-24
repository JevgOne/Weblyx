#!/usr/bin/env tsx
import { config } from 'dotenv';
config({ path: '.env.local' });

import { turso } from '../lib/turso';

async function updatePhone() {
  console.log('📞 Updating company phone number...\n');

  try {
    await turso.execute({
      sql: `UPDATE company_settings SET phone = ? WHERE id = ?`,
      args: ['+420 702 110 166', 'weblyx'],
    });

    console.log('✅ Phone updated to: +420 702 110 166\n');

    // Verify
    const result = await turso.execute({
      sql: 'SELECT phone FROM company_settings WHERE id = ?',
      args: ['weblyx'],
    });

    console.log('Current phone:', result.rows[0]);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePhone();
