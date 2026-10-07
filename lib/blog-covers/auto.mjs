import { wrap } from './kit.mjs';
import { sceneList } from './scenes.mjs';

/**
 * A cover for an article nobody has drawn one for.
 *
 * The hand-made covers (scripts/blog-covers) pick a scene per article. A new
 * article should not wait for that, so this builds one from the article's own
 * structure: its title in a Safari window, its chapters as the list, and the
 * figure from its title on the card. Nothing is invented — every word on the
 * cover is in the article — and the style is the same kit the others use.
 */
const GLOWS = ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
const SKIP = /^(shrnutí|závěr|časté|faq|bonus|zusammenfassung|fazit|häufige)/i;

const clean = (s) => s.replace(/[*_`~]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^[^\p{L}\p{N}„"(]+/u, '').replace(/^\d+[.)]\s*/, '').replace(/\s+/g, ' ').trim();
const short = (s, n) => (s.length <= n ? s : `${s.slice(0, n + 1).replace(/\s+\S*$/, '').replace(/[,;:–—-]+$/, '')}…`);
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** The title's main clause, on at most two lines. */
function headingLines(title) {
  const main = clean(title.split(/\s[—–-]\s|:\s/)[0]);
  if (main.length <= 30) return [main];
  const words = main.split(' ');
  let first = '';
  while (words.length && (first + ' ' + words[0]).trim().length <= Math.max(18, main.length / 2 + 4)) first = `${first} ${words.shift()}`.trim();
  return [first, short(words.join(' '), 30)].filter(Boolean);
}

/** The figure a title leads with ("10 pravidel", "37 % spotřebitelů"), if it has one. */
function titleFigure(title) {
  const m = title.match(/(\d[\d  ]*(?:[,.]\d+)?(?:[–-]\d+)?)\s?(%|Kč|×)?\s+((?:\p{L}+[\s,]*){1,4})/u);
  if (!m || /^(19|20)\d\d$/.test(m[1].trim())) return null;
  const big = `${m[1].trim()}${m[2] ? (m[2] === '×' ? '×' : ` ${m[2]}`) : ''}`;
  const words = m[3].trim().replace(/[,\s]+$/, '').split(/\s+/).slice(0, 4);
  const half = Math.ceil(words.length / 2);
  return { big, label: [words.slice(0, half).join(' '), words.slice(half).join(' ')].filter(Boolean) };
}

export function autoCoverSvg(post) {
  const content = post.content ?? '';
  const chapters = [...content.matchAll(/^##\s+(.+)$/gm)].map((m) => clean(m[1])).filter((h) => h && !SKIP.test(h));
  const rows = (chapters.length ? chapters : (post.tags ?? []).map(String)).slice(0, 5).map((h) => short(h, 46));
  const minutes = Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
  const stat = titleFigure(post.title) ?? { big: `${minutes} min`, label: [post.language === 'de' ? 'Lesezeit' : 'čtení'] };
  const h = hash(post.slug);
  const body = sceneList({
    domain: post.language === 'de' ? 'seitelyx.de' : 'weblyx.cz',
    heading: headingLines(post.title),
    rows,
    stat,
    pills: (post.tags ?? []).map(String).filter((t) => t.length <= 22).slice(0, 4),
  });
  return wrap(body, GLOWS[h % GLOWS.length], h % 3, h % 4 === 3);
}

/** The picture to show for an article: its own cover, or the generated one. */
export function coverUrl(post) {
  return post.featuredImage || `/blog-cover/${post.slug}.svg`;
}
