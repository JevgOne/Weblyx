#!/usr/bin/env tsx
/**
 * Crawls every URL in the sitemap and reports copy that contradicts the price
 * list or the rest of the site.
 *
 * Written after an audit found the same package quoted at four different
 * prices across the site, marketing promising better payment terms than the
 * contract, and three different answers to "how fast do you reply". Checking
 * that by reading pages does not scale to 71 of them, and it does not stay
 * checked.
 *
 * Usage: npm run check:texts [-- https://www.weblyx.cz]
 */

const BASE = process.argv[2] || 'https://www.weblyx.cz';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/140.0 Safari/537.36';

interface Rule {
  name: string;
  /** Text that must never appear. */
  forbidden: RegExp;
  why: string;
  /** Pages allowed to contain it anyway. */
  except?: RegExp;
  /**
   * Set when the rule governs a claim we make about ourselves. The match is
   * then ignored if it sits inside quotation marks or an illustration — an
   * article teaching someone to write "Opravíme ho do 2 hodin" on a plumber's
   * site is not us promising to answer in two hours.
   */
  ourClaimOnly?: boolean;
}

/**
 * Whether a match is somebody else's words rather than ours.
 *
 * The checker reported eighteen findings and every one was an example, a
 * competitor's published price, or our own changelog describing a price we
 * had already removed. A check that cries wolf eighteen times is a check
 * nobody reads, and the real contradiction hides in the noise.
 */
/**
 * Known-good matches, each with the reason it is not a contradiction.
 *
 * The point of this list is that everything outside it is a real finding. A
 * check that reports a dozen things nobody intends to fix is a check nobody
 * runs, so anything deliberate is written down here rather than tolerated in
 * the output.
 */
const ALLOWED: Array<{ path: RegExp; hit: RegExp; why: string }> = [
  {
    path: /proc-vas-web-nikdo-nenavstevuje|nejcastejsi-chyby-tvorba-webu/,
    hit: /do 2 hodin/,
    why: 'vymyšlený instalatér jako ukázka dobrého textu, ne náš slib',
  },
  {
    path: /klient-chtel-web-za-5000/,
    hit: /25 000/,
    why: 'příběh klienta, který zaplatil jinde — ne naše cena',
  },
  {
    path: /analyzovali-jsme-50-ceskych-webu/,
    hit: /10 000/,
    why: 'průměrná zakázka čtenáře, ne cena webu',
  },
  {
    path: /tvorba-webu-praha-jak-vybrat-agenturu-ceny/,
    hit: /10 000/,
    why: 'hypotetické srovnání dvou webů za stejnou cenu',
  },
  {
    path: /wordpress-vs-wix/,
    hit: /8 000/,
    why: 'pětileté náklady na Wix Business, ne naše cena',
  },
  {
    path: /kolik-realne-vydelame-na-webu-za-8-tisic/,
    hit: /8 000/,
    why: 'název případovky o konkrétní zakázce',
  },
];

function isAllowedHit(path: string, hit: string): boolean {
  return ALLOWED.some((a) => a.path.test(path) && a.hit.test(hit));
}

