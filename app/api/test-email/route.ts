import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email/resend-client';

/**
 * Test endpoint for email delivery
 * GET /api/test-email
 */
export async function GET(request: NextRequest) {
  try {
    const result = await sendEmail({
      to: EMAIL_CONFIG.adminEmail,
      subject: 'Test Email z Weblyx - Production Check',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #14B8A6; margin: 0 0 16px 0;">Email funguje!</h1>
    <p style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">
      Tento testovací email byl úspěšně odeslán z production prostředí Weblyx.
    </p>
    <div style="background: #F0FDF4; border-left: 4px solid #14B8A6; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #065F46; font-size: 14px;">
        <strong>Odesláno:</strong> ${new Date().toLocaleString('cs-CZ')}<br>
        <strong>Z adresy:</strong> ${EMAIL_CONFIG.from}<br>
        <strong>Prostředí:</strong> ${process.env.NODE_ENV || 'development'}
      </p>
    </div>
    <p style="margin: 20px 0 0 0; color: #6B7280; font-size: 14px;">
      Pokud vidíte tento email, znamená to, že Resend je správně nakonfigurovaný!
    </p>
  </div>
</body>
</html>
      `,
      text: 'Test email z Weblyx - Resend funguje!',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email byl úspěšně odeslán!',
        data: result.data,
        config: {
          from: EMAIL_CONFIG.from,
          to: EMAIL_CONFIG.adminEmail,
          apiKeySet: !!process.env.RESEND_API_KEY,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Email se nepodařilo odeslat',
        config: {
          from: EMAIL_CONFIG.from,
          to: EMAIL_CONFIG.adminEmail,
          apiKeySet: !!process.env.RESEND_API_KEY,
        },
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      config: {
        from: EMAIL_CONFIG.from,
        to: EMAIL_CONFIG.adminEmail,
        apiKeySet: !!process.env.RESEND_API_KEY,
        fromEnv: process.env.RESEND_FROM_EMAIL,
        adminEnv: process.env.ADMIN_EMAIL,
      },
    }, { status: 500 });
  }
}
