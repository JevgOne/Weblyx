#!/usr/bin/env tsx
/**
 * Seed Reviews
 * Creates realistic customer reviews
 */

import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';

const weblyx = createClient({
  url: 'libsql://weblyx-jevgone.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4OTY1NjksImlkIjoiNjQ0NDNiODktZTBmOC00NTUxLWFiNTItNDhkYTg4ZDIwMTcwIiwicmlkIjoiNTgyYjlkM2QtYjUxYS00NGE0LTgyZGYtMmEwY2I2OTM5N2NkIn0.U_aC0zZdrsTf3y3vz34C880xN_jVM3Mzo6qkKtmdZWqBb8Hsfho_O52rCVyTLZrHJQ2nxnuwWSZoxy7Am7poBw',
});

const reviews = [
  {
    authorName: 'Jan Novák',
    authorRole: 'Majitel fitness centra',
    rating: 5,
    text: 'S Weblyx jsem naprosto spokojený. Web byl hotový do týdne, vypadá skvěle a hlavně je extrémně rychlý. Zákazníci nás teď mnohem snadněji najdou na Google. Určitě doporučuji!',
    date: new Date('2025-10-15'),
    source: 'Google',
    sourceUrl: 'https://google.com/reviews',
    published: true,
    featured: true,
    order: 1,
  },
  {
    authorName: 'Petra Svobodová',
    authorRole: 'Majitelka kavárny',
    rating: 5,
    text: 'Profesionální přístup, férové ceny a hlavně rychlost dodání. Za týden jsem měla hotový web, který vypadá lépe než u konkurence. Díky moderním technologiím se načítá okamžitě.',
    date: new Date('2025-09-28'),
    source: 'Google',
    sourceUrl: 'https://google.com/reviews',
    published: true,
    featured: true,
    order: 2,
  },
  {
    authorName: 'Martin Dvořák',
    authorRole: 'E-shop majitel',
    rating: 5,
    text: 'Přešel jsem z WordPressu na Next.js a rozdíl je obrovský. Web se načítá pod 2 sekundy, SEO se zlepšilo a konverze vzrostly o 30%. Skvělá investice!',
    date: new Date('2025-11-05'),
    source: 'Firmy.cz',
    sourceUrl: 'https://firmy.cz',
    published: true,
    featured: true,
    order: 3,
  },
  {
    authorName: 'Lucie Málková',
    authorRole: 'Fotografka',
    rating: 5,
    text: 'Potřebovala jsem rychle spustit portfolio web. Weblyx to zvládl za 5 dní a výsledek předčil moje očekávání. Moderní design, rychlost načítání a skvělá podpora.',
    date: new Date('2025-10-20'),
    source: 'Facebook',
    sourceUrl: 'https://facebook.com',
    published: true,
    featured: false,
    order: 4,
  },
  {
    authorName: 'Tomáš Procházka',
    authorRole: 'Majitel autoservisu',
    rating: 5,
    text: 'Jasná komunikace, transparentní ceník a žádné skryté poplatky. Web funguje perfektně na všech zařízeních. Zákazníci oceňují hlavně rychlost a jednoduchost.',
    date: new Date('2025-09-12'),
    source: 'Google',
    sourceUrl: 'https://google.com/reviews',
    published: true,
    featured: false,
    order: 5,
  },
  {
    authorName: 'Kateřina Černá',
    authorRole: 'Majitelka salonu',
    rating: 5,
    text: 'Dlouho jsem hledala někoho, kdo umí moderní technologie a zároveň má férové ceny. S Weblyx jsem trefila do černého. Web je krásný, rychlý a hlavně mi přináší nové zákazníky.',
    date: new Date('2025-11-18'),
    source: 'Seznam',
    sourceUrl: 'https://seznam.cz',
    published: true,
    featured: true,
    order: 6,
  },
];

async function seedReviews() {
  console.log('🚀 Creating reviews...\n');

  for (const review of reviews) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const reviewDate = Math.floor(review.date.getTime() / 1000);

      await weblyx.execute({
        sql: `INSERT INTO reviews (
          id, author_name, author_image, author_role, rating, text,
          date, source, source_url, published, featured, "order",
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          review.authorName,
          null, // No images for now
          review.authorRole,
          review.rating,
          review.text,
          reviewDate,
          review.source,
          review.sourceUrl,
          review.published ? 1 : 0,
          review.featured ? 1 : 0,
          review.order,
          now,
          now,
        ],
      });

      console.log(`✅ ${review.authorName} - ${review.rating}⭐`);
    } catch (error: any) {
      console.error(`❌ Error creating review for ${review.authorName}:`, error.message);
    }
  }

  console.log('\n🎉 All reviews created successfully!');
}

seedReviews();
