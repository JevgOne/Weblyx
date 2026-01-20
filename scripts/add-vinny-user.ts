/**
 * Add vinny@weblyx.cz user to the database
 * Run with: npx tsx scripts/add-vinny-user.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addVinnyUser() {
  console.log('🚀 Adding vinny@weblyx.cz user...\n');

  try {
    const email = 'vinny@weblyx.cz';
    const password = 'weblyxisthebest';
    const name = 'Vinny';
    const role = 'super_admin';

    // Check if user already exists
    const existing = await turso.execute({
      sql: 'SELECT * FROM admins WHERE email = ?',
      args: [email],
    });

    if (existing.rows.length > 0) {
      console.log('⚠️  User already exists:', email);
      console.log('Existing user:', existing.rows[0]);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const id = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert user
    await turso.execute({
      sql: `INSERT INTO admins (id, email, name, password_hash, role, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, unixepoch(), unixepoch())`,
      args: [id, email, name, passwordHash, role],
    });

    console.log('✅ User created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role}`);
    console.log(`   ID: ${id}`);

    // Verify
    const verify = await turso.execute({
      sql: 'SELECT id, email, name, role, active FROM admins WHERE email = ?',
      args: [email],
    });

    console.log('\n📋 Verification:');
    console.log(verify.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addVinnyUser();
