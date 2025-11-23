import { NextRequest, NextResponse } from 'next/server';
import { scrapeAndImportLeads } from '@/lib/lead-scraper';

/**
 * POST /api/lead-generation/scrape
 * Start automated lead scraping from Google Maps
 *
 * Body: {
 *   searchQuery: string;  // e.g., "pekrna Praha"
 *   maxResults?: number;  // default: 20
 * }
 *
 *  WARNING: This may violate Google's Terms of Service. Use at your own risk.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if running on Vercel production
    const isProduction = process.env.VERCEL_ENV === 'production';

    if (isProduction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scraping není dostupný na produkci kvůli Vercel limitům. Použijte CSV import nebo lokální scraping.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { searchQuery, maxResults = 20 } = body;

    if (!searchQuery) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing searchQuery parameter',
        },
        { status: 400 }
      );
    }

    console.log(`🤖 Starting lead scraper for: "${searchQuery}"`);

    // Run scraper
    const result = await scrapeAndImportLeads({
      searchQuery,
      maxResults: Math.min(maxResults, 50), // Limit to max 50
      headless: true,
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Scraped ${result.scraped} leads, found ${result.withEmails} emails, imported ${result.imported} to database`,
    });
  } catch (error: any) {
    console.error('POST /api/lead-generation/scrape error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to scrape leads',
      },
      { status: 500 }
    );
  }
}
