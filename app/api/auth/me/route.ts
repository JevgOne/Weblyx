import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth/simple-auth';

/**
 * GET /api/auth/me
 * Get current admin user - verifies session token
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session');

    if (!sessionToken?.value) {
      return NextResponse.json(
        { error: 'Nejste přihlášen' },
        { status: 401 }
      );
    }

    // Verify and decode the session token
    const user = verifySessionToken(sessionToken.value);

    if (!user) {
      // Invalid or expired token - clear the cookie
      cookieStore.delete('admin-session');
      return NextResponse.json(
        { error: 'Neplatná nebo expirovaná session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Chyba při ověřování' },
      { status: 500 }
    );
  }
}
