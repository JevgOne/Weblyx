import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { generatePaymentConfirmationPDF, uploadPaymentConfirmationPDF } from '@/lib/pdf-invoice';

/**
 * POST /api/invoices/confirm-payment
 *
 * Mark invoice as paid and generate payment confirmation PDF
 *
 * Body:
 * - invoice_id: string (invoice ID or invoice_number)
 * - payment_date?: number (Unix timestamp, defaults to now)
 * - payment_method?: string (defaults to invoice's payment_method)
 */
export async function POST(request: NextRequest) {
  try {
    const { invoice_id, payment_date, payment_method } = await request.json();

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'Missing invoice_id' },
        { status: 400 }
      );
    }

    // Get invoice
    const invoiceResult = await turso.execute({
      sql: `SELECT * FROM invoices WHERE id = ? OR invoice_number = ?`,
      args: [invoice_id, invoice_id],
    });

    if (invoiceResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = invoiceResult.rows[0];

    // Check if already paid
    if (invoice.status === 'paid') {
      // Try to get confirmation URL from internal_notes
      let confirmationUrl = null;
      try {
        const notes = JSON.parse(invoice.internal_notes as string || '{}');
        confirmationUrl = notes.confirmation_pdf_url;
      } catch {}

      return NextResponse.json(
        { error: 'Invoice already marked as paid', confirmation_url: confirmationUrl },
        { status: 400 }
      );
    }

    // Get company settings
    const companyResult = await turso.execute({
      sql: 'SELECT * FROM company_settings WHERE id = ?',
      args: ['weblyx'],
    });

    if (companyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Company settings not found' },
        { status: 500 }
      );
    }

    const company = companyResult.rows[0];

    // Payment date (default to now)
    const paidAt = payment_date || Math.floor(Date.now() / 1000);

    // Generate payment confirmation PDF
    const pdfBytes = await generatePaymentConfirmationPDF({
      invoice_number: invoice.invoice_number as string,
      variable_symbol: invoice.variable_symbol as string,
      company: {
        name: company.name as string,
        street: company.street as string,
        city: company.city as string,
        zip: company.zip as string,
        country: company.country as string,
        ico: company.ico as string,
        dic: company.dic as string | null,
        bank_account: company.bank_account as string,
        iban: company.iban as string,
        swift: company.swift as string,
        email: company.email as string,
        phone: company.phone as string,
        website: company.website as string,
        logo_url: company.logo_url as string | null,
      },
      client_name: invoice.client_name as string,
      client_ico: invoice.client_ico as string | null,
      amount_with_vat: invoice.amount_with_vat as number,
      currency: invoice.currency as string,
      payment_date: paidAt,
      payment_method: payment_method || invoice.payment_method as string || 'bank_transfer',
    });

    // Upload PDF
    const confirmationUrl = await uploadPaymentConfirmationPDF(
      pdfBytes,
      invoice.invoice_number as string
    );

    // Update invoice status to paid
    // Note: confirmation_pdf_url stored in notes field as JSON until migration adds column
    const notesData = {
      confirmation_pdf_url: confirmationUrl,
      original_notes: invoice.internal_notes || '',
    };

    await turso.execute({
      sql: `UPDATE invoices SET
        status = 'paid',
        paid_date = ?,
        internal_notes = ?,
        updated_at = unixepoch()
      WHERE id = ?`,
      args: [paidAt, JSON.stringify(notesData), invoice.id],
    });

    return NextResponse.json({
      success: true,
      invoice_number: invoice.invoice_number,
      status: 'paid',
      paid_at: paidAt,
      confirmation_pdf_url: confirmationUrl,
    });

  } catch (error: any) {
    console.error('❌ Confirm payment error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
