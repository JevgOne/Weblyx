import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { GoPay } from '@/lib/gopay';
import type { PaymentStatus } from '@/types/payments';

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

    console.log('🔔 Webhook received:', {
      gopay_id: payload.id,
      state: payload.state,
      sub_state: payload.sub_state,
    });

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

    console.log('✅ Payment updated:', {
      gopay_id: goPayId,
      old_status: oldStatus,
      new_status: goPayStatus,
      variable_symbol: payment.variable_symbol,
      amount: amountPaid,
    });

    // Handle PAID status
    if (goPayStatus === 'PAID') {
      console.log('💰 Payment PAID - triggering post-payment actions:', {
        payment_id: payment.id,
        lead_id: payment.lead_id,
        amount: GoPay.halereToCzk(amountPaid),
      });

      // Generate invoice automatically
      try {
        console.log('📄 Auto-generating invoice for payment:', payment.id);

        // Prepare invoice data from payment
        const invoiceData = {
          payment_id: payment.id as string,
          client_name: payment.payer_name as string || 'N/A',
          client_email: payment.payer_email as string | undefined,
          client_ico: payment.payer_ico as string | undefined,
          client_dic: payment.payer_dic as string | undefined,
          invoice_type: 'standard' as const,
          items: [
            {
              description: payment.description as string,
              quantity: 1,
              unit_price: payment.amount as number,
              vat_rate: 21, // Default VAT rate for Czech Republic
            },
          ],
          payment_method: 'gopay' as const,
          notes: `Platba provedena přes GoPay (ID: ${payment.gopay_id})`,
        };

        // Call invoice generation API internally
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weblyx.cz';
        const invoiceResponse = await fetch(`${siteUrl}/api/invoices/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData),
        });

        if (invoiceResponse.ok) {
          const invoiceResult = await invoiceResponse.json();
          console.log('✅ Invoice generated:', {
            invoice_number: invoiceResult.invoice?.invoice_number,
            pdf_url: invoiceResult.pdf_url,
          });

          // Update payment with invoice_id
          if (invoiceResult.invoice?.id) {
            await turso.execute({
              sql: 'UPDATE payments SET invoice_id = ?, updated_at = unixepoch() WHERE id = ?',
              args: [invoiceResult.invoice.id, payment.id],
            });
          }
        } else {
          const error = await invoiceResponse.text();
          console.error('⚠️ Failed to generate invoice:', error);
        }

      } catch (error: any) {
        console.error('⚠️ Invoice generation error:', error.message);
        // Don't fail the webhook if invoice generation fails
      }

      // TODO: Send email notification (will be implemented later)

      // If payment is linked to a lead, update lead status
      if (payment.lead_id) {
        try {
          await turso.execute({
            sql: `UPDATE leads
                  SET updated_at = unixepoch()
                  WHERE id = ?`,
            args: [payment.lead_id],
          });

          console.log('✅ Updated lead after payment:', payment.lead_id);
        } catch (error: any) {
          console.error('⚠️ Failed to update lead:', error.message);
          // Don't fail the webhook if lead update fails
        }
      }
    }

    // Handle CANCELED/TIMEOUTED status
    if (goPayStatus === 'CANCELED' || goPayStatus === 'TIMEOUTED') {
      console.log('⚠️ Payment cancelled/timeouted:', {
        payment_id: payment.id,
        status: goPayStatus,
      });

      // TODO: Send cancellation email notification
    }

    // Handle REFUNDED status
    if (goPayStatus === 'REFUNDED' || goPayStatus === 'PARTIALLY_REFUNDED') {
      console.log('💸 Payment refunded:', {
        payment_id: payment.id,
        status: goPayStatus,
      });

      // TODO: Update invoice status
      // TODO: Send refund confirmation email
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
