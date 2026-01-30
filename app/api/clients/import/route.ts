import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { initClientsTable, upsertClientFromInvoice } from '@/lib/turso/clients';

/**
 * POST /api/clients/import
 *
 * One-time migration: import existing clients from invoices table
 * into the clients table.
 */
export async function POST() {
  try {
    await initClientsTable();

    // Get all unique clients from invoices
    const result = await turso.execute(`
      SELECT
        client_name,
        client_email,
        client_phone,
        client_street,
        client_city,
        client_zip,
        client_country,
        client_ico,
        client_dic,
        COUNT(*) as inv_count,
        SUM(amount_with_vat) as total_amount
      FROM invoices
      WHERE client_name IS NOT NULL AND client_name != ''
      GROUP BY client_name
      ORDER BY inv_count DESC
    `);

    let imported = 0;
    let skipped = 0;
    const details: string[] = [];

    for (const row of result.rows) {
      const name = row.client_name as string;
      const totalAmount = (row.total_amount as number) || 0;
      const invCount = (row.inv_count as number) || 1;

      try {
        // Use upsert for each unique client — handles deduplication
        // We pass invoiceAmountHalere = 0 first, then fix counters after
        await upsertClientFromInvoice({
          name,
          email: (row.client_email as string) || null,
          phone: (row.client_phone as string) || null,
          street: (row.client_street as string) || null,
          city: (row.client_city as string) || null,
          zip: (row.client_zip as string) || null,
          country: (row.client_country as string) || null,
          ico: (row.client_ico as string) || null,
          dic: (row.client_dic as string) || null,
          invoiceAmountHalere: totalAmount,
        });

        // Fix invoice_count to match actual count from invoices
        await turso.execute({
          sql: `UPDATE clients SET invoice_count = ? WHERE name = ?`,
          args: [invCount, name],
        });

        imported++;
        details.push(`${name} (${invCount} faktur)`);
      } catch (err: any) {
        skipped++;
        details.push(`SKIP: ${name} — ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: result.rows.length,
      details,
    });
  } catch (error: any) {
    console.error('Error importing clients:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to import clients' },
      { status: 500 }
    );
  }
}
