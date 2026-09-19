/**
 * Guards against the failure this suite was written after: the same package
 * price written into a dozen places, then updated in one of them.
 *
 * The configurator bills from `pricing_tiers`. Everything a visitor reads —
 * marketing copy, meta titles, the budget dropdown, the AI manifests — has to
 * agree with it. These are source assertions, so they run without a database.
 *
 * When prices genuinely change, update PACKAGE_PRICES and the copy together;
 * that is the point of the test.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(__dirname, '..');

/** Must match the active rows in `pricing_tiers`. */
const PACKAGE_PRICES = {
  'Landing Page': 7990,
  'Základní Web': 14900,
  'Standardní Web': 29900,
} as const;

const ENTRY_PRICE = Math.min(...Object.values(PACKAGE_PRICES));

/** Prices these packages used to carry, in the spaced format the copy uses. */
const RETIRED = ['8 000 Kč', '9 990 Kč', '10 000 Kč', '24 990 Kč', '25 000 Kč', '14 990 Kč'];

/**
 * Lines that legitimately contain one of those numbers for another reason.
 * Keyed by file, matched as a substring of the offending line.
 */
const ALLOWED: Array<[string, string]> = [
  // What WordPress hosting costs, not what we charge.
  ['app/wordpress-alternativa/page.tsx', '2 000–8 000 Kč/rok'],
  // Monthly SEO retainer range, unrelated to the packages.
  ['app/seo-optimalizace/page.tsx', 'od 8 000–15 000 Kč/měsíc'],
  // A standalone SEO offer in a cold-outreach template.
  ['app/api/admin/analyze-website/route.ts', 'Kompletní SEO optimalizace za 8 000 Kč'],
  // The market rate we compare ourselves against.
  ['app/tvorba-webu-praha/page.tsx', 'na trhu pohybují od 10 000 Kč'],
  // Google Ads budget picker in the admin — ad spend, not our price.
  ['app/admin/marketing/google-ads/_components/SmartCampaignCreator.tsx', 'label: "10 000 Kč"'],
  ['app/admin/marketing/google-ads/_components/SmartCampaignCreator.tsx', 'label: "25 000 Kč"'],
  // Competitor price ranges in the eroweb analysis report.
  ['app/admin/eroweb-analyza/components/report-card.tsx', '149 990 Kč'],
  ['lib/eroweb/pdf-translations.ts', '149 990 Kč'],
  // Number-formatting examples in AI prompts, not offers.
  ['app/api/ai-assistant/chat/route.ts', 'Formát čísel'],
  ['app/api/meta-ads/analyze/route.ts', 'Čísla:'],
  ['app/api/cms/pricing/route.ts', 'the same formatting the configurator shows'],
  ['lib/changelog/server.ts', 'A value diff for the `detail` column'],
  ['app/sluzby/page.tsx', 'that copy had gone stale'],
  // Budget bands in the multi-step contact form, not package prices.
  ['messages/cs.json', '"10-20k"'],
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', '.git', 'tests'].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|json)$/.test(entry)) out.push(full);
  }
  return out;
}

const FILES = [
  ...walk(join(ROOT, 'app')),
  ...walk(join(ROOT, 'components')),
  ...walk(join(ROOT, 'lib')),
  join(ROOT, 'messages/cs.json'),
  join(ROOT, 'messages/de.json'),
];

function isAllowed(file: string, line: string): boolean {
  return ALLOWED.some(([f, needle]) => file === f && line.includes(needle));
}

describe('no retired package price survives in public copy', () => {
  for (const price of RETIRED) {
    it(`"${price}" appears nowhere unexplained`, () => {
      const hits: string[] = [];

      for (const path of FILES) {
        const rel = relative(ROOT, path);
        readFileSync(path, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (line.includes(price) && !isAllowed(rel, line)) {
              hits.push(`${rel}:${i + 1}  ${line.trim().slice(0, 120)}`);
            }
          });
      }

      expect(hits, `stará cena ${price} zůstala:\n${hits.join('\n')}`).toEqual([]);
    });
  }
});

describe('the budget dropdown quotes the real packages', () => {
  const messages = JSON.parse(readFileSync(join(ROOT, 'messages/cs.json'), 'utf8'));
  const options = messages.contactForm.form.budgetOptions;

  it('every package option carries its current price', () => {
    expect(options.landing).toContain('7 990');
    expect(options.basic).toContain('14 900');
    expect(options.standard).toContain('29 900');
  });

  it('e-shops are offered on request, without a figure', () => {
    expect(options.premium).toMatch(/poptávku/i);
    expect(options.premium).not.toMatch(/\d/);
  });
});

describe('the entry price is quoted consistently', () => {
  it('is 7 990 Kč', () => {
    expect(ENTRY_PRICE).toBe(7990);
  });

  it('every "od ... Kč" headline in the metadata helper uses it', () => {
    const src = readFileSync(join(ROOT, 'lib/seo-metadata.ts'), 'utf8');
    const quoted = [...src.matchAll(/od (\d[\d\s]*) Kč/gi)].map((m) => m[1].replace(/\s/g, ''));
    for (const value of quoted) {
      expect(Number(value), `lib/seo-metadata.ts uvádí od ${value} Kč`).toBe(ENTRY_PRICE);
    }
  });
});

