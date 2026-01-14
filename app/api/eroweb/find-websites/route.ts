// EroWeb Analysis API - Automatic Website Finder
// DISABLED: This endpoint used automated scraping which violated Google TOS

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // DISABLED: Automated website finding via web scraping violated Google's Terms of Service
  // This caused Google Account suspension and Business Profile suspension
  // Use manual website entry instead

  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint has been permanently disabled due to Google TOS violations',
      message: 'Please add websites manually through the admin interface',
    },
    { status: 403 }
  );
}
