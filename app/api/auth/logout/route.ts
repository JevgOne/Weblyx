import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/logout
 * Admin logout
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin-session');

    return NextResponse.json({
      success: true,
      message: 'Odhlášení proběhlo úspěšně',
    });
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { error: 'Chyba při odhlašování' },
      { status: 500 }
    );
  }
}
