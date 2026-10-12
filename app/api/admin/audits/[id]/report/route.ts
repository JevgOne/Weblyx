import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { getAudit, getAuditReport } from '@/lib/audits/server';
import { buildEmailHtml, runAudit } from '@/lib/audits/report';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * The full report for one audit, for reading in the admin panel.
 *
 * Reports are stored from 12. 10. 2026. For an older audit there is nothing to
 * show, so the site is measured again and the answer says so — the numbers may
 * differ from what the prospect received.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) {
    return NextResponse.json({ success: false, error: 'Audit nenalezen' }, { status: 404 });
  }

  const stored = await getAuditReport(id);
  if (stored) {
    return NextResponse.json({ success: true, data: { html: stored.html, stored: true, createdAt: stored.createdAt } });
  }

  try {
    const result = await runAudit(audit.url);
    return NextResponse.json({
      success: true,
      data: { html: buildEmailHtml(result), stored: false, score: result.score },
    });
  } catch (error) {
    console.error('Audit report preview failed:', error);
    return NextResponse.json(
      { success: false, error: 'Web se teď nepodařilo změřit, report nejde sestavit.' },
      { status: 422 }
    );
  }
}
