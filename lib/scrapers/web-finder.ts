// Automatic Web Finder - Scrapes public directories for competitor websites
// This is LEGAL - scraping publicly available business directories

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface FoundWebsite {
  url: string;
  domain: string;
  source: string;
  businessType?: 'massage' | 'privat' | 'escort';
  title?: string;
  phone?: string;
  email?: string;
}

// Public directory sources
const SOURCES = [
  {
    name: 'erosservis.cz',
    url: 'https://www.erosservis.cz/katalog/',
    type: 'massage' as const,
  },
  {
    name: 'eroticke-masaze.cz',
    url: 'https://www.eroticke-masaze.cz/',
    type: 'massage' as const,
  },
  {
    name: 'erotic-list.cz',
    url: 'https://www.erotic-list.cz/',
    type: 'privat' as const,
  },
];

/**
 * Extract valid website URLs from HTML
 */
function extractWebsiteUrls(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  // Find all links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    try {
      // Skip internal links, social media, email
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.includes('facebook.com') ||
        href.includes('instagram.com') ||
        href.includes('twitter.com') ||
        href.includes('youtube.com')
      ) {
        return;
      }

      let fullUrl: string;
      if (href.startsWith('http')) {
        fullUrl = href;
      } else if (href.startsWith('/')) {
        const base = new URL(baseUrl);
        fullUrl = `${base.protocol}//${base.host}${href}`;
      } else {
        fullUrl = new URL(href, baseUrl).href;
      }

      const url = new URL(fullUrl);

      // Only Czech domains or obvious websites
      if (
        url.hostname.endsWith('.cz') ||
        url.hostname.endsWith('.com') ||
        url.hostname.endsWith('.eu')
      ) {
        // Skip the source domain itself
        const sourceDomain = new URL(baseUrl).hostname;
        if (!url.hostname.includes(sourceDomain)) {
          urls.add(fullUrl);
        }
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });

  return Array.from(urls);
}

/**
 * Extract contact info from page
 */
function extractContactInfo(html: string): { phone?: string; email?: string; title?: string } {
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim() || $('title').text().trim();

  // Find phone numbers
  const phoneRegex = /(\+420\s?)?[67]\d{2}\s?\d{3}\s?\d{3}/g;
  const phones = html.match(phoneRegex);
  const phone = phones?.[0]?.replace(/\s/g, '');

  // Find emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex);
  const email = emails?.[0];

  return { phone, email, title };
}

/**
 * Scrape a single source
 */
async function scrapeSource(source: typeof SOURCES[0]): Promise<FoundWebsite[]> {
  try {
    console.log(`[WebFinder] Scraping ${source.name}...`);

    const response = await axios.get(source.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const urls = extractWebsiteUrls(response.data, source.url);
    console.log(`[WebFinder] Found ${urls.length} URLs from ${source.name}`);

    const websites: FoundWebsite[] = [];

    // Process each URL
    for (const url of urls.slice(0, 50)) { // Limit to 50 per source
      try {
        const domain = new URL(url).hostname.replace('www.', '');

        // Try to get contact info from the website
        const siteResponse = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const contactInfo = extractContactInfo(siteResponse.data);

        websites.push({
          url,
          domain,
          source: source.name,
          businessType: source.type,
          ...contactInfo,
        });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        // Skip this URL if we can't access it
        console.log(`[WebFinder] Failed to access ${url}`);
      }
    }

    return websites;
  } catch (error: any) {
    console.error(`[WebFinder] Error scraping ${source.name}:`, error.message);
    return [];
  }
}

/**
 * Find new websites from all sources
 */
export async function findWebsites(): Promise<FoundWebsite[]> {
  console.log('[WebFinder] Starting website search...');

  const allWebsites: FoundWebsite[] = [];

  for (const source of SOURCES) {
    const websites = await scrapeSource(source);
    allWebsites.push(...websites);

    // Rate limiting between sources
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Deduplicate by domain
  const uniqueWebsites = Array.from(
    new Map(allWebsites.map(w => [w.domain, w])).values()
  );

  console.log(`[WebFinder] Found ${uniqueWebsites.length} unique websites`);

  return uniqueWebsites;
}

/**
 * Find websites and filter out already analyzed ones
 */
export async function findNewWebsites(
  existingDomains: string[]
): Promise<FoundWebsite[]> {
  const allWebsites = await findWebsites();

  const existingSet = new Set(existingDomains.map(d => d.toLowerCase()));

  const newWebsites = allWebsites.filter(
    w => !existingSet.has(w.domain.toLowerCase())
  );

  console.log(`[WebFinder] ${newWebsites.length} new websites (${allWebsites.length - newWebsites.length} already analyzed)`);

  return newWebsites;
}
