import { turso } from '@/lib/turso';
import { createGeneratedEmail, createLead } from '@/lib/turso/lead-generation';

/**
 * Import of the CSV that lead-finder/find-leads.mjs writes.
 *
 * That file is not the template this section used to expect: it is separated
 * by semicolons, its cells may hold line breaks, and it brings the finished
 * e-mail for every company (predmet, text_emailu). The e-mail is stored as it
 * is — nothing here rewrites or generates text.
 *
 *   firma; web; email; telefon; adresa; skore; duvody; predmet; text_emailu
 */
export function isLeadFinderCsv(content: string): boolean {
  const header = content.replace(/^﻿/, '').split('\n')[0].toLowerCase();
  return header.includes(';') && header.includes('firma') && header.includes('text_emailu');
}

export const EMAIL = /^[^\s@;,%]+@[^\s@;,%]+\.[a-z]{2,}$/i;

/** Semicolon-separated, with quoted cells that may contain line breaks. */
export function parseLeadFinderCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ';') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), r[i] ?? ''])));
}

export async function importLeadFinderCsv(content: string) {
  const result = { success: true, imported: 0, duplicates: 0, skipped: 0, failed: 0, errors: [] as string[] };
  const rows = parseLeadFinderCsv(content.replace(/^﻿/, ''));

  // A company is a duplicate if its address or its website is already here —
  // from an earlier import or from a row above in the same file. Lists for
  // neighbouring towns and trades overlap, and the same salon turns up with
  // "info@" in one and the owner's address in another.
  const site = (w: unknown) => String(w ?? '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim();
  const existing = await turso.execute('SELECT lower(email) AS email, website FROM lead_generation_leads');
  const known = new Set(existing.rows.map((r) => String(r.email)));
  const knownSites = new Set(existing.rows.map((r) => site(r.website)).filter(Boolean));

  for (const row of rows) {
    // A company may list several addresses — separated by a comma, a semicolon
    // or a space, depending on where the list found them. Only the first valid
    // one is written to; "a@x.cz;b@y.cz" taken whole is not an address, and one
    // such row stopped a whole batch.
    const email = (row.email ?? '')
      .replace(/%20/gi, ' ')
      .replace(/mailto:/gi, '')
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .find((e) => EMAIL.test(e));
    if (!email || !row.text_emailu?.trim() || !row.predmet?.trim()) { result.skipped++; continue; }
    const domain = site(row.web);
    if (known.has(email) || (domain && knownSites.has(domain))) { result.duplicates++; continue; }
    known.add(email);
    if (domain) knownSites.add(domain);
    try {
      const lead = await createLead({
        companyName: row.firma,
        email,
        website: row.web?.replace(/^https?:\/\//, '').replace(/\/$/, '') || undefined,
        phone: row.telefon || undefined,
        notes: [row.adresa, row.duvody].filter(Boolean).join(' · ') || undefined,
      });
      await createGeneratedEmail({ leadId: lead.id, subject: row.predmet.trim(), body: row.text_emailu.trim() });
      result.imported++;
    } catch (error: any) {
      result.failed++;
      result.errors.push(`${row.firma}: ${error?.message ?? 'chyba'}`);
    }
  }
  if (result.failed > 0) result.success = false;
  return result;
}
