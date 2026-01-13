/**
 * Email templates for various notifications
 * Using Tailwind-compatible HTML styling
 */

import { EMAIL_CONFIG } from './resend-client';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  companyName: string;
  projectType: string;
  description: string;
  leadId: string;
}

export interface ReviewSubmissionData {
  authorName: string;
  authorRole?: string;
  rating: number;
  text: string;
  reviewId: string;
}

export interface PaymentCancellationData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
}

export interface PaymentRefundData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
}

export interface PaymentConfirmationData {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  variableSymbol?: string;
}

/**
 * Generate HTML email for new contact form submission
 */
export function generateContactFormEmail(data: ContactFormData): string {
  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nová poptávka - Weblyx</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📬 Nová poptávka z webu
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Přišla vám nová poptávka přes kontaktní formulář na webu Weblyx.
              </p>

              <!-- Lead Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #14B8A6;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Jméno klienta
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 700;">
                      ${data.name}
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #14B8A6;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Email
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #111827;">
                      <a href="mailto:${data.email}" style="color: #14B8A6; text-decoration: none;">${data.email}</a>
                    </p>
                  </td>
                </tr>
                ${data.phone ? `
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #14B8A6;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Telefon
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #111827;">
                      <a href="tel:${data.phone}" style="color: #14B8A6; text-decoration: none;">${data.phone}</a>
                    </p>
                  </td>
                </tr>
                ` : ''}
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #14B8A6;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Firma
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 700;">
                      ${data.companyName}
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #14B8A6;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Typ projektu
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #111827;">
                      ${data.projectType}
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px; background-color: #f9fafb; border-left: 4px solid #14B8A6;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Popis projektu
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #111827; white-space: pre-wrap;">
                      ${data.description}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads"
                       style="display: inline-block; background-color: #14B8A6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Zobrazit poptávku v administraci
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #6B7280; text-align: center;">
                Lead ID: <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${data.leadId}</code>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Tento email byl vygenerován automaticky z webu <strong>Weblyx.cz</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email for new review submission
 */
export function generateReviewSubmissionEmail(data: ReviewSubmissionData): string {
  const stars = '⭐'.repeat(data.rating);

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nová recenze - Weblyx</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ⭐ Nová recenze čeká na schválení
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Někdo právě odeslal novou recenzi na vašem webu. Zkontrolujte ji a schvalte ke zveřejnění.
              </p>

              <!-- Review Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f9fafb; border-left: 4px solid #14B8A6; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Autor
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 18px; color: #111827; font-weight: 700;">
                      ${data.authorName}
                    </p>
                    ${data.authorRole ? `
                    <p style="margin: 0; font-size: 14px; color: #6B7280;">
                      ${data.authorRole}
                    </p>
                    ` : ''}
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #f9fafb; border-left: 4px solid #14B8A6; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Hodnocení
                    </p>
                    <p style="margin: 0; font-size: 24px;">
                      ${stars} (${data.rating}/5)
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #f9fafb; border-left: 4px solid #14B8A6; border-radius: 4px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #6B7280; font-weight: 600;">
                      Text recenze
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #111827; line-height: 1.6; white-space: pre-wrap;">
                      "${data.text}"
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/reviews"
                       style="display: inline-block; background-color: #14B8A6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Schválit recenzi v administraci
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #6B7280; text-align: center;">
                Review ID: <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${data.reviewId}</code>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Tento email byl vygenerován automaticky z webu <strong>Weblyx.cz</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email for payment cancellation
 */
export function generatePaymentCancellationEmail(data: PaymentCancellationData): string {
  const formattedAmount = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount);

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Platba byla zrušena - Weblyx</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                ❌ Platba byla zrušena
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Platba byla zákazníkem zrušena nebo vypršela její platnost.
              </p>

              <!-- Payment Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 6px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                      Číslo objednávky
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 700;">
                      ${data.orderId}
                    </p>

                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                      Částka
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 24px; color: #DC2626; font-weight: 700;">
                      ${formattedAmount}
                    </p>

                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                      ID platby
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #111827; font-family: monospace;">
                      ${data.paymentId}
                    </p>
                  </td>
                </tr>
              </table>

              ${data.customerEmail ? `
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6B7280;">
                <strong>Email zákazníka:</strong> <a href="mailto:${data.customerEmail}" style="color: #14B8A6;">${data.customerEmail}</a>
              </p>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/payments"
                       style="display: inline-block; background-color: #14B8A6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Zobrazit platby v administraci
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Tento email byl vygenerován automaticky systémem plateb <strong>Weblyx.cz</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email for payment refund
 */
export function generatePaymentRefundEmail(data: PaymentRefundData): string {
  const formattedAmount = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount);

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Platba byla vrácena - Weblyx</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                💰 Platba byla vrácena
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Byla provedena refundace platby zákazníkovi.
              </p>

              <!-- Payment Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 6px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                      Číslo objednávky
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 700;">
                      ${data.orderId}
                    </p>

                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                      Vrácená částka
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 24px; color: #D97706; font-weight: 700;">
                      ${formattedAmount}
                    </p>

                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                      ID platby
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #111827; font-family: monospace;">
                      ${data.paymentId}
                    </p>
                  </td>
                </tr>
              </table>

              ${data.customerEmail ? `
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #6B7280;">
                <strong>Email zákazníka:</strong> <a href="mailto:${data.customerEmail}" style="color: #14B8A6;">${data.customerEmail}</a>
              </p>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/payments"
                       style="display: inline-block; background-color: #14B8A6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Zobrazit platby v administraci
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #6B7280;">
                Tento email byl vygenerován automaticky systémem plateb <strong>Weblyx.cz</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
