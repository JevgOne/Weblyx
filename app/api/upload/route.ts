import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { executeQuery } from '@/lib/turso';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    let formData;

    try {
      formData = await request.formData();
    } catch (error) {
      console.error('FormData parse error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to parse form data' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob with unique filename
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Generate unique ID for media record
    const mediaId = nanoid();

    // Determine media type based on MIME type
    let mediaType = 'document';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    }

    // Save metadata to Turso database
    const currentTime = Math.floor(Date.now() / 1000);
    await executeQuery(
      `INSERT INTO media (id, filename, url, blob_url, type, mime_type, size, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mediaId,
        file.name,
        blob.url,
        blob.url,
        mediaType,
        file.type,
        file.size,
        'admin', // TODO: Get actual user from session
        currentTime,
      ]
    );

    return NextResponse.json({
      success: true,
      url: blob.url,
      id: mediaId,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
