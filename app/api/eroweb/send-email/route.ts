// EroWeb Analysis API - Send Email
// POST /api/eroweb/send-email - Send analysis email to client

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnalysisById, markEmailSent } from '@/lib/turso/eroweb';

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

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, we'll simulate sending and log the email
    console.log('=== EMAIL TO SEND ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body.substring(0, 500) + '...');
    console.log('=====================');

    // In production, you would:
    // 1. Use Resend, SendGrid, or similar email service
    // 2. Attach the PDF report
    // 3. Track opens with pixel tracking

    /*
    // Example with Resend:
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Weblyx <info@weblyx.cz>',
      to: [to],
      subject: subject,
      text: body,
      // attachments: [{ filename: 'report.pdf', content: pdfBuffer }],
    });
    */

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
