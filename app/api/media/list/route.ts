import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();

    const files = blobs.map(blob => ({
      url: blob.url,
      name: blob.pathname.split('/').pop() || blob.pathname,
      alt: '', // ALT texts will be generated on demand
    }));

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    console.error('List media error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
