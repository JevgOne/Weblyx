#!/usr/bin/env tsx
/**
 * Lead Scraper CLI Tool
 *
 * Usage:
 *   npx tsx scripts/scrape-leads.ts "pekárna Praha" 20
 *   npx tsx scripts/scrape-leads.ts "autoservis Brno" 50
 *
 * ⚠️ WARNING: This may violate Google's Terms of Service. Use at your own risk.
 */

import { scrapeAndImportLeads } from '../lib/lead-scraper';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Missing search query');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/scrape-leads.ts "pekárna Praha" [maxResults]');
    console.log('\nExamples:');
    console.log('  npx tsx scripts/scrape-leads.ts "pekárna Praha" 20');
    console.log('  npx tsx scripts/scrape-leads.ts "autoservis Brno" 50');
    console.log('  npx tsx scripts/scrape-leads.ts "květinářství Ostrava" 30');
    process.exit(1);
  }

  const searchQuery = args[0];
  const maxResults = args[1] ? parseInt(args[1]) : 20;

  console.log('🤖 Lead Scraper Bot');
  console.log('==================\n');
  console.log(`Query: "${searchQuery}"`);
  console.log(`Max Results: ${maxResults}\n`);

  try {
    const result = await scrapeAndImportLeads({
      searchQuery,
      maxResults,
      headless: true,
    });

    console.log('\n✅ Done!');
    console.log(`\nNext steps:`);
    console.log(`1. Go to admin panel: http://localhost:3000/admin/lead-generation`);
    console.log(`2. Click "Analyzovat" on each lead to analyze their website`);
    console.log(`3. Click "Generovat email" to create personalized emails`);
    console.log(`4. Send emails manually via Titan`);
  } catch (error: any) {
    console.error('\n❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

main();
