import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { GoPay } from '@/lib/gopay';
import type { PaymentStatus } from '@/types/payments';
import { sendEmail, EMAIL_CONFIG } from '@/lib/email/resend-client';
import { generatePaymentCancellationEmail, generatePaymentRefundEmail } from '@/lib/email/templates';
import { generatePaymentConfirmationEmail } from '@/lib/email/payment-confirmation';

/**
 * POST /api/payments/webhook
 *
 * GoPay webhook handler for payment status updates
 *
 * GoPay sends notifications when payment status changes:
 * - CREATED → PAYMENT_METHOD_CHOSEN
 * - PAYMENT_METHOD_CHOSEN → PAID
 * - PAID → REFUNDED
 * - etc.
 *
 * Security: GoPay signs all webhooks with HMAC-SHA256
 * Signature is in x-signature header
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature from header
    const signature = request.headers.get('x-signature');

    if (!signature) {
      console.error('❌ Webhook missing x-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify signature
    const isValid = GoPay.verifySignature(signature, rawBody);

    if (!isValid) {
      console.error('❌ Invalid webhook signature!');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = JSON.parse(rawBody);

    // Extract payment data
    const goPayId = payload.id?.toString();
    const goPayStatus = payload.state as PaymentStatus;
    const goPaySubState = payload.sub_state;
    const amountPaid = payload.amount;

    if (!goPayId || !goPayStatus) {
      console.error('❌ Invalid webhook payload - missing id or state');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Find payment in database
    const existingPayment = await turso.execute({
      sql: 'SELECT * FROM payments WHERE gopay_id = ?',
      args: [goPayId],
    });

    if (existingPayment.rows.length === 0) {
      console.error(`❌ Payment not found in database: ${goPayId}`);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = existingPayment.rows[0];
    const oldStatus = payment.gopay_status;

    // Update payment status
    const updateSql = goPayStatus === 'PAID'
      ? `UPDATE payments
         SET gopay_status = ?,
             paid_at = unixepoch(),
             updated_at = unixepoch()
         WHERE gopay_id = ?`
      : `UPDATE payments
         SET gopay_status = ?,
             updated_at = unixepoch()
         WHERE gopay_id = ?`;

    await turso.execute({
      sql: updateSql,
      args: [goPayStatus, goPayId],
    });

    // Handle PAID status
    if (goPayStatus === 'PAID') {
      // Generate invoice automatically via Fakturoid
      try {
        const { Fakturoid } = await import('@/lib/fakturoid');

        if (!Fakturoid.isConfigured()) {
          console.warn('⚠️ Fakturoid not configured, skipping invoice generation');
        } else {
          // Prepare invoice data
          const invoiceData = {
            subject: {
              name: (payment.payer_name as string) || 'Klient',
              email: payment.payer_email as string || undefined,
              phone: payment.payer_phone as string || undefined,
              registration_no: payment.payer_ico as string || undefined,
              vat_no: payment.payer_dic as string || undefined,
            },
            lines: [
              {
                name: payment.description as string,
                quantity: 1,
                unit_price: GoPay.halereToCzk(payment.amount as number),
                vat_rate: 21, // Default VAT rate
              },
            ],
            variable_symbol: payment.variable_symbol as string,
            note: `Platba provedena přes GoPay (ID: ${payment.gopay_id})`,
            payment_method: 'bank' as const,
          };

          // Create invoice in Fakturoid
          const fakturoidInvoice = await Fakturoid.createInvoice(invoiceData);

          // Mark invoice as paid (since payment is already completed)
          await Fakturoid.markAsPaid(fakturoidInvoice.id);

          // Send invoice via email
          if (payment.payer_email) {
            await Fakturoid.sendEmail(fakturoidInvoice.id, payment.payer_email as string);
          }

          // Store Fakturoid invoice ID in our database
          await turso.execute({
            sql: `INSERT INTO invoices (
              invoice_number, variable_symbol, payment_id, lead_id,
              invoice_type, client_name, client_email,
              amount_without_vat, vat_rate, vat_amount, amount_with_vat, currency,
              items, issue_date, due_date, paid_date,
              payment_method, status, pdf_url,
              notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              fakturoidInvoice.number,
              fakturoidInvoice.variable_symbol,
              payment.id,
              payment.lead_id || null,
              'standard',
              fakturoidInvoice.subject.name,
              fakturoidInvoice.subject.email || null,
              fakturoidInvoice.subtotal * 100, // Convert to haléře
              21,
              (fakturoidInvoice.total - fakturoidInvoice.subtotal) * 100,
              fakturoidInvoice.total * 100,
              'CZK',
              JSON.stringify(fakturoidInvoice.lines),
              Math.floor(new Date(fakturoidInvoice.issued_on).getTime() / 1000),
              Math.floor(new Date(fakturoidInvoice.due_on).getTime() / 1000),
              Math.floor(Date.now() / 1000), // paid_date
              'gopay',
              'paid',
              fakturoidInvoice.pdf_url,
              `Fakturoid ID: ${fakturoidInvoice.id}`,
            ],
          });

          // Get the invoice ID we just created
          const invoiceResult = await turso.execute({
            sql: 'SELECT id FROM invoices WHERE invoice_number = ?',
            args: [fakturoidInvoice.number],
          });

          if (invoiceResult.rows.length > 0) {
            // Update payment with invoice_id
            await turso.execute({
              sql: 'UPDATE payments SET invoice_id = ?, updated_at = unixepoch() WHERE id = ?',
              args: [invoiceResult.rows[0].id, payment.id],
            });
          }

        }

      } catch (error: any) {
        console.error('⚠️ Fakturoid invoice generation error:', error.message);
        // Don't fail the webhook if invoice generation fails
      }

      // If payment is linked to a lead, update lead status
      if (payment.lead_id) {
        try {
          await turso.execute({
            sql: `UPDATE leads
                  SET updated_at = unixepoch()
                  WHERE id = ?`,
            args: [payment.lead_id],
          });

        } catch (error: any) {
          console.error('⚠️ Failed to update lead:', error.message);
          // Don't fail the webhook if lead update fails
        }
      }

      // Send payment confirmation email to customer
      if (payment.payer_email) {
        try {
          const emailHtml = generatePaymentConfirmationEmail({
            customerName: (payment.payer_name as string) || 'Vážený zákazníku',
            invoiceNumber: payment.variable_symbol?.toString() || 'N/A',
            amount: GoPay.halereToCzk(payment.amount as number),
            currency: 'CZK',
            paymentDate: new Date(),
            variableSymbol: payment.variable_symbol?.toString(),
          });

          const emailResult = await sendEmail({
            to: payment.payer_email.toString(),
            subject: `✅ Potvrzení platby - Faktura ${payment.variable_symbol}`,
            html: emailHtml,
            from: EMAIL_CONFIG.from,
          });

          if (!emailResult.success) {
            console.error('⚠️ Failed to send payment confirmation email:', emailResult.error);
          }
        } catch (emailError: any) {
          console.error('⚠️ Payment confirmation email error:', emailError.message);
          // Don't fail the webhook if email fails
        }
      }
    }

    // Handle CANCELED/TIMEOUTED status
    if (goPayStatus === 'CANCELED' || goPayStatus === 'TIMEOUTED') {
      // Send cancellation email notification
      try {
        const emailHtml = generatePaymentCancellationEmail({
          paymentId: payment.id?.toString() || 'unknown',
          orderId: payment.order_number?.toString() || payment.id?.toString() || 'unknown',
          amount: Number(payment.amount) / 100, // Convert from haléře to CZK
          currency: payment.currency?.toString() || 'CZK',
          customerEmail: payment.payer_email?.toString(),
        });

        const emailResult = await sendEmail({
          to: EMAIL_CONFIG.adminEmail,
          subject: `❌ Platba zrušena - Objednávka #${payment.order_number?.toString() || payment.id || 'unknown'}`,
          html: emailHtml,
        });

        if (!emailResult.success) {
          console.error("⚠️ Failed to send cancellation email:", emailResult.error);
        }
      } catch (emailError) {
        console.error("⚠️ Cancellation email error:", emailError);
      }
    }

    // Handle REFUNDED status
    if (goPayStatus === 'REFUNDED' || goPayStatus === 'PARTIALLY_REFUNDED') {
      // TODO: Update invoice status (implement when invoice system is complete)

      // Send refund confirmation email
      try {
        const emailHtml = generatePaymentRefundEmail({
          paymentId: payment.id?.toString() || 'unknown',
          orderId: payment.order_number?.toString() || payment.id?.toString() || 'unknown',
          amount: Number(payment.amount) / 100, // Convert from haléře to CZK
          currency: payment.currency?.toString() || 'CZK',
          customerEmail: payment.payer_email?.toString(),
        });

        const emailResult = await sendEmail({
          to: EMAIL_CONFIG.adminEmail,
          subject: `💰 Platba vrácena - Objednávka #${payment.order_number?.toString() || payment.id || 'unknown'}`,
          html: emailHtml,
        });

        if (!emailResult.success) {
          console.error("⚠️ Failed to send refund email:", emailResult.error);
        }
      } catch (emailError) {
        console.error("⚠️ Refund email error:", emailError);
      }
    }

    // Always return 200 OK to acknowledge webhook receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
      payment_id: payment.id,
      status: goPayStatus,
    });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);

    // Return 200 even on error to prevent GoPay from retrying
    // (Log the error for investigation)
    return NextResponse.json({
      success: false,
      error: 'Internal error',
      message: error.message,
    }, { status: 200 });
  }
}

/**
 * GET /api/payments/webhook
 *
 * Health check endpoint
 * (GoPay might test webhook URL availability)
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is ready',
    timestamp: Date.now(),
  });
}
