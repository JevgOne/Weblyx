// Google Maps Lead Scraper
// ⚠️ WARNING: This may violate Google's Terms of Service. Use at your own risk.

import puppeteer from 'puppeteer';
import { createLead } from './turso/lead-generation';

export interface ScraperOptions {
  searchQuery: string; // e.g., "pekárna Praha"
  maxResults?: number; // default: 20
  headless?: boolean; // default: true
}

export interface ScrapedLead {
  companyName: string;
  website?: string;
  phone?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
}

/**
 * Scrape leads from Google Maps
 */
export async function scrapeGoogleMaps(options: ScraperOptions): Promise<ScrapedLead[]> {
  const { searchQuery, maxResults = 20, headless = true } = options;

  console.log(`🤖 Starting Google Maps scraper for: "${searchQuery}"`);
  console.log(`📊 Target: ${maxResults} results`);

  const browser = await puppeteer.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to Google Maps
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    console.log(`🌐 Navigating to: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for results to load
    await page.waitForSelector('div[role="feed"]', { timeout: 10000 });

    console.log('✅ Results loaded, starting to scrape...');

    // Scroll to load more results
    const resultsSelector = 'div[role="feed"]';
    await autoScroll(page, resultsSelector, maxResults);

    // Extract leads from the page
    const leads = await page.evaluate((maxCount) => {
      const results: ScrapedLead[] = [];
      const items = document.querySelectorAll('div[role="feed"] > div > div[jsaction]');

      console.log(`Found ${items.length} items`);

      for (let i = 0; i < Math.min(items.length, maxCount); i++) {
        const item = items[i];

        try {
          // Company name
          const nameElement = item.querySelector('div.fontHeadlineSmall');
          const companyName = nameElement?.textContent?.trim() || '';

          if (!companyName) continue;

          // Rating
          const ratingElement = item.querySelector('span[role="img"]');
          const ratingText = ratingElement?.getAttribute('aria-label') || '';
          const ratingMatch = ratingText.match(/(\d+[.,]\d+)/);
          const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : undefined;

          // Review count
          const reviewElement = item.querySelector('span.fontBodyMedium > span > span');
          const reviewText = reviewElement?.textContent?.trim() || '';
          const reviewMatch = reviewText.match(/\((\d+)\)/);
          const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : undefined;

          // Address (basic extraction)
          const addressElements = item.querySelectorAll('div.fontBodyMedium');
          let address = '';
          addressElements.forEach((el) => {
            const text = el.textContent?.trim() || '';
            if (text.includes('·')) {
              address = text.split('·')[0].trim();
            }
          });

          results.push({
            companyName,
            rating,
            reviewCount,
            address: address || undefined,
          });
        } catch (error) {
          console.error('Error extracting item:', error);
        }
      }

      return results;
    }, maxResults);

    console.log(`✅ Scraped ${leads.length} leads from Google Maps`);

    // Now click on each result to get website and phone
    console.log('🔍 Extracting websites and phones...');

    for (let i = 0; i < Math.min(leads.length, maxResults); i++) {
      try {
        // Click on the result
        const items = await page.$$('div[role="feed"] > div > div[jsaction]');
        if (items[i]) {
          await items[i].click();
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for details to load

          // Extract website
          const websiteLink = await page.evaluate(() => {
            const link = document.querySelector('a[data-item-id="authority"]') as HTMLAnchorElement;
            return link?.href || '';
          });

          if (websiteLink) {
            // Clean URL
            let cleanUrl = websiteLink;
            try {
              const url = new URL(websiteLink);
              cleanUrl = url.hostname.replace('www.', '');
            } catch (e) {
              // Keep original if parsing fails
            }
            leads[i].website = cleanUrl;
          }

          // Extract phone
          const phone = await page.evaluate(() => {
            const phoneButton = document.querySelector('button[data-item-id^="phone:tel:"]');
            const phoneText = phoneButton?.getAttribute('data-item-id');
            return phoneText?.replace('phone:tel:', '') || '';
          });

          if (phone) {
            leads[i].phone = phone;
          }

          console.log(`  ${i + 1}/${leads.length}: ${leads[i].companyName} - ${leads[i].website || 'no website'}`);
        }
      } catch (error) {
        console.error(`Error extracting details for lead ${i}:`, error);
      }
    }

    return leads;
  } catch (error) {
    console.error('❌ Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Auto-scroll function to load more results
 */
async function autoScroll(page: any, selector: string, maxResults: number) {
  await page.evaluate(
    async (sel: string, max: number) => {
      const feed = document.querySelector(sel);
      if (!feed) return;

      let previousHeight = 0;
      let currentHeight = feed.scrollHeight;
      let attempts = 0;
      const maxAttempts = 20;

      while (attempts < maxAttempts) {
        feed.scrollTo(0, currentHeight);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        previousHeight = currentHeight;
        currentHeight = feed.scrollHeight;

        // Check if we have enough results
        const items = document.querySelectorAll('div[role="feed"] > div > div[jsaction]');
        if (items.length >= max) {
          console.log(`Reached target of ${max} results`);
          break;
        }

        // Check if scroll didn't change (end of results)
        if (currentHeight === previousHeight) {
          console.log('Reached end of results');
          break;
        }

        attempts++;
      }
    },
    selector,
    maxResults
  );
}

/**
 * Extract email from website
 */
export async function extractEmailFromWebsite(websiteUrl: string): Promise<string | null> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Normalize URL
    let url = websiteUrl;
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    // Extract emails from page content
    const email = await page.evaluate(() => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const bodyText = document.body.innerText;
      const matches = bodyText.match(emailRegex);

      if (!matches || matches.length === 0) return null;

      // Filter out common spam/image emails
      const validEmails = matches.filter((email) => {
        const lower = email.toLowerCase();
        return (
          !lower.includes('example.com') &&
          !lower.includes('sentry') &&
          !lower.includes('wixpress') &&
          !lower.includes('placeholder') &&
          !lower.includes('.png') &&
          !lower.includes('.jpg')
        );
      });

      // Prefer info@, kontakt@, obchod@ emails
      const preferredEmail = validEmails.find(
        (email) =>
          email.toLowerCase().startsWith('info@') ||
          email.toLowerCase().startsWith('kontakt@') ||
          email.toLowerCase().startsWith('obchod@')
      );

      return preferredEmail || validEmails[0] || null;
    });

    return email;
  } catch (error) {
    console.error(`Failed to extract email from ${websiteUrl}:`, error);
    return null;
  } finally {
    await browser.close();
  }
}

/**
 * Scrape leads and import them to database
 */
export async function scrapeAndImportLeads(options: ScraperOptions) {
  console.log('🚀 Starting automated lead generation...');

  // Step 1: Scrape Google Maps
  const scrapedLeads = await scrapeGoogleMaps(options);

  console.log(`\n📊 Scraped ${scrapedLeads.length} leads`);
  console.log('📧 Extracting emails from websites...\n');

  // Step 2: Extract emails
  const leadsWithEmails: Array<{ lead: ScrapedLead; email: string }> = [];

  for (let i = 0; i < scrapedLeads.length; i++) {
    const lead = scrapedLeads[i];

    if (!lead.website) {
      console.log(`  ${i + 1}/${scrapedLeads.length}: ${lead.companyName} - ⚠️ No website`);
      continue;
    }

    try {
      const email = await extractEmailFromWebsite(lead.website);

      if (email) {
        leadsWithEmails.push({ lead, email });
        console.log(`  ${i + 1}/${scrapedLeads.length}: ${lead.companyName} - ✅ ${email}`);
      } else {
        console.log(`  ${i + 1}/${scrapedLeads.length}: ${lead.companyName} - ⚠️ No email found`);
      }
    } catch (error) {
      console.log(`  ${i + 1}/${scrapedLeads.length}: ${lead.companyName} - ❌ Error`);
    }

    // Rate limiting: wait 2 seconds between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Found ${leadsWithEmails.length} leads with emails`);
  console.log('💾 Importing to database...\n');

  // Step 3: Import to database
  const imported: string[] = [];

  for (const { lead, email } of leadsWithEmails) {
    try {
      const createdLead = await createLead({
        companyName: lead.companyName,
        email,
        website: lead.website,
        phone: lead.phone,
        notes: `Scraped from Google Maps. Rating: ${lead.rating || 'N/A'}, Reviews: ${lead.reviewCount || 0}`,
      });

      imported.push(createdLead.id);
      console.log(`  ✅ Imported: ${lead.companyName}`);
    } catch (error: any) {
      console.log(`  ❌ Failed to import ${lead.companyName}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Lead generation complete!`);
  console.log(`   Scraped: ${scrapedLeads.length}`);
  console.log(`   With emails: ${leadsWithEmails.length}`);
  console.log(`   Imported: ${imported.length}`);

  return {
    scraped: scrapedLeads.length,
    withEmails: leadsWithEmails.length,
    imported: imported.length,
    leadIds: imported,
  };
}