describe('the project count is never written by hand', () => {
  const walkFiles = FILES.filter((f) => !f.includes('site-stats') && !f.includes('stats-bar'));

  it('no page claims "15+ projektů"', () => {
    const hits: string[] = [];
    for (const path of walkFiles) {
      const rel = relative(ROOT, path);
      readFileSync(path, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (/15\+\s*(projekt|Projekte|úspěšných)/i.test(line) || /"stat1Value":\s*"15\+"/.test(line)) {
            hits.push(`${rel}:${i + 1}  ${line.trim().slice(0, 110)}`);
          }
        });
    }
    expect(hits, `ručně psaný počet projektů:\n${hits.join('\n')}`).toEqual([]);
  });

  it('projectsLabel rounds down so the claim cannot overstate the portfolio', async () => {
    const { projectsLabel } = await import('../lib/site-stats');
    expect(projectsLabel(13)).toBe('10+');
    expect(projectsLabel(15)).toBe('15+');
    expect(projectsLabel(9)).toBe('9');
  });
});

/**
 * Marketing must not promise better terms than the contract grants.
 *
 * The Czech pages advertised "Platba až po předání · žádné zálohy předem" and
 * "neomezené revize" while the binding terms at /obchodni-podminky required a
 * 50% deposit before work starts and the FAQ offered two rounds of revisions.
 * Whichever way those numbers move, the claim and the contract move together.
 */
describe('payment and revision claims match the terms', () => {
  const terms = readFileSync(join(ROOT, 'app/obchodni-podminky/page.tsx'), 'utf8');

  it('the terms still require a deposit before work starts', () => {
    expect(terms).toMatch(/zálohu\s*50\s*%?\s*před zahájením/i);
  });

  const FALSE_CLAIMS = [
    'Platba až po předání',
    'Žádná záloha předem',
    'žádné zálohy předem',
    'Neomezené revize',
    'neomezené revize',
    'Unbegrenzte Korrekturen',
    'Kein Vorschuss',
  ];

  for (const claim of FALSE_CLAIMS) {
    it(`no page claims "${claim}"`, () => {
      const hits: string[] = [];
      for (const path of FILES) {
        const rel = relative(ROOT, path);
        readFileSync(path, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (line.includes(claim)) hits.push(`${rel}:${i + 1}  ${line.trim().slice(0, 110)}`);
          });
      }
      expect(hits, `slib odporuje obchodním podmínkám:\n${hits.join('\n')}`).toEqual([]);
    });
  }

  it('the FAQ states the deposit split on both language sites', () => {
    const cs = JSON.parse(readFileSync(join(ROOT, 'messages/cs.json'), 'utf8'));
    const de = JSON.parse(readFileSync(join(ROOT, 'messages/de.json'), 'utf8'));
    expect(JSON.stringify(cs.faq)).toMatch(/50%?\s*zálohu/i);
    expect(JSON.stringify(de.faq)).toMatch(/50%?\s*Anzahlung/i);
  });
});

/**
 * The hero promised a reply in 2 hours while the contact section four blocks
 * below on the same page promised 24, and the thank-you page said 2–4. Both
 * enquiry endpoints and every landing page say 24.
 */
describe('the response time is the same everywhere', () => {
  const CONTRADICTIONS = ['do 2 h', 'do 2 hodin', '2-4 hodin', '2–4 hodin', 'in 2 Std.'];

  for (const claim of CONTRADICTIONS) {
    it(`no page promises "${claim}"`, () => {
      const hits: string[] = [];
      for (const path of FILES) {
        const rel = relative(ROOT, path);
        // The eroweb PDF is an outbound competitor analysis, not our promise.
        if (rel.startsWith('lib/eroweb/')) continue;
        readFileSync(path, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (line.includes(claim)) hits.push(`${rel}:${i + 1}  ${line.trim().slice(0, 110)}`);
          });
      }
      expect(hits, `jiná doba odpovědi než 24 h:\n${hits.join('\n')}`).toEqual([]);
    });
  }
});

/**
 * The GEO page's top tier bundles "Kompletní SEO optimalizace" on top of GEO,
 * so it contains everything Premium SEO sells. At 7 990 against Premium SEO's
 * 12 000 it undercut the very product it contains, and nobody wanting SEO had
 * a reason to buy the SEO package. A bundle costs more than either part and
 * less than both bought separately.
 */
describe('the GEO bundle does not undercut Premium SEO', () => {
  const priceOf = (file: string, name: string): number => {
    const src = readFileSync(join(ROOT, file), 'utf8');
    const re = new RegExp(
      `<h3 className="text-xl font-bold">${name}</h3>\\s*<p className="text-3xl font-black text-primary">od ([\\d\\s]+) Kč</p>`
    );
    const m = src.match(re);
    if (!m) throw new Error(`cena pro "${name}" nenalezena v ${file}`);
    return Number(m[1].replace(/\s/g, ''));
  };

  const monthlySeo = () => priceOf('app/seo-optimalizace/page.tsx', 'Měsíční SEO');
  const premiumSeo = () => priceOf('app/seo-optimalizace/page.tsx', 'Premium SEO');
  const bundle = () => priceOf('app/geo-optimalizace/page.tsx', 'Premium GEO \\+ SEO');

  it('costs more than Premium SEO alone', () => {
    expect(bundle()).toBeGreaterThan(premiumSeo());
  });

  it('costs less than buying Premium SEO and monthly GEO separately', () => {
    expect(bundle()).toBeLessThan(premiumSeo() + monthlySeo());
  });

  it('does not reuse a one-off website price as a monthly figure', () => {
    expect([7990, 14900, 29900]).not.toContain(bundle());
  });
});
