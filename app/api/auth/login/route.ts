import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, generateSessionToken } from '@/lib/auth/simple-auth';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/login
 * Admin login (NO Firebase - simple cookie auth)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email a heslo jsou povinné' },
        { status: 400 }
      );
    }

    // Verify credentials
    const user = await verifyAdminCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Nesprávný email nebo heslo' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ Admin logged in:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Chyba při přihlašování' },
      { status: 500 }
    );
  }
}
