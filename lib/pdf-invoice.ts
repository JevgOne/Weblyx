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
import QRCode from 'qrcode';
import type { Invoice, InvoiceItem } from '@/types/payments';

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Remove Czech diacritics for PDF compatibility with WinAnsi encoding
 * StandardFonts (Helvetica) don't support UTF-8, so we need to convert Czech chars
 */
function removeDiacritics(text: string): string {
  const diacriticsMap: Record<string, string> = {
    'á': 'a', 'Á': 'A',
    'č': 'c', 'Č': 'C',
    'ď': 'd', 'Ď': 'D',
    'é': 'e', 'É': 'E',
    'ě': 'e', 'Ě': 'E',
    'í': 'i', 'Í': 'I',
    'ň': 'n', 'Ň': 'N',
    'ó': 'o', 'Ó': 'O',
    'ř': 'r', 'Ř': 'R',
    'š': 's', 'Š': 'S',
    'ť': 't', 'Ť': 'T',
    'ú': 'u', 'Ú': 'U',
    'ů': 'u', 'Ů': 'U',
    'ý': 'y', 'Ý': 'Y',
    'ž': 'z', 'Ž': 'Z',
  };

  return text.replace(/[áÁčČďĎéÉěĚíÍňŇóÓřŘšŠťŤúÚůŮýÝžŽ]/g, (char) => diacriticsMap[char] || char);
}

/**
 * Generate SPAYD (Short Payment Descriptor) QR code for Czech banking
 * Standard format: SPD*1.0*ACC:IBAN+BIC*AM:amount*CC:CZK*MSG:message*X-VS:variable_symbol
 *
 * SPAYD 1.0 specification: https://qr-platba.cz/
 */
async function generatePaymentQRCode(
  iban: string,
  swift: string,
  amount: number, // in haléře
  currency: string,
  variableSymbol: string,
  message: string
): Promise<string> {
  // Clean IBAN - remove spaces, "IBAN:" prefix, etc.
  const cleanIban = iban.replace(/[\s-]/g, '').replace(/^IBAN:?/i, '').toUpperCase();

  // Clean SWIFT/BIC
  const cleanSwift = swift.replace(/[\s-]/g, '').toUpperCase();

  // Convert amount from haléře to currency (30000.00)
  const amountFormatted = (amount / 100).toFixed(2);

  // Clean message - remove diacritics and special chars for QR compatibility
  const cleanMessage = message
    .replace(/[áÁ]/g, 'a')
    .replace(/[čČ]/g, 'c')
    .replace(/[ďĎ]/g, 'd')
    .replace(/[éÉěĚ]/g, 'e')
    .replace(/[íÍ]/g, 'i')
    .replace(/[ňŇ]/g, 'n')
    .replace(/[óÓ]/g, 'o')
    .replace(/[řŘ]/g, 'r')
    .replace(/[šŠ]/g, 's')
    .replace(/[ťŤ]/g, 't')
    .replace(/[úÚůŮ]/g, 'u')
    .replace(/[ýÝ]/g, 'y')
    .replace(/[žŽ]/g, 'z')
    .substring(0, 60); // Max 60 chars for MSG

  // Build SPAYD string according to specification
  // ACC format: IBAN+BIC (BIC is optional but recommended)
  const spaydParts = [
    'SPD*1.0',
    `ACC:${cleanIban}${cleanSwift ? '+' + cleanSwift : ''}`,
    `AM:${amountFormatted}`,
    `CC:${currency}`,
    `X-VS:${variableSymbol}`,
  ];

  // Add message only if not empty
  if (cleanMessage) {
    spaydParts.push(`MSG:${cleanMessage}`);
  }

  const spayd = spaydParts.join('*');

  console.log('📱 Generated SPAYD:', spayd);

  // Generate QR code as Data URL
  const qrDataUrl = await QRCode.toDataURL(spayd, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 200,
  });

  return qrDataUrl;
}

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
// COLORS (Weblyx Brand - Enhanced)
// =====================================================

