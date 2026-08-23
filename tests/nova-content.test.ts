import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const NOVA = join(ROOT, 'components/nova');
const read = (f: string) => readFileSync(join(NOVA, f), 'utf8');

/**
 * These sections carried people's names, client names and counts written into
 * the file. Reviews were the worst case: real clients' names above text they
 * had not written. Each must now read from the CMS.
 */
const CMS_BACKED: Array<[string, string]> = [
  ['reviews.tsx', 'getPublishedReviews'],
  ['client-logos.tsx', 'getHomepagePortfolio'],
  ['portfolio.tsx', 'getHomepagePortfolio'],
  ['stats-bar.tsx', 'getPublishedPortfolio'],
];

describe('nova sections read their content from the CMS', () => {
  for (const [file, reader] of CMS_BACKED) {
    it(`${file} reads via ${reader} and guards it`, () => {
      const src = read(file);
      expect(src).toContain(reader);
      expect(src).toContain('safeRead');
      expect(src).not.toMatch(new RegExp(`await\\s+${reader}\\s*\\(`));
    });
  }

  it('no review text or client name is hardcoded any more', () => {
    const reviews = read('reviews.tsx');
    // The names that used to sit in the file, above words they never wrote.
    for (const name of ['Václav Fejkl', 'Kristýna Hyršová', 'Adam Shaker']) {
      expect(reviews, `${name} must come from the database`).not.toContain(name);
    }
    const logos = read('client-logos.tsx');
    for (const client of ['Titan Gym', 'CarMakléř', 'Wardon Design']) {
      expect(logos, `${client} must come from the CMS`).not.toContain(client);
    }
  });

  it('the stats bar counts rows instead of stating a figure', () => {
    const src = read('stats-bar.tsx');
    // It used to claim "15+" while the CMS held thirteen projects.
    expect(src).not.toMatch(/"15\+"/);
    expect(src).toContain('reviews.length');
    expect(src).toContain('projects.length');
  });

  it('delivery is quoted from the price list, not restated', () => {
    const src = read('stats-bar.tsx');
    expect(src).toContain('deliveryDays');
    expect(src).not.toMatch(/"5–7 dní"/);
  });

  it('every nova section that renders CMS rows can render none', () => {
    // A "trusted by" row with nobody in it, or a five-star headline over an
    // empty grid, is worse than the section being absent.
    for (const [file] of CMS_BACKED) {
      if (file === 'stats-bar.tsx') continue; // drops individual stats instead
      expect(read(file), file).toMatch(/length === 0\) return null/);
    }
  });

  it('matches the Google source case-insensitively', () => {
    // The column is free text and the rows say "Google", not "google".
    const src = read('reviews.tsx');
    expect(src).toContain('toLowerCase()');
    expect(src).not.toMatch(/source === "google"/);
  });
});

describe('no nova section still ships a hardcoded content list', () => {
  it('has no top-level array of copy left', () => {
    const offenders: string[] = [];
    for (const file of readdirSync(NOVA)) {
      const src = readFileSync(join(NOVA, file), 'utf8');
      // BADGES-style promise lists are fine; arrays of objects with a name or
      // author field are content that belongs in the CMS.
      if (/^const [A-Z_]+(: [^=]+)? = \[\s*\n\s*\{[^}]*\b(author|clientName|name):/m.test(src)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});
