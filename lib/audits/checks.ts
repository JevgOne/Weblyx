import * as cheerio from 'cheerio';
import type { WebAnalysisResult } from '@/types/cms';

/**
 * The yes/no checklist the audit shows next to the scores.
 *
 * Six category scores tell a visitor how much is wrong; they do not tell them
 * what. "Uvidí vás ChatGPT? Ne — robots.txt mu zakazuje přístup" is the line
 * a business owner understands and acts on, and most of it is invisible in a
 * browser: robots.txt rules, llms.txt, structured data, a cookie banner that
 * should be there because the site loads Google Analytics.
 *
 * Every check is cheap — the page HTML (fetched once more here, the analyzer
 * does not hand it out), robots.txt and llms.txt. A check that cannot be
 * decided says so (`ok: null`) instead of guessing; a false "you are missing
 * X" on someone's own site is the fastest way to lose them.
 */

export type CheckGroup = 'ai' | 'google' | 'mobile' | 'trust';

export interface AuditCheck {
  id: string;
  group: CheckGroup;
  label: string;
  /** true = passes, false = missing, null = could not be determined. */
  ok: boolean | null;
  /** What we found, in a few words. */
  detail: string;
  /** Why it matters and what to do — shown when the check fails. */
  fix: string;
}

export const CHECK_GROUPS: Array<{ key: CheckGroup; label: string }> = [
  { key: 'ai', label: 'Najde vás AI (ChatGPT, Perplexity, Google AI)?' },
  { key: 'google', label: 'Google a mapy' },
  { key: 'mobile', label: 'Zákazník na mobilu' },
  { key: 'trust', label: 'Důvěra a pravidla' },
];

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** The crawlers behind ChatGPT, Claude, Perplexity and Google's AI answers. */
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

async function fetchText(url: string, timeoutMs = 6000): Promise<{ status: number; text: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'cs-CZ,cs;q=0.9' },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    });
    return { status: res.status, text: res.ok ? await res.text() : '' };
  } catch {
    return null;
  }
}

/**
 * Which AI crawlers robots.txt shuts out of the whole site. Groups are read the
 * way crawlers read them: a bot obeys the group naming it, and only falls back
 * to `*` when no group names it.
 */
export function blockedAiBots(robots: string): string[] {
  const groups: Array<{ agents: string[]; disallowAll: boolean }> = [];
  let current: { agents: string[]; disallowAll: boolean } | null = null;
  let lastWasAgent = false;

  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], disallowAll: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (current && key === 'disallow' && value === '/') current.disallowAll = true;
    }
  }

  return AI_BOTS.filter((bot) => {
    const own = groups.filter((g) => g.agents.includes(bot.toLowerCase()));
    const applicable = own.length > 0 ? own : groups.filter((g) => g.agents.includes('*'));
    return applicable.some((g) => g.disallowAll);
  });
}

function schemaTypesOf($: cheerio.CheerioAPI): string[] {
  const types = new Set<string>();
  const walk = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    const t = node['@type'];
    (Array.isArray(t) ? t : t ? [t] : []).forEach((x: string) => types.add(String(x)));
    Object.values(node).forEach(walk);
  };
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      walk(JSON.parse($(el).html() || 'null'));
    } catch {
      /* broken JSON-LD is reported by the analyzer */
    }
  });
  return [...types];
}

