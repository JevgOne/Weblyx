import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { executeQuery, executeOne } from '@/lib/turso';

interface MediaRecord {
  id: string;
  url: string;
  blob_url: string | null;
}

export async function DELETE(request: Request) {
  try {
    const { url, id } = await request.json();

    if (!url && !id) {
      return NextResponse.json(
        { success: false, error: 'No URL or ID provided' },
        { status: 400 }
      );
    }

    // Find the media record in database
    let mediaRecord: MediaRecord | null = null;

    if (id) {
      mediaRecord = await executeOne<MediaRecord>(
        'SELECT id, url, blob_url FROM media WHERE id = ?',
        [id]
      );
    } else if (url) {
      mediaRecord = await executeOne<MediaRecord>(
        'SELECT id, url, blob_url FROM media WHERE url = ? OR blob_url = ?',
        [url, url]
      );
    }

    if (!mediaRecord) {
      return NextResponse.json(
        { success: false, error: 'Media not found in database' },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob
    const blobUrl = mediaRecord.blob_url || mediaRecord.url;
    try {
      await del(blobUrl);
    } catch (blobError) {
      console.error('Error deleting from Vercel Blob:', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from Turso database
    await executeQuery(
      'DELETE FROM media WHERE id = ?',
      [mediaRecord.id]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
