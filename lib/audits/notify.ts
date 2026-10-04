import { EMAIL_CONFIG, sendEmail } from '@/lib/email/resend-client';
import { sendTelegramText } from '@/lib/telegram';
import type { AuditCheck } from '@/lib/audits/checks';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Tells the team someone ran the free audit. It is not an enquiry, so it does
 * not land in Poptávky — but someone who just handed over their website and
 * e-mail is the warmest contact the site produces, and it should not wait for
 * whoever next happens to open the audits list.
 *
 * Never throws: the visitor's report must not depend on our notifications.
 */
export async function notifyNewAudit(a: {
  url: string;
  email: string;
  name?: string | null;
  score?: number | null;
  checks?: AuditCheck[];
  failed?: boolean;
}): Promise<void> {
  const host = (() => {
    try {
      return new URL(a.url).hostname.replace(/^www\./, '');
    } catch {
      return a.url;
    }
  })();
  const missing = (a.checks ?? []).filter((c) => c.ok === false).map((c) => c.label);
  const scoreLine = a.failed ? 'Audit se nepodařilo dokončit (web možná nejede).' : `Skóre ${a.score ?? '—'}/100`;
  const adminUrl = 'https://www.weblyx.cz/admin/audity';

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#0f172a;line-height:1.6">
    <h2 style="margin:0 0 12px">🔍 Nový audit z webu: ${esc(host)}</h2>
    <p style="margin:0 0 4px"><strong>${esc(scoreLine)}</strong></p>
    <p style="margin:0 0 12px">
      ${a.name ? `${esc(a.name)} · ` : ''}<a href="mailto:${esc(a.email)}">${esc(a.email)}</a><br>
      <a href="${esc(a.url)}">${esc(a.url)}</a>
    </p>
    ${missing.length ? `<p style="margin:0 0 4px"><strong>Chybí (${missing.length}):</strong></p><ul style="margin:0 0 12px;padding-left:20px">${missing.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
    <p style="margin:0">Report už odešel na jeho e-mail. Odpovědí na tento e-mail napíšete přímo jemu.</p>
    <p style="margin:16px 0 0"><a href="${adminUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Otevřít audity</a></p>
  </div>`;

  const tasks: Promise<unknown>[] = [
    sendEmail({
      to: EMAIL_CONFIG.adminEmail,
      subject: `🔍 Nový audit: ${host}${a.failed ? ' (nedokončen)' : ` — ${a.score ?? '—'}/100`}`,
      html,
      replyTo: a.email,
    }),
    sendTelegramText(
      `🔍 <b>Nový audit z webu</b>\n${esc(host)} — ${esc(scoreLine)}\n${a.name ? esc(a.name) + ' · ' : ''}${esc(a.email)}` +
        (missing.length ? `\nChybí: ${esc(missing.slice(0, 6).join(', '))}${missing.length > 6 ? '…' : ''}` : '') +
        `\n${adminUrl}`
    ),
  ];
  await Promise.allSettled(tasks).then((results) =>
    results.forEach((r) => r.status === 'rejected' && console.error('Audit notification failed:', r.reason))
  );
}
