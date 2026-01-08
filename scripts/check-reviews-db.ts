/**
 * Check existing reviews in Turso DB
 */

import { turso } from '../lib/turso';

async function checkReviews() {
  try {
    console.log('🔍 Checking reviews in database...\n');

    // Get all reviews
    const result = await turso.execute(
      "SELECT author_name, rating, source, date, published, text FROM reviews ORDER BY date DESC LIMIT 10"
    );

    console.log(`📊 Found ${result.rows.length} reviews:\n`);

    result.rows.forEach((row, idx) => {
      const date = new Date((row.date as number) * 1000);
      console.log(`${idx + 1}. ${row.author_name} (${row.rating}★)`);
      console.log(`   Source: ${row.source}`);
      console.log(`   Date: ${date.toLocaleDateString('cs-CZ')}`);
      console.log(`   Published: ${row.published ? 'Yes' : 'No'}`);
      console.log(`   Text: ${(row.text as string).substring(0, 80)}...`);
      console.log('');
    });

    // Count by source
    const sourceCount = await turso.execute(
      "SELECT source, COUNT(*) as count FROM reviews GROUP BY source"
    );

    console.log('📈 Reviews by source:');
    sourceCount.rows.forEach(row => {
      console.log(`   ${row.source}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkReviews();
