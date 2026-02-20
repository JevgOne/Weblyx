import { NextRequest, NextResponse } from 'next/server';
import { createReview } from '@/lib/turso/reviews';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email/resend-client';
import { generateReviewSubmissionEmail } from '@/lib/email/templates';

export const runtime = 'nodejs';

// Rate limiting pomocí simple in-memory store (pro produkci použít Redis)
const submissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxSubmissions = 3; // Max 3 submissions per hour

  const ipSubmissions = submissions.get(ip) || [];
  const recentSubmissions = ipSubmissions.filter(time => now - time < windowMs);

  if (recentSubmissions.length >= maxSubmissions) {
    return true;
  }

  recentSubmissions.push(now);
  submissions.set(ip, recentSubmissions);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Příliš mnoho recenzí. Zkuste to prosím později.'
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.authorName || body.authorName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Prosím vyplňte své jméno (min. 2 znaky)' },
        { status: 400 }
      );
    }

    if (!body.text || body.text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Recenze musí obsahovat alespoň 10 znaků' },
        { status: 400 }
      );
    }

    if (body.text.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Recenze je příliš dlouhá (max. 1000 znaků)' },
        { status: 400 }
      );
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Prosím vyberte hodnocení 1-5 hvězdiček' },
        { status: 400 }
      );
    }

    // Simple spam detection
    const spamKeywords = ['http://', 'https://', 'www.', 'click here', 'buy now'];
    const hasSpam = spamKeywords.some(keyword =>
      body.text.toLowerCase().includes(keyword) ||
      (body.authorName && body.authorName.toLowerCase().includes(keyword))
    );

    if (hasSpam) {
      return NextResponse.json(
        { success: false, error: 'Recenze obsahuje nepovolený obsah' },
        { status: 400 }
      );
    }

    // Create review (unpublished by default - admin must approve)
    const review = await createReview({
      authorName: body.authorName.trim(),
      authorRole: body.authorRole?.trim() || undefined,
      rating: Number(body.rating),
      text: body.text.trim(),
      date: new Date(),
      source: 'manual',
      published: false, // Requires admin approval
      featured: false,
    });

    // Send email notification to admin about new review
    try {
      const emailHtml = generateReviewSubmissionEmail({
        authorName: body.authorName.trim(),
        authorRole: body.authorRole?.trim(),
        rating: Number(body.rating),
        text: body.text.trim(),
        reviewId: review.id,
      });

      const emailResult = await sendEmail({
        to: EMAIL_CONFIG.adminEmail,
        subject: `⭐ Nová recenze od ${body.authorName.trim()} (${body.rating}/5)`,
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error("⚠️ Failed to send review notification:", emailResult.error);
      }
    } catch (emailError) {
      console.error("⚠️ Email notification error:", emailError);
      // Continue - review is saved, email is not critical
    }

    return NextResponse.json({
      success: true,
      message: 'Děkujeme za vaši recenzi! Po schválení administrátorem bude zveřejněna.',
      data: {
        id: review.id,
      },
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: 'Nepodařilo se odeslat recenzi. Zkuste to prosím později.' },
      { status: 500 }
    );
  }
}
