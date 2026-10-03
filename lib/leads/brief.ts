/**
 * Turns an enquiry (plus the package and add-ons it was configured with) into
 * the brief a specialist builds the site from: which pages exist, which
 * sections sit on each, what content each needs and who supplies it, and what
 * the package does NOT cover.
 *
 * Pure on purpose — no I/O, so the dialog can run it in the browser and the
 * tests can feed it plain objects. Package scope is mirrored from the
 * `pricing_tiers.features` rows (migration 016); keep the two in sync.
 */

import { formatCzk, supportMonthsLabel } from '@/lib/pricing/types';
import { leadValueLabel } from '@/lib/leads/labels';

/* --- Input ----------------------------------------------------------------- */

/** The slice of a lead the brief reads; everything is optional because audit leads have only url + email. */
export interface BriefLead {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  ico?: string | null;
  address?: string | null;
  existingWebsite?: string | null;
  projectType?: string | null;
  projectTypeOther?: string | null;
  businessDescription?: string | null;
  projectGoal?: string | null;
  additionalRequirements?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  socialMedia?: unknown;
  features?: unknown;
  projectDetails?: {
    purpose?: string;
    targetAudience?: string;
    mainActions?: unknown;
    sections?: unknown;
    hasContent?: string;
    contentNotes?: string;
  } | null;
  designPreferences?: {
    colors?: { primary?: string; secondary?: string; accent?: string; noPreference?: boolean } | null;
    style?: string;
    inspiration?: string;
    mustHave?: unknown;
    expectations?: string;
  } | null;
  configuration?: {
    tierId?: string;
    tierName?: string;
    tierHours?: number;
    deliveryDays?: string;
    supportMonths?: number;
    addons?: Array<{ id: string; name: string; hours: number; price: number }>;
    totalHours?: number;
    totalPrice?: number;
  } | null;
  audits?: Array<{ url?: string; score?: number | null }> | null;
}

/* --- Output ---------------------------------------------------------------- */

/** "tbd" = we do not know yet who supplies it; the specialist has to ask. */
export type ContentSource = 'client' | 'us' | 'tbd';

export interface BriefContent {
  what: string;
  source: ContentSource;
}

export interface BriefSection {
  name: string;
  content: BriefContent[];
}

export interface BriefPage {
  title: string;
  path: string;
  purpose: string;
  /** Added by us on top of what the client asked for — needs a nod from the client. */
  suggested: boolean;
  sections: BriefSection[];
}

export type FeatureStatus = 'included' | 'addon' | 'out' | 'check';

export interface BriefFeature {
  name: string;
  status: FeatureStatus;
  note?: string;
}

export type BriefRow = [label: string, value: string];

export interface LeadBrief {
  title: string;
  header: BriefRow[];
  clientInput: BriefRow[];
  /** One line on who writes the texts, derived from copywriting add-on + hasContent. */
  contentNote: string;
  /** True when the client gave no sections and the whole sitemap is our proposal. */
  sitemapSuggested: boolean;
  sitemap: BriefPage[];
  /** Why there is no sitemap, when there is none. */
  sitemapNote: string | null;
  features: BriefFeature[];
  design: BriefRow[];
  seo: string[];
  outOfScope: string[];
  openQuestions: string[];
}

export const SOURCE_LABELS: Record<ContentSource, string> = {
  client: 'dodá klient',
  us: 'napíšeme my',
  tbd: 'kdo dodá — ověřit',
};

const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  included: 'v balíčku',
  addon: 'doplněk',
  out: 'MIMO ROZSAH',
  check: 'ověřit',
};

/* --- Helpers --------------------------------------------------------------- */

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Form fields arrive as arrays, comma strings or garbage; always hand back clean strings. */
function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  const text = clean(value);
  return text ? text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean) : [];
}

/** Lowercase, diacritics stripped — keeps the patterns below readable. */
const norm = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const humanize = (value: string) => leadValueLabel(value);

/* --- Package scope --------------------------------------------------------- */

type TierKind = 'landing' | 'basic' | 'standard';

/** What each package lists as included — a copy of `pricing_tiers.features`. */
const TIER_INCLUDES: Record<TierKind, string[]> = {
  landing: ['1 stránka, 3–5 sekcí', 'Responzivní design', 'Kontaktní formulář', 'SEO základy', 'Google Analytics'],
  basic: [
    '3–5 podstránek',
    'Moderní design',
    'Pokročilé SEO',
    'Blog s CMS editorem',
    'Kontaktní formulář',
    'Napojení na sociální sítě',
  ],
  standard: [
    '10+ podstránek',
    'Premium design na míru',
    'Pokročilé animace',
    'Full CMS pro správu obsahu',
    'Rezervační systém',
    'Newsletter integrace',
    'Pokročilé SEO a Analytics',
    'Bezplatné drobné úpravy (2 h)',
  ],
};

