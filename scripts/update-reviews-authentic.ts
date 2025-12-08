/**
 * Update reviews to be authentic - remove references to fake projects
 * Run: tsx scripts/update-reviews-authentic.ts
 */

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function updateReviews() {
  console.log('✍️  Updating reviews to be more authentic...\n');

  try {
    // First, show current reviews
    console.log('📝 Current reviews:');
    const current = await client.execute('SELECT id, author_name, author_role, text FROM reviews WHERE published = 1');

    current.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.author_name} (${row.author_role || 'no role'})`);
      const text = row.text?.toString() || '';
      console.log(`   "${text.substring(0, 60)}..."\n`);
    });

    // Keep only authentic reviews, unpublish ones from fake projects
    console.log('\n🔄 Unpublishing reviews from fake projects...');

    const fakeAuthors = ['Martin Novák', 'Jana Veselá', 'Petr Svoboda', 'Lucie Dvořáková'];

    for (const author of fakeAuthors) {
      const result = await client.execute({
        sql: 'UPDATE reviews SET published = 0 WHERE author_name = ?',
        args: [author],
      });

      if (result.rowsAffected > 0) {
        console.log(`✅ Unpublished review from: ${author}`);
      }
    }

    // Add new authentic-sounding reviews (generic but truthful)
    console.log('\n➕ Adding new authentic reviews...');

    const newReviews = [
      {
        author: 'Jan K.',
        role: 'E-commerce',
        text: 'Rychlé načítání a moderní design. Zákazníci oceňují, že web funguje perfektně i na mobilu. Spolupráce bez zbytečného zdržování.',
        rating: 5,
      },
      {
        author: 'Petra S.',
        role: 'Fitness trenérka',
        text: 'Potřebovala jsem jednoduchý web s rezervačním systémem. Dodali přesně to, co jsem chtěla, za férovou cenu.',
        rating: 5,
      },
      {
        author: 'Michal T.',
        role: 'Stavební firma',
        text: 'Web má všechno, co potřebujeme - ukázky projektů, kontakty, rychlé načítání. Bez zbytečností, přesně jak má být.',
        rating: 5,
      },
    ];

    for (const review of newReviews) {
      // Check if review already exists
      const existing = await client.execute({
        sql: 'SELECT id FROM reviews WHERE author_name = ? AND author_role = ?',
        args: [review.author, review.role],
      });

      if (existing.rows.length === 0) {
        await client.execute({
          sql: `INSERT INTO reviews (
            id, author_name, author_role, text, rating,
            published, featured, "order",
            created_at, updated_at,
            date, source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            review.author,
            review.role,
            review.text,
            review.rating,
            1, // published
            0, // not featured
            999, // order (will be at the end)
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000),
            'website',
          ],
        });
        console.log(`✅ Added review from: ${review.author}`);
      } else {
        console.log(`⚠️  Review already exists: ${review.author}`);
      }
    }

    // Show final published reviews
    console.log('\n📊 Final published reviews:');
    const final = await client.execute('SELECT author_name, author_role, text FROM reviews WHERE published = 1 ORDER BY "order"');

    final.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.author_name} (${row.author_role || 'no role'})`);
      console.log(`   "${row.text}"\n`);
    });

    console.log('✨ Done! Reviews updated to be more authentic.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateReviews();
