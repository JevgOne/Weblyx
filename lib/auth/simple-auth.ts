/**
 * Simple Admin Authentication (NO Firebase)
 * Uses secure cookies with signed tokens for session management
 * Supports both hardcoded users and database users with bcrypt
 */

import bcrypt from 'bcryptjs';
import type { UserRole } from './permissions';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
}

export interface DbAdminUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  active: number;
  created_at: number;
}

// Secret for signing tokens - use env var in production!
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'weblyx-admin-secret-2024';

/**
 * Legacy admin users configuration (fallback)
 */
const LEGACY_ADMIN_USERS = [
  {
    id: 'admin-1',
    email: process.env.ADMIN_EMAIL || 'zenuly3@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: 'Owner',
    role: 'owner' as const,
  },
  {
    id: 'admin-2',
    email: process.env.ADMIN_EMAIL_2 || 'zvin.a@seznam.cz',
    password: process.env.ADMIN_PASSWORD_2 || 'Muzaisthebest',
    name: 'Admin',
    role: 'admin' as const,
  },
  {
    id: 'admin-3',
    email: 'filip@weblyx.com',
    password: 'weblyxisthebest',
    name: 'Filip',
    role: 'admin' as const,
  },
];

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get admin user from database by email
 */
async function getDbAdminByEmail(email: string): Promise<DbAdminUser | null> {
  try {
    const { turso } = await import('@/lib/turso');
    const result = await turso.execute({
      sql: 'SELECT * FROM admins WHERE email = ? AND active = 1',
      args: [email],
    });

    if (result.rows.length > 0) {
      return result.rows[0] as unknown as DbAdminUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching DB admin:', error);
    return null;
  }
}

/**
 * Get admin user from database by ID
 */
export async function getDbAdminById(id: string): Promise<DbAdminUser | null> {
  try {
    const { turso } = await import('@/lib/turso');
    const result = await turso.execute({
      sql: 'SELECT * FROM admins WHERE id = ? AND active = 1',
      args: [id],
    });

    if (result.rows.length > 0) {
      return result.rows[0] as unknown as DbAdminUser;
    }
    return null;
  } catch (error) {
    console.error('Error fetching DB admin by ID:', error);
    return null;
  }
}

/**
 * Get all admin users from database
 */
export async function getAllDbAdmins(): Promise<DbAdminUser[]> {
  try {
    const { turso } = await import('@/lib/turso');
    const result = await turso.execute({
      sql: 'SELECT id, email, name, role, active, created_at FROM admins ORDER BY created_at DESC',
      args: [],
    });

    return result.rows as unknown as DbAdminUser[];
  } catch (error) {
    console.error('Error fetching all DB admins:', error);
    return [];
  }
}

/**
 * Create new admin user in database
 */
export async function createDbAdmin(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'admin'
): Promise<DbAdminUser | null> {
  try {
    const { turso } = await import('@/lib/turso');
    const id = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const passwordHash = await hashPassword(password);

    await turso.execute({
      sql: `INSERT INTO admins (id, email, name, password_hash, role, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, unixepoch(), unixepoch())`,
      args: [id, email, name, passwordHash, role],
    });

    return {
      id,
      email,
      name,
      password_hash: passwordHash,
      role,
      active: 1,
      created_at: Math.floor(Date.now() / 1000),
    };
  } catch (error: any) {
    console.error('Error creating DB admin:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

/**
 * Update admin user in database
 */
export async function updateDbAdmin(
  id: string,
  data: { name?: string; email?: string; password?: string; role?: UserRole; active?: boolean }
): Promise<boolean> {
  try {
    const { turso } = await import('@/lib/turso');
    const updates: string[] = [];
    const args: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      args.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      args.push(data.email);
    }
    if (data.password !== undefined) {
      updates.push('password_hash = ?');
      args.push(await hashPassword(data.password));
    }
    if (data.role !== undefined) {
      updates.push('role = ?');
      args.push(data.role);
    }
    if (data.active !== undefined) {
      updates.push('active = ?');
      args.push(data.active ? 1 : 0);
    }

    if (updates.length === 0) return false;

    updates.push('updated_at = unixepoch()');
    args.push(id);

    await turso.execute({
      sql: `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return true;
  } catch (error) {
    console.error('Error updating DB admin:', error);
    return false;
  }
}

/**
 * Delete admin user from database (soft delete - set active = 0)
 */
export async function deleteDbAdmin(id: string): Promise<boolean> {
  try {
    const { turso } = await import('@/lib/turso');
    await turso.execute({
      sql: 'UPDATE admins SET active = 0, updated_at = unixepoch() WHERE id = ?',
      args: [id],
    });
    return true;
  } catch (error) {
    console.error('Error deleting DB admin:', error);
    return false;
  }
}

/**
 * Get custom password from DB if exists (legacy support)
 */
async function getCustomPassword(userId: string): Promise<string | null> {
  try {
    const { turso } = await import('@/lib/turso');
    const result = await turso.execute({
      sql: 'SELECT value FROM admin_settings WHERE key = ?',
      args: [`password_${userId}`],
    });

    if (result.rows.length > 0) {
      return result.rows[0].value as string;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Verify admin credentials
 * First checks database users, then falls back to legacy hardcoded users
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  // 1. First try database users (new system with bcrypt)
  const dbAdmin = await getDbAdminByEmail(email);
  if (dbAdmin && dbAdmin.password_hash) {
    const isValid = await comparePassword(password, dbAdmin.password_hash);
    if (isValid) {
      return {
        id: dbAdmin.id,
        email: dbAdmin.email,
        name: dbAdmin.name,
        role: dbAdmin.role,
      };
    }
  }

  // 2. Fall back to legacy hardcoded users
  const legacyAdmin = LEGACY_ADMIN_USERS.find((user) => user.email === email);
  if (!legacyAdmin) {
    return null;
  }

  // Check for custom password in DB first (legacy system)
  const customPassword = await getCustomPassword(legacyAdmin.id);
  const expectedPassword = customPassword || legacyAdmin.password;

  if (password === expectedPassword) {
    return {
      id: legacyAdmin.id,
      email: legacyAdmin.email,
      name: legacyAdmin.name,
      role: legacyAdmin.role,
    };
  }

  return null;
}

/**
 * Generate signed session token containing user data
 */
export function generateSessionToken(user: AdminUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'admin',
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };

  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString('base64url');
  const signature = createSignature(encoded);

  return `${encoded}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): AdminUser | null {
  try {
    const [encoded, signature] = token.split('.');

    if (!encoded || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = createSignature(encoded);
    if (signature !== expectedSignature) {
      console.warn('Invalid token signature');
      return null;
    }

    // Decode payload
    const data = Buffer.from(encoded, 'base64url').toString('utf-8');
    const payload = JSON.parse(data);

    // Check expiration
    if (payload.exp && payload.exp < Date.now()) {
      console.warn('Token expired');
      return null;
    }

    // Check if user exists - either in DB or legacy list
    // Note: We trust the token signature, so we just return the payload data
    // The user existence check happens async on critical operations
    const legacyAdmin = LEGACY_ADMIN_USERS.find(u => u.id === payload.id && u.email === payload.email);

    // If found in legacy list, return it
    if (legacyAdmin) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: legacyAdmin.role,
      };
    }

    // For DB users, trust the token (async check would be done separately if needed)
    // Token signature proves authenticity
    if (payload.id?.startsWith('admin-')) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'admin',
      };
    }

    console.warn('User no longer valid');
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Create HMAC signature for token
 */
function createSignature(data: string): string {
  // Simple signature using hash - in production use crypto.createHmac
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(data)
    .digest('base64url');
}

