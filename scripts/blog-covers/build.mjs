/**
 * Draws the blog covers and writes them to public/images/blog/covers.
 *
 *   node scripts/blog-covers/build.mjs            every cover
 *   node scripts/blog-covers/build.mjs <slug>…    only these
 *   node scripts/blog-covers/build.mjs --apply    also point the articles at them
 *
 * Covers are SVG drawn in code (kit.mjs, scenes.mjs) and rasterised at 2x, so
 * they stay sharp on a Retina screen. Reads the articles from Turso to check
 * each cover against its text; writes to the database only with --apply.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { wrap } from './kit.mjs';
import { covers } from './covers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'public/images/blog/covers');
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])
);
const db = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const only = args.filter((a) => !a.startsWith('--'));

const { rows } = await db.execute("SELECT id, slug, title, excerpt, content, featured_image FROM blog_posts WHERE language = 'cs'");
const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r]));
const all = covers(bySlug);

// Every figure on a cover has to appear in its article.
const norm = (s) => String(s).replace(/[\s  ]/g, '').toLowerCase();
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const problems = [];
for (const [slug, [, , o]] of Object.entries(all)) {
  const post = bySlug[slug];
  if (!post) { problems.push(`${slug}: no such article`); continue; }
  const hay = norm(`${post.title} ${post.excerpt} ${post.content}`);
  for (const s of strings(o)) {
    if (/^#/.test(s) || /^\d{1,3}$/.test(norm(s))) continue; // colours; bare counts from the title
    for (const m of s.matchAll(/\d[\d  ,.–-]*\d|\d/g)) if (!hay.includes(norm(m[0]))) problems.push(`${slug}: "${m[0]}" in "${s}" is not in the article`);
  }
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
let i = 0, built = 0;
for (const [slug, [blob, scene, o]] of Object.entries(all)) {
  const svg = wrap(scene(o), blob, i, i % 4 === 3);
  i++;
  if (only.length && !only.includes(slug)) continue;
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).resize(2400).webp({ quality: 88 }).toFile(path.join(outDir, `${slug}.webp`));
  built++;
  if (apply) await db.execute({ sql: 'UPDATE blog_posts SET featured_image = ? WHERE slug = ?', args: [`/images/blog/covers/${slug}.webp`, slug] });
}
await browser.close();
console.log(`${built} cover(s) written to public/images/blog/covers${apply ? ' and set on their articles' : ''}`);
const without = rows.filter((r) => !all[r.slug]).map((r) => r.slug);
if (without.length) console.log(`Articles without a cover: ${without.join(', ')}`);
