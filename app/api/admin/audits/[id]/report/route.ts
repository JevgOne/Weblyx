import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { getAuditReport } from '@/lib/audits/server';

export const runtime = 'nodejs';

/**
 * The report exactly as it was mailed, for reading in the admin panel.
 *
 * Never measured again: a fresh run gives different numbers from the ones the
 * prospect is looking at, and the point is to see what they see. Reports are
 * kept from 12. 10. 2026; older audits have none.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const stored = await getAuditReport(id);
  if (!stored) {
    return NextResponse.json(
      { success: false, error: 'Report k tomuto auditu není uložený.' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: { html: stored.html, createdAt: stored.createdAt } });
}
