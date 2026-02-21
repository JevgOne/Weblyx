import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json();

    // Verify either admin session or revalidation secret
    const user = await getAuthUser();
    const expectedSecret = process.env.REVALIDATE_SECRET;
    const hasValidSecret = expectedSecret && secret === expectedSecret;

    if (!user && !hasValidSecret) {
      return unauthorizedResponse();
    }

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path is required' },
        { status: 400 }
      );
    }

    // Revalidate the specified path
    revalidatePath(path);

    return NextResponse.json({
      success: true,
      message: `Revalidated path: ${path}`,
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revalidate',
      },
      { status: 500 }
    );
  }
}

// GET for simple testing - requires admin auth
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path parameter is required' },
        { status: 400 }
      );
    }

    // Revalidate the specified path
    revalidatePath(path);

    return NextResponse.json({
      success: true,
      message: `Revalidated path: ${path}`,
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revalidate',
      },
      { status: 500 }
    );
  }
}