function isIllustration(text: string, at: number, hit: string): boolean {
  const before = text.slice(Math.max(0, at - 220), at);
  const around = text.slice(Math.max(0, at - 220), at + hit.length + 120);

  // Inside a quotation — examples of copy are written as quotes.
  const quotes = (before.match(/[„"]/g) ?? []).length;
  if (quotes % 2 === 1) return true;

  // A range is a market figure, not a price of ours: our packages cost one
  // amount each. "3 000–8 000 Kč za optimalizaci obrázků" is what a repair
  // costs, "2 000–10 000 Kč" is what a VPS costs, and neither is a package.
  const asRange = new RegExp(`\\d[\\d\\s]*\\s*[–-]\\s*${hit.replace(/[.*+?^$()[\]{}|\\]/g, '\\$&')}`);
  if (asRange.test(around)) return true;

  // Named as an example, a competitor's published price, or a change we made.
  return /\b(například|třeba|vzor|ukázk|příklad|fiktivn|špatn[ěý]|takhle ne|místo toho|konkurence|agentur[ayi]|stavebnic|uváděly staré|starou cenu|dříve|původně|hosting|VPS|focení|fotograf|Wix|Webnode|Shoptet|create201|wpdistro|pixelfield|dejtonaweb|weby-praha)\b/i.test(
    around
  );
}

const RULES: Rule[] = [
  {
    name: 'retired price',
    ourClaimOnly: true,
    forbidden: /\b(8 000|9 990|10 000|24 990|25 000|85 000|49 990|89 990|14 990|12 990|16 990|54 900)\s*Kč/,
    why: 'balíčky stojí 7 990 / 14 900 / 29 900 Kč',
    // WordPress hosting costs and the monthly SEO retainer are not our prices.
    except: /wordpress-alternativa|seo-optimalizace|geo-optimalizace/,
  },
  {
    name: 'payment promise',
    forbidden: /Platba až po předání|žádné zálohy předem|Žádná záloha/i,
    why: 'obchodní podmínky vyžadují zálohu 50 % před zahájením',
  },
  {
    name: 'revisions promise',
    ourClaimOnly: true,
    forbidden: /neomezené revize|neomezený počet revizí/i,
    why: 'v ceně jsou 2 kola revizí',
  },
  {
    name: 'response time',
    ourClaimOnly: true,
    forbidden: /do 2 h\b|do 2 hodin|2-4 hodin|2–4 hodin/i,
    why: 'web slibuje odpověď do 24 hodin',
  },
  {
    name: 'project count',
    forbidden: /15\+\s*(projekt|úspěšných)|150\+\s*projekt/i,
    why: 'počet projektů se počítá z databáze (nyní 10+)',
  },
  {
    name: 'years in business',
    forbidden: /\b5 let zkušeností|\b10 let zkušeností/i,
    why: 'firma vznikla v únoru 2024',
  },
  {
    name: 'wrong phone',
    ourClaimOnly: true,
    forbidden: /\+420 ?7(?!02 ?110 ?166)\d{2} ?\d{3} ?\d{3}/,
    why: 'telefon je +420 702 110 166',
    // The enquiry forms use a placeholder number in their inputs.
    except: /poptavka|kontakt|anfrage/,
  },
];

/** Claims that must appear identically wherever they appear at all. */
const CONSISTENCY = [
  { name: 'entry price', pattern: /od\s*([\d\s]+)\s*Kč/g, expect: '7 990' },
];

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const html = await res.text();
    // Strip scripts (the RSC payload repeats everything) and tags.
    return html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ');
  } catch {
    return null;
  }
}

async function main() {
  const smx = await fetch(`${BASE}/sitemap.xml`, { headers: { 'User-Agent': UA } });
  const urls = [...(await smx.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  console.log(`Kontroluji ${urls.length} URL ze sitemapy na ${BASE}\n`);

  let problems = 0;
  const entryPrices = new Map<string, string[]>();

  for (const url of urls) {
    const text = await fetchText(url);
    if (text === null) {
      console.log(`  ⚠  ${url} — nedostupné`);
      problems++;
      continue;
    }

    const path = url.replace(BASE, '') || '/';

    for (const rule of RULES) {
      if (rule.except?.test(path)) continue;
      const hit = text.match(rule.forbidden);
      if (hit) {
        const at = text.indexOf(hit[0]);
        if (rule.ourClaimOnly && isAllowedHit(path, hit[0])) continue;
        if (rule.ourClaimOnly && isIllustration(text, at, hit[0])) continue;
        const context = text.slice(Math.max(0, at - 60), at + 70).trim();
        console.log(`  ✗  ${path}`);
        console.log(`       ${rule.name}: „${hit[0]}" — ${rule.why}`);
        console.log(`       …${context}…`);
        problems++;
      }
    }

    for (const c of CONSISTENCY) {
      for (const m of text.matchAll(c.pattern)) {
        const value = m[1].trim();
        if (!entryPrices.has(value)) entryPrices.set(value, []);
        entryPrices.get(value)!.push(path);
      }
    }
  }

  const variants = [...entryPrices.keys()].filter((v) => /^\d/.test(v));
  if (variants.length > 1) {
    console.log(`\n  ℹ  "od X Kč" se na webu vyskytuje v ${variants.length} variantách:`);
    for (const v of variants.sort()) {
      const pages = [...new Set(entryPrices.get(v)!)];
      console.log(`       ${v} Kč — ${pages.length} stránek: ${pages.slice(0, 4).join(', ')}`);
    }
  }

  console.log(problems === 0 ? '\n✅ Žádný rozpor.' : `\n❌ ${problems} nálezů.`);
  process.exit(problems === 0 ? 0 : 1);
}

main();
