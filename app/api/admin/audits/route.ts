import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { listAudits, updateAuditCall, type AuditSource, type CallStatus } from '@/lib/audits/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get('offset') ?? '0') || 0);
  const limit = Math.min(100, Number(searchParams.get('limit') ?? '25') || 25);

  const sourceParam = searchParams.get('source');
  const source: AuditSource | undefined =
    sourceParam === 'web' || sourceParam === 'admin' ? sourceParam : undefined;

  const { audits, total } = await listAudits({ limit, offset, source });
  return NextResponse.json({ success: true, data: { audits, total } });
}

/** Call state and notes, edited straight from the list. */
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id) {
    return NextResponse.json({ success: false, error: 'Chybí id' }, { status: 400 });
  }

  const STATES = ['new', 'called', 'interested', 'rejected'] as const;
  const callStatus = STATES.includes(body?.callStatus) ? (body.callStatus as CallStatus) : undefined;
  const note = typeof body?.note === 'string' ? body.note : undefined;

  if (!callStatus && note === undefined) {
    return NextResponse.json({ success: false, error: 'Nic k uložení' }, { status: 400 });
  }

  await updateAuditCall(id, { callStatus, note });
  return NextResponse.json({ success: true });
}
