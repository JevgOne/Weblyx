import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { GoPay } from '@/lib/gopay';
import type { PaymentStatus, PaymentType } from '@/types/payments';

/**
 * GET /api/payments/list
 *
 * List all payments with optional filters
 *
 * Query params:
 * - status: Filter by payment status (CREATED, PAID, etc.)
 * - payment_type: Filter by type (project, package, deposit, subscription, manual)
 * - lead_id: Filter by lead ID
 * - project_id: Filter by project ID
 * - start_date: Unix timestamp (filter payments created after this date)
 * - end_date: Unix timestamp (filter payments created before this date)
 * - limit: Max number of results (default: 50, max: 200)
 * - offset: Pagination offset (default: 0)
 * - sort: Sort order (newest, oldest, highest, lowest) (default: newest)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const status = searchParams.get('status') as PaymentStatus | null;
    const paymentType = searchParams.get('payment_type') as PaymentType | null;
    const leadId = searchParams.get('lead_id');
    const projectId = searchParams.get('project_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'newest';

    // Build WHERE clause
    const conditions: string[] = [];
    const args: any[] = [];

    if (status) {
      conditions.push('gopay_status = ?');
      args.push(status);
    }

    if (paymentType) {
      conditions.push('payment_type = ?');
      args.push(paymentType);
    }

    if (leadId) {
      conditions.push('lead_id = ?');
      args.push(leadId);
    }

    if (projectId) {
      conditions.push('project_id = ?');
      args.push(projectId);
    }

    if (startDate) {
      conditions.push('created_at >= ?');
      args.push(parseInt(startDate));
    }

    if (endDate) {
      conditions.push('created_at <= ?');
      args.push(parseInt(endDate));
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // Build ORDER BY clause
    let orderBy = 'created_at DESC'; // newest
    if (sort === 'oldest') orderBy = 'created_at ASC';
    if (sort === 'highest') orderBy = 'amount DESC';
    if (sort === 'lowest') orderBy = 'amount ASC';

    // Build SQL query
    const sql = `
      SELECT * FROM payments
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    args.push(limit, offset);

    // Execute query
    const result = await turso.execute({
      sql,
      args,
    });

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total FROM payments
      ${whereClause}
    `;

    const countResult = await turso.execute({
      sql: countSql,
      args: args.slice(0, -2), // Remove limit and offset
    });

    const totalCount = countResult.rows[0]?.total as number || 0;

    // Format payments
    const payments = result.rows.map(payment => ({
      id: payment.id,
      gopay_id: payment.gopay_id,
      gopay_gw_url: payment.gopay_gw_url,
      status: payment.gopay_status,
      variable_symbol: payment.variable_symbol,
      amount: payment.amount,
      amount_czk: GoPay.halereToCzk(payment.amount as number),
      currency: payment.currency,
      description: payment.description,
      payment_type: payment.payment_type,
      payer_name: payment.payer_name,
      payer_email: payment.payer_email,
      payer_phone: payment.payer_phone,
      lead_id: payment.lead_id,
      project_id: payment.project_id,
      invoice_id: payment.invoice_id,
      subscription_id: payment.subscription_id,
      metadata: payment.metadata ? JSON.parse(payment.metadata as string) : null,
      notes: payment.notes,
      created_at: payment.created_at,
      paid_at: payment.paid_at,
      updated_at: payment.updated_at,
    }));

    // Calculate statistics
    const stats = {
      total_count: totalCount,
      returned_count: payments.length,
      has_more: offset + payments.length < totalCount,
      total_amount: payments.reduce((sum, p) => sum + (p.amount as number), 0),
      total_amount_czk: payments.reduce((sum, p) => sum + p.amount_czk, 0),
      paid_count: payments.filter(p => p.status === 'PAID').length,
      pending_count: payments.filter(p =>
        p.status === 'CREATED' || p.status === 'PAYMENT_METHOD_CHOSEN'
      ).length,
      cancelled_count: payments.filter(p =>
        p.status === 'CANCELED' || p.status === 'TIMEOUTED'
      ).length,
    };

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        limit,
        offset,
        total: totalCount,
        has_more: stats.has_more,
      },
      stats,
    });

  } catch (error: any) {
    console.error('❌ Payment list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch payments',
      },
      { status: 500 }
    );
  }
}
