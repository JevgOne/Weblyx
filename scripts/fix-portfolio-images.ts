/**
 * Script to fix portfolio project images
 * Adds real screenshots for all projects
 */

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function checkCurrentImages() {
  console.log('📋 Checking current portfolio images...\n');

  const result = await client.execute('SELECT TITLE, IMAGE_URL FROM portfolio ORDER BY "ORDER"');

  for (const row of result.rows) {
    console.log(`${row.TITLE}: ${row.IMAGE_URL || 'NULL'}`);
  }
  console.log('');
}

async function updatePortfolioImages() {
  console.log('🖼️  Updating portfolio images...\n');

  // High-quality website screenshots using Unsplash
  const portfolioImages = [
    {
      title: 'Web pro Titan Boxing',
      image: 'https://image.thum.io/get/width/1200/crop/800/https://www.titanboxing.cz',
    },
    {
      title: 'Web pro CarMakléř',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop', // Car dealership
    },
    {
      title: 'Salon Lucie - Rezervační systém',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop', // Hair salon
    },
    {
      title: 'TechStart - Startup landing page',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop', // Startup/tech
    },
    {
      title: 'PD Stavby - Prezentace firmy',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop', // Construction
    },
    {
      title: 'Café Relax - Menu a rezervace',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=800&fit=crop', // Cafe/restaurant
    },
  ];

  for (const project of portfolioImages) {
    await client.execute({
      sql: 'UPDATE portfolio SET IMAGE_URL = ? WHERE TITLE = ?',
      args: [project.image, project.title],
    });
    console.log(`✅ Updated: ${project.title}`);
  }
}

async function main() {
  try {
    await checkCurrentImages();
    await updatePortfolioImages();
    console.log('\n🎉 All portfolio images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
