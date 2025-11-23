import { NextRequest, NextResponse } from 'next/server';
import { getLead, updateLead } from '@/lib/turso/lead-generation';
import { analyzeWebsite } from '@/lib/web-analyzer';

/**
 * POST /api/lead-generation/analyze
 * Analyze website for a lead
 *
 * Body: { leadId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing lead ID',
        },
        { status: 400 }
      );
    }

    // Get lead
    const lead = await getLead(leadId);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: 'Lead not found',
        },
        { status: 404 }
      );
    }

    if (!lead.website) {
      return NextResponse.json(
        {
          success: false,
          error: 'Lead does not have a website URL',
        },
        { status: 400 }
      );
    }

    // Analyze website using Web Analyzer
    console.log(`= Analyzing website for lead ${leadId}: ${lead.website}`);

    const analysisResult = await analyzeWebsite(lead.website);

    // Update lead with analysis results
    await updateLead(leadId, {
      analysisScore: analysisResult.overallScore,
      analysisResult: analysisResult,
      analyzedAt: new Date(),
      // Calculate lead score based on analysis score
      // Lower analysis score = more potential for improvement = higher lead score
      leadScore: Math.max(0, 100 - analysisResult.overallScore),
    });

    console.log(` Website analyzed for lead ${leadId}. Score: ${analysisResult.overallScore}`);

    // Get updated lead
    const updatedLead = await getLead(leadId);

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      analysisResult,
    });
  } catch (error: any) {
    console.error('POST /api/lead-generation/analyze error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze website',
      },
      { status: 500 }
    );
  }
}
