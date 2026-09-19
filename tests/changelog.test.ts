/**
 * The changelog has one rule that must never bend: entries about pricing and
 * about other people's enquiries do not reach the public site. It is enforced
 * in three places — the writer, the reader and the visibility endpoint — so
 * these tests cover the pure logic plus source guards for the two paths that
 * need a database to run for real.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  ALWAYS_INTERNAL,
  CHANGE_TYPES,
  CHANGE_TYPE_COLORS,
  CHANGE_TYPE_LABELS,
  DEFAULT_PUBLIC,
  formatChangeDate,
  formatChangeDateTime,
  isChangeType,
} from '../lib/changelog/types';
import { describeDiff } from '../lib/changelog/server';

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

describe('change types', () => {
  it('every type has a Czech label and a badge colour', () => {
    for (const type of CHANGE_TYPES) {
      expect(CHANGE_TYPE_LABELS[type], type).toBeTruthy();
      expect(CHANGE_TYPE_COLORS[type]?.fg, type).toMatch(/^#|rgba/);
      expect(CHANGE_TYPE_COLORS[type]?.bg, type).toMatch(/^#|rgba/);
    }
  });

  it('isChangeType rejects anything not on the list', () => {
    expect(isChangeType('project')).toBe(true);
    expect(isChangeType('Project')).toBe(false);
    expect(isChangeType('deploy')).toBe(false);
    expect(isChangeType(undefined)).toBe(false);
    expect(isChangeType(null)).toBe(false);
  });
});

describe('public vs internal', () => {
  it('pricing and lead are the always-internal types', () => {
    expect([...ALWAYS_INTERNAL].sort()).toEqual(['lead', 'pricing']);
  });

  it('no always-internal type defaults to public', () => {
    for (const type of ALWAYS_INTERNAL) {
      expect(DEFAULT_PUBLIC[type], type).toBe(false);
    }
  });

  it('project, review and content default to public — the archive exists to show them', () => {
    expect(DEFAULT_PUBLIC.project).toBe(true);
    expect(DEFAULT_PUBLIC.review).toBe(true);
    expect(DEFAULT_PUBLIC.content).toBe(true);
  });

  it('recordChange forces isPublic to false for the always-internal types', () => {
    const src = read('lib/changelog/server.ts');
    expect(src).toContain('ALWAYS_INTERNAL.includes(params.type)');
    // The caller's isPublic is only consulted on the other branch.
    expect(src).toMatch(/ALWAYS_INTERNAL\.includes\(params\.type\)\s*\?\s*false/);
  });

  it('the public read filters the always-internal types out again', () => {
    const src = read('lib/changelog/server.ts');
    expect(src).toContain('is_public = 1');
    expect(src).toContain('type NOT IN');
  });

  it('setChangeVisibility cannot publish an always-internal row', () => {
    const src = read('lib/changelog/server.ts');
    const start = src.indexOf('export async function setChangeVisibility');
    expect(start).toBeGreaterThan(-1);
    expect(src.slice(start)).toContain('type NOT IN');
  });

  it('the public timeline component never renders the author', () => {
    const src = read('components/nova/changelog.tsx');
    expect(src).not.toContain('entry.author');
  });
});

describe('manual entries', () => {
  it('the API writes manual entries as system only', () => {
    const src = read('app/api/admin/changelog/route.ts');
    const start = src.indexOf('export async function POST');
    const body = src.slice(start, src.indexOf('export async function PATCH'));
    expect(body).toContain("type: 'system'");
    // No route for the caller to pick a type.
    expect(body).not.toContain('body.type');
  });

  it('every changelog endpoint authenticates first', () => {
    const src = read('app/api/admin/changelog/route.ts');
    for (const method of ['GET', 'POST', 'PATCH']) {
      const start = src.indexOf(`export async function ${method}(`);
      expect(start, method).toBeGreaterThan(-1);
      const body = src.slice(start, start + 400);
      expect(body, `${method}: no auth`).toContain('getAuthUser()');
      expect(body, `${method}: no 401`).toContain('unauthorizedResponse()');
    }
  });
});

describe('describeDiff', () => {
  it('renders old → new', () => {
    expect(describeDiff('Cena', 9990, 10990, (v) => `${v} Kč`)).toBe('Cena: 9990 Kč → 10990 Kč');
  });

  it('returns null when nothing changed, so no empty detail is stored', () => {
    expect(describeDiff('Cena', 9990, 9990)).toBeNull();
  });

  it('returns null when the old value is unknown — "undefined → 20" helps nobody', () => {
    expect(describeDiff('Hodiny', undefined, 20)).toBeNull();
    expect(describeDiff('Hodiny', null, 20)).toBeNull();
  });
});

describe('Czech date formatting', () => {
  // 2026-09-14 12:34 UTC
  const stamp = Math.floor(Date.UTC(2026, 8, 14, 12, 34) / 1000);

  it('the public timeline uses d. m. yyyy', () => {
    expect(formatChangeDate(stamp)).toBe('14. 9. 2026');
  });

  it('the admin list adds the time', () => {
    expect(formatChangeDateTime(stamp)).toMatch(/^14\. 9\. 2026 \d{2}:\d{2}$/);
  });
});

describe('automatic writes', () => {
  const HOOKED: Array<[string, string]> = [
    ['app/api/admin/reviews/route.ts', 'review'],
    ['app/api/portfolio/route.ts', 'project'],
    ['app/api/cms/pricing/route.ts', 'pricing'],
    ['app/api/cms/pricing/addons/route.ts', 'pricing'],
    ['app/api/admin/leads/route.ts', 'lead'],
    ['app/api/cms/hero/route.ts', 'content'],
    ['app/api/cms/contact/route.ts', 'content'],
  ];

  for (const [file, type] of HOOKED) {
    it(`${file} records a '${type}' entry`, () => {
      const src = read(file);
      expect(src).toContain('recordChange');
      expect(src).toContain(`type: '${type}'`);
    });
  }
});

describe('the site never shows a hardcoded year', () => {
  it('the footer computes it', () => {
    const src = read('components/nova/footer.tsx');
    expect(src).toContain('new Date().getFullYear()');
    expect(src).not.toMatch(/©\s*20\d\d/);
  });
});
