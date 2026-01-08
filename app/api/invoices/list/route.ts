import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { GoPay } from '@/lib/gopay';
import type { InvoiceStatus, InvoiceType } from '@/types/payments';

/**
 * GET /api/invoices/list
 *
 * List all invoices with optional filters
 *
 * Query params:
 * - status: Filter by status (draft, issued, sent, paid, overdue, cancelled)
 * - invoice_type: Filter by type (standard, proforma, deposit, final, credit_note)
 * - client_name: Filter by client name (partial match)
 * - lead_id: Filter by lead ID
 * - project_id: Filter by project ID
 * - start_date: Unix timestamp (filter invoices created after this date)
 * - end_date: Unix timestamp (filter invoices created before this date)
 * - overdue_only: Filter only overdue invoices (boolean)
 * - limit: Max number of results (default: 50, max: 200)
 * - offset: Pagination offset (default: 0)
 * - sort: Sort order (newest, oldest, due_soon, highest, lowest) (default: newest)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const status = searchParams.get('status') as InvoiceStatus | null;
    const invoiceType = searchParams.get('invoice_type') as InvoiceType | null;
    const clientName = searchParams.get('client_name');
    const leadId = searchParams.get('lead_id');
    const projectId = searchParams.get('project_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const overdueOnly = searchParams.get('overdue_only') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'newest';

    // Build WHERE clause
    const conditions: string[] = [];
    const args: any[] = [];

    if (status) {
      conditions.push('status = ?');
      args.push(status);
    }

    if (invoiceType) {
      conditions.push('invoice_type = ?');
      args.push(invoiceType);
    }

    if (clientName) {
      conditions.push('client_name LIKE ?');
      args.push(`%${clientName}%`);
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

    if (overdueOnly) {
      const now = Math.floor(Date.now() / 1000);
      conditions.push('due_date < ?');
      conditions.push('status NOT IN (?, ?)');
      args.push(now, 'paid', 'cancelled');
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // Build ORDER BY clause
    let orderBy = 'created_at DESC'; // newest
    if (sort === 'oldest') orderBy = 'created_at ASC';
    if (sort === 'due_soon') orderBy = 'due_date ASC';
    if (sort === 'highest') orderBy = 'amount_with_vat DESC';
    if (sort === 'lowest') orderBy = 'amount_with_vat ASC';

    // Build SQL query
    const sql = `
      SELECT * FROM invoices
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
      SELECT COUNT(*) as total FROM invoices
      ${whereClause}
    `;

    const countResult = await turso.execute({
      sql: countSql,
      args: args.slice(0, -2), // Remove limit and offset
    });

    const totalCount = countResult.rows[0]?.total as number || 0;

    // Format invoices
    const now = Math.floor(Date.now() / 1000);

    const invoices = result.rows.map((invoice: any) => {
      // Auto-update status to overdue if due_date passed
      let invoiceStatus = invoice.status as InvoiceStatus;
      if (
        invoiceStatus !== 'paid' &&
        invoiceStatus !== 'cancelled' &&
        (invoice.due_date as number) < now
      ) {
        invoiceStatus = 'overdue';
      }

      return {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        variable_symbol: invoice.variable_symbol,
        invoice_type: invoice.invoice_type,
        status: invoiceStatus,
        client_name: invoice.client_name,
        client_ico: invoice.client_ico,
        client_email: invoice.client_email,
        amount_without_vat: invoice.amount_without_vat,
        vat_rate: invoice.vat_rate,
        vat_amount: invoice.vat_amount,
        amount_with_vat: invoice.amount_with_vat,
        amount_czk: GoPay.halereToCzk(invoice.amount_with_vat as number),
        currency: invoice.currency,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        paid_date: invoice.paid_date,
        payment_method: invoice.payment_method,
        payment_id: invoice.payment_id,
        lead_id: invoice.lead_id,
        project_id: invoice.project_id,
        pdf_url: invoice.pdf_url,
        notes: invoice.notes,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
        is_overdue: invoiceStatus === 'overdue',
        days_until_due: Math.floor(((invoice.due_date as number) - now) / (24 * 60 * 60)),
      };
    });

    // Calculate statistics
    const stats = {
      total_count: totalCount,
      returned_count: invoices.length,
      has_more: offset + invoices.length < totalCount,
      total_amount: invoices.reduce((sum, inv) => sum + (inv.amount_with_vat as number), 0),
      total_amount_czk: invoices.reduce((sum, inv) => sum + inv.amount_czk, 0),
      paid_count: invoices.filter(inv => inv.status === 'paid').length,
      unpaid_count: invoices.filter(inv =>
        inv.status === 'issued' || inv.status === 'sent'
      ).length,
      overdue_count: invoices.filter(inv => inv.status === 'overdue').length,
      draft_count: invoices.filter(inv => inv.status === 'draft').length,
      total_paid_amount: invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount_czk, 0),
      total_unpaid_amount: invoices
        .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + inv.amount_czk, 0),
    };

    return NextResponse.json({
      success: true,
      invoices,
      pagination: {
        limit,
        offset,
        total: totalCount,
        has_more: stats.has_more,
      },
      stats,
    });

  } catch (error: any) {
    console.error('❌ Invoice list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch invoices',
      },
      { status: 500 }
    );
  }
}
