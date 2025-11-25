import { NextRequest, NextResponse } from 'next/server';
import {
  getAllLeads,
  createLead,
} from '@/lib/turso/lead-generation';
import { CreateLeadData } from '@/types/lead-generation';

/**
 * GET /api/lead-generation
 * Get all leads from lead generation system
 * Query params:
 *  - limit: number (optional) - limit number of results
 *  - includeAnalysis: boolean (optional) - include full analysis results (default: false for performance)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const includeAnalysis = searchParams.get('includeAnalysis') === 'true';

    // Default: limit 100 leads, exclude analysis_result for performance
    const leads = await getAllLeads(limit || 100, includeAnalysis);

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
    });
  } catch (error: any) {
    console.error('GET /api/lead-generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch leads',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lead-generation
 * Create a new lead
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateLeadData = await request.json();

    // Validate required fields
    if (!body.companyName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: companyName and email',
        },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await createLead(body);

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error: any) {
    console.error('POST /api/lead-generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create lead',
      },
      { status: 500 }
    );
  }
}
