import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Firebase has been removed from this project',
    info: 'All data is now stored in Turso database',
    migration: 'See /TURSO_ONLY_MIGRATION.md for details',
  });
}
