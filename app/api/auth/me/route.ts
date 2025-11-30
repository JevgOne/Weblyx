import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/me
 * Get current admin user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Nejste přihlášen' },
        { status: 401 }
      );
    }

    // In real app, validate session token from database
    // For now, just return mock user
    return NextResponse.json({
      success: true,
      user: {
        email: process.env.ADMIN_EMAIL || 'admin@weblyx.cz',
        name: 'Admin',
      },
    });
  } catch (error: any) {
    console.error('❌ Auth check error:', error);
    return NextResponse.json(
      { error: 'Chyba při ověřování' },
      { status: 500 }
    );
  }
}
