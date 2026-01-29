/**
 * Payment System TypeScript Types
 *
 * Complete type definitions for:
 * - GoPay payments
 * - Czech invoices (faktury)
 * - Recurring subscriptions
 */

// =====================================================
// CLIENT TYPES
// =====================================================

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  ico: string | null;
  dic: string | null;
  notes: string | null;
  invoice_count: number;
  total_invoiced: number;
  created_at: number;
  updated_at: number;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  ico?: string;
  dic?: string;
  notes?: string;
}

// =====================================================
// PAYMENT TYPES
// =====================================================

export type PaymentStatus =
  | 'CREATED'
  | 'PAYMENT_METHOD_CHOSEN'
  | 'PAID'
  | 'AUTHORIZED'
  | 'CANCELED'
  | 'TIMEOUTED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentType =
  | 'project'      // Full project payment
  | 'package'      // Package purchase (e.g., Web 30k)
  | 'deposit'      // Deposit payment (záloha)
  | 'subscription' // Recurring payment
  | 'manual';      // Manual/custom payment

export interface Payment {
  id: string;

  // GoPay specific
  gopay_id: string;
  gopay_gw_url: string | null;
  gopay_status: PaymentStatus;

  // Relations
  lead_id: string | null;
  project_id: string | null;
  invoice_id: string | null;
  subscription_id: string | null;

  // Payment details
  amount: number;              // Amount in haléře (CZK cents)
  currency: string;
  variable_symbol: string;

  // Description
  description: string;
  payment_type: PaymentType;

  // Payer info
  payer_name: string | null;
  payer_email: string | null;
  payer_phone: string | null;
  payer_ico: string | null;   // IČO (company ID)
  payer_dic: string | null;   // DIČ (VAT ID)

  // Metadata
  metadata: Record<string, any> | null;
  notes: string | null;

  // Timestamps
  created_at: number;
  paid_at: number | null;
  updated_at: number;
}

export interface CreatePaymentInput {
  amount: number;              // Amount in Kč (will be converted to haléře)
  description: string;
  payment_type: PaymentType;

  // Optional relations
  lead_id?: string;
  project_id?: string;

  // Payer info
  payer_name?: string;
  payer_email?: string;
  payer_phone?: string;
  payer_ico?: string;
  payer_dic?: string;

  // Optional
  metadata?: Record<string, any>;
  notes?: string;

  // Payment settings
  return_url?: string;         // Where to redirect after payment
  notify_url?: string;         // Webhook URL for GoPay
}

// =====================================================
// INVOICE TYPES
// =====================================================

export type InvoiceType =
  | 'standard'      // Běžná faktura
  | 'proforma'      // Proforma (zálohová faktura)
  | 'deposit'       // Záloha
  | 'final'         // Konečná faktura (po záloze)
  | 'credit_note';  // Dobropis

export type InvoiceStatus =
  | 'draft'            // Koncept
  | 'issued'           // Vystaveno
  | 'sent'             // Odesláno
  | 'awaiting_payment' // Čeká na zaplacení
  | 'deposit_paid'     // Zaplacena záloha
  | 'paid'             // Zaplaceno
  | 'overdue'          // Po splatnosti
  | 'cancelled';       // Zrušeno

export type PaymentMethod =
  | 'bank_transfer' // Bankovní převod
  | 'card'          // Kartou
  | 'gopay'         // GoPay brána
  | 'cash';         // Hotově

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;  // Price per unit in haléře
  vat_rate: number;    // VAT rate in % (21, 15, 12, 0)
}

export interface Invoice {
  id: string;

  // Invoice numbering
  invoice_number: string;       // e.g., "20251203-001"
  variable_symbol: string;

  // Relations
  payment_id: string | null;
  lead_id: string | null;
  project_id: string | null;
  related_invoice_id: string | null; // For deposit→final invoice linking

  // Invoice type
  invoice_type: InvoiceType;

  // Client info
  client_name: string;
  client_street: string | null;
  client_city: string | null;
  client_zip: string | null;
  client_country: string;
  client_ico: string | null;
  client_dic: string | null;
  client_email: string | null;
  client_phone: string | null;

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
  paid_date: number | null;

  // Payment details
  payment_method: PaymentMethod | null;
  bank_account: string | null;
  iban: string | null;
  swift: string | null;

  // Status
  status: InvoiceStatus;

  // PDF
  pdf_url: string | null;
  pdf_generated_at: number | null;

  // Notes
  notes: string | null;
  internal_notes: string | null;

  // Timestamps
  created_at: number;
  updated_at: number;
}

export interface CreateInvoiceInput {
  // Client info (required)
  client_name: string;
  client_email?: string;
  client_phone?: string;

  // Optional client address
  client_street?: string;
  client_city?: string;
  client_zip?: string;
  client_country?: string;
  client_ico?: string;
  client_dic?: string;

  // Invoice type
  invoice_type?: InvoiceType;

