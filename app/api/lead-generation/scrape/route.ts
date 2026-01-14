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
  // DISABLED: This endpoint violated Google's Terms of Service
  // Google has suspended accounts due to automated scraping
  // Use Google Places API instead for legitimate data access

  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint has been permanently disabled due to TOS violations',
    },
    { status: 403 }
  );
}
