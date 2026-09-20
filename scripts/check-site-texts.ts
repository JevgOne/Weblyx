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
}

const RULES: Rule[] = [
  {
    name: 'retired price',
    forbidden: /\b(8 000|9 990|10 000|24 990|25 000|85 000|49 990|89 990|14 990|12 990|16 990)\s*Kč/,
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
    forbidden: /neomezené revize|neomezený počet revizí/i,
    why: 'v ceně jsou 2 kola revizí',
  },
  {
    name: 'response time',
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
    forbidden: /\+420 ?7(?!02 ?110 ?166)\d{2} ?\d{3} ?\d{3}/,
    why: 'telefon je +420 702 110 166',
    // The enquiry forms use a placeholder number in their inputs.
    except: /poptavka|kontakt|anfrage/,
  },
  {
    name: 'e-shop with a fixed price',
    forbidden: /e-?shop[^.]{0,60}(od|za)\s*\d[\d\s]*\s*Kč/i,
    why: 'e-shopy se nabízejí na poptávku',
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
