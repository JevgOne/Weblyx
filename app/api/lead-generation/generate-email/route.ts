import { NextRequest, NextResponse } from 'next/server';
import { getLead } from '@/lib/turso/lead-generation';
import { createGeneratedEmail } from '@/lib/turso/lead-generation';
import { generateEmail } from '@/lib/email-generator';

/**
 * POST /api/lead-generation/generate-email
 * Generate personalized email for a lead using GPT
 *
 * Body: { leadId: string, campaignId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, campaignId } = body;

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

    // Check if lead has been analyzed
    if (!lead.analyzedAt || !lead.analysisResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'Lead has not been analyzed yet. Please analyze the website first.',
        },
        { status: 400 }
      );
    }

    console.log(`📧 Generating email for lead ${leadId}: ${lead.companyName}`);

    // Generate email using GPT
    const emailResult = await generateEmail({
      companyName: lead.companyName,
      website: lead.website,
      analysisResult: lead.analysisResult,
      industry: lead.industry,
    });

    // Save generated email to database
    const generatedEmail = await createGeneratedEmail({
      leadId: lead.id,
      campaignId: campaignId || undefined,
      subject: emailResult.subject,
      body: emailResult.body,
    });

    console.log(` Email generated for lead ${leadId}. Tracking code: ${generatedEmail.trackingCode}`);

    return NextResponse.json({
      success: true,
      email: generatedEmail,
      confidence: emailResult.confidence,
    });
  } catch (error: any) {
    console.error('POST /api/lead-generation/generate-email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate email',
      },
      { status: 500 }
    );
  }
}
