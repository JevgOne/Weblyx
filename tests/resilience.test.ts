import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { safeRead } from '@/lib/safe-read';

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

afterEach(() => vi.restoreAllMocks());

describe('safeRead', () => {
  it('returns the value when the read succeeds', async () => {
    await expect(safeRead(async () => ['a'], [], 'x')).resolves.toEqual(['a']);
  });

  it('returns the fallback and logs when the read throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const out = await safeRead(async () => {
      throw new Error('TURSO_DATABASE_URL environment variable is not set');
    }, [] as string[], 'reviews');

    expect(out).toEqual([]);
    expect(spy).toHaveBeenCalledOnce();
    expect(String(spy.mock.calls[0][0])).toContain('reviews');
  });

  it('swallows a synchronous throw from the callback too', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const out = await safeRead(() => {
      throw new Error('boom');
    }, null, 'section');
    expect(out).toBeNull();
  });

  it('passes a falsy fallback through untouched', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(safeRead(async () => { throw new Error('x'); }, 0, 'n')).resolves.toBe(0);
    await expect(safeRead(async () => { throw new Error('x'); }, '', 's')).resolves.toBe('');
  });
});

describe('lib/turso.ts stays lazy', () => {
  const src = read('lib/turso.ts');

  it('does not throw at module scope', () => {
    // A top-level throw turns runtime credentials into a build requirement and
    // kills `next build` during "Collecting page data".
    const beforeFirstFn = src.slice(0, src.indexOf('function getClient'));
    expect(beforeFirstFn).not.toMatch(/^\s*if \(!process\.env/m);
    expect(beforeFirstFn).not.toContain('throw new Error');
  });

  it('still reports missing credentials, just later', () => {
    expect(src).toContain('TURSO_DATABASE_URL environment variable is not set');
    expect(src).toContain('TURSO_AUTH_TOKEN environment variable is not set');
  });
});

describe('public pages guard their CMS reads', () => {
  // Each of these took the whole page down with a 500 when the database was
  // unreachable, instead of dropping one section.
  const guarded: Array<[string, string]> = [
    ['components/home/case-study.tsx', 'getPublishedPortfolio'],
    ['components/home/portfolio.tsx', 'getPageContent'],
    ['components/home/services.tsx', 'getPageContent'],
    ['app/sluzby/page.tsx', 'getActiveServices'],
    ['app/leistungen/page.tsx', 'getActiveServices'],
    ['app/recenze/page.tsx', 'getPublishedReviews'],
    ['app/bewertungen/page.tsx', 'getPublishedReviews'],
    ['app/blog/page.tsx', 'getPublishedBlogPostsByLanguage'],
    ['app/faq/page.tsx', 'getFAQSection'],
  ];

  for (const [file, fn] of guarded) {
    it(`${file} wraps ${fn}`, () => {
      const src = read(file);
      expect(src).toContain('safeRead');
      // the call must not sit bare on an await line
      expect(src).not.toMatch(new RegExp(`await\\s+${fn}\\s*\\(`));
    });
  }
});
