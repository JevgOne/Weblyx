import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { nanoid } from 'nanoid';

// Ensure the table exists
async function ensureTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS blog_feedback (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      vote TEXT NOT NULL CHECK(vote IN ('up', 'down')),
      locale TEXT DEFAULT 'cs',
      created_at INTEGER NOT NULL
    )
  `);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, vote, locale = 'cs' } = body;

    if (!postId || typeof postId !== 'string') {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    if (!vote || !['up', 'down'].includes(vote)) {
      return NextResponse.json(
        { error: 'vote must be "up" or "down"' },
        { status: 400 }
      );
    }

    await ensureTable();

    const id = nanoid();
    const now = Math.floor(Date.now() / 1000);

    await turso.execute({
      sql: `INSERT INTO blog_feedback (id, post_id, vote, locale, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [id, postId, vote, locale, now],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
