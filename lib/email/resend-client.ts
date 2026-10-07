import { Resend } from 'resend';

// Email sender configuration
export const EMAIL_CONFIG = {
  // Trimmed: the production value carried a trailing newline.
  from: process.env.RESEND_FROM_EMAIL?.trim() || 'Weblyx <noreply@weblyx.cz>',
  adminEmail: process.env.ADMIN_EMAIL?.trim() || 'info@weblyx.cz',
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
    // 🛑 Global kill switch — set EMAILS_DISABLED=true to stop ALL outgoing emails.
    // Reversible: remove the env var (or set to anything but "true") to re-enable.
    if (process.env.EMAILS_DISABLED === 'true') {
      console.warn(`🛑 Email sending is disabled (EMAILS_DISABLED=true) — skipped email to ${params.to}`);
      return { success: false, error: 'Email sending disabled' };
    }

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

    // Resend reports a rejected message in the payload instead of throwing —
    // an invalid API key came back as { data: null, error } and was counted
    // as a sent e-mail by every caller.
    if (result.error) {
      console.error('❌ Email rejected by Resend:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}
