import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { GoPay } from '@/lib/gopay';

/**
 * GET /api/payments/status?gopay_id=123456
 * GET /api/payments/status?variable_symbol=2512030001
 *
 * Check payment status from database and optionally sync with GoPay
 *
 * Query params:
 * - gopay_id: GoPay payment ID
 * - variable_symbol: Variable symbol
 * - sync: If true, fetch fresh status from GoPay API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const goPayId = searchParams.get('gopay_id');
    const variableSymbol = searchParams.get('variable_symbol');
    const shouldSync = searchParams.get('sync') === 'true';

    // Validate input
    if (!goPayId && !variableSymbol) {
      return NextResponse.json(
        { error: 'Missing gopay_id or variable_symbol parameter' },
        { status: 400 }
      );
    }

    // Find payment in database
    let query: { sql: string; args: string[] };

    if (goPayId) {
      query = {
        sql: 'SELECT * FROM payments WHERE gopay_id = ?',
        args: [goPayId],
      };
    } else {
      query = {
        sql: 'SELECT * FROM payments WHERE variable_symbol = ?',
        args: [variableSymbol!],
      };
    }

    const result = await turso.execute(query);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = result.rows[0];

    // If sync requested, fetch fresh status from GoPay
    if (shouldSync && GoPay.isConfigured()) {
      try {
        const goPayStatus = await GoPay.getPaymentStatus(
          parseInt(payment.gopay_id as string)
        );

        // Update database if status changed
        if (goPayStatus.state !== payment.gopay_status) {
          const updateSql = goPayStatus.state === 'PAID'
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
            args: [goPayStatus.state, payment.gopay_id],
          });

          // Update local payment object
          payment.gopay_status = goPayStatus.state;
          payment.updated_at = Math.floor(Date.now() / 1000);

          if (goPayStatus.state === 'PAID') {
            payment.paid_at = Math.floor(Date.now() / 1000);
          }
        }

      } catch (error: any) {
        console.error('⚠️ Failed to sync with GoPay:', error.message);
        // Continue with database data even if sync fails
      }
    }

    // Format response
    const amountInCzk = GoPay.halereToCzk(payment.amount as number);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        gopay_id: payment.gopay_id,
        gopay_gw_url: payment.gopay_gw_url,
        status: payment.gopay_status,
        variable_symbol: payment.variable_symbol,
        amount: payment.amount,
        amount_czk: amountInCzk,
        currency: payment.currency,
        description: payment.description,
        payment_type: payment.payment_type,
        payer_name: payment.payer_name,
        payer_email: payment.payer_email,
        payer_phone: payment.payer_phone,
        lead_id: payment.lead_id,
        project_id: payment.project_id,
        invoice_id: payment.invoice_id,
        created_at: payment.created_at,
        paid_at: payment.paid_at,
        updated_at: payment.updated_at,
      },
    });

  } catch (error: any) {
    console.error('❌ Payment status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check payment status',
      },
      { status: 500 }
    );
  }
}
