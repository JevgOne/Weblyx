-- =====================================================
-- Add invoice status & deposit invoice support
-- =====================================================
-- Purpose:
-- 1. Add better status tracking (Zaplaceno, Zaplacena Záloha, Čeká na zaplacení)
-- 2. Add support for deposit→final invoice linking
-- =====================================================

-- Add related_invoice_id for deposit→final invoice relationship
ALTER TABLE invoices ADD COLUMN related_invoice_id TEXT;

-- Create index for related invoices
CREATE INDEX IF NOT EXISTS idx_invoices_related_invoice ON invoices(related_invoice_id);

-- Add foreign key constraint (if supported - LibSQL may require new table creation)
-- FOREIGN KEY (related_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL

-- =====================================================
-- Status hodnoty (v aplikačním kódu):
-- =====================================================
-- - 'draft' - Koncept
-- - 'issued' - Vystaveno
-- - 'sent' - Odesláno
-- - 'awaiting_payment' - Čeká na zaplacení
-- - 'deposit_paid' - Zaplacena záloha
-- - 'paid' - Zaplaceno
-- - 'overdue' - Po splatnosti
-- - 'cancelled' - Zrušeno
-- =====================================================

-- Update existing invoices to new status format (if needed)
-- This is a safe migration - existing statuses remain valid
UPDATE invoices SET status = 'awaiting_payment' WHERE status = 'issued' AND paid_date IS NULL;
UPDATE invoices SET status = 'paid' WHERE paid_date IS NOT NULL;
