// EroWeb Analysis API - Send Email
// POST /api/eroweb/send-email - Send analysis email to client

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnalysisById, markEmailSent } from '@/lib/turso/eroweb';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email/resend-client';

const SendEmailSchema = z.object({
  analysisId: z.string().min(1),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { analysisId, to, subject, body } = SendEmailSchema.parse(rawBody);

    // Verify analysis exists
    const analysis = await getAnalysisById(analysisId);
    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Send email with analysis results using Resend
    const emailResult = await sendEmail({
      to: to,
      subject: subject,
      html: `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Analýza vašeho webu
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${body.split('\n').map(line => `<p style="margin: 0 0 12px 0; font-size: 16px; color: #374151; line-height: 1.6;">${line}</p>`).join('')}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                <strong>Weblyx.cz</strong> - Profesionální tvorba webů
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      text: body, // Plain text fallback
      replyTo: EMAIL_CONFIG.adminEmail,
    });

    if (!emailResult.success) {
      console.error('❌ Failed to send EroWeb analysis email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Mark email as sent in database
    await markEmailSent(analysisId);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