const COLORS = {
  teal: rgb(0.078, 0.722, 0.651), // #14B8A6 - Primary brand
  tealDark: rgb(0.055, 0.580, 0.525), // #0E9488 - Darker teal
  tealLight: rgb(0.8, 0.95, 0.93), // #CCF2ED - Light teal background
  darkGray: rgb(0.15, 0.15, 0.15),
  mediumGray: rgb(0.4, 0.4, 0.4),
  lightGray: rgb(0.6, 0.6, 0.6),
  veryLightGray: rgb(0.95, 0.95, 0.95),
  black: rgb(0, 0, 0),
  white: rgb(1, 1, 1),
  accent: rgb(0.992, 0.729, 0.114), // #FDB912 - Gold accent
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

  // Helper function to draw text without diacritics
  const drawText = (text: string, options: any) => {
    page.drawText(removeDiacritics(text), options);
  };

  let y = height - 40; // Start from top with margin

  // =====================================================
  // HEADER - Colored Banner with Invoice Type
  // =====================================================

  // Top banner - teal gradient effect (simulated with two rectangles)
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: COLORS.teal,
  });

  // Add subtle "shadow" effect
  page.drawRectangle({
    x: 0,
    y: height - 102,
    width: width,
    height: 2,
    color: COLORS.tealDark,
  });

  // WEBLYX logo text
  drawText('WEBLYX', {
    x: 50,
    y: height - 35,
    size: 20,
    font: fontBold,
    color: COLORS.white,
  });

  drawText('Web Development & Design', {
    x: 50,
    y: height - 55,
    size: 9,
    font,
    color: COLORS.white,
  });

  // Invoice type label - large, on the right
  const invoiceTypeLabel = getInvoiceTypeLabel(invoiceData.invoice_type);
  const labelWidth = fontBold.widthOfTextAtSize(removeDiacritics(invoiceTypeLabel), 28);

  drawText(invoiceTypeLabel, {
    x: width - labelWidth - 50,
    y: height - 50,
    size: 28,
    font: fontBold,
    color: COLORS.white,
  });

  y = height - 130; // Continue below banner

  // =====================================================
  // INVOICE METADATA - In a light box
  // =====================================================

  const metadataHeight = invoiceData.delivery_date ? 110 : 95;

  // Background box for metadata
  page.drawRectangle({
    x: 40,
    y: y - metadataHeight + 10,
    width: width - 80,
    height: metadataHeight,
    color: COLORS.veryLightGray,
  });

  y -= 15;

  // Two-column layout for metadata
  const col1X = 60;
  const col2X = 320;

  // Left column
  let yLeft = y;

  // Invoice number
  drawText('Cislo faktury:', {
    x: col1X,
    y: yLeft,
    size: 9,
    font: fontBold,
    color: COLORS.mediumGray,
  });

  drawText(invoiceData.invoice_number, {
    x: col1X + 110,
    y: yLeft,
    size: 9,
    font: fontBold,
    color: COLORS.black,
  });

  yLeft -= 18;

  // Variable symbol
  drawText('Variabilni symbol:', {
    x: col1X,
    y: yLeft,
    size: 9,
    font: fontBold,
    color: COLORS.mediumGray,
  });

  drawText(invoiceData.variable_symbol, {
    x: col1X + 110,
    y: yLeft,
    size: 9,
    font,
    color: COLORS.black,
  });

  yLeft -= 18;

  // Payment method
  drawText('Zpusob platby:', {
    x: col1X,
    y: yLeft,
    size: 9,
    font: fontBold,
    color: COLORS.mediumGray,
  });

  drawText(getPaymentMethodLabel(invoiceData.payment_method), {
    x: col1X + 110,
    y: yLeft,
    size: 9,
    font,
    color: COLORS.black,
  });

  // Right column
  let yRight = y;

  // Issue date
  drawText('Datum vystaveni:', {
    x: col2X,
    y: yRight,
    size: 9,
    font: fontBold,
    color: COLORS.mediumGray,
  });

  drawText(formatDate(invoiceData.issue_date), {
    x: col2X + 110,
    y: yRight,
    size: 9,
    font,
    color: COLORS.black,
  });

  yRight -= 18;

  // Due date
  drawText('Datum splatnosti:', {
    x: col2X,
    y: yRight,
    size: 9,
    font: fontBold,
    color: COLORS.mediumGray,
  });

  drawText(formatDate(invoiceData.due_date), {
    x: col2X + 110,
    y: yRight,
    size: 9,
    font,
    color: COLORS.black,
  });

  yRight -= 18;

  // Delivery date (DUZP)
  if (invoiceData.delivery_date) {
    drawText('Datum zdan. plneni:', {
      x: col2X,
      y: yRight,
      size: 9,
      font: fontBold,
      color: COLORS.mediumGray,
    });

    drawText(formatDate(invoiceData.delivery_date), {
      x: col2X + 110,
      y: yRight,
      size: 9,
      font,
      color: COLORS.black,
    });
  }

  y -= metadataHeight + 20;  // More spacing before company info

  // =====================================================
  // COMPANY INFO (DODAVATEL)
  // =====================================================

  drawText('Dodavatel:', {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  // Company name
  drawText(invoiceData.company.name, {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.black,
  });

  y -= 15;

  // Address
  drawText(`${invoiceData.company.street}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 12;

  drawText(`${invoiceData.company.zip} ${invoiceData.company.city}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 12;

  drawText(invoiceData.company.country, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 15;

  // IČO, DIČ
  drawText(`IČO: ${invoiceData.company.ico}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  if (invoiceData.company.dic) {
    y -= 12;
    drawText(`DIČ: ${invoiceData.company.dic}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
  }

  y -= 50;  // More spacing before client info

  // =====================================================
  // CLIENT INFO (ODBĚRATEL)
  // =====================================================

  drawText('Odběratel:', {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  // Client name
  drawText(invoiceData.client_name, {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.black,
  });

  y -= 15;

  // Address
  if (invoiceData.client_street) {
    drawText(invoiceData.client_street, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  if (invoiceData.client_zip && invoiceData.client_city) {
    drawText(`${invoiceData.client_zip} ${invoiceData.client_city}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  drawText(invoiceData.client_country, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 15;

  // IČO, DIČ
  if (invoiceData.client_ico) {
    drawText(`IČO: ${invoiceData.client_ico}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  if (invoiceData.client_dic) {
    drawText(`DIČ: ${invoiceData.client_dic}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
    y -= 12;
  }

  y -= 50;  // More spacing before items table

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

  drawText('Popis', {
    x: 60,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COLORS.white,
  });

  drawText('Množství', {
    x: 320,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COLORS.white,
  });

  drawText('Jedn. cena', {
    x: 390,
    y: y - 10,
    size: 9,
    font: fontBold,
    color: COLORS.white,
  });

  drawText('Celkem', {
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

    drawText(item.description, {
      x: 60,
      y,
      size: 9,
      font,
      color: COLORS.black,
      maxWidth: 250,
    });

    drawText(`${item.quantity}`, {
      x: 330,
      y,
      size: 9,
      font,
      color: COLORS.black,
    });

    drawText(formatCurrency(item.unit_price, ''), {
      x: 390,
      y,
      size: 9,
      font,
      color: COLORS.black,
    });

    drawText(formatCurrency(totalPrice, ''), {
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

  // If VAT payer, show breakdown
  if (invoiceData.vat_rate > 0) {
    // Amount without VAT
    drawText('Základ daně:', {
      x: 350,
      y,
      size: 10,
      font: fontBold,
      color: COLORS.darkGray,
    });

    drawText(formatCurrency(invoiceData.amount_without_vat, invoiceData.currency), {
      x: 470,
      y,
      size: 10,
      font,
      color: COLORS.black,
    });

    y -= 15;

    // VAT
    drawText(`DPH (${invoiceData.vat_rate}%):`, {
      x: 350,
      y,
      size: 10,
      font: fontBold,
      color: COLORS.darkGray,
    });

    drawText(formatCurrency(invoiceData.vat_amount, invoiceData.currency), {
      x: 470,
      y,
      size: 10,
      font,
      color: COLORS.black,
    });

    y -= 20;
  } else {
    // Not VAT payer - show note
    drawText('Nejsme plátci DPH', {
      x: 350,
      y,
      size: 9,
      font,
      color: COLORS.lightGray,
    });

    y -= 25;
  }

  // Total amount
  page.drawRectangle({
    x: 340,
    y: y - 5,
    width: 205,
    height: 25,
    color: COLORS.teal,
  });

  drawText('Celkem k úhradě:', {
    x: 350,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.white,
  });

  drawText(formatCurrency(invoiceData.amount_with_vat, invoiceData.currency), {
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

  drawText('Platební údaje:', {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  drawText('Číslo účtu:', {
    x: 50,
    y,
    size: 9,
    font: fontBold,
    color: COLORS.darkGray,
  });

  drawText(invoiceData.company.bank_account, {
    x: 150,
    y,
    size: 9,
    font,
    color: COLORS.black,
  });

  y -= 12;

  drawText('IBAN:', {
    x: 50,
    y,
    size: 9,
    font: fontBold,
    color: COLORS.darkGray,
  });

  drawText(invoiceData.company.iban, {
    x: 150,
    y,
    size: 9,
    font,
    color: COLORS.black,
  });

  y -= 12;

  drawText('SWIFT:', {
    x: 50,
    y,
    size: 9,
    font: fontBold,
    color: COLORS.darkGray,
  });

  drawText(invoiceData.company.swift, {
    x: 150,
    y,
    size: 9,
    font,
    color: COLORS.black,
  });

  y -= 30;

  // =====================================================
  // QR CODE - Payment QR Code
  // =====================================================

  try {
    const qrCode = await generatePaymentQRCode(
      invoiceData.company.iban,
      invoiceData.company.swift,
      invoiceData.amount_with_vat,
      invoiceData.currency,
      invoiceData.variable_symbol,
      `Faktura ${invoiceData.invoice_number}`
    );

    // Embed QR code image
    const qrImage = await pdfDoc.embedPng(qrCode);
    const qrDims = qrImage.scale(0.6); // Scale to 120x120

    // Draw QR code on the right side
    page.drawImage(qrImage, {
      x: width - qrDims.width - 60,
      y: y - 180,
      width: qrDims.width,
      height: qrDims.height,
    });

    // QR code label
    drawText('Platba QR kodem', {
      x: width - qrDims.width - 60,
      y: y - 195,
      size: 8,
      font: fontBold,
      color: COLORS.teal,
    });

  } catch (error) {
    console.error('Failed to generate QR code:', error);
    // Continue without QR code if it fails
  }

  y -= 20;

  // =====================================================
  // NOTES
  // =====================================================

  if (invoiceData.notes) {
    drawText('Poznámka:', {
      x: 50,
      y,
      size: 9,
      font: fontBold,
      color: COLORS.darkGray,
    });

    y -= 15;

    drawText(invoiceData.notes, {
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

  drawText(`${invoiceData.company.name} | ${invoiceData.company.email} | ${invoiceData.company.phone}`, {
    x: 50,
    y: 30,
    size: 8,
    font,
    color: COLORS.lightGray,
  });

  drawText(invoiceData.company.website, {
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

// =====================================================
// PAYMENT CONFIRMATION (Potvrzení o zaplacení)
// =====================================================

interface PaymentConfirmationData {
  invoice_number: string;
  variable_symbol: string;
  company: CompanyInfo;
  client_name: string;
  client_ico: string | null;
  amount_with_vat: number;
  currency: string;
  payment_date: number; // Unix timestamp
  payment_method: string;
}

/**
 * Generate payment confirmation PDF
 * Czech: "Potvrzení o zaplacení faktury"
 */
export async function generatePaymentConfirmationPDF(
  data: PaymentConfirmationData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const drawText = (text: string, options: any) => {
    page.drawText(removeDiacritics(text), options);
  };

  let y = height - 50;

  // =====================================================
  // HEADER
  // =====================================================

  drawText('POTVRZENI O ZAPLACENI', {
    x: 50,
    y,
    size: 24,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 15;

  drawText('Payment Confirmation', {
    x: 50,
    y,
    size: 12,
    font,
    color: COLORS.lightGray,
  });

  y -= 50;

  // =====================================================
  // CONFIRMATION BOX
  // =====================================================

  // Green confirmation box
  page.drawRectangle({
    x: 50,
    y: y - 80,
    width: width - 100,
    height: 90,
    color: rgb(0.9, 0.98, 0.9), // Light green
    borderColor: rgb(0.2, 0.7, 0.3),
    borderWidth: 2,
  });

  drawText('FAKTURA UHRAZENA', {
    x: 200,
    y: y - 30,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.2),
  });

  drawText(`Castka: ${formatCurrency(data.amount_with_vat, data.currency)}`, {
    x: 200,
    y: y - 55,
    size: 14,
    font: fontBold,
    color: COLORS.black,
  });

  drawText(`Datum uhrady: ${formatDate(data.payment_date)}`, {
    x: 200,
    y: y - 75,
    size: 11,
    font,
    color: COLORS.darkGray,
  });

  y -= 120;

  // =====================================================
  // INVOICE DETAILS
  // =====================================================

  drawText('Udaje o fakture:', {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 25;

  const details = [
    ['Cislo faktury:', data.invoice_number],
    ['Variabilni symbol:', data.variable_symbol],
    ['Zpusob platby:', getPaymentMethodLabel(data.payment_method)],
  ];

  for (const [label, value] of details) {
    drawText(label, {
      x: 50,
      y,
      size: 10,
      font: fontBold,
      color: COLORS.darkGray,
    });

    drawText(value, {
      x: 180,
      y,
      size: 10,
      font,
      color: COLORS.black,
    });

    y -= 18;
  }

  y -= 30;

  // =====================================================
  // SUPPLIER INFO
  // =====================================================

  drawText('Dodavatel:', {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  drawText(data.company.name, {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.black,
  });

  y -= 15;

  drawText(`${data.company.street}, ${data.company.zip} ${data.company.city}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 12;

  drawText(`ICO: ${data.company.ico}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  y -= 30;

  // =====================================================
  // CLIENT INFO
  // =====================================================

  drawText('Odberatel:', {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: COLORS.teal,
  });

  y -= 20;

  drawText(data.client_name, {
    x: 50,
    y,
    size: 10,
    font: fontBold,
    color: COLORS.black,
  });

  if (data.client_ico) {
    y -= 15;
    drawText(`ICO: ${data.client_ico}`, {
      x: 50,
      y,
      size: 9,
      font,
      color: COLORS.darkGray,
    });
  }

  y -= 50;

  // =====================================================
  // LEGAL NOTE
  // =====================================================

  page.drawRectangle({
    x: 50,
    y: y - 40,
    width: width - 100,
    height: 50,
    color: rgb(0.95, 0.95, 0.95),
  });

  drawText('Tento doklad potvrzuje uhrazeni vyse uvedene faktury.', {
    x: 60,
    y: y - 15,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  drawText('Doklad byl vygenerovan elektronicky a je platny bez podpisu.', {
    x: 60,
    y: y - 30,
    size: 9,
    font,
    color: COLORS.darkGray,
  });

  // =====================================================
  // FOOTER
  // =====================================================

  drawText(`${data.company.name} | ${data.company.email} | ${data.company.phone}`, {
    x: 50,
    y: 30,
    size: 8,
    font,
    color: COLORS.lightGray,
  });

  drawText(data.company.website, {
    x: width - 150,
    y: 30,
    size: 8,
    font,
    color: COLORS.teal,
  });

  // Generation timestamp
  const now = new Date();
  drawText(`Vygenerovano: ${now.toLocaleDateString('cs-CZ')} ${now.toLocaleTimeString('cs-CZ')}`, {
    x: width - 200,
    y: 50,
    size: 7,
    font,
    color: COLORS.lightGray,
  });

  return pdfDoc.save();
}

/**
 * Upload payment confirmation PDF to Vercel Blob
 */
export async function uploadPaymentConfirmationPDF(
  pdfBytes: Uint8Array,
  invoiceNumber: string
): Promise<string> {
  const filename = `payment-confirmations/${invoiceNumber}-potvrzeni.pdf`;

  console.log('📤 Uploading payment confirmation to Vercel Blob:', filename);

  const buffer = Buffer.from(pdfBytes);

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'application/pdf',
  });

  console.log('✅ Payment confirmation uploaded:', blob.url);

  return blob.url;
}
