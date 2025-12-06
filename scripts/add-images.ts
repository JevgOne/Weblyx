/**
 * Script to add real images to reviews and services
 * Uses high-quality stock photos from Unsplash
 */

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addReviewImages() {
  console.log('📸 Adding review author images...');

  const reviewImages = [
    // Professional business headshots from Unsplash
    { name: 'Martin Novák', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Jana Svobodová', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Petr Dvořák', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Lucie Málková', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Tomáš Černý', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces' },
    { name: 'Marie Nováková', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces' },
  ];

  for (const review of reviewImages) {
    await client.execute({
      sql: 'UPDATE reviews SET AUTHOR_IMAGE = ? WHERE AUTHOR_NAME = ?',
      args: [review.image, review.name],
    });
    console.log(`✅ Updated ${review.name}`);
  }
}

async function addServiceImages() {
  console.log('🎨 Adding service images...');

  const serviceImages = [
    { title: 'Webové stránky', image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop' }, // Code on laptop
    { title: 'E-shopy', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop' }, // Shopping cart
    { title: 'SEO optimalizace', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop' }, // Analytics graph
    { title: 'Redesign webu', image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=600&fit=crop' }, // Design mockup
    { title: 'Údržba a podpora', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop' }, // Team support
    { title: 'Konzultace', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop' }, // Business meeting
  ];

  for (const service of serviceImages) {
    await client.execute({
      sql: 'UPDATE services SET IMAGE_URL = ? WHERE TITLE = ?',
      args: [service.image, service.title],
    });
    console.log(`✅ Updated ${service.title}`);
  }
}

async function main() {
  try {
    await addReviewImages();
    await addServiceImages();
    console.log('\n🎉 All images added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
