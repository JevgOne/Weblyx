/**
 * Test script for Resend email sending
 * Usage: tsx scripts/test-email.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { sendEmail, EMAIL_CONFIG } from '../lib/email/resend-client';

async function testEmail() {
  console.log('🧪 Testing Resend email service...\n');

  // Use Resend test email during development (doesn't require domain verification)
  const testTo = process.env.TEST_MODE === 'true' ? 'delivered@resend.dev' : EMAIL_CONFIG.adminEmail;
  const testFrom = process.env.TEST_MODE === 'true' ? 'Acme <onboarding@resend.dev>' : EMAIL_CONFIG.from;

  console.log('📧 From:', testFrom);
  console.log('📬 To:', testTo);
  console.log('');

  const result = await sendEmail({
    from: testFrom,
    to: testTo,
    subject: '✅ Test email z Weblyx - Resend funguje!',
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ✅ Resend funguje!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 600;">
                Gratulujeme! 🎉
              </p>
              <p style="margin: 0 0 12px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Email služba Resend je správně nakonfigurovaná a funguje perfektně.
              </p>
              <p style="margin: 0 0 12px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                <strong>Teď budou fungovat všechny notifikace:</strong>
              </p>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #374151; font-size: 16px; line-height: 1.8;">
                <li>📬 Kontaktní formulář</li>
                <li>⭐ Nové recenze</li>
                <li>💳 Platby (zrušení, vrácení)</li>
                <li>🔍 EroWeb analýzy</li>
                <li>📄 Faktury s PDF</li>
              </ul>
              <p style="margin: 0; font-size: 14px; color: #6B7280; padding: 16px; background-color: #F9FAFB; border-left: 4px solid #14B8A6; border-radius: 4px;">
                <strong>Čas odeslání:</strong> ${new Date().toLocaleString('cs-CZ')}<br>
                <strong>Odesláno z:</strong> ${EMAIL_CONFIG.from}
              </p>
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
    `,
    text: 'Resend email služba funguje! Tento email byl odeslán jako test z Weblyx projektu.',
  });

  if (result.success) {
    console.log('✅ Email byl úspěšně odeslán!');
    console.log('📨 Email ID:', result.data);
    console.log('\n🎯 Zkontrolujte inbox na:', EMAIL_CONFIG.adminEmail);
  } else {
    console.error('❌ Nepodařilo se odeslat email');
    console.error('Error:', result.error);
  }
}

testEmail().catch(console.error);
