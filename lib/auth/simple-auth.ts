/**
 * Simple Admin Authentication (NO Firebase)
 * Uses secure cookies with signed tokens for session management
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

// Secret for signing tokens - use env var in production!
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'weblyx-admin-secret-2024';

/**
 * Admin users configuration
 */
const ADMIN_USERS = [
  {
    id: 'admin-1',
    email: process.env.ADMIN_EMAIL || 'admin@weblyx.cz',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: 'Admin',
  },
  {
    id: 'admin-2',
    email: process.env.ADMIN_EMAIL_2 || 'zvin.a@seznam.cz',
    password: process.env.ADMIN_PASSWORD_2 || 'Muzaisthebest',
    name: 'Admin 2',
  },
];

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  // Find matching admin user
  const admin = ADMIN_USERS.find(
    (user) => user.email === email && user.password === password
  );

  if (admin) {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
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

    // Verify user still exists in admin list
    const admin = ADMIN_USERS.find(u => u.id === payload.id && u.email === payload.email);
    if (!admin) {
      console.warn('User no longer valid');
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
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

/**
 * Hash password (simple version - use bcrypt in production!)
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or argon2
  // This is just for demo
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'weblyx-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
