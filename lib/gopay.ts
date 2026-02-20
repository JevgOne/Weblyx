/**
 * GoPay Payment Gateway Integration
 *
 * Official GoPay REST API v3 client
 * Documentation: https://doc.gopay.com/
 *
 * Features:
 * - OAuth2 authentication
 * - Create standard & recurring payments
 * - Payment status checking
 * - Refunds
 * - Webhook signature verification
 */

import {
  type GoPayPaymentRequest,
  type GoPayPaymentResponse,
  type GoPayPaymentStatus,
  type PaymentStatus
} from '@/types/payments';

// =====================================================
// CONFIGURATION
// =====================================================

const GOPAY_CONFIG = {
  // Credentials from environment
  goid: process.env.GOPAY_GOID || '',
  clientId: process.env.GOPAY_CLIENT_ID || '',
  clientSecret: process.env.GOPAY_CLIENT_SECRET || '',
  isProduction: process.env.GOPAY_IS_PRODUCTION === 'true',

  // API URLs
  apiUrl: process.env.GOPAY_IS_PRODUCTION === 'true'
    ? 'https://gate.gopay.cz/api'
    : 'https://gw.sandbox.gopay.com/api',

  // OAuth scope
  scope: 'payment-all',
};

// Validate configuration
if (!GOPAY_CONFIG.goid || !GOPAY_CONFIG.clientId || !GOPAY_CONFIG.clientSecret) {
  console.warn('⚠️ GoPay credentials not configured. Payment features will not work.');
  console.warn('   Required env vars: GOPAY_GOID, GOPAY_CLIENT_ID, GOPAY_CLIENT_SECRET, GOPAY_IS_PRODUCTION');
}

// =====================================================
// OAUTH2 TOKEN MANAGEMENT
// =====================================================

interface GoPayToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number; // Calculated expiration timestamp
}

let cachedToken: GoPayToken | null = null;

/**
 * Get OAuth2 access token (cached with auto-refresh)
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  // Request new token
  const auth = Buffer.from(`${GOPAY_CONFIG.clientId}:${GOPAY_CONFIG.clientSecret}`).toString('base64');

  const response = await fetch(`${GOPAY_CONFIG.apiUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: GOPAY_CONFIG.scope,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GoPay OAuth failed: ${response.status} - ${error}`);
  }

  const data = await response.json();

  cachedToken = {
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    expires_at: Date.now() + (data.expires_in * 1000),
  };

  return cachedToken.access_token;
}

// =====================================================
// API REQUESTS
// =====================================================

/**
 * Make authenticated API request to GoPay
 */
