/**
 * Simple Admin Authentication (NO Firebase)
 * Uses secure cookies for session management
 */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

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
 * Generate session token
 */
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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
