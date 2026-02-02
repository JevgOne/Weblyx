import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { nanoid } from 'nanoid';

// Ensure the table exists
async function ensureTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      locale TEXT NOT NULL DEFAULT 'cs',
      source TEXT DEFAULT 'blog-inline',
      created_at INTEGER NOT NULL
    )
  `);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, locale = 'cs', source = 'blog-inline' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    await ensureTable();

    const id = nanoid();
    const now = Math.floor(Date.now() / 1000);

    try {
      await turso.execute({
        sql: `INSERT INTO newsletter_subscribers (id, email, locale, source, created_at) VALUES (?, ?, ?, ?, ?)`,
        args: [id, email.toLowerCase().trim(), locale, source, now],
      });
    } catch (err: unknown) {
      // Check for unique constraint violation (email already exists)
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('UNIQUE') || message.includes('unique') || message.includes('constraint')) {
        return NextResponse.json(
          { error: 'Already subscribed', code: 'ALREADY_SUBSCRIBED' },
          { status: 409 }
        );
      }
      throw err;
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
