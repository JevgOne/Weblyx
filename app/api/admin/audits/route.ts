import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { listAudits } from '@/lib/audits/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get('offset') ?? '0') || 0);
  const limit = Math.min(100, Number(searchParams.get('limit') ?? '25') || 25);

  const { audits, total } = await listAudits({ limit, offset });
  return NextResponse.json({ success: true, data: { audits, total } });
}
