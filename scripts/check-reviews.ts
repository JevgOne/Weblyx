import { turso } from '../lib/turso';

async function checkReviews() {
  console.log('🔍 Checking reviews in database...\n');

  try {
    // Check Google reviews
    const googleReviews = await turso.execute(
      "SELECT id, author_name, published, featured, source, created_at FROM reviews WHERE source = 'Google' ORDER BY created_at DESC LIMIT 10"
    );

    console.log(`📊 Google Reviews (${googleReviews.rows.length}):`);
    googleReviews.rows.forEach((row: any) => {
      const published = row.published ? '✅ Published' : '❌ Not published';
      const featured = row.featured ? '⭐ Featured' : '   Regular';
      console.log(`  ${published} ${featured} | ${row.author_name}`);
    });

    // Check all published reviews
    const publishedReviews = await turso.execute(
      "SELECT COUNT(*) as count FROM reviews WHERE published = 1"
    );

    console.log(`\n✅ Total published reviews: ${publishedReviews.rows[0]?.count || 0}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkReviews();
