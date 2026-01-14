/**
 * Payment confirmation email template
 */

export interface PaymentConfirmationData {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  variableSymbol?: string;
}

/**
 * Generate HTML email for payment confirmation
 */
export function generatePaymentConfirmationEmail(data: PaymentConfirmationData): string {
  const formattedAmount = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount);

  const formattedDate = data.paymentDate.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potvrzení o přijetí platby - Weblyx</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ✅ Platba přijata
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 18px; color: #111827; font-weight: 600;">
                Dobrý den, ${data.customerName},
              </p>
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Děkujeme! Vaše platba byla úspěšně přijata a zpracována.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px solid #14B8A6; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #065F46; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Detaily platby
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #374151;">Faktura č.:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong style="font-size: 16px; color: #111827;">${data.invoiceNumber}</strong>
                        </td>
                      </tr>
                      ${data.variableSymbol ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #374151;">Variabilní symbol:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong style="font-size: 16px; color: #111827;">${data.variableSymbol}</strong>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #374151;">Uhrazená částka:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong style="font-size: 20px; color: #14B8A6;">${formattedAmount}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="font-size: 14px; color: #374151;">Datum platby:</span>
                        </td>
                        <td style="padding: 8px 0; text-align: right;">
                          <strong style="font-size: 16px; color: #111827;">${formattedDate}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <div style="background-color: #F0FDF4; border-left: 4px solid #14B8A6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 16px; color: #065F46; font-weight: 600;">
                  ✓ Faktura uhrazena
                </p>
                <p style="margin: 0; font-size: 14px; color: #065F46;">
                  Faktura byla označena jako uhrazená. Tímto emailem Vám potvrzujeme přijetí platby.
                </p>
              </div>
              <p style="margin: 24px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
                V případě jakýchkoli dotazů nás neváhejte kontaktovat na <a href="mailto:info@weblyx.cz" style="color: #14B8A6; text-decoration: none;">info@weblyx.cz</a>.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151;">
                Děkujeme za Vaši důvěru!
              </p>
              <p style="margin: 8px 0 0 0; font-size: 16px; color: #374151; font-weight: 600;">
                Tým Weblyx
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">
                <strong>Weblyx</strong> – Profesionální tvorba webů
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                Praha, Česká republika | <a href="https://weblyx.cz" style="color: #14B8A6; text-decoration: none;">weblyx.cz</a>
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
