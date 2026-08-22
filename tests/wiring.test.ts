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
