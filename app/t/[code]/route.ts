import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailByTrackingCode,
  updateGeneratedEmail,
  getLead,
  updateLead,
  createTrackingEvent,
} from '@/lib/turso/lead-generation';

/**
 * GET /t/[code]
 * Tracking redirect endpoint
 *
 * 1. Records click event
 * 2. Updates email and lead stats
 * 3. Redirects to target URL (default: /poptavka)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const resolvedParams = await params;
  const trackingCode = resolvedParams.code.toUpperCase();

  try {
    // Get email by tracking code
    const email = await getEmailByTrackingCode(trackingCode);

    if (!email) {
      console.warn(`⚠️  Tracking code not found: ${trackingCode}`);
      // Still redirect to poptavka even if tracking code is invalid
      return NextResponse.redirect(new URL('/poptavka', request.url));
    }

    console.log(`🔗 Click tracked: ${trackingCode} (Lead: ${email.leadId})`);

    // Get request metadata
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || undefined;

    // Create tracking event
    await createTrackingEvent({
      trackingCode,
      eventType: 'click',
      ipAddress,
      userAgent,
      referer,
    });

    // Update email stats (first click only)
    if (!email.clicked) {
      await updateGeneratedEmail(email.id, {
        clicked: true,
        clickedAt: new Date(),
      });

      // Update lead stats
      const lead = await getLead(email.leadId);
      if (lead && !lead.linkClicked) {
        await updateLead(email.leadId, {
          linkClicked: true,
          linkClickedAt: new Date(),
          // Update lead status to "interested" if not already converted
          leadStatus: lead.leadStatus === 'new' || lead.leadStatus === 'contacted'
            ? 'interested'
            : lead.leadStatus,
        });
      }

      console.log(`✅ Stats updated for email ${email.id} and lead ${email.leadId}`);
    }

    // Redirect to poptavka page
    const redirectUrl = new URL('/poptavka', request.url);

    // Add tracking parameter for analytics
    redirectUrl.searchParams.set('ref', trackingCode.toLowerCase());

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error(`❌ Tracking error for code ${trackingCode}:`, error);

    // Still redirect even if tracking fails
    return NextResponse.redirect(new URL('/poptavka', request.url));
  }
}
