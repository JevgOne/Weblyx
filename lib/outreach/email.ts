import { reportToken, unsubscribeToken } from '@/lib/outreach/unsubscribe';

/**
 * The outreach e-mail: the text from the lead list, a signature, a way out.
 *
 * It is meant to read as a letter from one person, so there are no images and
 * no banners — plain paragraphs, the signature laid out like a business card,
 * and a small footer with the unsubscribe link. The same message goes out as
 * plain text for clients that prefer it.
 */
export const OUTREACH = {
  from: 'Weblyx <info@weblyx.cz>',
  fromEmail: 'info@weblyx.cz',
  name: 'Jevgenij',
  role: 'Weblyx · tvorba webových stránek',
  phone: '+420 702 110 166',
  site: 'https://www.weblyx.cz',
  optOut: 'Pokud o další zprávy nemáte zájem, stačí odpovědět a už se neozvu.',
  /** E-mails per run, and the pause between two of them. */
  batchSize: 20,
  pauseMs: 1500,
} as const;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function unsubscribeUrl(email: string, path = '/odhlasit'): string {
  return `${OUTREACH.site}${path}?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

export function reportUrl(email: string): string {
  return `${OUTREACH.site}/rozbor?e=${encodeURIComponent(email)}&t=${reportToken(email)}`;
}

/**
 * `withReport` adds the link that sends the full analysis by itself: the
 * e-mail offers the report, and a reader who wants it should not have to wait
 * for someone to notice a reply. Only for leads whose site has been analysed.
 */
export function buildOutreachEmail(body: string, to: string, options: { withReport?: boolean } = {}) {
  const o = OUTREACH;
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px;">${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');

  const cta = options.withReport
    ? `<p style="margin:4px 0 20px;"><a href="${reportUrl(to)}" style="display:inline-block;background:#14b8a6;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:11px 20px;border-radius:9px;">Poslat mi celý rozbor zdarma</a></p>`
    : '';
  const ctaText = options.withReport ? `\n\nCelý rozbor si můžete nechat poslat i jedním kliknutím: ${reportUrl(to)}` : '';

  const text = `${body}${ctaText}\n\n${o.name}\n${o.role}\n${o.fromEmail} · ${o.phone}\nwww.weblyx.cz\n\n${o.optOut}\nOdhlásit se můžete i tady: ${unsubscribeUrl(to)}`;

  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="max-width:580px;padding:24px 20px;font-family:${font};font-size:16px;line-height:1.65;color:#1e293b;">
${paragraphs}
${cta}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;font-family:${font};">
  <tr>
    <td style="padding:2px 18px 2px 0;border-right:3px solid #14b8a6;vertical-align:middle;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="34" height="34" align="center" valign="middle" style="width:34px;height:34px;background:#14b8a6;border-radius:9px;font-size:19px;line-height:34px;font-weight:800;color:#ffffff;">W</td>
        <td valign="middle" style="padding-left:9px;font-size:22px;line-height:34px;font-weight:800;letter-spacing:-0.02em;color:#0f172a;">Weblyx</td>
      </tr></table>
    </td>
    <td style="padding:2px 0 2px 18px;vertical-align:middle;font-size:14px;line-height:1.55;color:#475569;">
      <div style="font-size:16px;font-weight:700;color:#0f172a;">${esc(o.name)}</div>
      <div style="font-size:13px;font-weight:600;color:#0d9488;margin-bottom:6px;">${esc(o.role)}</div>
      <a href="mailto:${o.fromEmail}" style="color:#475569;text-decoration:none;">${o.fromEmail}</a> &nbsp;·&nbsp; <a href="tel:${o.phone.replace(/\s/g, '')}" style="color:#475569;text-decoration:none;">${o.phone}</a><br>
      <a href="${o.site}" style="color:#0d9488;text-decoration:none;font-weight:600;">www.weblyx.cz</a>
    </td>
  </tr>
</table>
<p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;font-size:13px;line-height:1.6;color:#94a3b8;">
  ${o.optOut} Nebo se <a href="${unsubscribeUrl(to)}" style="color:#64748b;text-decoration:underline;">odhlaste jedním kliknutím</a>.
</p>
</div></body></html>`;

  const headers = {
    'List-Unsubscribe': `<${unsubscribeUrl(to, '/odhlasit/stav')}>, <mailto:${o.fromEmail}?subject=Odhlasit>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };

  return { html, text, headers };
}
