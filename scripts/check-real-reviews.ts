/**
 * Check real review stats from database
 * Run: tsx scripts/check-real-reviews.ts
 */

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function checkReviews() {
  try {
    // Get published reviews stats
    const stats = await client.execute(
      'SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM reviews WHERE published = 1'
    );

    const total = stats.rows[0].total as number;
    const avgRating = stats.rows[0].avg_rating as number;

    console.log('📊 Real Review Stats:');
    console.log(`Total published reviews: ${total}`);
    console.log(`Average rating: ${avgRating ? avgRating.toFixed(1) : 'N/A'}`);
    console.log('');

    // Get all published reviews
    const reviews = await client.execute(
      'SELECT author_name, author_role, rating, text FROM reviews WHERE published = 1 ORDER BY "order"'
    );

    console.log('📝 Published Reviews:');
    reviews.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.author_name} (${row.author_role}) - ${row.rating}★`);
      const text = row.text?.toString() || '';
      console.log(`   "${text.substring(0, 80)}..."`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkReviews();
