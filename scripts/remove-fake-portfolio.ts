/**
 * Remove fake portfolio projects - keep only real projects
 * Run: tsx scripts/remove-fake-portfolio.ts
 */

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function removeFakePortfolio() {
  console.log('🗑️  Removing fake portfolio projects...\n');

  try {
    // List of fake project titles to unpublish
    const fakeTitles = [
      'Web pro CarMakléř',
      'Salon Lucie - Rezervační systém',
      'TechStart - Startup landing page',
      'PD Stavby - Prezentace firmy',
      'Café Relax - Menu a rezervace',
      'FitZone - Fitness centrum'
    ];

    // Unpublish fake projects by title
    for (const title of fakeTitles) {
      const result = await client.execute({
        sql: 'UPDATE portfolio SET published = 0 WHERE title = ?',
        args: [title],
      });

      if (result.rowsAffected > 0) {
        console.log(`✅ Unpublished: ${title}`);
      } else {
        console.log(`⚠️  Not found: ${title}`);
      }
    }

    // Also unpublish projects with example.com URL
    const exampleResult = await client.execute({
      sql: "UPDATE portfolio SET published = 0 WHERE project_url LIKE '%example.com%'",
      args: [],
    });

    if (exampleResult.rowsAffected > 0) {
      console.log(`✅ Unpublished ${exampleResult.rowsAffected} projects with example.com URLs`);
    }

    // Show remaining published projects
    console.log('\n📊 Remaining published projects:');
    const published = await client.execute('SELECT title, project_url FROM portfolio WHERE published = 1 ORDER BY "order"');

    published.rows.forEach((row) => {
      console.log(`  - ${row.title} - ${row.project_url || 'no URL'}`);
    });

    console.log('\n✨ Done! Portfolio now shows only real projects.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeFakePortfolio();