function tierKind(lead: BriefLead): TierKind | null {
  const config = lead.configuration;
  if (config?.tierId === 'tier-1') return 'landing';
  if (config?.tierId === 'tier-2') return 'basic';
  if (config?.tierId === 'tier-3') return 'standard';

  const name = norm(clean(config?.tierName));
  if (name.includes('landing')) return 'landing';
  if (name.includes('zakladni')) return 'basic';
  if (name.includes('standardni')) return 'standard';

  // No configuration: a landing-page enquiry still tells us the shape.
  if (!config && lead.projectType === 'landing') return 'landing';
  return null;
}

/* --- Sections -------------------------------------------------------------- */

type ItemKind = 'text' | 'media' | 'data';

interface SectionDef {
  key: string;
  label: string;
  pattern: RegExp;
  items: Array<[what: string, kind: ItemKind]>;
}

const SECTION_DEFS: SectionDef[] = [
  {
    key: 'hero',
    label: 'Hero (úvod)',
    pattern: /hero|uvod/,
    items: [
      ['Nadpis, podnadpis a text hlavního tlačítka', 'text'],
      ['Hlavní fotka nebo vizuál', 'media'],
    ],
  },
  {
    key: 'about',
    label: 'O nás',
    pattern: /\bo nas\b|\bo mne\b|about|pribeh|o firme/,
    items: [
      ['Příběh firmy, hodnoty, čím se liší', 'text'],
      ['Fotky firmy, provozovny nebo majitele', 'media'],
    ],
  },
  {
    key: 'services',
    label: 'Služby',
    pattern: /sluzb|nabidk|services|produkt|co delame|co nabizime/,
    items: [
      ['Seznam služeb: název + krátký popis', 'text'],
      ['Fotky nebo ikony ke službám', 'media'],
    ],
  },
  {
    key: 'portfolio',
    label: 'Portfolio / galerie',
    pattern: /portfolio|galeri|realizac/,
    items: [
      ['Fotky realizací', 'media'],
      ['Popisky k realizacím', 'text'],
    ],
  },
  {
    key: 'testimonials',
    label: 'Reference a recenze',
    pattern: /referenc|recenz|testimon|hodnocen|zkusenost/,
    items: [
      ['Recenze zákazníků: jméno + text (nevymýšlíme)', 'data'],
      ['Loga klientů, pokud mají být', 'media'],
    ],
  },
  {
    key: 'pricing',
    label: 'Ceník',
    pattern: /cenik|\bceny\b|pricing|balicky/,
    items: [
      ['Položky a ceny', 'data'],
      ['Poznámky k ceníku a podmínky', 'text'],
    ],
  },
  {
    key: 'faq',
    label: 'Časté dotazy (FAQ)',
    pattern: /faq|caste dotaz|otazk/,
    items: [['5–8 otázek a odpovědí', 'text']],
  },
  {
    key: 'team',
    label: 'Tým',
    pattern: /\btym\b|team|\blide\b/,
    items: [['Jména a role členů týmu', 'data'], ['Portrétní fotky', 'media']],
  },
  {
    key: 'process',
    label: 'Jak to funguje',
    pattern: /jak (to )?funguje|postup|proces|kroky/,
    items: [['Kroky spolupráce od poptávky po výsledek', 'text']],
  },
  {
    key: 'blog',
    label: 'Blog',
    pattern: /blog|clanky|novink|aktualit|magazin/,
    items: [
      ['Kategorie blogu a 3 úvodní články', 'text'],
      ['Úvodní obrázky k článkům', 'media'],
    ],
  },
  {
    key: 'booking',
    label: 'Rezervace',
    pattern: /rezerv|objednav|booking|terminy/,
    items: [
      ['Seznam rezervovatelných služeb, jejich délka a cena', 'data'],
      ['Pracovní doba a kdo přijímá rezervace', 'data'],
    ],
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    pattern: /newsletter|odber/,
    items: [
      ['Text výzvy k odběru', 'text'],
      ['Služba pro rozesílku (např. Ecomail, MailerLite) a přístupy', 'data'],
    ],
  },
  {
    key: 'contact',
    label: 'Kontakt',
    pattern: /kontakt|contact|formular/,
    items: [
      ['Telefon, e-mail, adresa, otevírací doba', 'data'],
      ['E-mail, kam chodí zprávy z formuláře', 'data'],
    ],
  },
];

const HERO = SECTION_DEFS.find((d) => d.key === 'hero')!;
const CONTACT = SECTION_DEFS.find((d) => d.key === 'contact')!;
const defOf = (key: string) => SECTION_DEFS.find((d) => d.key === key)!;

interface WantedSection {
  key: string;
  label: string;
}

