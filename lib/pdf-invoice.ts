/**
 * Czech Invoice PDF Generator
 *
 * Generates professional PDF invoices compliant with Czech legislation
 *
 * Features:
 * - Czech legal requirements (IČO, DIČ, DPH)
 * - Professional design with Weblyx branding
 * - Multiple invoice types (standard, proforma, deposit, final)
 * - VAT calculation (21%, 15%, 12%, 0%)
 * - Upload to Vercel Blob storage
 */

import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import { put } from '@vercel/blob';
import type { Invoice, InvoiceItem } from '@/types/payments';

// =====================================================
// TYPES
// =====================================================

interface CompanyInfo {
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  ico: string;
  dic: string | null;
  bank_account: string;
  iban: string;
  swift: string;
  email: string;
  phone: string;
  website: string;
  logo_url: string | null;
}

interface InvoicePDFData {
  // Invoice metadata
  invoice_number: string;
  variable_symbol: string;
  invoice_type: string;

  // Company info
  company: CompanyInfo;

  // Client info
  client_name: string;
  client_street: string | null;
  client_city: string | null;
  client_zip: string | null;
  client_country: string;
  client_ico: string | null;
  client_dic: string | null;
  client_email: string | null;

  // Amounts (in haléře)
  amount_without_vat: number;
  vat_rate: number;
  vat_amount: number;
  amount_with_vat: number;
  currency: string;

  // Items
  items: InvoiceItem[];

  // Dates (Unix timestamps)
  issue_date: number;
  due_date: number;
  delivery_date: number | null;

  // Payment details
  payment_method: string | null;
  notes: string | null;
}

// =====================================================
// COLORS (Weblyx Brand)
// =====================================================

