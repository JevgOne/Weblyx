/**
 * Fakturoid API Integration
 *
 * Official Fakturoid REST API v3 client
 * Documentation: https://www.fakturoid.cz/api/v3
 *
 * Features:
 * - Create invoices
 * - Send invoices via email
 * - Mark invoices as paid
 * - Get invoice details
 */

// =====================================================
// CONFIGURATION
// =====================================================

const FAKTUROID_CONFIG = {
  slug: process.env.FAKTUROID_SLUG || '',
  apiKey: process.env.FAKTUROID_API_KEY || '',
  apiUrl: 'https://app.fakturoid.cz/api/v3',
  userAgent: 'Weblyx (info@weblyx.cz)',
};

// Validate configuration
if (!FAKTUROID_CONFIG.slug || !FAKTUROID_CONFIG.apiKey) {
  console.warn('⚠️ Fakturoid credentials not configured. Invoice features will not work.');
  console.warn('   Required env vars: FAKTUROID_SLUG, FAKTUROID_API_KEY');
}

// =====================================================
// TYPES
// =====================================================

export interface FakturoidSubject {
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  registration_no?: string; // IČO
  vat_no?: string; // DIČ
}

export interface FakturoidLine {
  name: string;
  quantity: number;
  unit_price: number; // in CZK
  vat_rate: number; // in % (21, 15, 12, 10, 0)
}

export interface FakturoidInvoiceInput {
  subject: FakturoidSubject;
  lines: FakturoidLine[];
  number?: string; // Invoice number (auto-generated if not provided)
  variable_symbol?: string;
  issued_on?: string; // YYYY-MM-DD
  due_on?: string; // YYYY-MM-DD
  note?: string;
  payment_method?: 'bank' | 'cash' | 'card';
}

export interface FakturoidInvoice {
  id: number;
  number: string;
  variable_symbol: string;
  issued_on: string;
  due_on: string;
  paid_on: string | null;
  status: 'open' | 'sent' | 'overdue' | 'paid';
  subject: FakturoidSubject;
  lines: FakturoidLine[];
  subtotal: number;
  total: number;
  native_subtotal: number;
  native_total: number;
  public_html_url: string;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// API REQUESTS
// =====================================================

/**
 * Make authenticated API request to Fakturoid
 */
async function fakturoidRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${FAKTUROID_CONFIG.apiUrl}/accounts/${FAKTUROID_CONFIG.slug}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': FAKTUROID_CONFIG.userAgent,
      'Authorization': `Bearer ${FAKTUROID_CONFIG.apiKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Fakturoid API Error:', {
      endpoint,
      status: response.status,
      error,
    });
    throw new Error(`Fakturoid API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// =====================================================
// INVOICE OPERATIONS
// =====================================================

/**
 * Create new invoice in Fakturoid
 *
 * @param invoiceData Invoice details
 * @returns Created invoice
 */
export async function createFakturoidInvoice(
  invoiceData: FakturoidInvoiceInput
): Promise<FakturoidInvoice> {
  console.log('📄 Creating Fakturoid invoice for:', invoiceData.subject.name);

  const invoice = await fakturoidRequest<FakturoidInvoice>('/invoices.json', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });

  console.log('✅ Fakturoid invoice created:', {
    id: invoice.id,
    number: invoice.number,
    total: invoice.total,
    pdf_url: invoice.pdf_url,
  });

  return invoice;
}

/**
 * Get invoice by ID
 *
 * @param invoiceId Fakturoid invoice ID
 * @returns Invoice details
 */
export async function getFakturoidInvoice(
  invoiceId: number
): Promise<FakturoidInvoice> {
  console.log('🔍 Fetching Fakturoid invoice:', invoiceId);

  const invoice = await fakturoidRequest<FakturoidInvoice>(
    `/invoices/${invoiceId}.json`
  );

  return invoice;
}

/**
 * Mark invoice as paid
 *
 * @param invoiceId Fakturoid invoice ID
 * @param paidOn Date when paid (YYYY-MM-DD) - defaults to today
 * @returns Updated invoice
 */
export async function markFakturoidInvoiceAsPaid(
  invoiceId: number,
  paidOn?: string
): Promise<FakturoidInvoice> {
  console.log('💰 Marking Fakturoid invoice as paid:', invoiceId);

  const paidDate = paidOn || new Date().toISOString().split('T')[0];

  const invoice = await fakturoidRequest<FakturoidInvoice>(
    `/invoices/${invoiceId}/fire.json?event=pay`,
    {
      method: 'POST',
      body: JSON.stringify({
        paid_on: paidDate,
      }),
    }
  );

  console.log('✅ Invoice marked as paid:', {
    id: invoice.id,
    number: invoice.number,
    paid_on: invoice.paid_on,
  });

  return invoice;
}

/**
 * Send invoice via email
 *
 * @param invoiceId Fakturoid invoice ID
 * @param email Recipient email (optional - uses subject email if not provided)
 * @returns Success status
 */
export async function sendFakturoidInvoiceEmail(
  invoiceId: number,
  email?: string
): Promise<{ success: boolean }> {
  console.log('📧 Sending Fakturoid invoice via email:', invoiceId);

  const body: any = {};
  if (email) {
    body.email = email;
  }

  await fakturoidRequest(
    `/invoices/${invoiceId}/message.json`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );

  console.log('✅ Invoice sent via email');

  return { success: true };
}

/**
 * Delete invoice (only unpaid invoices can be deleted)
 *
 * @param invoiceId Fakturoid invoice ID
 * @returns Success status
 */
export async function deleteFakturoidInvoice(
  invoiceId: number
): Promise<{ success: boolean }> {
  console.log('🗑️ Deleting Fakturoid invoice:', invoiceId);

  await fakturoidRequest(`/invoices/${invoiceId}.json`, {
    method: 'DELETE',
  });

  console.log('✅ Invoice deleted');

  return { success: true };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if Fakturoid is configured
 */
export function isFakturoidConfigured(): boolean {
  return !!(FAKTUROID_CONFIG.slug && FAKTUROID_CONFIG.apiKey);
}

/**
 * Format date to YYYY-MM-DD (Fakturoid format)
 */
export function formatDateForFakturoid(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate due date (14 days from issue date by default)
 */
export function calculateDueDate(issueDate: Date, dueDays: number = 14): string {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + dueDays);
  return formatDateForFakturoid(dueDate);
}

// =====================================================
// EXPORTS
// =====================================================

export const Fakturoid = {
  // Invoice operations
  createInvoice: createFakturoidInvoice,
  getInvoice: getFakturoidInvoice,
  markAsPaid: markFakturoidInvoiceAsPaid,
  sendEmail: sendFakturoidInvoiceEmail,
  deleteInvoice: deleteFakturoidInvoice,

  // Helpers
  isConfigured: isFakturoidConfigured,
  formatDate: formatDateForFakturoid,
  calculateDueDate,
};

export default Fakturoid;
