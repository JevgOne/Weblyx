import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'No URL provided' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    await del(url);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