async function goPayRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${GOPAY_CONFIG.apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GoPay API Error:', {
      endpoint,
      status: response.status,
      error,
    });
    throw new Error(`GoPay API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// =====================================================
// PAYMENT OPERATIONS
// =====================================================

/**
 * Create new payment in GoPay
 *
 * @param paymentData Payment details
 * @returns Payment response with gw_url for redirect
 */
export async function createGoPayPayment(
  paymentData: GoPayPaymentRequest
): Promise<GoPayPaymentResponse> {
  const response = await goPayRequest<GoPayPaymentResponse>(
    `/payments/payment`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...paymentData,
        target: {
          type: 'ACCOUNT',
          goid: parseInt(GOPAY_CONFIG.goid),
        },
        lang: paymentData.lang || 'CS',
      }),
    }
  );

  return response;
}

/**
 * Get payment status from GoPay
 *
 * @param paymentId GoPay payment ID
 * @returns Current payment status
 */
export async function getGoPayPaymentStatus(
  paymentId: number
): Promise<GoPayPaymentStatus> {
  const response = await goPayRequest<GoPayPaymentStatus>(
    `/payments/payment/${paymentId}`
  );

  return response;
}

/**
 * Refund payment (full or partial)
 *
 * @param paymentId GoPay payment ID
 * @param amount Amount to refund in haléře (optional, full refund if not provided)
 * @returns Refund response
 */
export async function refundGoPayPayment(
  paymentId: number,
  amount?: number
): Promise<{ result: string; }> {
  const response = await goPayRequest<{ result: string }>(`/payments/payment/${paymentId}/refund`, {
    method: 'POST',
    body: JSON.stringify({
      amount: amount || undefined,
    }),
  });

  return response;
}

/**
 * Create recurring payment (pre-authorization)
 *
 * @param paymentData Payment details with recurrence settings
 * @returns Payment response
 */
export async function createRecurringPayment(
  paymentData: GoPayPaymentRequest & {
    recurrence: {
      recurrence_cycle: 'DAY' | 'WEEK' | 'MONTH';
      recurrence_period: number;
      recurrence_date_to: string; // YYYY-MM-DD
    };
  }
): Promise<GoPayPaymentResponse> {
  return createGoPayPayment(paymentData);
}

/**
 * Charge recurring payment (on-demand)
 *
 * @param parentPaymentId Original payment ID
 * @param amount Amount in haléře
 * @param orderNumber New order number
 * @param description Payment description
 * @returns Payment response
 */
export async function chargeRecurringPayment(
  parentPaymentId: number,
  amount: number,
  orderNumber: string,
  description: string
): Promise<GoPayPaymentResponse> {
  const response = await goPayRequest<GoPayPaymentResponse>(
    `/payments/payment/${parentPaymentId}/create-recurrence`,
    {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency: 'CZK',
        order_number: orderNumber,
        order_description: description,
      }),
    }
  );

  return response;
}

// =====================================================
// WEBHOOK SIGNATURE VERIFICATION
// =====================================================

/**
 * Verify GoPay webhook signature
 *
 * GoPay signs webhook requests with HMAC-SHA256
 * Signature is in x-signature header
 *
 * @param signature Signature from x-signature header
 * @param payload Raw request body
 * @returns True if signature is valid
 */
export function verifyGoPaySignature(
  signature: string,
  payload: string
): boolean {
  const crypto = require('crypto');

  const expectedSignature = crypto
    .createHmac('sha256', GOPAY_CONFIG.clientSecret)
    .update(payload)
    .digest('hex');

  const isValid = signature === expectedSignature;

  if (!isValid) {
    console.error('❌ Invalid GoPay webhook signature!', {
      expected: expectedSignature.substring(0, 20) + '...',
      received: signature.substring(0, 20) + '...',
    });
  }

  return isValid;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Convert CZK to haléře (cents)
 * @param czk Amount in CZK
 * @returns Amount in haléře
 */
export function czkToHalere(czk: number): number {
  return Math.round(czk * 100);
}

/**
 * Convert haléře to CZK
 * @param halere Amount in haléře
 * @returns Amount in CZK
 */
export function halereToCzk(halere: number): number {
  return halere / 100;
}

/**
 * Map GoPay status to internal PaymentStatus
 * @param goPayState GoPay state string
 * @returns Normalized payment status
 */
export function mapGoPayStatus(goPayState: string): PaymentStatus {
  const mapping: Record<string, PaymentStatus> = {
    'CREATED': 'CREATED',
    'PAYMENT_METHOD_CHOSEN': 'PAYMENT_METHOD_CHOSEN',
    'PAID': 'PAID',
    'AUTHORIZED': 'AUTHORIZED',
    'CANCELED': 'CANCELED',
    'TIMEOUTED': 'TIMEOUTED',
    'REFUNDED': 'REFUNDED',
    'PARTIALLY_REFUNDED': 'PARTIALLY_REFUNDED',
  };

  return mapping[goPayState] || 'CREATED';
}

/**
 * Generate unique variable symbol (10 digits)
 * Format: YYMMDD + 4 random digits
 */
export function generateVariableSymbol(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  return `${year}${month}${day}${random}`;
}

/**
 * Check if GoPay is configured
 */
export function isGoPayConfigured(): boolean {
  return !!(GOPAY_CONFIG.goid && GOPAY_CONFIG.clientId && GOPAY_CONFIG.clientSecret);
}

// =====================================================
// EXPORTS
// =====================================================

export const GoPay = {
  // Payment operations
  createPayment: createGoPayPayment,
  getPaymentStatus: getGoPayPaymentStatus,
  refundPayment: refundGoPayPayment,

  // Recurring payments
  createRecurring: createRecurringPayment,
  chargeRecurring: chargeRecurringPayment,

  // Webhooks
  verifySignature: verifyGoPaySignature,

  // Helpers
  czkToHalere,
  halereToCzk,
  mapStatus: mapGoPayStatus,
  generateVariableSymbol,
  isConfigured: isGoPayConfigured,

  // Config (for debugging)
  config: {
    isProduction: GOPAY_CONFIG.isProduction,
    apiUrl: GOPAY_CONFIG.apiUrl,
  },
};

export default GoPay;