/** Maps what the client typed to known sections; unknown labels survive as custom ones. */
function parseWanted(raw: string[]): WantedSection[] {
  const seen = new Set<string>();
  const result: WantedSection[] = [];

  for (const entry of raw) {
    const text = norm(entry);
    const def = SECTION_DEFS.find((d) => d.pattern.test(text));
    const key = def?.key ?? `custom:${text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ key, label: def ? def.label : humanize(entry) });
  }
  return result;
}

/* --- Who supplies the texts ------------------------------------------------ */

function textSource(hasCopywriting: boolean, hasContent: string): ContentSource {
  if (hasCopywriting) return 'us';
  if (hasContent === 'yes') return 'client';
  return 'tbd';
}

function describeContent(hasCopywriting: boolean, hasContent: string): string {
  if (hasCopywriting) {
    return 'Texty píšeme my (doplněk Copywriting) — klient dodá fakta, ceny, reference a fotky.';
  }
  if (hasContent === 'yes') return 'Klient má texty i fotky hotové a dodá je. Copywriting v balíčku není.';
  if (hasContent === 'partial') {
    return 'Klient má podklady jen částečně a copywriting není v balíčku — před startem dohodnout, kdo doplní zbytek textů.';
  }
  if (hasContent === 'no') {
    return 'Klient texty nemá a copywriting není v balíčku — před startem dohodnout, kdo je napíše (nabídnout doplněk Copywriting).';
  }
  return 'Není známo, zda klient má texty. Copywriting v balíčku není — ověřit.';
}

function sectionFromDef(
  def: SectionDef | null,
  label: string,
  ctx: { copy: boolean; hasContent: string },
  extra: Array<[string, ItemKind]> = []
): BriefSection {
  const items = def ? def.items : [['Obsah sekce (texty, případně fotky)', 'text'] as [string, ItemKind]];
  return {
    name: label,
    content: [...items, ...extra].map(([what, kind]) => ({
      what,
      source: kind === 'text' ? textSource(ctx.copy, ctx.hasContent) : 'client',
    })),
  };
}

/** A section whose content is lifted from another page — nothing for the client to deliver. */
const derivedSection = (name: string, what: string): BriefSection => ({
  name,
  content: [{ what, source: 'us' }],
});

/* --- Sitemap --------------------------------------------------------------- */

interface Ctx {
  kind: TierKind;
  copy: boolean;
  hasContent: string;
  addonIds: string[];
  mainAction: string;
}

const hasAddon = (ctx: Pick<Ctx, 'addonIds'>, id: string) => ctx.addonIds.includes(id);

const hasLanguage = (addonIds: string[]) => addonIds.some((id) => id.startsWith('addon-language'));

function buildLanding(wanted: WantedSection[], ctx: Ctx, suggested: boolean): BriefPage[] {
  const keys = wanted.map((w) => w.key);
  const defaults = ['services', 'about', 'testimonials'];
  const list: WantedSection[] = suggested
    ? defaults.map((key) => ({ key, label: defOf(key).label }))
    : wanted.filter((w) => w.key !== 'blog' && w.key !== 'booking');

  const sections: WantedSection[] = [];
  if (!keys.includes('hero')) sections.push({ key: 'hero', label: HERO.label });
  sections.push(...list.filter((w) => w.key !== 'contact'));
  sections.push({ key: 'contact', label: 'Kontakt a formulář' });

  const extraForContact: Array<[string, ItemKind]> = hasAddon(ctx, 'addon-booking-external')
    ? [['Odkaz na externí rezervační systém (tlačítko nebo vložený widget)', 'data']]
    : [];

  return [
    {
      title: 'Landing page',
      path: '/',
      purpose: `Jediná stránka, která návštěvníka dovede k akci: ${ctx.mainAction}.`,
      suggested: false,
      sections: sections.map((w) => {
        const def = SECTION_DEFS.find((d) => d.key === w.key) ?? null;
        return sectionFromDef(def, w.label, ctx, w.key === 'contact' ? extraForContact : []);
      }),
    },
  ];
}

interface PageSpec {
  key: string;
  title: string;
  path: string;
  purpose: string;
  sections: string[];
}

const PAGE_SPECS: Record<string, PageSpec> = {
  about: {
    key: 'about',
    title: 'O nás',
    path: '/o-nas',
    purpose: 'Vzbudit důvěru: kdo firma je a čím se liší.',
    sections: ['about', 'team'],
  },
  services: {
    key: 'services',
    title: 'Služby',
    path: '/sluzby',
    purpose: 'Přehled toho, co klient nabízí, s výzvou k poptávce.',
    sections: ['services', 'process'],
  },
  portfolio: {
    key: 'portfolio',
    title: 'Portfolio',
    path: '/portfolio',
    purpose: 'Důkaz kvality na konkrétních realizacích.',
    sections: ['portfolio'],
  },
  testimonials: {
    key: 'testimonials',
    title: 'Reference',
    path: '/reference',
    purpose: 'Sociální důkaz — co říkají zákazníci.',
    sections: ['testimonials'],
  },
  pricing: {
    key: 'pricing',
    title: 'Ceník',
    path: '/cenik',
    purpose: 'Odpovědět na otázku „kolik to stojí“ dřív, než ji návštěvník položí telefonem.',
    sections: ['pricing'],
  },
  faq: {
    key: 'faq',
    title: 'Časté dotazy',
    path: '/faq',
    purpose: 'Odstranit námitky a podpořit SEO/GEO přímými odpověďmi.',
    sections: ['faq'],
  },
  blog: {
    key: 'blog',
    title: 'Blog',
    path: '/blog',
    purpose: 'Výpis článků a detail článku, spravované přes CMS editor.',
    sections: ['blog'],
  },
  booking: {
    key: 'booking',
    title: 'Rezervace',
    path: '/rezervace',
    purpose: 'Online rezervace termínů přímo na webu.',
    sections: ['booking'],
  },
  contact: {
    key: 'contact',
    title: 'Kontakt',
    path: '/kontakt',
    purpose: 'Usnadnit spojení: formulář, údaje, mapa.',
    sections: ['contact'],
  },
};

function pageFromSpec(spec: PageSpec, ctx: Ctx, wantedLabels: Map<string, string>, suggested: boolean): BriefPage {
  const extras: Record<string, Array<[string, ItemKind]>> = {
    contact: [['Adresa pro mapu', 'data']],
  };
  if (spec.key === 'contact' && hasAddon(ctx, 'addon-booking-external')) {
    extras.contact.push(['Odkaz na externí rezervační systém', 'data']);
  }
  return {
    title: spec.title,
    path: spec.path,
    purpose: spec.purpose,
    suggested,
    sections: spec.sections
      // A page's own section always shows; secondary ones only if the client asked.
      .filter((key, i) => i === 0 || wantedLabels.has(key))
      .map((key) => sectionFromDef(defOf(key), defOf(key).label, ctx, i0(extras, spec.key, key))),
  };
}

/** Extras attach to the page's primary section only. */
const i0 = (extras: Record<string, Array<[string, ItemKind]>>, pageKey: string, sectionKey: string) =>
  pageKey === sectionKey ? extras[pageKey] ?? [] : [];

function buildHome(
  wanted: WantedSection[],
  pageKeys: string[],
  ctx: Ctx
): BriefPage {
  const sections: BriefSection[] = [sectionFromDef(HERO, HERO.label, ctx)];

  if (pageKeys.includes('services')) {
    sections.push(derivedSection('Přehled služeb', 'Výběr 3–6 hlavních služeb z podstránky Služby s odkazy'));
  }
  if (pageKeys.includes('about')) {
    sections.push(derivedSection('O nás (náhled)', 'Zkrácená verze textu z podstránky O nás'));
  }

  // Wanted sections that have no page of their own live on the home page.
  for (const w of wanted) {
    const hasOwnPage = pageKeys.includes(w.key) || ['hero', 'contact', 'services', 'about'].includes(w.key);
    if (hasOwnPage || w.key === 'blog' || w.key === 'booking') continue;
    const def = SECTION_DEFS.find((d) => d.key === w.key) ?? null;
    sections.push(sectionFromDef(def, w.label, ctx));
  }

  sections.push(derivedSection('Výzva ke kontaktu', `Závěrečná výzva k akci (${ctx.mainAction}) s odkazem na Kontakt`));

  return {
    title: 'Domů',
    path: '/',
    purpose: `Rozcestník: do pár vteřin říct, co firma dělá, a vést k akci: ${ctx.mainAction}.`,
    suggested: false,
    sections,
  };
}

function buildMultiPage(wanted: WantedSection[], ctx: Ctx, suggested: boolean): BriefPage[] {
  const pageable = ['about', 'services', 'portfolio', 'testimonials', 'pricing', 'faq', 'blog', 'booking', 'contact'];
  const wantedKeys = wanted.map((w) => w.key);
  const wantedLabels = new Map(wanted.map((w) => [w.key, w.label]));

  // Which sections get a page of their own depends on the package.
  const ownPage = (key: string): boolean => {
    if (!pageable.includes(key)) return false;
    if (key === 'faq' || key === 'testimonials') return ctx.kind === 'standard';
    if (key === 'booking') return ctx.kind === 'standard' || hasAddon(ctx, 'addon-booking');
    if (key === 'blog') return ctx.kind !== 'landing';
    return true;
  };

  const requested = suggested ? ['about', 'services'] : wantedKeys;
  const keys: string[] = [];
  const added = new Set<string>();
  const push = (key: string, isAdded: boolean) => {
    if (keys.includes(key)) return;
    keys.push(key);
    if (isAdded) added.add(key);
  };

  for (const key of requested) if (ownPage(key)) push(key, suggested);
  // Contact is always needed; blog ships with both multi-page packages.
  push('contact', suggested ? false : !wantedKeys.includes('contact'));
  push('blog', suggested ? false : !wantedKeys.includes('blog'));
  // Standard ships a booking system; elsewhere only a purchased add-on earns a page.
  if (ctx.kind === 'standard' || hasAddon(ctx, 'addon-booking')) {
    push('booking', !wantedKeys.includes('booking') && !suggested);
  }

  const pages: BriefPage[] = [];
  const order = ['about', 'services', 'portfolio', 'testimonials', 'pricing', 'faq', 'blog', 'booking', 'contact'];
  const sorted = [...keys].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  const stdFill: string[] = ['about', 'services', 'testimonials', 'pricing', 'faq', 'portfolio'];
  if (ctx.kind === 'standard') {
    // 10+ pages: home + the pages above + service details + legal.
    for (const key of stdFill) if (!sorted.includes(key)) {
      sorted.push(key);
      added.add(key);
    }
    sorted.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }

  const homeKeys = sorted;
  pages.push(buildHome(wanted, homeKeys, ctx));

  for (const key of sorted) {
    const spec = PAGE_SPECS[key];
    pages.push(pageFromSpec(spec, ctx, wantedLabels, added.has(key)));

    if (key === 'services' && ctx.kind === 'standard') {
      for (let n = 1; n <= 3; n++) {
        pages.push({
          title: `Detail služby ${n}`,
          path: `/sluzby/sluzba-${n}`,
          purpose: 'Samostatná stránka jedné hlavní služby (cíl pro vyhledávání konkrétní služby).',
          suggested: true,
          sections: [
            sectionFromDef(null, 'Popis služby', ctx, [
              ['Co služba zahrnuje, pro koho je, jak probíhá', 'text'],
              ['Fotky ke službě', 'media'],
            ]),
            sectionFromDef(null, 'Cena a výzva k akci', ctx, [['Cena nebo „od“ cena', 'data']]),
          ],
        });
      }
    }
  }

  if (ctx.kind === 'standard') {
    pages.push({
      title: 'Zásady ochrany osobních údajů a cookies',
      path: '/ochrana-osobnich-udaju',
      purpose: 'Právní minimum kvůli kontaktnímu formuláři a analytice.',
      suggested: true,
      sections: [
        {
          name: 'Zásady a cookies',
          content: [
            { what: 'Šablonu připravíme my, klient doplní identifikaci správce (firma, IČO, sídlo)', source: 'us' },
          ],
        },
      ],
    });
  }

  return pages;
}

/* --- Features -------------------------------------------------------------- */

const ADDON_NOTES: Array<[prefix: string, note: string]> = [
  ['addon-blog', 'Výpis článků, detail článku a editor v CMS; klient dodá první články nebo je napíšeme (Copywriting).'],
  ['addon-booking-external', 'Tlačítko nebo widget na externí rezervační systém; klient dodá odkaz / embed kód.'],
  ['addon-booking', 'Rezervační systém na webu: služby, kalendář, potvrzovací e-maily.'],
  ['addon-payments', 'Platba kartou; před startem ověřit s klientem platební bránu a získat přístupy.'],
  ['addon-language', 'Druhá jazyková verze; překlady dodá klient, pokud není zakoupen Copywriting.'],
  ['addon-copywriting', 'Texty na web píšeme my z faktů, která dodá klient.'],
  ['addon-maintenance', 'Roční údržba a podpora po spuštění — nemění rozsah stavby webu.'],
];

type Capability = (kind: TierKind, addonIds: string[]) => { status: FeatureStatus; note?: string };

const has = (addonIds: string[], id: string) => addonIds.includes(id);

const CAPABILITIES: Array<{ pattern: RegExp; cap: Capability }> = [
  {
    pattern: /e-?shop|obchod|kosik|prodej/,
    cap: () => ({ status: 'out', note: 'e-shop není součástí žádného balíčku' }),
  },
  {
    pattern: /plat(ba|by|ebn)|kartou|stripe|gopay/,
    cap: (kind, ids) =>
      has(ids, 'addon-payments')
        ? { status: 'addon' }
        : kind === 'landing'
          ? { status: 'out', note: 'platby nejsou pro Landing page dostupné' }
          : { status: 'out', note: 'jen s doplňkem Online platby kartou' },
  },
  {
    pattern: /rezerv|booking|objednav|kalendar/,
    cap: (kind, ids) => {
      if (kind === 'standard') return { status: 'included', note: 'rezervační systém je součástí balíčku' };
      if (has(ids, 'addon-booking') || has(ids, 'addon-booking-external')) return { status: 'addon' };
      return kind === 'landing'
        ? { status: 'out', note: 'jen odkaz na externí systém, a to s doplňkem' }
        : { status: 'out', note: 'jen s doplňkem Rezervační systém' };
    },
  },
  {
    pattern: /blog|clanky|novink/,
    cap: (kind, ids) =>
      kind !== 'landing'
        ? { status: 'included' }
        : has(ids, 'addon-blog')
          ? { status: 'addon' }
          : { status: 'out', note: 'Landing page nemá blog bez doplňku' },
  },
  {
    pattern: /jazyk|jazycn|anglick|preklad|multilang/,
    cap: (_kind, ids) =>
      hasLanguage(ids) ? { status: 'addon' } : { status: 'out', note: 'jen s doplňkem Druhý jazyk webu' },
  },
  {
    pattern: /newsletter|mailing|e-?mail marketing/,
    cap: (kind) =>
      kind === 'standard' ? { status: 'included' } : { status: 'out', note: 'newsletter je jen ve Standardním webu' },
  },
  {
    pattern: /animac/,
    cap: (kind) =>
      kind === 'standard' ? { status: 'included' } : { status: 'out', note: 'pokročilé animace jen ve Standardním webu' },
  },
  {
    pattern: /\bcms\b|sprava obsahu|editor/,
    cap: (kind) =>
      kind === 'standard'
        ? { status: 'included', note: 'full CMS' }
        : kind === 'basic'
          ? { status: 'check', note: 'CMS je jen pro blog' }
          : { status: 'out', note: 'Landing page je bez CMS' },
  },
  {
    pattern: /socialn|facebook|instagram/,
    cap: (kind) =>
      kind === 'landing' ? { status: 'check', note: 'v balíčku není, stačí odkazy v patičce' } : { status: 'included' },
  },
  {
    pattern: /analytic|google ads|pixel|\bgtm\b/,
    cap: () => ({ status: 'included', note: 'Google Analytics; pixely a reklamní tagy ověřit' }),
  },
  { pattern: /formular|kontakt|mapa/, cap: () => ({ status: 'included' }) },
  { pattern: /galeri|fotk|portfolio|reference|recenz/, cap: () => ({ status: 'included', note: 'jako sekce webu' }) },
];

function buildFeatures(lead: BriefLead, kind: TierKind | null, addonIds: string[]): BriefFeature[] {
  const result: BriefFeature[] = [];

  if (kind) {
    for (const name of TIER_INCLUDES[kind]) result.push({ name, status: 'included' });
  }

  for (const addon of lead.configuration?.addons ?? []) {
    const note = ADDON_NOTES.find(([prefix]) => addon.id === prefix || addon.id.startsWith(`${prefix}-`))?.[1];
    result.push({ name: `${addon.name} (${addon.hours} h)`, status: 'addon', note });
  }

  for (const raw of strings(lead.features)) {
    const text = norm(raw);
    const match = kind ? CAPABILITIES.find((c) => c.pattern.test(text)) : null;
    if (match && kind) {
      const { status, note } = match.cap(kind, addonIds);
      // Already listed as package inclusion or purchased add-on; only the problems are news.
      if (status === 'included' || status === 'addon') continue;
      result.push({ name: humanize(raw), status, note });
    } else {
      result.push({
        name: humanize(raw),
        status: 'check',
        note: kind ? 'nepokryto jednoznačně balíčkem' : 'balíček není vybrán',
      });
    }
  }

  return result;
}

/* --- Out of scope ---------------------------------------------------------- */

function buildOutOfScope(kind: TierKind | null, addonIds: string[]): string[] {
  if (!kind) return [];
  const items: string[] = [];
  const unless = (addonId: string | string[], text: string) => {
    const ids = Array.isArray(addonId) ? addonId : [addonId];
    if (!ids.some((id) => addonIds.some((a) => a === id || a.startsWith(`${id}-`)))) items.push(text);
  };

  if (kind === 'landing') {
    items.push('Podstránky — web je jedna stránka (3–5 sekcí)');
    unless('addon-blog', 'Blog (jen s doplňkem Blog s CMS editorem)');
    unless(['addon-booking-external'], 'Rezervační systém; s doplňkem jen odkaz na externí systém');
    items.push('CMS pro správu obsahu', 'Pokročilé SEO (v balíčku jsou jen základy)', 'Newsletter', 'Pokročilé animace');
  } else if (kind === 'basic') {
    items.push('Více než 5 podstránek');
    unless(['addon-booking', 'addon-booking-external'], 'Rezervační systém (jen s doplňkem)');
    items.push(
      'Newsletter',
      'Premium design na míru a pokročilé animace',
      'Plné CMS pro celý web — CMS je jen pro blog'
    );
  } else {
    unless('addon-booking-external', 'Napojení na externí rezervační nástroje (Reservio, Notino…), pokud je nechce klient místo vestavěného systému');
    items.push('Drobné úpravy po spuštění nad 2 hodiny zdarma — dál se účtují zvlášť');
  }

  if (kind !== 'landing') unless('addon-payments', 'Online platby kartou (jen s doplňkem)');
  else items.push('Online platby kartou');
  unless('addon-language', 'Druhá jazyková verze (jen s doplňkem)');
  unless('addon-copywriting', 'Psaní textů — texty dodává klient (copywriting je doplněk)');
  items.push(
    'E-shop, košík a správa produktů',
    'Vlastní aplikace, uživatelské účty a přihlašování',
    'Tvorba loga a brandingu, profesionální focení',
    'Správa reklamních kampaní (Google Ads, Meta)'
  );

  return items;
}

/* --- Design, SEO, questions ------------------------------------------------ */

function buildDesign(lead: BriefLead): BriefRow[] {
  const prefs = lead.designPreferences ?? {};
  const colors = prefs.colors ?? {};
  const rows: BriefRow[] = [];

  const colorParts = [
    colors.primary && `hlavní ${colors.primary}`,
    colors.secondary && `doplňková ${colors.secondary}`,
    colors.accent && `akcent ${colors.accent}`,
  ].filter(Boolean) as string[];

  if (colorParts.length) rows.push(['Barvy', colorParts.join(', ')]);
  else if (colors.noPreference) rows.push(['Barvy', 'bez preference — navrhneme my (z loga, pokud existuje)']);

  if (clean(prefs.style)) rows.push(['Styl', humanize(clean(prefs.style))]);
  if (clean(prefs.inspiration)) rows.push(['Inspirace', clean(prefs.inspiration)]);
  const must = strings(prefs.mustHave);
  if (must.length) rows.push(['Nesmí chybět', must.map(humanize).join(', ')]);
  if (clean(prefs.expectations)) rows.push(['Očekávání', clean(prefs.expectations)]);
  return rows;
}

function buildSeo(kind: TierKind | null, lead: BriefLead, hasFaq: boolean): string[] {
  const local = Boolean(clean(lead.address));
  const items = [
    'Unikátní title (do 60 znaků) a meta description (do 155) pro každou stránku, jeden H1 na stránku',
    `Schema.org ${local ? 'LocalBusiness' : 'Organization'} (název, logo, kontakt${local ? ', adresa, otevírací doba' : ''})`,
    hasFaq
      ? 'FAQ sekce se schématem FAQPage — krátké přímé odpovědi (využijí i AI vyhledávače)'
      : 'Alespoň krátká FAQ sekce se schématem FAQPage (využijí i AI vyhledávače)',
    'sitemap.xml, robots.txt a soubor llms.txt',
    'Open Graph náhled, alt texty obrázků, obrázky ve WebP',
    'Klíčová slova a meta texty vycházejí z pole „Klíčová slova & SEO“ v úkolu',
  ];
  if (kind === 'landing' || kind === 'standard') items.push('Google Analytics 4');
  return items;
}

function buildQuestions(lead: BriefLead, kind: TierKind | null, brief: {
  sitemapSuggested: boolean;
  sitemap: BriefPage[];
  features: BriefFeature[];
  design: BriefRow[];
}): string[] {
  const q: string[] = [];
  const details = lead.projectDetails ?? {};

  if (!lead.configuration && !kind) {
    q.push('Není vybrán balíček — potvrdit s klientem rozsah (Landing page / Základní / Standardní web), než se začne stavět.');
  }
  if (lead.projectType === 'eshop') {
    q.push('Klient poptává e-shop, který balíčky nepokrývají — vrátit obchodníkovi k nacenění zvlášť.');
  }
  if (brief.sitemapSuggested) q.push('Klient nezadal požadované sekce — celá sitemapa je návrh, odsouhlasit s klientem.');
  if (!clean(details.hasContent)) q.push('Má klient hotové texty a fotky? (určuje, kdo píše obsah)');
  if (!clean(details.purpose)) q.push('Jaký je hlavní cíl webu?');
  if (!clean(details.targetAudience)) q.push('Pro koho je web určen (cílová skupina)?');
  if (brief.design.length === 0) q.push('Má klient logo, firemní barvy nebo vzory webů, které se mu líbí?');
  if (!clean(lead.phone) && !clean(lead.address)) q.push('Kontaktní údaje na web: telefon, adresa, otevírací doba.');
  if (strings(lead.socialMedia).length === 0 && kind && kind !== 'landing') {
    q.push('Odkazy na sociální sítě klienta, které se mají propojit.');
  }
  q.push('Doména a hosting: kdo je vlastní a kdo dodá přístup k DNS?');

  if (kind === 'landing') {
    const count = brief.sitemap[0]?.sections.length ?? 0;
    if (count > 5) q.push(`Sitemapa má ${count} sekcí, Landing page počítá s 3–5 — zkrátit, nebo nabídnout větší balíček.`);
  }
  if (kind === 'basic') {
    const subpages = brief.sitemap.filter((p) => p.path !== '/' && p.path !== '/blog').length;
    if (subpages > 5) q.push(`Sitemapa má ${subpages} podstránek bez blogu, Základní web počítá s 3–5 — sloučit, nebo nabídnout Standardní web.`);
  }
  for (const feature of brief.features) {
    if (feature.status === 'out') q.push(`Klient chce „${feature.name}“, ale není v balíčku (${feature.note ?? 'mimo rozsah'}) — řešit s obchodníkem před realizací.`);
    if (feature.status === 'check') q.push(`Požadovaná funkce „${feature.name}“ — ověřit, zda spadá do balíčku.`);
  }

  return q;
}

/* --- Entry points ---------------------------------------------------------- */

export function buildLeadBrief(lead: BriefLead): LeadBrief {
  const config = lead.configuration ?? null;
  const kind = tierKind(lead);
  const addons = config?.addons ?? [];
  const addonIds = addons.map((a) => a.id);
  const copy = addonIds.includes('addon-copywriting');
  const details = lead.projectDetails ?? {};
  const hasContent = clean(details.hasContent);
  const client = clean(lead.company) || clean(lead.name) || clean(lead.email) || 'Klient';
  const mainActions = strings(details.mainActions);

  const header: BriefRow[] = [];
  const push = (label: string, value: unknown) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (text) header.push([label, text]);
  };

  push('Klient', [clean(lead.name), clean(lead.company) && `(${clean(lead.company)})`, clean(lead.ico) && `IČO ${clean(lead.ico)}`].filter(Boolean).join(' '));
  push('Kontakt', [clean(lead.email), clean(lead.phone)].filter(Boolean).join(', '));
  push('Stávající web', clean(lead.existingWebsite) || (lead.audits?.[0]?.url ?? ''));
  push('Typ projektu', humanize(clean(lead.projectTypeOther) || clean(lead.projectType)));
  if (config?.tierName) {
    push('Balíček', config.tierName);
    push('Doplňky', addons.length ? addons.map((a) => `${a.name} (${a.hours} h)`).join(', ') : 'bez doplňků');
    if (config.totalHours) push('Rozpočet hodin', `${config.totalHours} h`);
    if (config.deliveryDays) push('Dodání', `${config.deliveryDays} dní`);
    if (typeof config.supportMonths === 'number' && config.supportMonths > 0) {
      push('Podpora po spuštění', supportMonthsLabel(config.supportMonths));
    }
    if (config.totalPrice) push('Cena', `${formatCzk(Number(config.totalPrice))} Kč`);
  }
  push('Rozpočet klienta', humanize(clean(lead.budgetRange)));
  push('Termín klienta', humanize(clean(lead.timeline)));

  const clientInput: BriefRow[] = [];
  const pushInput = (label: string, value: string) => value && clientInput.push([label, value]);
  pushInput('Zpráva klienta', clean(lead.businessDescription));
  pushInput('Cíl projektu', clean(lead.projectGoal) || clean(details.purpose));
  pushInput('Cílová skupina', clean(details.targetAudience));
  pushInput('Co má návštěvník udělat', mainActions.map(humanize).join(', '));
  pushInput('Poznámka k obsahu', clean(details.contentNotes));
  pushInput('Další požadavky', clean(lead.additionalRequirements));

  const contentNote = describeContent(copy, hasContent);

  let sitemap: BriefPage[] = [];
  let sitemapSuggested = false;
  let sitemapNote: string | null = null;

  if (kind) {
    const wanted = parseWanted(strings(details.sections));
    sitemapSuggested = wanted.length === 0;
    const ctx: Ctx = {
      kind,
      copy,
      hasContent,
      addonIds,
      mainAction: mainActions.length ? mainActions.map(humanize).join(' / ') : 'poptávka přes kontakt',
    };
    sitemap =
      kind === 'landing'
        ? buildLanding(wanted, ctx, sitemapSuggested)
        : buildMultiPage(wanted, ctx, sitemapSuggested);
  } else {
    sitemapNote = 'Bez vybraného balíčku nejde určit rozsah webu, proto sitemapa chybí. Nejdřív potvrdit balíček s klientem.';
  }

  const features = buildFeatures(lead, kind, addonIds);
  const design = buildDesign(lead);
  const hasFaq = sitemap.some((p) => p.sections.some((s) => s.name === defOf('faq').label));

  const partial = { sitemapSuggested, sitemap, features, design };

  return {
    title: `${config?.tierName ?? (humanize(clean(lead.projectType)) || 'Web')}: ${client}`,
    header,
    clientInput,
    contentNote,
    sitemapSuggested,
    sitemap,
    sitemapNote,
    features,
    design,
    seo: buildSeo(kind, lead, hasFaq),
    outOfScope: buildOutOfScope(kind, addonIds),
    openQuestions: buildQuestions(lead, kind, partial),
  };
}

const rowsToMarkdown = (rows: BriefRow[]) => rows.map(([label, value]) => `- **${label}:** ${value}`).join('\n');

export function briefToMarkdown(brief: LeadBrief): string {
  const out: string[] = [`# Brief: ${brief.title}`];

  out.push('## Zakázka', rowsToMarkdown(brief.header) || '- Bez údajů');
  if (brief.clientInput.length) out.push('## Zadání od klienta', rowsToMarkdown(brief.clientInput));

  out.push('## Sitemapa');
  if (brief.sitemapNote) {
    out.push(brief.sitemapNote);
  } else {
    out.push(`**Texty a podklady:** ${brief.contentNote}`);
    if (brief.sitemapSuggested) {
      out.push('> Návrh — ověřit s klientem. Klient nezadal sekce, struktura vychází z typu balíčku.');
    }
    brief.sitemap.forEach((page, index) => {
      out.push(`### ${index + 1}. ${page.title} (${page.path})${page.suggested ? ' — návrh, ověřit s klientem' : ''}`);
      out.push(`**Účel:** ${page.purpose}`);
      page.sections.forEach((section, i) => {
        const lines = section.content.map((c) => `- ${c.what} — ${SOURCE_LABELS[c.source]}`);
        out.push(`**${i + 1}. ${section.name}**\n${lines.join('\n')}`);
      });
    });
  }

  if (brief.features.length) {
    out.push(
      '## Funkce a integrace',
      brief.features
        .map((f) => `- ${f.name} — ${FEATURE_STATUS_LABELS[f.status]}${f.note ? ` (${f.note})` : ''}`)
        .join('\n')
    );
  }

  out.push('## Design', rowsToMarkdown(brief.design) || '- Klient nic neuvedl — navrhneme sami a necháme schválit.');
  out.push('## SEO a GEO (u každého webu)', brief.seo.map((s) => `- ${s}`).join('\n'));

  if (brief.outOfScope.length) {
    out.push('## Mimo rozsah (nedělat, nezahrnuto v balíčku)', brief.outOfScope.map((s) => `- ${s}`).join('\n'));
  }
  if (brief.openQuestions.length) {
    out.push('## Otevřené otázky pro klienta', brief.openQuestions.map((s) => `- ${s}`).join('\n'));
  }

  return out.join('\n\n');
}

export const buildLeadBriefMarkdown = (lead: BriefLead): string => briefToMarkdown(buildLeadBrief(lead));