const COLORS = {
  teal: rgb(0.078, 0.722, 0.651), // #14B8A6
  darkGray: rgb(0.2, 0.2, 0.2),
  lightGray: rgb(0.5, 0.5, 0.5),
  black: rgb(0, 0, 0),
  white: rgb(1, 1, 1),
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Convert haléře to CZK with formatting
 */
function formatCurrency(halere: number, currency: string = 'CZK'): string {
  const czk = halere / 100;
  return `${czk.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/**
 * Format Unix timestamp to Czech date (DD.MM.YYYY)
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Get invoice type label in Czech
 */
function getInvoiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'standard': 'FAKTURA',
    'proforma': 'PROFORMA FAKTURA',
    'deposit': 'ZÁLOHA',
    'final': 'KONEČNÁ FAKTURA',
    'credit_note': 'DOBROPIS',
  };
  return labels[type] || 'FAKTURA';
}

/**
 * Get payment method label in Czech
 */
function getPaymentMethodLabel(method: string | null): string {
  if (!method) return 'Bankovní převod';

  const labels: Record<string, string> = {
    'bank_transfer': 'Bankovní převod',
    'card': 'Platební kartou',
    'gopay': 'GoPay',
    'cash': 'Hotově',
  };
  return labels[method] || method;
}

// =====================================================
// PDF GENERATION
// =====================================================

/**
 * Generate Czech invoice PDF
 *
 * @param invoiceData Invoice data
 * @returns PDF as Uint8Array
 */
export async function generateInvoicePDF(
  invoiceData: InvoicePDFData
): Promise<Uint8Array> {
  // Create PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add page
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();

  let y = height - 50; // Start from top with margin

  // =====================================================
  // HEADER - Invoice Type
  // =====================================================

  const invoiceTypeLabel = getInvoiceTypeLabel(invoiceData.invoice_type);

  page.drawText(invoiceTypeLabel, {
    x: 50,
    y,
    size: 24,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 40;

  // =====================================================
  // INVOICE METADATA
  // =====================================================

  // Invoice number
  page.drawText('Číslo faktury:', {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(invoiceData.invoice_number, {
    x: 150,
    y,
    size: 10,
    font,
    color: COLORS.black,
  });

  y -= 15;

  // Variable symbol
  page.drawText('Variabilní symbol:', {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(invoiceData.variable_symbol, {
    x: 150,
    y,
    size: 10,
    font,
    color: COLORS.black,
  });

  y -= 15;

  // Issue date
  page.drawText('Datum vystavení:', {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(formatDate(invoiceData.issue_date), {
    x: 150,
    y,
    size: 10,
    font,
    color: COLORS.black,
  });

  y -= 15;

  // Due date
  page.drawText('Datum splatnosti:', {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(formatDate(invoiceData.due_date), {
    x: 150,
    y,
    size: 10,
    font,
    color: COLORS.black,
  });

  y -= 15;

  // Delivery date (DUZP)
  if (invoiceData.delivery_date) {
    page.drawText('Datum zdan. plnění:', {
      x: 50,
      y,
      size: 10,
      font: fontBold,
      color: COLORS.darkGray,
    });

    page.drawText(formatDate(invoiceData.delivery_date), {
      x: 150,
      y,
      size: 10,
      font,
      color: COLORS.black,
    });

    y -= 15;
  }

  // Payment method
  page.drawText('Způsob platby:', {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(getPaymentMethodLabel(invoiceData.payment_method), {
    x: 150,
    y,
    size: 10,
    font,
    color: COLORS.black,
  });

  y -= 40;

  // =====================================================
  // COMPANY INFO (DODAVATEL)
  // =====================================================

  page.drawText('Dodavatel:', {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  // Company name
  page.drawText(invoiceData.company.name, {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.black,
  });

  y -= 15;

  // Address
  page.drawText(`${invoiceData.company.street}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 12;

  page.drawText(`${invoiceData.company.zip} ${invoiceData.company.city}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 12;

  page.drawText(invoiceData.company.country, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 15;

  // IČO, DIČ
  page.drawText(`IČO: ${invoiceData.company.ico}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  if (invoiceData.company.dic) {
    y -= 12;
    page.drawText(`DIČ: ${invoiceData.company.dic}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
  }

  y -= 40;

  // =====================================================
  // CLIENT INFO (ODBĚRATEL)
  // =====================================================

  page.drawText('Odběratel:', {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  // Client name
  page.drawText(invoiceData.client_name, {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.black,
  });

  y -= 15;

  // Address
  if (invoiceData.client_street) {
    page.drawText(invoiceData.client_street, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  if (invoiceData.client_zip && invoiceData.client_city) {
    page.drawText(`${invoiceData.client_zip} ${invoiceData.client_city}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  page.drawText(invoiceData.client_country, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 15;

  // IČO, DIČ
  if (invoiceData.client_ico) {
    page.drawText(`IČO: ${invoiceData.client_ico}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  if (invoiceData.client_dic) {
    page.drawText(`DIČ: ${invoiceData.client_dic}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  y -= 30;

  // =====================================================
  // ITEMS TABLE
  // =====================================================

  // Table header
  page.drawRectangle({
    x: 50,
    y: y - 15,
    width: width - 100,
    height: 20,
    color: COLORS.teal,
  });

  page.drawText('Popis', {
    x: 60,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COLORS.white,
  });

  page.drawText('Množství', {
    x: 320,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COLORS.white,
  });

  page.drawText('Jedn. cena', {
    x: 390,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COLORS.white,
  });

  page.drawText('Celkem', {
    x: 470,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COLORS.white,
  });

  y -= 25;

  // Table rows
  for (const item of invoiceData.items) {
    const totalPrice = item.quantity * item.unit_price;

    page.drawText(item.description, {
      x: 60,
      y,
      size: 9,
      font,
      color: COLORS.black,
      maxWidth: 250,
    });

    page.drawText(`${item.quantity}`, {
      x: 330,
      y,
      size: 9,
      font,
      color: COLORS.black,
    });

    page.drawText(formatCurrency(item.unit_price, ''), {
      x: 390,
      y,
      size: 9,
      font,
      color: COLORS.black,
    });

    page.drawText(formatCurrency(totalPrice, ''), {
      x: 470,
      y,
      size: 9,
      font,
      color: COLORS.black,
    });

    y -= 20;
  }

  y -= 20;

  // =====================================================
  // TOTALS
  // =====================================================

  // Amount without VAT
  page.drawText('Základ daně:', {
    x: 350,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(formatCurrency(invoiceData.amount_without_vat, invoiceData.currency), {
    x: 470,
    y,
    size: 10,
    font,
    color: COLORS.black,
  });

  y -= 15;

  // VAT
  page.drawText(`DPH (${invoiceData.vat_rate}%):`, {
    x: 350,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(formatCurrency(invoiceData.vat_amount, invoiceData.currency), {
    x: 470,
    y,
    size: 10,
    font,
    color: COLORS.black,
  });

  y -= 20;

  // Total amount
  page.drawRectangle({
    x: 340,
    y: y - 5,
    width: 205,
    height: 25,
    color: COLORS.teal,
  });

  page.drawText('Celkem k úhradě:', {
    x: 350,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.white,
  });

  page.drawText(formatCurrency(invoiceData.amount_with_vat, invoiceData.currency), {
    x: 470,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.white,
  });

  y -= 40;

  // =====================================================
  // BANK DETAILS
  // =====================================================

  page.drawText('Platební údaje:', {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  page.drawText('Číslo účtu:', {
    x: 50,
    y,
    size: 9,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(invoiceData.company.bank_account, {
    x: 150,
    y,
    size: 9,
    font,
    color: COLORS.black,
  });

  y -= 12;

  page.drawText('IBAN:', {
    x: 50,
    y,
    size: 9,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(invoiceData.company.iban, {
    x: 150,
    y,
    size: 9,
    font,
    color: COLORS.black,
  });

  y -= 12;

  page.drawText('SWIFT:', {
    x: 50,
    y,
    size: 9,
    font: fontBold,
    color: COLORS.darkGray,
  });

  page.drawText(invoiceData.company.swift, {
    x: 150,
    y,
    size: 9,
    font,
    color: COLORS.black,
  });

  y -= 30;

  // =====================================================
  // NOTES
  // =====================================================

  if (invoiceData.notes) {
    page.drawText('Poznámka:', {
      x: 50,
      y,
      size: 9,
      font: fontBold,
      color: COLORS.darkGray,
    });

    y -= 15;

    page.drawText(invoiceData.notes, {
      x: 50,
      y,
      size: 8,
      font,
      color: COLORS.lightGray,
      maxWidth: width - 100,
    });

    y -= 20;
  }

  // =====================================================
  // FOOTER
  // =====================================================

  page.drawText(`${invoiceData.company.name} | ${invoiceData.company.email} | ${invoiceData.company.phone}`, {
    x: 50,
    y: 30,
    size: 8,
    font,
    color: COLORS.lightGray,
  });

  page.drawText(invoiceData.company.website, {
    x: width - 150,
    y: 30,
    size: 8,
    font,
    color: COLORS.teal,
  });

  // =====================================================
  // SAVE PDF
  // =====================================================

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Upload invoice PDF to Vercel Blob storage
 *
 * @param pdfBytes PDF file as Uint8Array
 * @param invoiceNumber Invoice number for filename
 * @returns Blob URL
 */
export async function uploadInvoicePDF(
  pdfBytes: Uint8Array,
  invoiceNumber: string
): Promise<string> {
  const filename = `invoices/${invoiceNumber}.pdf`;

  console.log('📤 Uploading invoice PDF to Vercel Blob:', filename);

  // Convert Uint8Array to Buffer for Vercel Blob
  const buffer = Buffer.from(pdfBytes);

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'application/pdf',
  });

  console.log('✅ Invoice PDF uploaded:', blob.url);

  return blob.url;
}

/**
 * Generate invoice number
 * Format: YYYYMMDD-XXX (e.g., 20251203-001)
 *
 * @param sequenceNumber Sequence number for the day
 * @returns Invoice number string
 */
export function generateInvoiceNumber(sequenceNumber: number): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const seq = sequenceNumber.toString().padStart(3, '0');

  return `${year}${month}${day}-${seq}`;
}
