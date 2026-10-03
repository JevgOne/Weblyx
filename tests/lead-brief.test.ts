import { describe, it, expect } from 'vitest';
import { buildLeadBrief, buildLeadBriefMarkdown } from '@/lib/leads/brief';

const config = (tierId: string, tierName: string, addons: any[] = []) => ({
  tierId,
  tierName,
  tierHours: 16,
  deliveryDays: '3–5',
  supportMonths: 1,
  addons,
  totalHours: 16,
  totalPrice: 7990,
});

describe('buildLeadBrief', () => {
  it('audit-only lead has no sitemap and asks for a package', () => {
    const brief = buildLeadBrief({ email: 'a@b.cz', existingWebsite: 'https://x.cz' });
    expect(brief.sitemap).toHaveLength(0);
    expect(brief.sitemapNote).toBeTruthy();
    expect(brief.outOfScope).toHaveLength(0);
    expect(brief.openQuestions.join(' ')).toContain('Není vybrán balíček');
  });

  it('landing page is a single page with hero first and contact last', () => {
    const brief = buildLeadBrief({
      name: 'Jan',
      configuration: config('tier-1', 'Landing Page'),
      projectDetails: { sections: ['Služby', 'Reference'], hasContent: 'yes' },
    });
    expect(brief.sitemap).toHaveLength(1);
    const names = brief.sitemap[0].sections.map((s) => s.name);
    expect(names[0]).toBe('Hero (úvod)');
    expect(names.at(-1)).toBe('Kontakt a formulář');
    expect(brief.sitemapSuggested).toBe(false);
    expect(brief.outOfScope.join(' ')).toContain('Blog');
  });

  it('suggests a default sitemap when the client gave no sections', () => {
    const brief = buildLeadBrief({ configuration: config('tier-2', 'Základní Web') });
    expect(brief.sitemapSuggested).toBe(true);
    expect(brief.sitemap.map((p) => p.path)).toEqual(['/', '/o-nas', '/sluzby', '/blog', '/kontakt']);
  });

  it('standard web reaches 10+ pages', () => {
    const brief = buildLeadBrief({ configuration: config('tier-3', 'Standardní Web') });
    expect(brief.sitemap.length).toBeGreaterThanOrEqual(10);
  });

  it('copywriting add-on makes us write the texts', () => {
    const brief = buildLeadBrief({
      configuration: config('tier-1', 'Landing Page', [{ id: 'addon-copywriting', name: 'Copywriting', hours: 3, price: 1490 }]),
      projectDetails: { hasContent: 'no' },
    });
    const sources = brief.sitemap[0].sections.flatMap((s) => s.content.map((c) => c.source));
    expect(sources).toContain('us');
    expect(sources).not.toContain('tbd');
    expect(brief.outOfScope.join(' ')).not.toContain('Psaní textů');
  });

  it('flags requested features the package does not cover', () => {
    const brief = buildLeadBrief({
      configuration: config('tier-1', 'Landing Page'),
      features: ['Rezervační systém', 'Blog'],
    });
    expect(brief.features.filter((f) => f.status === 'out').map((f) => f.name)).toEqual(['Rezervační systém', 'Blog']);
    expect(brief.openQuestions.join(' ')).toContain('Rezervační systém');
  });

  it('renders markdown with the main headings', () => {
    const md = buildLeadBriefMarkdown({ name: 'Jan', configuration: config('tier-2', 'Základní Web') });
    for (const h of ['## Zakázka', '## Sitemapa', '## Mimo rozsah', '## Otevřené otázky pro klienta']) {
      expect(md).toContain(h);
    }
  });
});
