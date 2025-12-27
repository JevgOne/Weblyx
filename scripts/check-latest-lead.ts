#!/usr/bin/env tsx

import { turso } from '../lib/turso';

async function checkLatestLead() {
  console.log('🔍 Checking latest lead in database...\n');

  const result = await turso.execute(
    `SELECT id, name, email, phone, company, project_type, created_at
     FROM leads
     ORDER BY created_at DESC
     LIMIT 1`
  );

  if (result.rows.length === 0) {
    console.log('❌ No leads found in database');
    return;
  }

  const lead = result.rows[0];
  const createdDate = new Date((lead.created_at as number) * 1000);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - createdDate.getTime()) / 1000 / 60);

  console.log('✅ Latest lead:');
  console.log(`   ID: ${lead.id}`);
  console.log(`   Name: ${lead.name}`);
  console.log(`   Email: ${lead.email}`);
  console.log(`   Phone: ${lead.phone || 'N/A'}`);
  console.log(`   Company: ${lead.company || 'N/A'}`);
  console.log(`   Project Type: ${lead.project_type}`);
  console.log(`   Created: ${createdDate.toLocaleString('cs-CZ')}`);
  console.log(`   Time ago: ${minutesAgo} minutes ago`);
}

checkLatestLead().catch(console.error);
