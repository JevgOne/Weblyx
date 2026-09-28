/**
 * The Czech site shipped two headers and two footers for a day.
 *
 * SiteChrome decided which chrome to render from `usePathname()` in a client
 * component. That worked while pages rendered per request; once they became
 * prerendered, the hook had no path to read at build time, the guard never
 * matched, and the shared chrome went into the static HTML next to the
 * redesign's own. Nothing failed — not the build, not the type check, not the
 * 231 tests — because nothing counted them.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const BUILT = join(ROOT, '.next/server/app');

const PAGES = [
  'index.html',
  'sluzby.html',
  'kontakt.html',
  'recenze.html',
  'tvorba-webu-praha.html',
  'tvorba-webu-brno.html',
  'tvorba-webu-ostrava.html',
  'o-nas.html',
  'blog.html',
  'portfolio.html',
];

const built = existsSync(BUILT) ? readdirSync(BUILT) : [];
const haveBuild = built.length > 0;

describe.skipIf(!haveBuild)('prerendered pages carry exactly one header and one footer', () => {
  for (const file of PAGES) {
    const path = join(BUILT, file);
    it.skipIf(!existsSync(path))(file, () => {
      const html = readFileSync(path, 'utf8');
      expect(html.match(/<header[\s>]/g)?.length ?? 0, 'headers').toBe(1);
      expect(html.match(/<footer[\s>]/g)?.length ?? 0, 'footers').toBe(1);
    });
  }
});

/**
 * The guard that broke: chrome must not be selected from a client-side hook,
 * because the answer is baked into static HTML at build time.
 */
describe('the chrome is chosen on the server', () => {
  it('the root layout picks it from the build-time locale', () => {
    const src = readFileSync(join(ROOT, 'app/layout.tsx'), 'utf8');
    expect(src).toMatch(/isCzech \? <NovaHeader \/> : <Header \/>/);
    expect(src).not.toContain('<SiteChrome>');
  });

  it('the homepage does not render chrome of its own', () => {
    const src = readFileSync(join(ROOT, 'components/nova/home.tsx'), 'utf8');
    expect(src).not.toContain('<NovaHeader');
    expect(src).not.toContain('<NovaFooter');
  });
});

/**
 * Three articles rendered two h1 elements: the template writes the post title,
 * and the markdown body opened with its own `# Heading`. On those three the two
 * did not match, so Google was handed competing titles for one article.
 */
describe('blog articles have one h1', () => {
  it('the renderer strips a leading markdown heading', () => {
    const src = readFileSync(join(ROOT, 'app/blog/[slug]/page.tsx'), 'utf8');
    expect(src).toMatch(/post\.content\.replace\(\/\^\\s\*#/);
  });
});
