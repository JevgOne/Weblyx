// Turso Clients Data Access Layer
import { turso } from '../turso';
import type { Client, CreateClientInput } from '@/types/payments';

/**
 * Initialize clients table (CREATE IF NOT EXISTS).
 * Safe to call multiple times — idempotent.
 */
export async function initClientsTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      street TEXT,
      city TEXT,
      zip TEXT,
      country TEXT DEFAULT 'Česká republika',
      ico TEXT,
      dic TEXT,
      notes TEXT,
      invoice_count INTEGER DEFAULT 0,
      total_invoiced INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_clients_ico ON clients(ico)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)`);
}

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) || null,
    phone: (row.phone as string) || null,
    street: (row.street as string) || null,
    city: (row.city as string) || null,
    zip: (row.zip as string) || null,
    country: (row.country as string) || 'Česká republika',
    ico: (row.ico as string) || null,
    dic: (row.dic as string) || null,
    notes: (row.notes as string) || null,
    invoice_count: (row.invoice_count as number) || 0,
    total_invoiced: (row.total_invoiced as number) || 0,
    created_at: row.created_at as number,
    updated_at: row.updated_at as number,
  };
}

/**
 * Search clients by name, ICO, or email.
 * Returns max 10 results, ordered by invoice_count DESC (most-used first).
 */
export async function searchClients(query: string): Promise<Client[]> {
  await initClientsTable();

  const pattern = `%${query}%`;
  const result = await turso.execute({
    sql: `SELECT * FROM clients
          WHERE name LIKE ? OR ico LIKE ? OR email LIKE ?
          ORDER BY invoice_count DESC, updated_at DESC
          LIMIT 10`,
    args: [pattern, pattern, pattern],
  });

  return result.rows.map((row) => rowToClient(row as unknown as Record<string, unknown>));
}

/**
 * Get a single client by ID.
 */
export async function getClientById(id: string): Promise<Client | null> {
  await initClientsTable();

  const result = await turso.execute({
    sql: 'SELECT * FROM clients WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return rowToClient(result.rows[0] as unknown as Record<string, unknown>);
}

/**
 * Get a single client by ICO (unique company identifier).
 */
export async function getClientByIco(ico: string): Promise<Client | null> {
  await initClientsTable();

  const result = await turso.execute({
    sql: 'SELECT * FROM clients WHERE ico = ?',
    args: [ico],
  });

  if (result.rows.length === 0) return null;
  return rowToClient(result.rows[0] as unknown as Record<string, unknown>);
}

/**
 * Create a new client. Returns the created client.
 */
export async function createClient(input: CreateClientInput): Promise<Client> {
  await initClientsTable();

  const id = crypto.randomUUID().replace(/-/g, '');

  await turso.execute({
    sql: `INSERT INTO clients (id, name, email, phone, street, city, zip, country, ico, dic, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.name,
      input.email || null,
      input.phone || null,
      input.street || null,
      input.city || null,
      input.zip || null,
      input.country || 'Česká republika',
      input.ico || null,
      input.dic || null,
      input.notes || null,
    ],
  });

  return (await getClientById(id))!;
}

/**
 * Update an existing client. Only updates provided fields.
 */
export async function updateClient(id: string, input: Partial<CreateClientInput>): Promise<Client | null> {
  await initClientsTable();

  const fields: string[] = [];
  const args: (string | null)[] = [];

  if (input.name !== undefined) { fields.push('name = ?'); args.push(input.name); }
  if (input.email !== undefined) { fields.push('email = ?'); args.push(input.email || null); }
  if (input.phone !== undefined) { fields.push('phone = ?'); args.push(input.phone || null); }
  if (input.street !== undefined) { fields.push('street = ?'); args.push(input.street || null); }
  if (input.city !== undefined) { fields.push('city = ?'); args.push(input.city || null); }
  if (input.zip !== undefined) { fields.push('zip = ?'); args.push(input.zip || null); }
  if (input.country !== undefined) { fields.push('country = ?'); args.push(input.country || null); }
  if (input.ico !== undefined) { fields.push('ico = ?'); args.push(input.ico || null); }
  if (input.dic !== undefined) { fields.push('dic = ?'); args.push(input.dic || null); }
  if (input.notes !== undefined) { fields.push('notes = ?'); args.push(input.notes || null); }

  if (fields.length === 0) return getClientById(id);

  args.push(id);
  await turso.execute({
    sql: `UPDATE clients SET ${fields.join(', ')} WHERE id = ?`,
    args,
  });

  return getClientById(id);
}

/**
 * Upsert client from invoice data.
 *
 * Logic:
 * 1. Search by ICO (if provided) — unique company identifier
 * 2. If not found, search by name + email
 * 3. If found → update contact details + increment counters
 * 4. If not found → create new client
 *
 * Returns client_id.
 */
export async function upsertClientFromInvoice(clientData: {
  name: string;
  email?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  ico?: string | null;
  dic?: string | null;
  invoiceAmountHalere: number;
}): Promise<string> {
  await initClientsTable();

  let existingClient: Client | null = null;

  // 1. Try finding by ICO
  if (clientData.ico) {
    existingClient = await getClientByIco(clientData.ico);
  }

  // 2. If not found, try name + email
  if (!existingClient && clientData.email) {
    const result = await turso.execute({
      sql: 'SELECT * FROM clients WHERE name = ? AND email = ? LIMIT 1',
      args: [clientData.name, clientData.email],
    });
    if (result.rows.length > 0) {
      existingClient = rowToClient(result.rows[0] as unknown as Record<string, unknown>);
    }
  }

  // 3. If not found, try just by name (exact match)
  if (!existingClient) {
    const result = await turso.execute({
      sql: 'SELECT * FROM clients WHERE name = ? LIMIT 1',
      args: [clientData.name],
    });
    if (result.rows.length > 0) {
      existingClient = rowToClient(result.rows[0] as unknown as Record<string, unknown>);
    }
  }

  if (existingClient) {
    // Update existing client with latest data + increment counters
    await turso.execute({
      sql: `UPDATE clients SET
              email = COALESCE(?, email),
              phone = COALESCE(?, phone),
              street = COALESCE(?, street),
              city = COALESCE(?, city),
              zip = COALESCE(?, zip),
              country = COALESCE(?, country),
              ico = COALESCE(?, ico),
              dic = COALESCE(?, dic),
              invoice_count = invoice_count + 1,
              total_invoiced = total_invoiced + ?
            WHERE id = ?`,
      args: [
        clientData.email || null,
        clientData.phone || null,
        clientData.street || null,
        clientData.city || null,
        clientData.zip || null,
        clientData.country || null,
        clientData.ico || null,
        clientData.dic || null,
        clientData.invoiceAmountHalere,
        existingClient.id,
      ],
    });

    return existingClient.id;
  }

  // 4. Create new client
  const id = crypto.randomUUID().replace(/-/g, '');

  await turso.execute({
    sql: `INSERT INTO clients (id, name, email, phone, street, city, zip, country, ico, dic, invoice_count, total_invoiced)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    args: [
      id,
      clientData.name,
      clientData.email || null,
      clientData.phone || null,
      clientData.street || null,
      clientData.city || null,
      clientData.zip || null,
      clientData.country || 'Česká republika',
      clientData.ico || null,
      clientData.dic || null,
      clientData.invoiceAmountHalere,
    ],
  });

  return id;
}
