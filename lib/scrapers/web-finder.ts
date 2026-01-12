// Automatic Web Finder - Uses Brave Search API to find competitor websites
// Brave Search API: https://brave.com/search/api/ (Free: 2,500 queries/month)

import axios from 'axios';

export interface FoundWebsite {
  url: string;
  domain: string;
  source: string;
  businessType?: 'massage' | 'privat' | 'escort';
  title?: string;
  description?: string;
}

// Search queries for different business types and locations
const SEARCH_QUERIES = [
  // Massage
  { query: 'erotické masáže Praha', type: 'massage' as const },
  { query: 'tantra masáže Praha', type: 'massage' as const },
  { query: 'erotic massage Prague', type: 'massage' as const },
  { query: 'erotické masáže Brno', type: 'massage' as const },

  // Privat
  { query: 'privát Praha', type: 'privat' as const },
  { query: 'erotický klub Praha', type: 'privat' as const },
  { query: 'privát Brno', type: 'privat' as const },

  // Escort
  { query: 'escort Praha', type: 'escort' as const },
  { query: 'escort služby Praha', type: 'escort' as const },
];

// Domains to skip (aggregators, directories, not actual businesses)
const SKIP_DOMAINS = [
  'erosservis.cz',
  'eroticke-masaze.cz',
  'erotic-list.cz',
  'seznam.cz',
  'google.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'youtube.com',
  'pornhub.com',
  'xvideos.com',
  'sluzby.cz',
];

/**
 * Search using Brave Search API
 */
async function searchBrave(query: string): Promise<Array<{ url: string; title: string; description: string }>> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    console.warn('[WebFinder] BRAVE_SEARCH_API_KEY not set, skipping search');
    return [];
  }

  try {
    console.log(`[WebFinder] Searching Brave: "${query}"`);

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      params: {
        q: query,
        count: 20, // Number of results
        search_lang: 'cs',
        country: 'CZ',
        safesearch: 'off',
      },
      timeout: 10000,
    });

    const results = response.data?.web?.results || [];

    return results.map((r: any) => ({
      url: r.url,
      title: r.title,
      description: r.description || '',
    }));
  } catch (error: any) {
    console.error(`[WebFinder] Brave Search error:`, error.message);
    return [];
  }
}

/**
 * Check if domain should be skipped
 */
function shouldSkipDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase();
  return SKIP_DOMAINS.some(skip => lowerDomain.includes(skip));
}

/**
 * Process search results into FoundWebsite format
 */
function processSearchResults(
  results: Array<{ url: string; title: string; description: string }>,
  businessType: 'massage' | 'privat' | 'escort',
  sourceName: string
): FoundWebsite[] {
  const websites: FoundWebsite[] = [];

  for (const result of results) {
    try {
      const url = new URL(result.url);
      const domain = url.hostname.replace('www.', '');

      // Skip aggregators and non-business sites
      if (shouldSkipDomain(domain)) {
        continue;
      }

      // Only Czech domains (and some .com/.eu that are Czech businesses)
      if (!domain.endsWith('.cz') && !domain.endsWith('.com') && !domain.endsWith('.eu')) {
        continue;
      }

      websites.push({
        url: result.url,
        domain,
        source: sourceName,
        businessType,
        title: result.title,
        description: result.description,
      });
    } catch (e) {
      // Invalid URL, skip
    }
  }

  return websites;
}

/**
 * Find new websites using Brave Search API
 */
export async function findWebsites(): Promise<FoundWebsite[]> {
  console.log('[WebFinder] Starting website search with Brave Search API...');

  const allWebsites: FoundWebsite[] = [];

  for (const searchQuery of SEARCH_QUERIES) {
    const results = await searchBrave(searchQuery.query);
    const websites = processSearchResults(results, searchQuery.type, `Brave Search: ${searchQuery.query}`);

    console.log(`[WebFinder] Found ${websites.length} websites for "${searchQuery.query}"`);
    allWebsites.push(...websites);

    // Rate limiting between searches (Brave API has rate limits)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Deduplicate by domain
  const uniqueWebsites = Array.from(
    new Map(allWebsites.map(w => [w.domain, w])).values()
  );

  console.log(`[WebFinder] Found ${uniqueWebsites.length} unique websites total`);

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
