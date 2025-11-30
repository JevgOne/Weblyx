import { Resend } from 'resend';

// Initialize Resend client (with fallback for optional usage)
export const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');

// Email sender configuration
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'Weblyx <noreply@weblyx.cz>',
  adminEmail: process.env.ADMIN_EMAIL || 'info@weblyx.cz',
} as const;

/**
 * Send email with error handling
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured - email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      ...params,
    });

    console.log('✅ Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}
