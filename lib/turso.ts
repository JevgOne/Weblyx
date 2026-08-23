// Turso Database Client
import { createClient, type Client } from '@libsql/client';

/**
 * The client is created on first use, not on import.
 *
 * Throwing at module scope made the credentials a *build* requirement: Next
 * evaluates every route module while collecting page data, so a deployment
 * without them died with "Failed to collect page data" before a single request
 * existed. That is what broke preview deployments, where Vercel only injects
 * the variables an environment is explicitly scoped to.
 *
 * Failing on first query instead keeps the message just as loud at runtime,
 * while letting a build — which needs no database — finish. Callers that
 * already catch (the pricing configurator, the CMS readers) degrade to their
 * fallbacks rather than taking the whole page down.
 */
let client: Client | null = null;

function getClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url) throw new Error('TURSO_DATABASE_URL environment variable is not set');
  if (!authToken) throw new Error('TURSO_AUTH_TOKEN environment variable is not set');

  client = createClient({ url, authToken });
  return client;
}

/**
 * Proxy so every existing `turso.execute(...)` / `turso.batch(...)` call site
 * keeps working unchanged; the real client is built on the first property read.
 */
export const turso: Client = new Proxy({} as Client, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient() as object, prop, receiver);
    return typeof value === 'function' ? value.bind(getClient()) : value;
  },
});

// Helper function to execute queries
export async function executeQuery<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const result = await turso.execute({
    sql,
    args: params || [],
  });
  return result.rows as T[];
}

// Helper function to execute single query
export async function executeOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const results = await executeQuery<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper function for transactions
export async function transaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  const tx = await turso.transaction('write');
  try {
    const result = await callback(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

// Helper to convert Date to Unix timestamp
export function dateToUnix(date: Date | null | undefined): number | null {
  if (!date) return null;
  return Math.floor(date.getTime() / 1000);
}

// Helper to convert Unix timestamp to Date
export function unixToDate(timestamp: number | null | undefined): Date | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000);
}

// Helper to parse JSON fields
export function parseJSON<T = any>(value: string | null | undefined): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

// Helper to stringify JSON fields
export function stringifyJSON(value: any): string | null {
  if (!value) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
