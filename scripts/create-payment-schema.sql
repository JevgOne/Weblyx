-- =====================================================
-- WEBLYX PAYMENT & INVOICING SCHEMA
-- =====================================================
-- Created: 2025-12-03
-- Database: Turso (LibSQL)
-- Purpose: GoPay integration + Czech invoicing system
-- =====================================================

-- =====================================================
-- TABLE: payments
-- Purpose: Store all payment transactions (GoPay)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

  -- GoPay specific
  gopay_id TEXT UNIQUE NOT NULL,           -- GoPay transaction ID
  gopay_gw_url TEXT,                       -- Payment gateway URL for redirect
  gopay_status TEXT NOT NULL DEFAULT 'CREATED', -- CREATED, PAYMENT_METHOD_CHOSEN, PAID, AUTHORIZED, CANCELED, TIMEOUTED, REFUNDED, PARTIALLY_REFUNDED

  -- Relations
  lead_id TEXT,                            -- Optional: link to leads table
  project_id TEXT,                         -- Optional: link to projects table
  invoice_id TEXT,                         -- Link to generated invoice
  subscription_id TEXT,                    -- Optional: for recurring payments

  -- Payment details
  amount INTEGER NOT NULL,                 -- Amount in haléře (CZK cents) - 10000 = 100 Kč
  currency TEXT NOT NULL DEFAULT 'CZK',
  variable_symbol TEXT NOT NULL,           -- Variabilní symbol (must be unique)

  -- Description
  description TEXT NOT NULL,               -- Payment description (e.g., "Web development - ${companyName}")
  payment_type TEXT NOT NULL,              -- 'project', 'package', 'deposit', 'subscription', 'manual'

  -- Payer info
  payer_name TEXT,
  payer_email TEXT,
  payer_phone TEXT,
  payer_ico TEXT,                          -- IČO (company ID)
  payer_dic TEXT,                          -- DIČ (VAT ID)

  -- Metadata
  metadata TEXT,                           -- JSON string for additional data
  notes TEXT,                              -- Admin notes

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  paid_at INTEGER,                         -- When payment was completed
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  -- Foreign key constraints
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_gopay_id ON payments(gopay_id);
CREATE INDEX IF NOT EXISTS idx_payments_lead_id ON payments(lead_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(gopay_status);
CREATE INDEX IF NOT EXISTS idx_payments_variable_symbol ON payments(variable_symbol);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- =====================================================
-- TABLE: invoices
-- Purpose: Czech invoices (faktury) - CZ legislation compliant
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

  -- Invoice numbering (CZ format: YYYYMMDD-XXX)
  invoice_number TEXT UNIQUE NOT NULL,     -- e.g., "20251203-001"
  variable_symbol TEXT UNIQUE NOT NULL,    -- Variabilní symbol (unique identifier)

  -- Relations
  payment_id TEXT,                         -- Link to payment (if paid)
  lead_id TEXT,                            -- Link to lead
  project_id TEXT,                         -- Link to project

  -- Invoice type
  invoice_type TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'proforma', 'deposit', 'final', 'credit_note'

  -- Supplier (Weblyx) - will be stored in settings/config
  -- Client (buyer) info
  client_name TEXT NOT NULL,
  client_street TEXT,
  client_city TEXT,
  client_zip TEXT,
  client_country TEXT DEFAULT 'Česká republika',
  client_ico TEXT,                         -- IČO
  client_dic TEXT,                         -- DIČ
  client_email TEXT,
  client_phone TEXT,

  -- Amounts (in haléře - CZK cents)
  amount_without_vat INTEGER NOT NULL,     -- Částka bez DPH
  vat_rate INTEGER NOT NULL DEFAULT 21,    -- DPH sazba (21%)
  vat_amount INTEGER NOT NULL,             -- DPH částka
  amount_with_vat INTEGER NOT NULL,        -- Celková částka včetně DPH
  currency TEXT NOT NULL DEFAULT 'CZK',

  -- Items (JSON array)
  items TEXT NOT NULL,                     -- JSON: [{"description": "Web development", "quantity": 1, "unit_price": 50000, "vat_rate": 21}]

  -- Dates (Unix timestamps)
  issue_date INTEGER NOT NULL,             -- Datum vystavení
  due_date INTEGER NOT NULL,               -- Datum splatnosti
  delivery_date INTEGER,                   -- Datum dodání/DUZP
  paid_date INTEGER,                       -- Datum zaplacení

  -- Payment details
  payment_method TEXT,                     -- 'bank_transfer', 'card', 'gopay', 'cash'
  bank_account TEXT,                       -- Bankovní účet (Weblyx)
  iban TEXT,                               -- IBAN
  swift TEXT,                              -- SWIFT/BIC

  -- Status
  status TEXT NOT NULL DEFAULT 'draft',    -- 'draft', 'issued', 'sent', 'paid', 'overdue', 'cancelled'

  -- PDF
  pdf_url TEXT,                            -- URL to generated PDF (stored in Vercel Blob or similar)
  pdf_generated_at INTEGER,

  -- Metadata
  notes TEXT,                              -- Additional notes
  internal_notes TEXT,                     -- Admin-only notes

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  -- Foreign key constraints
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_variable_symbol ON invoices(variable_symbol);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_lead_id ON invoices(lead_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- =====================================================
-- TABLE: subscriptions
-- Purpose: Recurring payments (monthly/yearly)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  -- Primary key
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

  -- Relations
  lead_id TEXT,
  project_id TEXT,

  -- Subscription details
  plan_name TEXT NOT NULL,                 -- e.g., "Web Maintenance Pro", "Hosting + Support"
  plan_type TEXT NOT NULL,                 -- 'hosting', 'maintenance', 'support', 'custom'

  -- Billing
  amount INTEGER NOT NULL,                 -- Amount in haléře (CZK cents)
  currency TEXT NOT NULL DEFAULT 'CZK',
  billing_interval TEXT NOT NULL,          -- 'monthly', 'quarterly', 'yearly'

  -- Status
  status TEXT NOT NULL DEFAULT 'active',   -- 'active', 'paused', 'cancelled', 'expired'

  -- Dates
  start_date INTEGER NOT NULL,             -- When subscription started
  end_date INTEGER,                        -- Optional: when subscription should end
  next_billing_date INTEGER NOT NULL,      -- When next payment is due
  last_billing_date INTEGER,               -- When last payment was processed
  cancelled_at INTEGER,                    -- When subscription was cancelled

  -- Payment tracking
  total_payments INTEGER DEFAULT 0,        -- Count of successful payments
  failed_payments INTEGER DEFAULT 0,       -- Count of failed payments
  last_payment_id TEXT,                    -- Link to last payment

  -- Subscriber info
  subscriber_name TEXT NOT NULL,
  subscriber_email TEXT NOT NULL,
  subscriber_phone TEXT,

  -- Metadata
  metadata TEXT,                           -- JSON string
  notes TEXT,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  -- Foreign key constraints
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (last_payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_lead_id ON subscriptions(lead_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- =====================================================
-- TABLE: company_settings (for invoice supplier data)
-- Purpose: Store Weblyx company info for invoices
-- =====================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id TEXT PRIMARY KEY DEFAULT 'weblyx',   -- Only one row

  -- Company info
  name TEXT NOT NULL DEFAULT 'Weblyx s.r.o.',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Česká republika',

  -- Tax IDs
  ico TEXT NOT NULL,                       -- IČO
  dic TEXT,                                -- DIČ

  -- Banking
  bank_account TEXT NOT NULL,
  iban TEXT NOT NULL,
  swift TEXT NOT NULL,

  -- Contact
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT NOT NULL DEFAULT 'https://weblyx.cz',

  -- Invoice settings
  invoice_prefix TEXT NOT NULL DEFAULT '',  -- Prefix for invoice numbers
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  invoice_due_days INTEGER NOT NULL DEFAULT 14, -- Default due date (days from issue)

  -- Logo
  logo_url TEXT,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Insert default company settings if not exists
INSERT OR IGNORE INTO company_settings (
  id, name, street, city, zip, ico,
  bank_account, iban, swift, email, phone
) VALUES (
  'weblyx',
  'Weblyx s.r.o.',
  'Ulice 123',
  'Praha',
  '110 00',
  '12345678',
  '123456789/0100',
  'CZ1234567890123456789012',
  'KOMBCZPPXXX',
  'info@weblyx.cz',
  '+420 123 456 789'
);

-- =====================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- =====================================================

-- Trigger for payments
CREATE TRIGGER IF NOT EXISTS update_payments_timestamp
AFTER UPDATE ON payments
BEGIN
  UPDATE payments SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Trigger for invoices
CREATE TRIGGER IF NOT EXISTS update_invoices_timestamp
AFTER UPDATE ON invoices
BEGIN
  UPDATE invoices SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Trigger for subscriptions
CREATE TRIGGER IF NOT EXISTS update_subscriptions_timestamp
AFTER UPDATE ON subscriptions
BEGIN
  UPDATE subscriptions SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Trigger for company_settings
CREATE TRIGGER IF NOT EXISTS update_company_settings_timestamp
AFTER UPDATE ON company_settings
BEGIN
  UPDATE company_settings SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- =====================================================
-- VIEWS: Useful queries
-- =====================================================

-- View: Payment overview with related data
CREATE VIEW IF NOT EXISTS payment_overview AS
SELECT
  p.id,
  p.gopay_id,
  p.amount,
  p.currency,
  p.gopay_status,
  p.description,
  p.payment_type,
  p.payer_name,
  p.payer_email,
  p.created_at,
  p.paid_at,
  l.name AS lead_name,
  l.company AS lead_company,
  i.invoice_number,
  i.status AS invoice_status
FROM payments p
LEFT JOIN leads l ON p.lead_id = l.id
LEFT JOIN invoices i ON p.invoice_id = i.id
ORDER BY p.created_at DESC;

-- View: Unpaid invoices (overdue)
CREATE VIEW IF NOT EXISTS unpaid_invoices AS
SELECT
  i.*,
  CASE
    WHEN i.due_date < unixepoch() THEN 'overdue'
    WHEN i.due_date < unixepoch() + (7 * 24 * 60 * 60) THEN 'due_soon'
    ELSE 'ok'
  END AS urgency
FROM invoices i
WHERE i.status IN ('issued', 'sent')
  AND i.paid_date IS NULL
ORDER BY i.due_date ASC;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
