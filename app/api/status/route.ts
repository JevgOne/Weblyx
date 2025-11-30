import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

export async function GET() {
  try {
    // Check environment
    const nodeEnv = process.env.NODE_ENV;
    const hasTursoUrl = !!process.env.TURSO_DATABASE_URL;
    const hasTursoToken = !!process.env.TURSO_AUTH_TOKEN;

    // Try to get leads count from Turso
    let leadsCount = 0;
    let leadsError = null;
    try {
      const result = await turso.execute('SELECT COUNT(*) as count FROM leads');
      leadsCount = Number(result.rows[0].count) || 0;
    } catch (error: any) {
      leadsError = error.message;
    }

    return NextResponse.json({
      environment: {
        NODE_ENV: nodeEnv,
        hasTursoUrl,
        hasTursoToken,
      },
      database: {
        type: 'Turso (SQLite)',
        leadsCount,
        error: leadsError,
      },
      migration: {
        status: 'Firebase removed, using Turso only',
        guide: '/TURSO_ONLY_MIGRATION.md',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