export async function runChecks(analysis: WebAnalysisResult): Promise<AuditCheck[]> {
  const base = new URL(analysis.url);
  const [page, robots, llms] = await Promise.all([
    fetchText(analysis.url, 10000),
    fetchText(new URL('/robots.txt', base).toString()),
    fetchText(new URL('/llms.txt', base).toString()),
  ]);

  const html = page?.text ?? '';
  const $ = cheerio.load(html);
  const lower = html.toLowerCase();
  const types = schemaTypesOf($);
  const hasType = (re: RegExp) => types.some((t) => re.test(t));
  const checks: AuditCheck[] = [];
  const add = (c: AuditCheck) => checks.push(c);

  // --- AI search -----------------------------------------------------------
  if (!robots || robots.status >= 500) {
    add({ id: 'ai-bots', group: 'ai', label: 'AI roboti mají na web přístup', ok: null,
      detail: 'robots.txt se nepodařilo načíst', fix: '' });
  } else {
    const blocked = robots.status === 200 ? blockedAiBots(robots.text) : [];
    add({
      id: 'ai-bots', group: 'ai', label: 'AI roboti mají na web přístup', ok: blocked.length === 0,
      detail: blocked.length ? `Zakázáno pro: ${blocked.join(', ')}` : 'robots.txt AI roboty neblokuje',
      fix: 'ChatGPT, Claude ani Perplexity web nemůžou číst, takže ho nikomu nedoporučí. Stačí upravit robots.txt.',
    });
  }

  const llmsOk = !!llms && llms.status === 200 && llms.text.trim().length > 20 && !/<html/i.test(llms.text.slice(0, 500));
  add({
    id: 'llms', group: 'ai', label: 'Soubor llms.txt pro AI asistenty', ok: llmsOk,
    detail: llmsOk ? 'Nalezen' : 'Chybí',
    fix: 'Krátký soubor, ze kterého si AI asistent přečte, co firma dělá, kde je a kolik co stojí — místo aby hádal z celého webu.',
  });

  const orgOk = hasType(/Organization|LocalBusiness|Store|Restaurant|ProfessionalService|Corporation/);
  add({
    id: 'org-schema', group: 'ai', label: 'Strukturované údaje o firmě', ok: orgOk,
    detail: orgOk ? types.filter((t) => /Organization|Business|Store|Restaurant|Service|Corporation|Shop|Salon|Office|Clinic/.test(t)).slice(0, 3).join(', ') : 'Chybí schema.org Organization / LocalBusiness',
    fix: 'Google i AI pak s jistotou vědí název, adresu, telefon a otevírací dobu — a umí je ukázat přímo ve výsledku.',
  });

  const faqSchema = hasType(/FAQPage/);
  const faqVisible = analysis.geo?.hasFaqSection ?? false;
  add({
    id: 'faq', group: 'ai', label: 'Časté otázky (FAQ)', ok: faqSchema || faqVisible,
    detail: faqSchema ? 'FAQ se strukturovanými daty' : faqVisible ? 'FAQ na webu je, ale bez strukturovaných dat' : 'Chybí',
    fix: 'AI asistenti odpovídají na otázky. Web, který otázky zákazníků sám zodpoví, citují jako zdroj.',
  });

  const contact = analysis.geo?.businessInfo;
  const contactOk = !!contact && contact.hasPhone && (contact.hasAddress || contact.hasEmail);
  add({
    id: 'contact', group: 'ai', label: 'Kontakt a adresa v textu webu', ok: contact ? contactOk : null,
    detail: contact ? [contact.hasPhone && 'telefon', contact.hasEmail && 'e-mail', contact.hasAddress && 'adresa', contact.hasOpeningHours && 'otevírací doba'].filter(Boolean).join(', ') || 'Nenalezeno' : '',
    fix: 'Když telefon a adresa nejsou jako text (jen v obrázku nebo vůbec), vyhledávače ani AI je zákazníkovi nepředají.',
  });

  const year = analysis.geo?.contentFreshness?.copyrightYear ?? null;
  const thisYear = new Date().getFullYear();
  add({
    id: 'fresh', group: 'ai', label: 'Web vypadá aktuálně', ok: year === null ? null : year >= thisYear - 1,
    detail: year === null ? 'Rok na webu jsme nenašli' : `Rok v patičce: ${year}`,
    fix: 'Starý rok v patičce působí na lidi i na vyhledávače jako opuštěný web.',
  });

  // --- Google and maps -----------------------------------------------------
  add({
    id: 'sitemap', group: 'google', label: 'Mapa webu pro Google (sitemap)', ok: analysis.technical.hasSitemap,
    detail: analysis.technical.hasSitemap ? 'Nalezena' : 'Nenalezena',
    fix: 'Bez sitemap Google nové stránky najde pomalu nebo vůbec.',
  });

  const title = analysis.technical.title?.trim() ?? '';
  const desc = analysis.technical.description?.trim() ?? '';
  const metaOk = title.length >= 15 && title.length <= 70 && desc.length >= 50 && desc.length <= 170;
  add({
    id: 'meta', group: 'google', label: 'Titulek a popis ve výsledcích Googlu', ok: metaOk,
    detail: `Titulek ${title.length} znaků, popis ${desc.length} znaků`,
    fix: 'To je text, který lidé uvidí v Googlu. Ideálně titulek do 60 znaků a popis 120–160 znaků, který láká ke kliknutí.',
  });

  // Google stopped showing review stars for a business's own reviews of
  // itself in 2019, so promising "stars in the results" would be a promise we
  // cannot keep. What reviews on the site do is earn trust — and give Google
  // and AI assistants a rating they can read.
  const ratingSchema = hasType(/AggregateRating|Review/);
  const reviewsVisible = ratingSchema || /recenz|hodnocení|reference|napsali o nás|★/.test(lower);
  add({
    id: 'stars', group: 'google', label: 'Recenze zákazníků na webu', ok: reviewsVisible,
    detail: ratingSchema ? 'Recenze i hodnocení ve strukturovaných datech' : reviewsVisible ? 'Recenze na webu jsou' : 'Recenze jsme nenašli',
    fix: 'Recenze z Googlu přímo na webu přesvědčí váhajícího zákazníka líp než jakýkoli text o vás — a AI asistenti z nich čerpají, když někdo hledá doporučení.',
  });

  const mapsOk = /google\.[a-z.]+\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl|g\.page\//.test(lower);
  add({
    id: 'maps', group: 'google', label: 'Napojení na Google mapy / Firmu na Googlu', ok: mapsOk,
    detail: mapsOk ? 'Odkaz nebo mapa nalezena' : 'Nenalezeno',
    fix: 'Odkaz na profil firmy na Googlu a mapa s trasou — zákazník jedním klikem naviguje a vidí recenze.',
  });

  // --- Mobile ----------------------------------------------------------------
  const viewportOk = $('meta[name="viewport"]').length > 0;
  add({
    id: 'viewport', group: 'mobile', label: 'Web je přizpůsobený mobilu', ok: viewportOk,
    detail: viewportOk ? 'Ano' : 'Chybí nastavení pro mobil (viewport)',
    fix: 'Přes 60 % lidí přichází z mobilu. Bez toho vidí zmenšenou stránku pro počítač.',
  });

  const telOk = $('a[href^="tel:"]').length > 0;
  add({
    id: 'tel', group: 'mobile', label: 'Telefon se dá na mobilu rovnou vytočit', ok: telOk,
    detail: telOk ? 'Klikací telefon nalezen' : contact?.hasPhone ? 'Telefon je jen jako text' : 'Telefon nenalezen',
    fix: 'Jeden ťuk a volá — místo přepisování čísla. U místních firem nejčastější cesta k zakázce.',
  });

  const images = $('img').length;
  const modern = $('img[src$=".webp"], img[src$=".avif"], img[src*=".webp?"], img[src*="/_next/image"], source[type="image/webp"], source[type="image/avif"]').length;
  add({
    id: 'images', group: 'mobile', label: 'Moderní formát obrázků (WebP/AVIF)', ok: images === 0 ? null : modern > 0,
    detail: images === 0 ? 'Na úvodní stránce nejsou obrázky' : modern > 0 ? 'Používá' : `${images} obrázků ve starém formátu`,
    fix: 'Moderní formáty jsou 2–3× menší, stránka se na mobilních datech načte výrazně rychleji.',
  });

  // --- Trust and rules -------------------------------------------------------
  const https = base.protocol === 'https:';
  add({
    id: 'https', group: 'trust', label: 'Zabezpečené spojení (HTTPS)', ok: https,
    detail: https ? 'Ano' : 'Web běží bez HTTPS',
    fix: 'Prohlížeč jinak hlásí „Nezabezpečeno" a formuláře působí nedůvěryhodně.',
  });

  const tracking = /googletagmanager\.com|google-analytics\.com|gtag\(|connect\.facebook\.net|fbq\(|hotjar|clarity\.ms|sklik|seznam\.cz\/js\/rc|h\.seznam\.cz|ssp\.seznam|gemius|mc\.yandex/.test(lower);
  const analyticsOk = tracking || /plausible\.io|umami|matomo|piwik|simpleanalytics|\/dot\.js|fathom|cloudflareinsights|vercel-insights|\/_vercel\/insights/.test(lower);
  const consent = /cookiebot|cookieyes|onetrust|cookie-?consent|cookieconsent|cookie-?banner|cookie-?lišt|souhlas s cookies|consentmanager|termly|iubenda|klaro|complianz|usercentrics|didomi|cookiehub|cc-banner/.test(lower);
  // A site that asks for cookie consent usually loads its analytics only after
  // the visitor agrees — from a script chunk that is not in the page at all
  // until then. Seen from outside that is indistinguishable from "no
  // analytics", and telling an owner who has GA4 that they measure nothing is
  // exactly the false finding that loses them. So it stays undecided.
  add({
    id: 'analytics', group: 'trust', label: 'Měření návštěvnosti', ok: analyticsOk ? true : consent ? null : false,
    detail: analyticsOk ? 'Nalezeno' : consent ? 'Načítá se nejspíš až po souhlasu s cookies, zvenku nelze ověřit' : 'Nenalezeno',
    fix: 'Bez měření nevíte, kolik lidí přichází, odkud a jestli vám web vůbec něco přináší.',
  });

  add({
    id: 'cookies', group: 'trust', label: 'Cookie lišta', ok: tracking ? consent : consent ? true : null,
    detail: consent ? 'Nalezena' : !tracking ? 'Web nepoužívá měřicí kódy, lišta není potřeba' : 'Měřicí kódy běží, lištu jsme nenašli',
    fix: 'Měření a reklamní kódy smí běžet až po souhlasu návštěvníka — jinak hrozí potíže s GDPR a Google Ads omezí měření.',
  });

  const ogOk = !!analysis.openGraph?.ogImage;
  add({
    id: 'og', group: 'trust', label: 'Náhled při sdílení (Facebook, WhatsApp)', ok: ogOk,
    detail: ogOk ? 'Obrázek pro sdílení nastaven' : 'Chybí obrázek pro sdílení',
    fix: 'Když někdo pošle odkaz, ukáže se obrázek a název firmy místo holého odkazu.',
  });

  return checks;
}
