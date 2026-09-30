/**
 * Structural guards for the stage-0 security fixes. These are cheap source
 * assertions — the runtime behaviour is covered by the HTTP checks in the test
 * report — but they fail loudly if someone removes an auth call again.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

describe('auth on the lead endpoints', () => {
  const files = [
    'app/api/leads/[id]/route.ts',
    'app/api/leads/[id]/convert/route.ts',
    'app/api/leads/[id]/generate-design/route.ts',
    'app/api/leads/[id]/generate-brief/route.ts',
    'app/api/admin/leads/route.ts',
    'app/api/admin/stats/route.ts',
  ];

  for (const f of files) {
    it(`${f} calls getAuthUser and returns unauthorizedResponse`, () => {
      const src = read(f);
      expect(src).toContain('getAuthUser()');
      expect(src).toContain('unauthorizedResponse()');
    });
  }

  it('every exported handler in /api/leads/[id] authenticates before touching the database', () => {
    const src = read('app/api/leads/[id]/route.ts');
    for (const method of ['GET', 'DELETE', 'PATCH']) {
      const start = src.indexOf(`export async function ${method}(`);
      expect(start, method).toBeGreaterThan(-1);
      const body = src.slice(start, src.indexOf('\n}\n', start));
      const authAt = body.indexOf('getAuthUser()');
      const sqlAt = body.indexOf('turso.execute');
      expect(authAt, `${method}: no auth`).toBeGreaterThan(-1);
      expect(authAt, `${method}: auth runs after the lookup`).toBeLessThan(sqlAt);
    }
  });

  it('the AI endpoints accept an internal secret as an alternative to a session', () => {
    for (const f of [
      'app/api/leads/[id]/generate-design/route.ts',
      'app/api/leads/[id]/generate-brief/route.ts',
    ]) {
      const src = read(f);
      expect(src, f).toMatch(
        /if \(!isInternalRequest\((request|req)\)\) \{\s*const user = await getAuthUser\(\);\s*if \(!user\) return unauthorizedResponse\(\);\s*\}/
      );
    }
  });
});

describe('admin lead updates', () => {
  const src = read('app/api/admin/leads/route.ts');

  it('writes only whitelisted columns (no caller-controlled SQL identifiers)', () => {
    expect(src).toContain('const UPDATABLE_COLUMNS: Record<string, string>');
    expect(src).toContain('const column = UPDATABLE_COLUMNS[key];');
    expect(src).toMatch(/if \(!column\)[\s\S]{0,120}status: 400/);
  });

  it('validates the status value against the lifecycle whitelist', () => {
    expect(src).toContain("column === 'status' && !isWritableLeadStatus(value)");
  });

  it('answers with private, no-store so the panel never shows a stale status', () => {
    expect(src).toContain("'Cache-Control': 'private, no-store'");
  });

  it('exposes the configuration column to the panel', () => {
    expect(src).toContain('configuration: parseJSON(row.configuration)');
  });
});

describe('admin stats split the lead lifecycle', () => {
  const src = read('app/api/admin/stats/route.ts');

  it('counts new / in_progress / done separately and folds converted into done', () => {
    expect(src).toContain("SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads");
    expect(src).toContain("SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress");
    expect(src).toContain("SUM(CASE WHEN status IN ('done', 'converted') THEN 1 ELSE 0 END) as done");
  });
});

describe('CMS pricing endpoints', () => {
  const files = [
    'app/api/cms/pricing/route.ts',
    'app/api/cms/pricing/addons/route.ts',
  ];

  for (const f of files) {
    it(`${f} authenticates every mutating handler (GET stays public)`, () => {
      const src = read(f);
      for (const method of ['POST', 'PUT', 'DELETE']) {
        const start = src.indexOf(`export async function ${method}(`);
        if (start === -1) continue;
        const body = src.slice(start, start + 400);
        expect(body, `${f} ${method}`).toContain('const user = await getAuthUser();');
        expect(body, `${f} ${method}`).toContain('if (!user) return unauthorizedResponse();');
      }
    });
  }

  it('validates the price it stores and revalidates both homepages', () => {
    const src = read('app/api/cms/pricing/route.ts');
    // Price is edited directly since migration 008, so it must be validated
    // rather than trusted; `hours x rate` no longer sanitises it.
    expect(src).toContain('Valid price is required');
    expect(src).not.toContain('priceFromHours');
    expect(src).toContain("revalidatePath('/nova')");
  });
});

describe('middleware CSRF exemptions', () => {
  const src = read('middleware.ts');

  it('/api/contact and /api/leads are exact matches, not prefixes', () => {
    expect(src).toContain("const publicExactEndpoints = ['/api/contact', '/api/leads'];");
    expect(src).toContain('publicExactEndpoints.includes(pathname)');
  });

  it('the prefix list no longer contains the lead/contact endpoints', () => {
    const prefixes = src.match(/const publicPrefixEndpoints = \[(.*?)\];/)![1];
    expect(prefixes).not.toContain('/api/leads');
    expect(prefixes).not.toContain('/api/contact');
    expect(prefixes).toContain('/api/audit');
    expect(prefixes).toContain('/api/newsletter');
    expect(prefixes).toContain('/api/auth/login');
  });
});

describe('retired calculator', () => {
  it('the page, the API route and the old QuoteForm copy are gone', () => {
    expect(existsSync(join(ROOT, 'app/kalkulacka'))).toBe(false);
    expect(existsSync(join(ROOT, 'app/kalkulacka/page.tsx'))).toBe(false);
    expect(existsSync(join(ROOT, 'app/api/calculator'))).toBe(false);
    expect(existsSync(join(ROOT, 'app/poptavka/QuoteForm.tsx'))).toBe(false);
  });

  it('the UI that posted to the deleted endpoint is gone too', () => {
    expect(existsSync(join(ROOT, 'components/calculator'))).toBe(false);
    expect(existsSync(join(ROOT, 'lib/calculator'))).toBe(false);
    expect(existsSync(join(ROOT, 'lib/email/calculator-template.ts'))).toBe(false);
  });

  it('the root layout no longer mounts the calculator lead capture', () => {
    const src = read('app/layout.tsx');
    expect(src).not.toContain('CalculatorLeadCapture');
  });

  it('next.config.ts redirects /kalkulacka to /#cenik with a 301', () => {
    const src = read('next.config.ts');
    expect(src).toMatch(/source: '\/kalkulacka',\s*destination: '\/#cenik',\s*statusCode: 301,/);
  });

  it('sitemap.ts no longer lists /kalkulacka', () => {
    expect(read('app/sitemap.ts')).not.toContain('kalkulacka');
  });
});

describe('no mock data left in the admin panel', () => {
  it('app/admin/leads/page.tsx has no mockLeads', () => {
    expect(read('app/admin/leads/page.tsx')).not.toContain('mockLeads');
  });

  it('components/home/pricing.tsx has no getMockPlans', () => {
    expect(read('components/home/pricing.tsx')).not.toContain('getMockPlans');
  });

  it('the leads page renders an error state instead of silently showing nothing', () => {
    const src = read('app/admin/leads/page.tsx');
    expect(src).toContain('Zkusit znovu');
  });
});

describe('lead status rendering goes through the shared helper', () => {
  const files = [
    'app/admin/leads/page.tsx',
    'app/admin/dashboard/page.tsx',
    'components/admin/LeadDetailDialog.tsx',
  ];

  for (const f of files) {
    it(`${f} uses leadStatusMeta / nextLeadStatus and no local status map`, () => {
      const src = read(f);
      expect(src).toContain("@/lib/leads/status");
      // the old crash site: statusConfig[x].color without optional chaining
      expect(src).not.toMatch(/statusConfig\[[^\]]+\]\.\w/);
      // dead branches for statuses that never existed in this lifecycle
      expect(src).not.toMatch(/["']won["']|["']completed["']/);
    });
  }

  it('the detail dialog writes "done", never the legacy value', () => {
    const src = read('components/admin/LeadDetailDialog.tsx');
    expect(src).toContain("'done'");
    expect(src).not.toMatch(/status:\s*["']converted["']/);
  });
});

/**
 * Every indexable route declares a canonical URL.
 *
 * The homepage did not — it inherited the root layout's metadata, which sets
 * metadataBase but no `alternates`, so the page carrying most of the site's
 * impressions had nothing resolving http:// against https:// or the bare
 * domain against www. Every other page already declared one; this keeps the
 * homepage from silently losing it again.
 */
