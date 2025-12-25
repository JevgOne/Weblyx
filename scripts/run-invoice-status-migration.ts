#!/usr/bin/env tsx
/**
 * Add invoice status support & deposit invoice linking
 *
 * Run with:
 * TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." tsx scripts/run-invoice-status-migration.ts
 */

import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("🚀 Running invoice status migration...\n");

  try {
    // 1. Add related_invoice_id column
    console.log("1️⃣ Adding related_invoice_id column...");
    await turso.execute(`
      ALTER TABLE invoices ADD COLUMN related_invoice_id TEXT;
    `);
    console.log("✅ Column added\n");

    // 2. Create index
    console.log("2️⃣ Creating index for related_invoice_id...");
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_invoices_related_invoice ON invoices(related_invoice_id);
    `);
    console.log("✅ Index created\n");

    // 3. Migrate existing statuses
    console.log("3️⃣ Migrating existing invoice statuses...");

    // Update 'issued' without paid_date → 'awaiting_payment'
    const result1 = await turso.execute(`
      UPDATE invoices
      SET status = 'awaiting_payment'
      WHERE status = 'issued' AND paid_date IS NULL;
    `);
    console.log(`   → Updated ${result1.rowsAffected} invoices to 'awaiting_payment'`);

    // Update invoices with paid_date → 'paid'
    const result2 = await turso.execute(`
      UPDATE invoices
      SET status = 'paid'
      WHERE paid_date IS NOT NULL AND status != 'paid';
    `);
    console.log(`   → Updated ${result2.rowsAffected} invoices to 'paid'\n`);

    console.log("✅ Migration completed successfully!\n");
    console.log("📋 New status options:");
    console.log("   - draft (Koncept)");
    console.log("   - issued (Vystaveno)");
    console.log("   - sent (Odesláno)");
    console.log("   - awaiting_payment (Čeká na zaplacení)");
    console.log("   - deposit_paid (Zaplacena záloha)");
    console.log("   - paid (Zaplaceno)");
    console.log("   - overdue (Po splatnosti)");
    console.log("   - cancelled (Zrušeno)\n");

  } catch (error: any) {
    // Ignore "duplicate column" error if already migrated
    if (error.message?.includes("duplicate column name")) {
      console.log("ℹ️ Column already exists, skipping column creation");
      console.log("✅ Migration appears to be already applied\n");
    } else {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }
}

main()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("💥 Error:", err);
    process.exit(1);
  });
