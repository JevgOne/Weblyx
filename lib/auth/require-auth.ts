import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, AdminUser } from './simple-auth';

/**
 * Verify admin authentication from session cookie.
 * Returns AdminUser if authenticated, null otherwise.
 */
export async function getAuthUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;

  if (!sessionToken) return null;

  return verifySessionToken(sessionToken);
}

/**
 * Returns 401 response for unauthorized requests.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