  // Items
  items: InvoiceItem[];

  // Dates
  issue_date?: Date;           // Defaults to now
  due_days?: number;           // Defaults to 14 days
  delivery_date?: Date;

  // Relations
  payment_id?: string;
  lead_id?: string;
  project_id?: string;
  related_invoice_id?: string; // For deposit→final invoice linking

  // Optional
  payment_method?: PaymentMethod;
  notes?: string;
  internal_notes?: string;
}

// =====================================================
// SUBSCRIPTION TYPES
// =====================================================

export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'expired';

export type BillingInterval =
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export type PlanType =
  | 'hosting'
  | 'maintenance'
  | 'support'
  | 'custom';

export interface Subscription {
  id: string;

  // Relations
  lead_id: string | null;
  project_id: string | null;

  // Subscription details
  plan_name: string;
  plan_type: PlanType;

  // Billing
  amount: number;                     // Amount in haléře
  currency: string;
  billing_interval: BillingInterval;

  // Status
  status: SubscriptionStatus;

  // Dates
  start_date: number;
  end_date: number | null;
  next_billing_date: number;
  last_billing_date: number | null;
  cancelled_at: number | null;

  // Payment tracking
  total_payments: number;
  failed_payments: number;
  last_payment_id: string | null;

  // Subscriber info
  subscriber_name: string;
  subscriber_email: string;
  subscriber_phone: string | null;

  // Metadata
  metadata: Record<string, any> | null;
  notes: string | null;

  // Timestamps
  created_at: number;
  updated_at: number;
}

export interface CreateSubscriptionInput {
  plan_name: string;
  plan_type: PlanType;
  amount: number;                     // Amount in Kč
  billing_interval: BillingInterval;

  // Subscriber info
  subscriber_name: string;
  subscriber_email: string;
  subscriber_phone?: string;

  // Optional dates
  start_date?: Date;                  // Defaults to now
  end_date?: Date;                    // Optional expiration

  // Relations
  lead_id?: string;
  project_id?: string;

  // Optional
  metadata?: Record<string, any>;
  notes?: string;
}

// =====================================================
// COMPANY SETTINGS
// =====================================================

export interface CompanySettings {
  id: string;

  // Company info
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;

  // Tax IDs
  ico: string;
  dic: string | null;

  // Banking
  bank_account: string;
  iban: string;
  swift: string;

  // Contact
  email: string;
  phone: string;
  website: string;

  // Invoice settings
  invoice_prefix: string;
  next_invoice_number: number;
  invoice_due_days: number;

  // Logo
  logo_url: string | null;

  // Timestamps
  created_at: number;
  updated_at: number;
}

// =====================================================
// GOPAY API TYPES
// =====================================================

export interface GoPayPaymentRequest {
  amount: number;                     // Amount in haléře
  currency: string;                   // CZK
  order_number: string;               // Variabilní symbol
  order_description: string;
  lang?: string;                      // cs, en

  // Payer
  payer?: {
    allowed_payment_instruments?: string[];
    default_payment_instrument?: string;
    default_swift?: string;
    allowed_swifts?: string[];
    contact?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone_number?: string;
      city?: string;
      street?: string;
      postal_code?: string;
      country_code?: string;
    };
  };

  // URLs
  callback: {
    return_url: string;
    notification_url: string;
  };

  // Additional
  additional_params?: Array<{
    name: string;
    value: string;
  }>;
}

export interface GoPayPaymentResponse {
  id: number;                         // GoPay payment ID
  parent_id?: number;
  order_number: string;
  state: string;                      // CREATED, PAID, etc.
  sub_state?: string;
  amount: number;
  payer?: {
    payment_card?: {
      card_number: string;
      card_expiration: string;
    };
  };
  target: {
    type: string;
    goid: number;
  };
  additional_params?: Array<{
    name: string;
    value: {
      [key: string]: string;
    };
  }>;
  lang: string;
  gw_url: string;                     // Payment gateway URL for redirect
}

export interface GoPayPaymentStatus {
  id: number;
  state: PaymentStatus;
  sub_state?: string;
  amount: number;
  payer?: {
    payment_card?: {
      card_number: string;
    };
  };
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface PaymentApiResponse {
  success: boolean;
  payment?: Payment;
  gw_url?: string;                    // For redirect
  error?: string;
}

export interface InvoiceApiResponse {
  success: boolean;
  invoice?: Invoice;
  pdf_url?: string;
  error?: string;
}

export interface SubscriptionApiResponse {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface PaymentStatistics {
  total_revenue: number;              // Total paid amount in Kč
  pending_amount: number;             // Unpaid invoices
  paid_count: number;
  pending_count: number;
  by_month: Array<{
    month: string;
    revenue: number;
    count: number;
  }>;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  start_date?: number;
  end_date?: number;
  client_name?: string;
  overdue_only?: boolean;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  payment_type?: PaymentType;
  start_date?: number;
  end_date?: number;
  lead_id?: string;
}
