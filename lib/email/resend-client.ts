import { Resend } from 'resend';

// Email sender configuration
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'Weblyx <noreply@weblyx.cz>',
  adminEmail: process.env.ADMIN_EMAIL || 'info@weblyx.cz',
} as const;

// Lazy initialize Resend client to ensure API key is loaded
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Send email with error handling
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string; // Optional override for testing
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured - email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const resend = getResendClient();
    const { from, ...otherParams } = params;
    const result = await resend.emails.send({
      from: from || EMAIL_CONFIG.from,
      ...otherParams,
    });

    console.log('✅ Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}
