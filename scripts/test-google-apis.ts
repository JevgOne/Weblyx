#!/usr/bin/env tsx

/**
 * Test Google Analytics & Search Console APIs
 *
 * This script tests if service account credentials work
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env.production.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { getGA4Overview, getGA4TopPages } from '../lib/google-analytics';
import {
  getSearchConsoleOverview,
  getSearchConsoleTopQueries,
  getSearchConsoleSitemaps
} from '../lib/google-search-console';

async function testGoogleAPIs() {
  console.log('🔍 Testing Google APIs\n');

  // Check env variables
  const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
  const SEARCH_CONSOLE_SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || 'https://www.weblyx.cz';

  console.log('📋 Configuration:');
  console.log(`   GA4_PROPERTY_ID: ${GA4_PROPERTY_ID || '❌ NOT SET'}`);
  console.log(`   Site URL: ${SEARCH_CONSOLE_SITE_URL}`);
  console.log(`   Service Account: service-account-key.json\n`);

  // Test GA4
  if (GA4_PROPERTY_ID) {
    console.log('📊 Testing Google Analytics 4...');
    try {
      const overview = await getGA4Overview('7daysAgo', 'today');
      console.log('✅ GA4 Connection successful!');
      console.log(`   Total Users: ${overview.summary.totalUsers}`);
      console.log(`   Total Sessions: ${overview.summary.totalSessions}`);
      console.log(`   Total Page Views: ${overview.summary.totalPageViews}\n`);
    } catch (error: any) {
      console.error('❌ GA4 Error:', error.message);
      console.error('   Make sure:');
      console.error('   1. Service account has access to GA4 property');
      console.error('   2. GA4_PROPERTY_ID is correct (format: 123456789)');
      console.error('   3. Analytics Data API is enabled in Google Cloud\n');
    }
  } else {
    console.log('⏭️  Skipping GA4 (GA4_PROPERTY_ID not set)\n');
  }

  // Test Search Console
  console.log('🔎 Testing Google Search Console...');
  try {
    const overview = await getSearchConsoleOverview(
      SEARCH_CONSOLE_SITE_URL,
      '2026-01-18', // 7 days ago
      '2026-01-25'  // today
    );
    console.log('✅ Search Console Connection successful!');
    console.log(`   Total Clicks: ${overview.summary.totalClicks}`);
    console.log(`   Total Impressions: ${overview.summary.totalImpressions}`);
    console.log(`   Average CTR: ${overview.summary.avgCtr.toFixed(2)}%`);
    console.log(`   Average Position: ${overview.summary.avgPosition.toFixed(1)}\n`);

    // Test sitemaps
    console.log('🗺️  Fetching sitemaps...');
    const sitemaps = await getSearchConsoleSitemaps(SEARCH_CONSOLE_SITE_URL);
    console.log(`✅ Found ${sitemaps.length} sitemaps`);
    sitemaps.forEach(sitemap => {
      console.log(`   - ${sitemap.path}`);
      sitemap.contents.forEach(content => {
        console.log(`     ${content.type}: ${content.indexed}/${content.submitted} indexed`);
      });
    });
  } catch (error: any) {
    console.error('❌ Search Console Error:', error.message);
    console.error('   Make sure:');
    console.error('   1. Service account email is added to Search Console as Owner');
    console.error('   2. Site URL is correct (https://www.weblyx.cz)');
    console.error('   3. Search Console API is enabled in Google Cloud\n');
  }

  console.log('\n🎉 Test complete!');
  console.log('\n📝 Next steps if errors:');
  console.log('   1. Add service account to GA4: weblyx-api-access@project-b619cc96-eaef-4512-a23.iam.gserviceaccount.com');
  console.log('   2. Add service account to Search Console (as Owner)');
  console.log('   3. Enable APIs in Google Cloud Console');
  console.log('   4. Set GA4_PROPERTY_ID env variable');
}

testGoogleAPIs();
