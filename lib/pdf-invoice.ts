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
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const margin = 40;
  const contentWidth = width - margin * 2;

  const drawText = (text: string, options: any) => {
    page.drawText(removeDiacritics(text), options);
  };

  // Right-align helper: draws text so its right edge lands at `rightX`
  const drawTextRight = (text: string, rightX: number, yPos: number, size: number, usedFont: any, color: any) => {
    const textWidth = usedFont.widthOfTextAtSize(removeDiacritics(text), size);
    drawText(text, { x: rightX - textWidth, y: yPos, size, font: usedFont, color });
  };

  // Thin separator line helper
  const drawSeparator = (yPos: number) => {
    page.drawRectangle({
      x: margin,
      y: yPos,
      width: contentWidth,
      height: 0.5,
      color: rgb(0.82, 0.82, 0.82),
    });
  };

  let y: number;

  // =====================================================
  // 1. HEADER BANNER (slim 70px)
  // =====================================================

  const bannerHeight = 70;
  page.drawRectangle({
    x: 0,
    y: height - bannerHeight,
    width,
    height: bannerHeight,
    color: COLORS.teal,
  });

  // Subtle bottom shadow
  page.drawRectangle({
    x: 0,
    y: height - bannerHeight - 1.5,
    width,
    height: 1.5,
    color: COLORS.tealDark,
  });

  // Logo: "Web" white + "lyx" gold
  drawText('Web', {
    x: margin + 10,
    y: height - 35,
    size: 22,
    font: fontBold,
    color: COLORS.white,
  });
  drawText('lyx', {
    x: margin + 52,
    y: height - 35,
    size: 22,
    font: fontBold,
    color: COLORS.accent,
  });
  drawText('Web Development & Design', {
    x: margin + 10,
    y: height - 50,
    size: 8,
    font,
    color: COLORS.white,
  });

  // Invoice type + number on right side of banner
  const invoiceTypeLabel = getInvoiceTypeLabel(invoiceData.invoice_type);
  const typeLabelWidth = fontBold.widthOfTextAtSize(removeDiacritics(invoiceTypeLabel), 22);
  drawText(invoiceTypeLabel, {
    x: width - typeLabelWidth - margin - 10,
    y: height - 33,
    size: 22,
    font: fontBold,
    color: COLORS.white,
  });

  const numText = `c. ${invoiceData.invoice_number}`;
  const numWidth = font.widthOfTextAtSize(removeDiacritics(numText), 9);
  drawText(numText, {
    x: width - numWidth - margin - 10,
    y: height - 48,
    size: 9,
    font,
    color: COLORS.white,
  });

  y = height - bannerHeight - 12;

  // =====================================================
  // 2. METADATA BOX (light gray background)
  // =====================================================

  const metaRows = 3;
  const metaRowHeight = 16;
  const metaBoxHeight = metaRows * metaRowHeight + 16;

  page.drawRectangle({
    x: margin,
    y: y - metaBoxHeight,
    width: contentWidth,
    height: metaBoxHeight,
    color: COLORS.veryLightGray,
  });

  const metaLeftX = margin + 15;
  const metaLeftValX = margin + 130;
  const metaRightX = width / 2 + 15;
  const metaRightValX = width / 2 + 140;
  let metaY = y - 14;

  // Row 1: Invoice number | Issue date
  drawText('Cislo faktury:', { x: metaLeftX, y: metaY, size: 8, font: fontBold, color: COLORS.mediumGray });
  drawText(invoiceData.invoice_number, { x: metaLeftValX, y: metaY, size: 8, font: fontBold, color: COLORS.black });
  drawText('Datum vystaveni:', { x: metaRightX, y: metaY, size: 8, font: fontBold, color: COLORS.mediumGray });
  drawText(formatDate(invoiceData.issue_date), { x: metaRightValX, y: metaY, size: 8, font, color: COLORS.black });
  metaY -= metaRowHeight;

  // Row 2: Variable symbol | Due date
  drawText('Var. symbol:', { x: metaLeftX, y: metaY, size: 8, font: fontBold, color: COLORS.mediumGray });
  drawText(invoiceData.variable_symbol, { x: metaLeftValX, y: metaY, size: 8, font, color: COLORS.black });
  drawText('Datum splatnosti:', { x: metaRightX, y: metaY, size: 8, font: fontBold, color: COLORS.mediumGray });
  drawText(formatDate(invoiceData.due_date), { x: metaRightValX, y: metaY, size: 8, font, color: COLORS.black });
  metaY -= metaRowHeight;

  // Row 3: Payment method | Delivery date
  drawText('Zpusob platby:', { x: metaLeftX, y: metaY, size: 8, font: fontBold, color: COLORS.mediumGray });
  drawText(getPaymentMethodLabel(invoiceData.payment_method), { x: metaLeftValX, y: metaY, size: 8, font, color: COLORS.black });
  if (invoiceData.delivery_date) {
    drawText('Datum zdan. plneni:', { x: metaRightX, y: metaY, size: 8, font: fontBold, color: COLORS.mediumGray });
    drawText(formatDate(invoiceData.delivery_date), { x: metaRightValX, y: metaY, size: 8, font, color: COLORS.black });
  }

  y -= metaBoxHeight + 10;
  drawSeparator(y);
  y -= 18;

  // =====================================================
  // 3. SUPPLIER + CLIENT — TWO COLUMNS SIDE BY SIDE
  // =====================================================

  const colLeft = margin + 10;
  const colRight = width / 2 + 15;
  const sectionStartY = y;

  // --- Left column: DODAVATEL ---
  let leftY = sectionStartY;

  drawText('DODAVATEL', { x: colLeft, y: leftY, size: 9, font: fontBold, color: COLORS.teal });
  leftY -= 16;

  drawText(invoiceData.company.name, { x: colLeft, y: leftY, size: 10, font: fontBold, color: COLORS.darkGray });
  leftY -= 14;

  drawText(invoiceData.company.street, { x: colLeft, y: leftY, size: 9, font, color: COLORS.darkGray });
  leftY -= 12;

  drawText(`${invoiceData.company.zip} ${invoiceData.company.city}`, { x: colLeft, y: leftY, size: 9, font, color: COLORS.darkGray });
  leftY -= 12;

  drawText(invoiceData.company.country, { x: colLeft, y: leftY, size: 9, font, color: COLORS.darkGray });
  leftY -= 14;

  drawText(`ICO: ${invoiceData.company.ico}`, { x: colLeft, y: leftY, size: 9, font, color: COLORS.darkGray });
  leftY -= 12;

  if (invoiceData.company.dic) {
    drawText(`DIC: ${invoiceData.company.dic}`, { x: colLeft, y: leftY, size: 9, font, color: COLORS.darkGray });
    leftY -= 12;
  }

  // --- Right column: ODBERATEL ---
  let rightY = sectionStartY;

  drawText('ODBERATEL', { x: colRight, y: rightY, size: 9, font: fontBold, color: COLORS.teal });
  rightY -= 16;

  drawText(invoiceData.client_name, { x: colRight, y: rightY, size: 10, font: fontBold, color: COLORS.darkGray });
  rightY -= 14;

  if (invoiceData.client_street) {
    drawText(invoiceData.client_street, { x: colRight, y: rightY, size: 9, font, color: COLORS.darkGray });
    rightY -= 12;
  }

  if (invoiceData.client_zip && invoiceData.client_city) {
    drawText(`${invoiceData.client_zip} ${invoiceData.client_city}`, { x: colRight, y: rightY, size: 9, font, color: COLORS.darkGray });
    rightY -= 12;
  }

  drawText(invoiceData.client_country, { x: colRight, y: rightY, size: 9, font, color: COLORS.darkGray });
  rightY -= 14;

  if (invoiceData.client_ico) {
    drawText(`ICO: ${invoiceData.client_ico}`, { x: colRight, y: rightY, size: 9, font, color: COLORS.darkGray });
    rightY -= 12;
  }

  if (invoiceData.client_dic) {
    drawText(`DIC: ${invoiceData.client_dic}`, { x: colRight, y: rightY, size: 9, font, color: COLORS.darkGray });
    rightY -= 12;
  }

  // Use the lower of the two columns
  y = Math.min(leftY, rightY) - 10;
  drawSeparator(y);
  y -= 18;

  // =====================================================
  // 4. ITEMS TABLE — alternating rows, right-aligned numbers
  // =====================================================

  const tableX = margin;
  const tableW = contentWidth;
  const colDescX = tableX + 10;
  const colQtyRight = tableX + 330;
  const colUnitRight = tableX + 420;
  const colTotalRight = tableX + tableW - 10;
  const headerH = 22;
  const rowH = 20;

  // Table header
  page.drawRectangle({
    x: tableX,
    y: y - headerH + 5,
    width: tableW,
    height: headerH,
    color: COLORS.teal,
  });

  const headerY = y - headerH + 11;
  drawText('Popis', { x: colDescX, y: headerY, size: 8.5, font: fontBold, color: COLORS.white });
  drawTextRight('Mnozstvi', colQtyRight, headerY, 8.5, fontBold, COLORS.white);
  drawTextRight('Jedn. cena', colUnitRight, headerY, 8.5, fontBold, COLORS.white);
  drawTextRight('Celkem', colTotalRight, headerY, 8.5, fontBold, COLORS.white);

  y -= headerH + 2;

  // Table rows with alternating backgrounds
  invoiceData.items.forEach((item, idx) => {
    const totalPrice = item.quantity * item.unit_price;

    // Alternating row background
    if (idx % 2 === 0) {
      page.drawRectangle({
        x: tableX,
        y: y - rowH + 7,
        width: tableW,
        height: rowH,
        color: COLORS.veryLightGray,
      });
    }

    const rowTextY = y - rowH + 12;
    drawText(item.description, { x: colDescX, y: rowTextY, size: 9, font, color: COLORS.darkGray, maxWidth: 260 });
    drawTextRight(`${item.quantity}`, colQtyRight, rowTextY, 9, font, COLORS.darkGray);
    drawTextRight(formatCurrency(item.unit_price, ''), colUnitRight, rowTextY, 9, font, COLORS.darkGray);
    drawTextRight(formatCurrency(totalPrice, ''), colTotalRight, rowTextY, 9, fontBold, COLORS.darkGray);

    y -= rowH;
  });

  // Bottom line under table
  page.drawRectangle({
    x: tableX,
    y: y + 6,
    width: tableW,
    height: 0.5,
    color: COLORS.teal,
  });

  y -= 12;

  // =====================================================
  // 5. TOTALS
  // =====================================================

  if (invoiceData.vat_rate > 0) {
    // VAT breakdown
    drawText('Zaklad dane:', { x: 370, y, size: 9, font, color: COLORS.mediumGray });
    drawTextRight(formatCurrency(invoiceData.amount_without_vat, invoiceData.currency), colTotalRight, y, 9, font, COLORS.darkGray);
    y -= 15;

    drawText(`DPH (${invoiceData.vat_rate}%):`, { x: 370, y, size: 9, font, color: COLORS.mediumGray });
    drawTextRight(formatCurrency(invoiceData.vat_amount, invoiceData.currency), colTotalRight, y, 9, font, COLORS.darkGray);
    y -= 18;
  } else {
    drawTextRight('Nejsme platci DPH', colTotalRight, y, 8, font, COLORS.lightGray);
    y -= 18;
  }

  // Total box (teal)
  const totalBoxW = 210;
  const totalBoxH = 28;
  const totalBoxX = tableX + tableW - totalBoxW;

  page.drawRectangle({
    x: totalBoxX,
    y: y - totalBoxH + 10,
    width: totalBoxW,
    height: totalBoxH,
    color: COLORS.teal,
  });

  const totalTextY = y - totalBoxH + 18;
  drawText('Celkem k uhrade:', { x: totalBoxX + 12, y: totalTextY, size: 11, font: fontBold, color: COLORS.white });
  drawTextRight(
    formatCurrency(invoiceData.amount_with_vat, invoiceData.currency),
    totalBoxX + totalBoxW - 12,
    totalTextY,
    11,
    fontBold,
    COLORS.white,
  );

  y -= totalBoxH + 14;
  drawSeparator(y);
  y -= 18;

  // =====================================================
  // 6. PAYMENT DETAILS + QR CODE — side by side
  // =====================================================

  const payLeftX = margin + 10;
  const payLabelW = 90;

  drawText('PLATEBNI UDAJE', { x: payLeftX, y, size: 9, font: fontBold, color: COLORS.teal });
  y -= 16;

  const bankDetails: [string, string][] = [
    ['Cislo uctu:', invoiceData.company.bank_account],
    ['IBAN:', invoiceData.company.iban],
    ['SWIFT:', invoiceData.company.swift],
  ];

  const bankStartY = y;
  for (const [label, value] of bankDetails) {
    drawText(label, { x: payLeftX, y, size: 8.5, font: fontBold, color: COLORS.mediumGray });
    drawText(value, { x: payLeftX + payLabelW, y, size: 8.5, font, color: COLORS.darkGray });
    y -= 14;
  }

  // QR Code on the right side, aligned with bank details
  try {
    const qrCode = await generatePaymentQRCode(
      invoiceData.company.iban,
      invoiceData.company.swift,
      invoiceData.amount_with_vat,
      invoiceData.currency,
      invoiceData.variable_symbol,
      `Faktura ${invoiceData.invoice_number}`
    );

    const qrImage = await pdfDoc.embedPng(qrCode);
    const qrSize = 90;
    const qrX = width - margin - qrSize - 10;
    const qrY = bankStartY - qrSize + 14;

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // QR label centered under the code
    const qrLabel = 'Platba QR kodem';
    const qrLabelWidth = font.widthOfTextAtSize(removeDiacritics(qrLabel), 7);
    drawText(qrLabel, {
      x: qrX + (qrSize - qrLabelWidth) / 2,
      y: qrY - 10,
      size: 7,
      font: fontBold,
      color: COLORS.teal,
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }

  y -= 10;
  drawSeparator(y);
  y -= 16;

  // =====================================================
  // 7. NOTES
  // =====================================================

  if (invoiceData.notes) {
    drawText('Poznamka:', { x: margin + 10, y, size: 8, font: fontBold, color: COLORS.mediumGray });
    y -= 12;
    drawText(invoiceData.notes, { x: margin + 10, y, size: 8, font, color: COLORS.lightGray, maxWidth: contentWidth - 20 });
  }

  // =====================================================
  // 8. FOOTER
  // =====================================================

  const footerY = 28;
  page.drawRectangle({
    x: 0,
    y: footerY - 8,
    width,
    height: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });

  const footerText = `${invoiceData.company.name} | ${invoiceData.company.email} | ${invoiceData.company.phone}`;
  drawText(footerText, { x: margin, y: footerY - 18, size: 7, font, color: COLORS.lightGray });

  const websiteWidth = font.widthOfTextAtSize(removeDiacritics(invoiceData.company.website), 7);
  drawText(invoiceData.company.website, {
    x: width - margin - websiteWidth,
    y: footerY - 18,
    size: 7,
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

  // Convert Uint8Array to Buffer for Vercel Blob
  const buffer = Buffer.from(pdfBytes);

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'application/pdf',
  });

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

  const buffer = Buffer.from(pdfBytes);

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: 'application/pdf',
  });

  return blob.url;
}
