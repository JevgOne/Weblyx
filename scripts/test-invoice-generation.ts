#!/usr/bin/env tsx
/**
 * Test Invoice Generation
 *
 * This script tests the invoice generation API directly
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { turso } from '../lib/turso';
import { generateInvoicePDF, uploadInvoicePDF, generateInvoiceNumber } from '../lib/pdf-invoice';
import type { InvoiceItem } from '../types/payments';

async function testInvoiceGeneration() {
  console.log('🧪 Testing invoice generation...\n');

  try {
    // Get company settings
    const companyResult = await turso.execute({
      sql: 'SELECT * FROM company_settings WHERE id = ?',
      args: ['weblyx'],
    });

    if (companyResult.rows.length === 0) {
      throw new Error('Company settings not found!');
    }

    const company = companyResult.rows[0];
    console.log('✅ Company settings loaded:', company.name);

    // Generate invoice number
    const nextInvoiceNumber = generateInvoiceNumber(company.next_invoice_number as number);
    const variableSymbol = nextInvoiceNumber.replace('-', '');

    console.log('📄 Invoice number:', nextInvoiceNumber);
    console.log('🔢 Variable symbol:', variableSymbol);

    // Test invoice items
    const items: InvoiceItem[] = [
      {
        description: 'Vývoj webových stránek - E-commerce',
        quantity: 1,
        unit_price: 5000000, // 50,000 CZK in haléře
        vat_rate: 21,
      },
      {
        description: 'SEO optimalizace',
        quantity: 3,
        unit_price: 500000, // 5,000 CZK per hour
        vat_rate: 21,
      },
    ];

    // Calculate amounts
    let amountWithoutVat = 0;
    for (const item of items) {
      amountWithoutVat += item.quantity * item.unit_price;
    }

    const vatRate = 21;
    const vatAmount = Math.round(amountWithoutVat * (vatRate / 100));
    const amountWithVat = amountWithoutVat + vatAmount;

    console.log('\n💰 Amounts:');
    console.log('  Without VAT:', (amountWithoutVat / 100).toLocaleString('cs-CZ'), 'Kč');
    console.log('  VAT (21%):', (vatAmount / 100).toLocaleString('cs-CZ'), 'Kč');
    console.log('  Total:', (amountWithVat / 100).toLocaleString('cs-CZ'), 'Kč');

    // Prepare dates
    const issueDate = Math.floor(Date.now() / 1000);
    const dueDays = 14;
    const dueDate = issueDate + (dueDays * 24 * 60 * 60);
    const deliveryDate = issueDate;

    // Generate PDF
    console.log('\n📄 Generating PDF...');

    const pdfBytes = await generateInvoicePDF({
      invoice_number: nextInvoiceNumber,
      variable_symbol: variableSymbol,
      invoice_type: 'standard',
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
      client_name: 'Test Client s.r.o.',
      client_street: 'Testovací 123',
      client_city: 'Praha',
      client_zip: '110 00',
      client_country: 'Česká republika',
      client_ico: '12345678',
      client_dic: 'CZ12345678',
      client_email: 'test@example.com',
      amount_without_vat: amountWithoutVat,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      amount_with_vat: amountWithVat,
      currency: 'CZK',
      items,
      issue_date: issueDate,
      due_date: dueDate,
      delivery_date: deliveryDate,
      payment_method: 'bank_transfer',
      notes: 'Testovací faktura - prosím nezapomeňte uvést variabilní symbol při platbě.',
    });

    console.log('✅ PDF generated, size:', (pdfBytes.length / 1024).toFixed(2), 'KB');

    // Upload PDF to Vercel Blob
    console.log('\n📤 Uploading to Vercel Blob...');
    const pdfUrl = await uploadInvoicePDF(pdfBytes, nextInvoiceNumber);
    console.log('✅ PDF uploaded:', pdfUrl);

    // Store invoice in database
    console.log('\n💾 Saving to database...');
    await turso.execute({
      sql: `INSERT INTO invoices (
        invoice_number, variable_symbol,
        payment_id, lead_id, project_id,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nextInvoiceNumber,
        variableSymbol,
        null,
        null,
        null,
        'standard',
        'Test Client s.r.o.',
        'Testovací 123',
        'Praha',
        '110 00',
        'Česká republika',
        '12345678',
        'CZ12345678',
        'test@example.com',
        amountWithoutVat,
        vatRate,
        vatAmount,
        amountWithVat,
        'CZK',
        JSON.stringify(items),
        issueDate,
        dueDate,
        deliveryDate,
        'bank_transfer',
        'issued',
        pdfUrl,
        Math.floor(Date.now() / 1000),
        'Testovací faktura - prosím nezapomeňte uvést variabilní symbol při platbě.',
        'Test invoice generated by script',
      ],
    });

    console.log('✅ Invoice saved to database');

    // Update next_invoice_number
    await turso.execute({
      sql: 'UPDATE company_settings SET next_invoice_number = ?, updated_at = unixepoch() WHERE id = ?',
      args: [(company.next_invoice_number as number) + 1, 'weblyx'],
    });

    console.log('✅ Next invoice number updated');

    console.log('\n✨ Invoice generation test completed successfully!');
    console.log('\n📋 Invoice details:');
    console.log('  Invoice number:', nextInvoiceNumber);
    console.log('  Amount:', (amountWithVat / 100).toLocaleString('cs-CZ'), 'Kč');
    console.log('  PDF URL:', pdfUrl);
    console.log('\n👉 Open PDF:', pdfUrl);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run test
testInvoiceGeneration();
