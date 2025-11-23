import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json();

    // Optional: Add secret validation for production
    // const expectedSecret = process.env.REVALIDATE_SECRET;
    // if (secret !== expectedSecret) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid secret' },
    //     { status: 401 }
    //   );
    // }

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
        error: error.message || 'Failed to revalidate',
      },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing
export async function GET(request: NextRequest) {
  try {
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
        error: error.message || 'Failed to revalidate',
      },
      { status: 500 }
    );
  }
}
