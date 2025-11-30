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
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  // Get admin credentials from env
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@weblyx.cz';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === adminEmail && password === adminPassword) {
    return {
      id: 'admin-1',
      email: adminEmail,
      name: 'Admin',
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
