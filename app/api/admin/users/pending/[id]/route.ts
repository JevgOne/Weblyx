import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { approvePendingAdmin, rejectPendingAdmin } from '@/lib/auth/simple-auth';
import { isAdminOrHigher, isOwner } from '@/lib/auth/permissions';
import { ROLE_NAMES } from '@/lib/auth/permissions';
import { logActivity } from '@/lib/activity-log';
import { sendEmail } from '@/lib/email/resend-client';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const approveSchema = z.object({ role: z.enum(['owner', 'admin', 'specialist']) });

/**
 * POST /api/admin/users/pending/[id]
 * Approve a registration and give it a role.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();
  if (!isAdminOrHigher(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = approveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Vyberte roli' }, { status: 400 });
  }
  // Same rule as creating a user by hand: an owner is made only by an owner.
  if (parsed.data.role === 'owner' && !isOwner(user.role)) {
    return NextResponse.json({ error: 'Vlastníka může založit jen vlastník' }, { status: 403 });
  }

  const { id } = await params;
  const approved = await approvePendingAdmin(id, parsed.data.role);
  if (!approved) {
    return NextResponse.json({ error: 'Žádost nenalezena' }, { status: 404 });
  }

  await logActivity({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: 'user_created',
    entityType: 'user',
    entityId: id,
    entityName: `${approved.name} (${approved.email})`,
    details: `Schválena registrace, role: ${parsed.data.role}`,
  });

  // Tell the person they can sign in. The password is not in the message: only
  // its hash is stored, and a password sitting in a mailbox is one nobody
  // should still be using.
  const loginUrl = 'https://www.weblyx.cz/admin/login';
  const roleName = ROLE_NAMES[parsed.data.role].cs;
  const emailResult = await sendEmail({
    to: approved.email,
    subject: 'Váš přístup do administrace Weblyx je schválený',
    html: `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#0f172a;line-height:1.6;max-width:520px">
    <h2 style="margin:0 0 12px">Přístup je schválený</h2>
    <p style="margin:0 0 16px">Dobrý den, ${esc(approved.name)},<br>vaše registrace do administrace Weblyx byla schválena. Můžete se přihlásit.</p>
    <table style="border-collapse:collapse;margin:0 0 16px">
      <tr><td style="padding:4px 16px 4px 0;color:#64748b">Přihlašovací e-mail</td><td style="padding:4px 0"><strong>${esc(approved.email)}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#64748b">Heslo</td><td style="padding:4px 0">to, které jste si zvolili při registraci</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#64748b">Role</td><td style="padding:4px 0"><strong>${esc(roleName)}</strong></td></tr>
    </table>
    <p style="margin:0 0 16px"><a href="${loginUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Přihlásit se</a></p>
    <p style="margin:0;color:#64748b;font-size:13px">Heslo z bezpečnostních důvodů neposíláme. Změnit si ho můžete po přihlášení v Nastavení.</p>
  </div>`,
    text: `Dobrý den, ${approved.name},\n\nvaše registrace do administrace Weblyx byla schválena.\n\nPřihlašovací e-mail: ${approved.email}\nHeslo: to, které jste si zvolili při registraci\nRole: ${roleName}\n\nPřihlášení: ${loginUrl}\n\nHeslo z bezpečnostních důvodů neposíláme. Změnit si ho můžete po přihlášení v Nastavení.`,
  }).catch((error) => {
    console.error('Approval email failed:', error);
    return null;
  });
  const emailed = Boolean(emailResult && (emailResult as { success?: boolean }).success !== false);

  return NextResponse.json({ success: true, emailed });
}

/**
 * DELETE /api/admin/users/pending/[id]
 * Reject a registration.
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();
  if (!isAdminOrHigher(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const rejected = await rejectPendingAdmin(id);
  if (!rejected) {
    return NextResponse.json({ error: 'Žádost nenalezena' }, { status: 404 });
  }

  await logActivity({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: 'user_deleted',
    entityType: 'user',
    entityId: id,
    entityName: `${rejected.name} (${rejected.email})`,
    details: 'Zamítnuta registrace',
  });

  return NextResponse.json({ success: true });
}