describe('the homepage declares a canonical URL', () => {
  const page = readFileSync(join(__dirname, '..', 'app/page.tsx'), 'utf8');

  it('exports metadata with alternates', () => {
    expect(page).toMatch(/export const metadata: Metadata/);
    expect(page).toMatch(/alternates:\s*\{/);
  });

  it('points at the canonical host for each build', () => {
    expect(page).toContain('https://www.weblyx.cz/');
    expect(page).toContain('https://seitelyx.de/');
    expect(page).toMatch(/languages:\s*getAlternateLanguages\("\/"\)/);
  });
});

/**
 * The public audit runs the audit.
 *
 * The form posted to /api/contact — the generic enquiry endpoint — and told
 * the visitor to wait 48 hours for an e-mail, while /api/audit already scored
 * the site synchronously, mailed the report and recorded the lead. Nothing
 * called it, so no visitor ever saw a number and the admin's audit list never
 * received a single web lead.
 */
describe('the free audit is wired to the audit endpoint', () => {
  const form = readFileSync(join(__dirname, '..', 'components/audit/AuditForm.tsx'), 'utf8');
  const route = readFileSync(join(__dirname, '..', 'app/api/audit/route.ts'), 'utf8');

  it('posts to /api/audit, not the contact endpoint', () => {
    expect(form).toContain('fetch("/api/audit"');
    expect(form).not.toContain('fetch("/api/contact"');
  });

  it('renders the score it gets back', () => {
    expect(form).toMatch(/result\.score/);
    // Six scored dimensions and the findings, not just a bare number.
    expect(form).toMatch(/result\.categories/);
    expect(form).toMatch(/result\.findings/);
  });

  it('scores every audit with the in-house analyzer', () => {
    // The in-house analyzer is the audit; PageSpeed only refines the speed
    // figure when a key is configured, so an exhausted quota or a missing key
    // can never leave the visitor without a result.
    expect(route).toContain('runLocalAudit');
    expect(route).toMatch(/const \[result, psi\] = await Promise\.all/);
    expect(route).toMatch(/if \(psi === null\) return result;/);
    expect(route).toMatch(/PAGESPEED_API_KEY/);
  });

  it('no longer promises a 48-hour turnaround anywhere on the audit', () => {
    const page = readFileSync(join(__dirname, '..', 'app/audit/page.tsx'), 'utf8');
    expect(page).not.toContain('48 hodin');
    expect(form).not.toContain('48 hodin');
  });
});

/**
 * The audit is linked from the site. It sat in the sitemap with no inbound
 * link from any page — a lead magnet reachable only by typing the URL.
 */
describe('the free audit is reachable', () => {
  it('appears in the header and the footer', () => {
    expect(readFileSync(join(__dirname, '..', 'components/nova/header.tsx'), 'utf8')).toContain('"/audit"');
    expect(readFileSync(join(__dirname, '..', 'components/nova/footer.tsx'), 'utf8')).toContain('"/audit"');
  });
});

/**
 * The landing pages and what they are obliged to carry.
 *
 * Every one of them shows a price, so every one has to say that half of it is
 * due on approval — that is the term a visitor is most likely to be surprised
 * by, and burying it is how a quote turns into an argument.
 */
describe('landing pages', () => {
  const PAGES = [
    'app/web-praha-nabidka/page.tsx',
    'app/cenik-webu/page.tsx',
    'app/web-za-3-5-dni/page.tsx',
    'app/web-pro-male-firmy/page.tsx',
    'app/web-pro-zivnostniky/page.tsx',
  ];

  for (const rel of PAGES) {
    const src = readFileSync(join(__dirname, '..', rel), 'utf8');

    it(`${rel} states the deposit`, () => {
      expect(src).toMatch(/DEPOSIT_SHORT|Po schválení návrhu/);
    });

    it(`${rel} declares structured data`, () => {
      expect(src).toContain('JsonLd');
    });
  }

  it('only the ad landing hides the site chrome', () => {
    // The others are organic pages too: hiding their header would cut them out
    // of the site's internal linking for no gain.
    const hiding = PAGES.filter((rel) =>
      readFileSync(join(__dirname, '..', rel), 'utf8').includes('wbx-landing')
    );
    expect(hiding).toEqual(['app/web-praha-nabidka/page.tsx']);
  });

  it('the ad landing is noindex and absent from the sitemap', () => {
    const page = readFileSync(join(__dirname, '..', 'app/web-praha-nabidka/page.tsx'), 'utf8');
    expect(page).toMatch(/robots:\s*\{\s*index:\s*false/);
    const sitemap = readFileSync(join(__dirname, '..', 'app/sitemap.ts'), 'utf8');
    expect(sitemap).not.toMatch(/\$\{baseUrl\}\/web-praha-nabidka/);
  });

  it('the chrome opt-out exists in the stylesheet', () => {
    const css = readFileSync(join(__dirname, '..', 'app/globals.css'), 'utf8');
    expect(css).toMatch(/body:has\(\.wbx-landing\)\s*\.site-chrome/);
  });
});

/**
 * Attribution. Nothing captured utm or gclid, so every enquiry arrived without
 * a way to tell which campaign paid for it.
 */
describe('lead attribution', () => {
  it('the enquiry endpoint stores the campaign columns', () => {
    const route = readFileSync(join(__dirname, '..', 'app/api/contact/route.ts'), 'utf8');
    for (const col of ['utm_source', 'utm_campaign', 'gclid', 'landing_page', 'referrer']) {
      expect(route, `chybí ${col}`).toContain(col);
    }
  });

  it('capture is first-touch, so browsing does not erase the source', () => {
    const src = readFileSync(join(__dirname, '..', 'components/tracking/AttributionFields.tsx'), 'utf8');
    expect(src).toContain('sessionStorage');
    expect(src).toMatch(/if \(stored && \(stored\.gclid \|\| stored\.utm_source\)\) return stored;/);
  });

  it('the migration is additive', () => {
    const sql = readFileSync(join(__dirname, '..', 'migrations/014_lead_attribution.sql'), 'utf8');
    expect(sql).toMatch(/ALTER TABLE leads ADD COLUMN/);
    expect(sql).not.toMatch(/DROP|DELETE|UPDATE\s+leads/i);
  });
});
