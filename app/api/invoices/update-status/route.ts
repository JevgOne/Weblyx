import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import type { InvoiceStatus } from '@/types/payments';

const VALID_STATUSES: InvoiceStatus[] = [
  'draft', 'issued', 'sent', 'awaiting_payment',
  'deposit_paid', 'paid', 'overdue', 'cancelled',
];

/**
 * POST /api/invoices/update-status
 *
 * Update invoice status (paid / unpaid toggle, etc.)
 *
 * Body:
 * - invoice_id: string
 * - status: InvoiceStatus
 */
export async function POST(request: NextRequest) {
  try {
    const { invoice_id, status } = await request.json();

    if (!invoice_id || !status) {
      return NextResponse.json(
        { error: 'Missing invoice_id or status' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Get invoice
    const invoiceResult = await turso.execute({
      sql: 'SELECT * FROM invoices WHERE id = ? OR invoice_number = ?',
      args: [invoice_id, invoice_id],
    });

    if (invoiceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = invoiceResult.rows[0];

    // Update status and paid_date
    if (status === 'paid') {
      await turso.execute({
        sql: `UPDATE invoices SET status = 'paid', paid_date = unixepoch(), updated_at = unixepoch() WHERE id = ?`,
        args: [invoice.id],
      });
    } else {
      await turso.execute({
        sql: `UPDATE invoices SET status = ?, paid_date = NULL, updated_at = unixepoch() WHERE id = ?`,
        args: [status, invoice.id],
      });
    }

    return NextResponse.json({
      success: true,
      invoice_number: invoice.invoice_number,
      status,
    });
  } catch (error: any) {
    console.error('Invoice status update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
