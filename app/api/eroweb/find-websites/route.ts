// EroWeb Analysis API - Automatic Website Finder
// POST /api/eroweb/find-websites - Find new competitor websites automatically

import { NextRequest, NextResponse } from 'next/server';
import { findNewWebsites } from '@/lib/scrapers/web-finder';
import { getAllAnalyses, createAnalysis } from '@/lib/turso/eroweb';
import type { BusinessType } from '@/types/eroweb';

export async function POST(req: NextRequest) {
  try {
    console.log('[FindWebsites] Starting automatic website search...');

    // Get all existing domains from database
    const { analyses } = await getAllAnalyses({ limit: 10000 });
    const existingDomains = analyses.map(a => a.domain);

    console.log(`[FindWebsites] Found ${existingDomains.length} existing analyses`);

    // Find new websites
    const newWebsites = await findNewWebsites(existingDomains);

    console.log(`[FindWebsites] Found ${newWebsites.length} new websites`);

    if (newWebsites.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new websites found',
        found: 0,
        created: 0,
        websites: [],
      });
    }

    // Create pending analyses for new websites
    const created: string[] = [];
    const errors: string[] = [];

    for (const website of newWebsites) {
      try {
        // Determine business type
        let businessType: BusinessType = 'massage';
        if (website.businessType) {
          businessType = website.businessType;
        }

        // Create pending analysis
        const analysis = await createAnalysis({
          url: website.url,
          businessType,
          contactName: website.title || undefined,
          contactEmail: undefined, // No email from search results
        });

        created.push(analysis.domain);
        console.log(`[FindWebsites] Created analysis for ${analysis.domain}`);
      } catch (error: any) {
        console.error(`[FindWebsites] Failed to create analysis for ${website.domain}:`, error.message);
        errors.push(website.domain);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${newWebsites.length} new websites, created ${created.length} analyses`,
      found: newWebsites.length,
      created: created.length,
      errors: errors.length,
      websites: newWebsites.map(w => ({
        domain: w.domain,
        url: w.url,
        source: w.source,
        businessType: w.businessType,
        title: w.title,
        description: w.description,
      })),
      createdDomains: created,
      errorDomains: errors,
    });
  } catch (error: any) {
    console.error('[FindWebsites] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find websites',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
