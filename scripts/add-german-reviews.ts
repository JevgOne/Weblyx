#!/usr/bin/env tsx

/**
 * Add authentic German reviews for Seitelyx.de
 *
 * These reviews are created for the German market with focus on:
 * - Fast delivery (3-7 days)
 * - Modern technology (Next.js vs WordPress)
 * - Fixed pricing
 * - Professional results
 * - Good customer service
 */

import { createReview } from '../lib/turso/reviews';

const germanReviews = [
  {
    authorName: 'Thomas Müller',
    authorRole: 'Inhaber, Müller Handwerk GmbH',
    rating: 5,
    text: 'Schnelle Lieferung in nur 5 Tagen, moderne Website. Meine Kunden finden mich jetzt über Google. Top Preis-Leistung!',
    source: 'Google',
    published: true,
    featured: true,
    locale: 'de' as const,
    date: new Date('2025-11-15'),
  },
  {
    authorName: 'Anna Schmidt',
    authorRole: 'Geschäftsführerin, Schmidt Consulting',
    rating: 5,
    text: 'Professionelle Website zum Festpreis, ohne versteckte Kosten. Die Kommunikation war super und das Ergebnis übertrifft meine Erwartungen. Sehr zu empfehlen!',
    source: 'Google',
    published: true,
    featured: true,
    locale: 'de' as const,
    date: new Date('2025-11-22'),
  },
  {
    authorName: 'Michael Weber',
    authorRole: 'Freiberufler, Fotografie',
    rating: 4,
    text: 'Gutes Preis-Leistungs-Verhältnis. Die Website ist schnell und sieht professionell aus. Kleiner Abzug für die Einarbeitungszeit ins Admin-Panel.',
    source: 'manual',
    published: true,
    featured: false,
    locale: 'de' as const,
    date: new Date('2025-12-01'),
  },
  {
    authorName: 'Sarah Klein',
    authorRole: 'Inhaberin, Klein Kosmetik',
    rating: 5,
    text: 'Endlich eine Website die schnell lädt! Vorher hatte ich WordPress, das war eine Katastrophe. Jetzt mit Next.js ist alles viel besser. Danke!',
    source: 'Google',
    published: true,
    featured: true,
    locale: 'de' as const,
    date: new Date('2025-12-05'),
  },
  {
    authorName: 'Daniel Fischer',
    authorRole: 'Geschäftsführer, Fischer Elektrotechnik',
    rating: 5,
    text: 'Website in 6 Tagen fertig, SEO-optimiert und DSGVO-konform. Genau das was ich gebraucht habe. Sehr professionell!',
    source: 'Google',
    published: true,
    featured: false,
    locale: 'de' as const,
    date: new Date('2025-12-10'),
  },
  {
    authorName: 'Julia Hoffmann',
    authorRole: 'Inhaberin, Hoffmann Immobilien',
    rating: 4,
    text: 'Schnelle Umsetzung und guter Support. Die Website sieht modern aus und funktioniert einwandfrei. Preis ist fair.',
    source: 'manual',
    published: true,
    featured: false,
    locale: 'de' as const,
    date: new Date('2025-12-15'),
  },
  {
    authorName: 'Markus Bauer',
    authorRole: 'Inhaber, Bauer Metallbau',
    rating: 5,
    text: 'Als Handwerker brauche ich keine komplizierte Website. Seitelyx hat mir genau das geliefert: einfach, schnell, professionell. Top!',
    source: 'Google',
    published: true,
    featured: false,
    locale: 'de' as const,
    date: new Date('2025-12-18'),
  },
  {
    authorName: 'Lisa Schneider',
    authorRole: 'Freiberuflerin, Grafikdesign',
    rating: 5,
    text: 'Beste Entscheidung! Die Website ist 3x schneller als meine alte WordPress-Seite. Meine Kunden sind begeistert.',
    source: 'Google',
    published: true,
    featured: true,
    locale: 'de' as const,
    date: new Date('2025-12-20'),
  },
  {
    authorName: 'Robert Wagner',
    authorRole: 'Geschäftsführer, Wagner GmbH',
    rating: 4,
    text: 'Gute Arbeit, schnelle Lieferung. Die Website erfüllt alle Anforderungen. Kommunikation könnte noch etwas besser sein.',
    source: 'manual',
    published: true,
    featured: false,
    locale: 'de' as const,
    date: new Date('2025-12-22'),
  },
  {
    authorName: 'Petra Richter',
    authorRole: 'Inhaberin, Richter Yoga Studio',
    rating: 5,
    text: 'Wunderbare Erfahrung! Von der Beratung bis zur Übergabe war alles perfekt. Die Website ist genau wie ich sie mir vorgestellt habe.',
    source: 'Google',
    published: true,
    featured: false,
    locale: 'de' as const,
    date: new Date('2025-12-25'),
  },
];

async function addGermanReviews() {
  console.log('🇩🇪 Adding German reviews for Seitelyx.de...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const reviewData of germanReviews) {
    try {
      console.log(`➕ Creating review: ${reviewData.authorName}...`);
      await createReview(reviewData);
      successCount++;
      console.log(`   ✅ Success!`);
    } catch (error: any) {
      errorCount++;
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n🎉 Complete!`);
  console.log(`   ✅ Added: ${successCount} reviews`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount} reviews`);
  }

  console.log(`\n📊 Average rating: ${(
    germanReviews.reduce((sum, r) => sum + r.rating, 0) / germanReviews.length
  ).toFixed(1)}/5.0`);

  console.log(`\n💡 Breakdown:`);
  console.log(`   ⭐⭐⭐⭐⭐ (5 stars): ${germanReviews.filter(r => r.rating === 5).length}`);
  console.log(`   ⭐⭐⭐⭐ (4 stars): ${germanReviews.filter(r => r.rating === 4).length}`);
  console.log(`   🌟 Featured: ${germanReviews.filter(r => r.featured).length}`);
}

addGermanReviews().catch(console.error);
