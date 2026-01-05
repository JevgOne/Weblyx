/**
 * Sync Google Reviews to Turso DB
 *
 * This script:
 * 1. Fetches reviews from Google Places API
 * 2. Saves them to Turso DB with source='Google'
 * 3. Sets published=false for admin approval
 *
 * Usage:
 * GOOGLE_PLACES_API_KEY=xxx GOOGLE_PLACE_ID=xxx tsx scripts/sync-google-reviews.ts
 */

import { turso, dateToUnix } from '../lib/turso';
import { nanoid } from 'nanoid';

interface GoogleReview {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  text: string;
  time: number;
  author_url?: string;
  relative_time_description?: string;
}

async function syncGoogleReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const businessName = process.env.GOOGLE_BUSINESS_NAME || 'Weblyx';

  if (!apiKey) {
    console.error('❌ Missing GOOGLE_PLACES_API_KEY environment variable');
    process.exit(1);
  }

  console.log('🔍 Fetching Google reviews...');

  try {
    let placeIdToUse = placeId;

    // If no Place ID, search by business name
    if (!placeId) {
      console.log(`🔍 No Place ID provided, searching for: ${businessName}`);
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName)}&inputtype=textquery&fields=place_id,name&key=${apiKey}`
      );
      const searchData = await searchResponse.json();

      if (searchData.status !== 'OK' || !searchData.candidates?.[0]) {
        console.error('❌ Could not find business:', businessName);
        console.error('   Try setting GOOGLE_PLACE_ID or GOOGLE_BUSINESS_NAME');
        process.exit(1);
      }

      placeIdToUse = searchData.candidates[0].place_id;
      console.log(`✅ Found Place ID: ${placeIdToUse}`);
      console.log(`   Business name: ${searchData.candidates[0].name}`);
    }

    // Fetch place details including reviews
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeIdToUse}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=cs`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('❌ Google Places API error:', data.status);
      if (data.error_message) {
        console.error('   Error message:', data.error_message);
      }
      process.exit(1);
    }

    const reviews = data.result.reviews || [];
    console.log(`✅ Found ${reviews.length} Google reviews`);

    // Get existing Google reviews from DB (to avoid duplicates)
    const existingReviews = await turso.execute(
      "SELECT author_name, date FROM reviews WHERE source = 'Google'"
    );

    const existingMap = new Map(
      existingReviews.rows.map(row => [
        `${row.author_name}_${row.date}`,
        true
      ])
    );

    let imported = 0;
    let skipped = 0;

    for (const review of reviews as GoogleReview[]) {
      const reviewKey = `${review.author_name}_${review.time}`;

      // Skip if already exists
      if (existingMap.has(reviewKey)) {
        skipped++;
        continue;
      }

      // Get max order
      const maxOrderResult = await turso.execute(
        'SELECT MAX("order") as max_order FROM reviews'
      );
      const maxOrder = (maxOrderResult.rows[0]?.max_order as number) || 0;

      // Insert new review
      await turso.execute({
        sql: `INSERT INTO reviews (
          id, author_name, author_image, author_role, rating, text,
          date, source, source_url, published, featured, "order", locale,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          nanoid(),
          review.author_name,
          review.profile_photo_url || null,
          null, // author_role
          review.rating,
          review.text,
          review.time, // Unix timestamp
          'Google',
          review.author_url || null,
          0, // published = false (needs approval)
          0, // featured = false
          maxOrder + 1,
          'cs', // locale
          Math.floor(Date.now() / 1000), // created_at
          Math.floor(Date.now() / 1000), // updated_at
        ],
      });

      imported++;
      console.log(`   ✅ Imported: ${review.author_name} (${review.rating}★)`);
    }

    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✅ Imported: ${imported} new reviews`);
    console.log(`   ⏭️  Skipped:  ${skipped} existing reviews`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Go to admin panel: /admin/reviews');
    console.log('   2. Review and approve Google reviews');
    console.log('   3. They will appear on the website once approved');
    console.log('');

  } catch (error) {
    console.error('❌ Error syncing Google reviews:', error);
    process.exit(1);
  }
}

// Run the script
syncGoogleReviews();
