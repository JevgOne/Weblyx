import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { GoPay } from '@/lib/gopay';
import { generateInvoicePDF, uploadInvoicePDF, generateInvoiceNumber } from '@/lib/pdf-invoice';
import type { CreateInvoiceInput, InvoiceItem } from '@/types/payments';

/**
 * POST /api/invoices/generate
 *
 * Generate invoice PDF and store in database
 *
 * Body:
 * - payment_id?: string (generate invoice from payment)
 * - client_name: string
 * - client_email?: string
 * - client_street?: string
 * - client_city?: string
 * - client_zip?: string
 * - client_country?: string (default: Česká republika)
 * - client_ico?: string
 * - client_dic?: string
 * - invoice_type?: 'standard' | 'proforma' | 'deposit' | 'final' | 'credit_note'
 * - items: InvoiceItem[]
 * - due_days?: number (default: 14)
 * - payment_method?: string
 * - notes?: string
 */
export async function POST(request: NextRequest) {
  try {
    const input: CreateInvoiceInput = await request.json();

    // Validate required fields
    if (!input.client_name || !input.items || input.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: client_name, items' },
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
        { error: 'Company settings not found. Please configure company settings first.' },
        { status: 500 }
      );
    }

    const company = companyResult.rows[0];

    // Get next invoice number
    const nextInvoiceNumber = generateInvoiceNumber(company.next_invoice_number as number);
    const variableSymbol = nextInvoiceNumber.replace('-', '');

    // Calculate amounts
    let amountWithoutVat = 0;
    for (const item of input.items) {
      amountWithoutVat += item.quantity * item.unit_price;
    }

    // Get VAT rate from first item (assuming all items have same VAT rate)
    const vatRate = input.items[0].vat_rate;
    const vatAmount = Math.round(amountWithoutVat * (vatRate / 100));
    const amountWithVat = amountWithoutVat + vatAmount;

    // Prepare dates
    const issueDate = input.issue_date
      ? Math.floor(input.issue_date.getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const dueDays = input.due_days || 14;
    const dueDate = issueDate + (dueDays * 24 * 60 * 60);

    const deliveryDate = input.delivery_date
      ? Math.floor(input.delivery_date.getTime() / 1000)
      : issueDate;

    // Get payment data if payment_id provided
    let paymentId = input.payment_id || null;
    let leadId = input.lead_id || null;
    let projectId = input.project_id || null;

    if (paymentId) {
      const paymentResult = await turso.execute({
        sql: 'SELECT * FROM payments WHERE id = ?',
        args: [paymentId],
      });

      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        leadId = payment.lead_id as string | null;
        projectId = payment.project_id as string | null;

        // Use payment data if client data not provided
        if (!input.client_email && payment.payer_email) {
          input.client_email = payment.payer_email as string;
        }
      }
    }

    // Generate PDF
    console.log('📄 Generating invoice PDF:', nextInvoiceNumber);

    const pdfBytes = await generateInvoicePDF({
      invoice_number: nextInvoiceNumber,
      variable_symbol: variableSymbol,
      invoice_type: input.invoice_type || 'standard',
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
      client_name: input.client_name,
      client_street: input.client_street || null,
      client_city: input.client_city || null,
      client_zip: input.client_zip || null,
      client_country: input.client_country || 'Česká republika',
      client_ico: input.client_ico || null,
      client_dic: input.client_dic || null,
      client_email: input.client_email || null,
      amount_without_vat: amountWithoutVat,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      amount_with_vat: amountWithVat,
      currency: 'CZK',
      items: input.items,
      issue_date: issueDate,
      due_date: dueDate,
      delivery_date: deliveryDate,
      payment_method: input.payment_method || 'bank_transfer',
      notes: input.notes || null,
    });

    // Upload PDF to Vercel Blob
    const pdfUrl = await uploadInvoicePDF(pdfBytes, nextInvoiceNumber);

    // Store invoice in database
    await turso.execute({
      sql: `INSERT INTO invoices (
        invoice_number, variable_symbol,
        payment_id, lead_id, project_id, related_invoice_id,
        invoice_type,
        client_name, client_street, client_city, client_zip, client_country,
        client_ico, client_dic, client_email,
        amount_without_vat, vat_rate, vat_amount, amount_with_vat, currency,
        items,
        issue_date, due_date, delivery_date,
        payment_method,
        status,
        pdf_url, pdf_generated_at,
        notes, internal_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nextInvoiceNumber,
        variableSymbol,
        paymentId,
        leadId,
        projectId,
        input.related_invoice_id || null,
        input.invoice_type || 'standard',
        input.client_name,
        input.client_street || null,
        input.client_city || null,
        input.client_zip || null,
        input.client_country || 'Česká republika',
        input.client_ico || null,
        input.client_dic || null,
        input.client_email || null,
        amountWithoutVat,
        vatRate,
        vatAmount,
        amountWithVat,
        'CZK',
        JSON.stringify(input.items),
        issueDate,
        dueDate,
        deliveryDate,
        input.payment_method || 'bank_transfer',
        (input as any).status || 'draft',
        pdfUrl,
        Math.floor(Date.now() / 1000),
        input.notes || null,
        input.internal_notes || null,
      ],
    });

    // Update next_invoice_number in company_settings
    await turso.execute({
      sql: 'UPDATE company_settings SET next_invoice_number = ?, updated_at = unixepoch() WHERE id = ?',
      args: [(company.next_invoice_number as number) + 1, 'weblyx'],
    });

    console.log('✅ Invoice generated:', {
      invoice_number: nextInvoiceNumber,
      amount: GoPay.halereToCzk(amountWithVat),
      pdf_url: pdfUrl,
    });

    // Get invoice from database
    const invoiceResult = await turso.execute({
      sql: 'SELECT * FROM invoices WHERE invoice_number = ?',
      args: [nextInvoiceNumber],
    });

    const invoice = invoiceResult.rows[0];

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        variable_symbol: invoice.variable_symbol,
        invoice_type: invoice.invoice_type,
        status: invoice.status,
        client_name: invoice.client_name,
        amount_without_vat: invoice.amount_without_vat,
        vat_rate: invoice.vat_rate,
        vat_amount: invoice.vat_amount,
        amount_with_vat: invoice.amount_with_vat,
        amount_czk: GoPay.halereToCzk(invoice.amount_with_vat as number),
        currency: invoice.currency,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        pdf_url: invoice.pdf_url,
        created_at: invoice.created_at,
      },
      pdf_url: pdfUrl,
    });

  } catch (error: any) {
    console.error('❌ Invoice generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate invoice',
      },
      { status: 500 }
    );
  }
}
