import { sendEmail, EMAIL_CONFIG } from './resend-client';
import { Resend } from 'resend';

// Create Resend instance for direct API calls (needed for attachments)
const resend = new Resend(process.env.RESEND_API_KEY || '');

interface SendInvoiceEmailParams {
  to: string;
  invoiceNumber: string;
  clientName: string;
  amountCzk: number;
  dueDate: Date;
  pdfUrl: string;
  pdfBytes?: Uint8Array;
}

/**
 * Send invoice email with PDF attachment
 */
export async function sendInvoiceEmail(params: SendInvoiceEmailParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured - invoice email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const { to, invoiceNumber, clientName, amountCzk, dueDate, pdfUrl, pdfBytes } = params;

    // Format currency
    const formattedAmount = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountCzk);

    // Format due date
    const formattedDueDate = dueDate.toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Fetch PDF from URL if bytes not provided
    let pdfAttachment: Buffer;
    if (pdfBytes) {
      pdfAttachment = Buffer.from(pdfBytes);
    } else {
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error('Failed to fetch invoice PDF');
      }
      const arrayBuffer = await pdfResponse.arrayBuffer();
      pdfAttachment = Buffer.from(arrayBuffer);
    }

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="cs">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #14B8A6;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #14B8A6;
            margin-bottom: 10px;
          }
          h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .invoice-info {
            background-color: #f8fafa;
            border-left: 4px solid #14B8A6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .invoice-info p {
            margin: 8px 0;
          }
          .invoice-info strong {
            color: #14B8A6;
            font-weight: 600;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #14B8A6;
            text-align: center;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background-color: #14B8A6;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
          .payment-details {
            background-color: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
          }
          .payment-details h3 {
            color: #92400e;
            margin-top: 0;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">WEBLYX</div>
            <p style="color: #666; margin: 0;">Profesionální webové řešení</p>
          </div>

          <h1>Dobrý den, ${clientName}! 👋</h1>

          <p>Zasíláme Vám fakturu číslo <strong>${invoiceNumber}</strong> za poskytnuté služby.</p>

          <div class="invoice-info">
            <p><strong>Číslo faktury:</strong> ${invoiceNumber}</p>
            <p><strong>Částka k úhradě:</strong> ${formattedAmount}</p>
            <p><strong>Splatnost:</strong> ${formattedDueDate}</p>
          </div>

          <div class="amount">${formattedAmount}</div>

          <div class="payment-details">
            <h3>💳 Platební údaje</h3>
            <p><strong>Číslo účtu:</strong> 6424423004/5500</p>
            <p><strong>Variabilní symbol:</strong> ${invoiceNumber.replace('-', '')}</p>
            <p style="margin-bottom: 0;"><strong>Poznámka:</strong> Prosím, uveďte variabilní symbol pro správné párování platby.</p>
          </div>

          <p>Faktura je připojena k tomuto emailu ve formátu PDF. Můžete ji také stáhnout z našeho systému:</p>

          <div style="text-align: center;">
            <a href="${pdfUrl}" class="cta-button">📄 Stáhnout fakturu</a>
          </div>

          <p style="margin-top: 30px;">V případě jakýchkoli dotazů nás neváhejte kontaktovat.</p>

          <div class="footer">
            <p><strong>Weblyx</strong></p>
            <p>Email: <a href="mailto:info@weblyx.cz" style="color: #14B8A6;">info@weblyx.cz</a></p>
            <p>Web: <a href="https://weblyx.cz" style="color: #14B8A6;">weblyx.cz</a></p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              Tento email byl vygenerován automaticky. Prosím neodpovídejte na něj.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create plain text version
    const emailText = `
Dobrý den, ${clientName}!

Zasíláme Vám fakturu číslo ${invoiceNumber} za poskytnuté služby.

Číslo faktury: ${invoiceNumber}
Částka k úhradě: ${formattedAmount}
Splatnost: ${formattedDueDate}

PLATEBNÍ ÚDAJE:
Číslo účtu: 6424423004/5500
Variabilní symbol: ${invoiceNumber.replace('-', '')}

Faktura je připojena k tomuto emailu ve formátu PDF.
Můžete ji také stáhnout zde: ${pdfUrl}

V případě jakýchkoliv dotazů nás neváhejte kontaktovat.

--
Weblyx
Email: info@weblyx.cz
Web: weblyx.cz
    `.trim();

    // Send email with Resend
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: `Faktura ${invoiceNumber} - ${formattedAmount}`,
      html: emailHtml,
      text: emailText,
      attachments: [
        {
          filename: `Faktura_${invoiceNumber}.pdf`,
          content: pdfAttachment,
        },
      ],
    });

    console.log('✅ Invoice email sent successfully:', {
      to,
      invoiceNumber,
      messageId: result.data?.id,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('❌ Invoice email sending failed:', error);
    return { success: false, error: error.message };
  }
}
