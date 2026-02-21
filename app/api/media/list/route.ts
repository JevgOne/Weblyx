import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/turso';

interface MediaRecord {
  id: string;
  filename: string;
  url: string;
  blob_url: string | null;
  type: string | null;
  mime_type: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  tags: string | null;
  created_at: number;
}

export async function GET() {
  try {
    // Read media metadata from Turso database
    const media = await executeQuery<MediaRecord>(
      `SELECT id, filename, url, blob_url, type, mime_type, size, width, height, alt_text, uploaded_by, tags, created_at
       FROM media
       ORDER BY created_at DESC`
    );

    const files = media.map(item => ({
      id: item.id,
      url: item.url,
      name: item.filename,
      alt: item.alt_text || '',
      type: item.type,
      mimeType: item.mime_type,
      size: item.size,
      width: item.width,
      height: item.height,
      uploadedBy: item.uploaded_by,
      tags: (() => { try { return item.tags ? JSON.parse(item.tags) : []; } catch { return []; } })(),
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    console.error('List media error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
