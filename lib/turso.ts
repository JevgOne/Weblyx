// Turso Database Client
import { createClient } from '@libsql/client';

// Check if Turso is configured
const isTursoConfigured = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

if (!isTursoConfigured) {
  console.warn('⚠️ Turso database not configured - using fallback mode');
}

export const turso = isTursoConfigured
  ? createClient({
      url: process.env.TURSO_DATABASE_URL!.trim(),
      authToken: process.env.TURSO_AUTH_TOKEN!.trim(),
    })
  : null as any; // Will cause errors if used, but won't crash on import

export { isTursoConfigured };

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
