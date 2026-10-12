/**
 * What to ask on a consultation call, in the order to ask it.
 *
 * The call has to end with everything needed to quote and build a website.
 * Each step is one topic; each question carries the words to say (`ask`) and
 * the short label the recap files the answer under. Nothing here is saved
 * anywhere else — the recap, the "still missing" list and the copy sent to the
 * enquiry's own fields are all derived from this list.
 */
export type Answer = string | string[];
export type Answers = Record<string, Answer>;

export interface Question {
  id: string;
  /** Short label, used in the recap. */
  label: string;
  /** What to say to the client. */
  ask: string;
  /**
   * The same question as the client reads it when filling the questionnaire
   * alone. A question without it is asked on the call only.
   */
  client?: string;
  type: 'text' | 'long' | 'choice' | 'multi';
  options?: string[];
  /** Options that come from the live price list instead of this file. */
  optionsFrom?: 'packages' | 'addons';
  placeholder?: string;
  /** Without it the site cannot be quoted or built; listed under "chybí doplnit". */
  required?: boolean;
}

export interface Step {
  id: string;
  title: string;
  /** What this part of the call is for. */
  intro: string;
  /** Detail for after the client says yes — never counted as missing. */
  later?: boolean;
  questions: Question[];
}

/** Choices read from the price list, so the questionnaire never quotes a stale offer. */
export interface OfferOptions {
  packages: string[];
  addons: string[];
}

export const optionsOf = (q: Question, offer: OfferOptions): string[] =>
  q.optionsFrom ? offer[q.optionsFrom] : (q.options ?? []);

/**
 * Twelve things are enough to quote a website; the call used to walk through
 * forty-nine. The first six steps are those twelve plus what the client would
 * tell us anyway. Everything else waits in the last step until there is a deal.
 */
export const STEPS: Step[] = [
  {
    id: 'firma',
    title: 'Firma a kontakt',
    intro: 'S kým mluvíte a čím se firma zabývá. Co už víme z poptávky, je předvyplněné.',
    questions: [
      { id: 'contactName', label: 'Kontaktní osoba', ask: 'S kým mám tu čest? Jste ten, kdo o webu rozhoduje?', client: 'Vaše jméno', type: 'text', required: true },
      { id: 'company', label: 'Firma', ask: 'Jak se firma přesně jmenuje?', client: 'Název firmy', type: 'text' },
      { id: 'phone', label: 'Telefon', ask: 'Na jakém čísle vás nejlíp zastihnu?', client: 'Telefon', type: 'text', required: true },
      { id: 'email', label: 'E-mail', ask: 'Na jaký e-mail vám mám poslat shrnutí a nabídku?', client: 'E-mail', type: 'text', required: true },
      { id: 'about', label: 'Čím se firma zabývá', ask: 'Řekněte mi jednou dvěma větami, co děláte a pro koho.', client: 'Čím se zabýváte? Stačí dvě věty.', type: 'long', required: true },
      { id: 'existingWebsite', label: 'Stávající web', ask: 'Máte teď nějaký web? Na jaké adrese?', client: 'Máte už web? Napište adresu, nebo „nemám“.', type: 'text', placeholder: 'www… nebo „nemá“' },
    ],
  },
  {
    id: 'cil',
    title: 'Cíl webu',
    intro: 'Proč web chtějí a co má přinést. Od tohohle se odvíjí všechno ostatní.',
    questions: [
      { id: 'goal', label: 'Co má web přinést', ask: 'Co by vám měl web hlavně přinést?', client: 'Co má web hlavně přinést?', type: 'multi', required: true, options: ['Poptávky a telefonáty', 'Rezervace nebo objednávky online', 'Prodej zboží (e-shop)', 'Být vidět na Googlu', 'Představit firmu a působit důvěryhodně', 'Ukázat reference a hotovou práci', 'Nahradit zastaralý web'] },
      { id: 'audience', label: 'Zákazníci', ask: 'Kdo jsou vaši typičtí zákazníci? Firmy, nebo lidé? Odkud?', client: 'Kdo jsou vaši zákazníci? Firmy, nebo lidé? Odkud?', type: 'long', required: true },
    ],
  },
  {
    id: 'rozsah',
    title: 'Rozsah a funkce',
    intro: 'Jaké stránky a co má web umět. Balíček a funkce navíc jsou z našeho ceníku.',
    questions: [
      { id: 'pages', label: 'Stránky', ask: 'Jaké stránky na webu potřebujete? Projdu vám obvyklé a řeknete mi, které ano.', client: 'Jaké stránky na webu chcete?', type: 'multi', required: true, options: ['Úvod', 'O nás', 'Služby', 'Ceník', 'Reference / realizace', 'Galerie', 'Recenze', 'Blog / novinky', 'Časté otázky', 'Kontakt'] },
      { id: 'budget', label: 'Balíček', ask: 'Podle toho, co říkáte, by vám sedělo… (navrhněte balíček z ceníku a ověřte si ho).', client: 'Který balíček vám nejvíc sedí?', type: 'choice', required: true, optionsFrom: 'packages' },
      { id: 'features', label: 'Funkce navíc', ask: 'Hodila by se vám některá z těchhle funkcí navíc?', client: 'Chcete některou funkci navíc?', type: 'multi', optionsFrom: 'addons' },
      { id: 'custom', label: 'Vlastní požadavky', ask: 'Je něco specifického, co web musí umět a zatím jsme to nezmínili?', client: 'Má web umět ještě něco, co jsme nezmínili?', type: 'long' },
    ],
  },
  {
    id: 'inspirace',
    title: 'Konkurence a inspirace',
    intro: 'S kým se budou srovnávat a co se jim líbí. Stačí odkazy.',
    questions: [
      { id: 'competitors', label: 'Konkurence', ask: 'Kdo je vaše hlavní konkurence? Stačí dva tři názvy nebo weby.', client: 'Kdo je vaše konkurence? Stačí názvy nebo odkazy na weby.', type: 'long' },
      { id: 'likes', label: 'Weby, které se líbí', ask: 'Je nějaký web, který se vám líbí? Klidně i z jiného oboru.', client: 'Weby, které se vám líbí. Stačí odkazy, klidně z jiného oboru.', type: 'long' },
    ],
  },
  {
    id: 'podklady',
    title: 'Podklady a doména',
    intro: 'Co už mají hotové a kde web poběží.',
    questions: [
      { id: 'materials', label: 'Hotové podklady', ask: 'Co z toho už máte hotové: logo, texty, fotky?', client: 'Co už máte připravené?', type: 'multi', options: ['Logo', 'Texty', 'Fotky', 'Zatím nic'] },
      { id: 'domain', label: 'Doména', ask: 'Máte už doménu? Jakou a u koho je registrovaná?', client: 'Máte doménu? Jakou?', type: 'text', required: true, placeholder: 'firma.cz u Wedosu / nemá' },
    ],
  },
  {
    id: 'dohoda',
    title: 'Termín a další krok',
    intro: 'Kdy má web běžet a na čem jste se domluvili. Další krok zapisujete vy, klient ho nevidí.',
    questions: [
      { id: 'launch', label: 'Kdy má web běžet', ask: 'Do kdy potřebujete mít web hotový? Je k tomu nějaký důvod, třeba sezóna nebo akce?', client: 'Do kdy web potřebujete?', type: 'text', required: true },
      { id: 'nextStep', label: 'Další krok', ask: 'Takže se domluvíme takhle: … Souhlasíte?', type: 'choice', required: true, options: ['Pošlu nabídku', 'Čekáme na podklady', 'Další hovor', 'Rozmyslí si to', 'Nemají zájem'] },
      { id: 'nextStepWhen', label: 'Termín dalšího kroku', ask: 'Kdy se vám mám ozvat / do kdy to pošlu?', type: 'text', required: true },
      { id: 'notes', label: 'Poznámky z hovoru', ask: '(Vaše poznámky: dojem z hovoru, na co si dát pozor.)', type: 'long' },
    ],
  },
  {
    id: 'pozdeji',
    title: 'Doplnit později',
    intro: 'Podrobnosti, které se řeší až při stavbě webu: vzhled, barvy, technika, fakturace. Nic z toho není potřeba k nacenění.',
    later: true,
    questions: [
      { id: 'ico', label: 'IČO', ask: 'Máte po ruce IČO? Budu ho potřebovat do nabídky a na fakturu.', type: 'text' },
      { id: 'industry', label: 'Obor', ask: 'Jak byste svůj obor pojmenovali?', type: 'text' },
      { id: 'area', label: 'Kde působí', ask: 'Působíte v jednom městě, v kraji, nebo po celé republice?', type: 'text' },
      { id: 'whyNow', label: 'Proč právě teď', ask: 'Proč to řešíte právě teď? Co se stalo nebo změnilo?', type: 'long' },
      { id: 'mainAction', label: 'Co má návštěvník udělat', ask: 'Když někdo na web přijde, co chcete, aby udělal? Zavolal, napsal, objednal?', type: 'text' },
      { id: 'acquisition', label: 'Odkud chodí zákazníci dnes', ask: 'Odkud k vám zákazníci chodí teď? Doporučení, Google, sociální sítě, reklama?', type: 'long' },
      { id: 'usp', label: 'Čím se liší od konkurence', ask: 'Proč by si měl zákazník vybrat vás a ne konkurenci?', type: 'long' },
      { id: 'projectType', label: 'Typ webu', ask: 'O jaký typ webu jde?', type: 'choice', options: ['Landing page (jedna stránka)', 'Základní web (3–5 podstránek)', 'Standardní web (10+ podstránek)', 'E-shop', 'Systém na míru (CRM, rezervace…)', 'Zatím není jasné'] },
      { id: 'pagesOther', label: 'Další stránky', ask: 'Napadá vás ještě nějaká stránka, kterou jsem nejmenoval?', type: 'text' },
      { id: 'servicesCount', label: 'Počet služeb / produktů', ask: 'Kolik služeb nebo produktů chcete na webu představit?', type: 'text' },
      { id: 'languages', label: 'Jazyky', ask: 'Stačí čeština, nebo potřebujete web i v dalším jazyce?', type: 'text', placeholder: 'čeština' },
      { id: 'selfEdit', label: 'Vlastní úpravy obsahu', ask: 'Chcete si texty a obrázky na webu měnit sami, nebo vám to budeme dělat my?', type: 'choice', options: ['Chtějí upravovat sami', 'Budeme upravovat my', 'Je jim to jedno'] },
      { id: 'integrations', label: 'Napojení na jiné systémy', ask: 'Používáte nějaký systém, na který má web navázat? Rezervace, účetnictví, sklad, CRM?', type: 'long' },
      { id: 'logo', label: 'Logo', ask: 'Máte logo? V jakém formátu?', type: 'choice', options: ['Má ve vektoru (SVG, AI, PDF)', 'Má jen jako obrázek', 'Nemá, potřebuje vytvořit'] },
      { id: 'texts', label: 'Texty', ask: 'Texty na web máte, nebo je máme napsat my?', type: 'choice', options: ['Dodají hotové', 'Dodají podklady, doladíme', 'Napíšeme my'] },
      { id: 'photos', label: 'Fotky', ask: 'Máte vlastní fotky provozovny, týmu a práce?', type: 'choice', options: ['Mají vlastní kvalitní', 'Mají, ale slabé', 'Nemají, použijeme fotobanku', 'Chtějí nafotit'] },
      { id: 'otherMaterials', label: 'Další podklady', ask: 'Máte ještě něco, co na web patří? Ceník, certifikáty, videa, reference?', type: 'long' },
      { id: 'materialsWho', label: 'Kdo dodá podklady', ask: 'Kdo nám podklady pošle a na koho se máme obracet?', type: 'text' },
      { id: 'materialsWhen', label: 'Kdy dodají podklady', ask: 'Do kdy byste nám podklady zvládli poslat?', type: 'text' },
      { id: 'style', label: 'Styl', ask: 'Jak má web působit? Řeknu pár slov a vyberte, co sedí.', type: 'multi', options: ['Moderní a čistý', 'Luxusní', 'Přátelský a osobní', 'Seriózní a firemní', 'Hravý a barevný', 'Minimalistický', 'Tradiční'] },
      { id: 'colors', label: 'Barvy', ask: 'Máte firemní barvy, nebo je máme navrhnout?', type: 'text' },
      { id: 'dislikes', label: 'Co nechtějí', ask: 'A je naopak něco, co na webu určitě nechcete?', type: 'long' },
      { id: 'domainAccess', label: 'Přístup k doméně', ask: 'Máte k doméně přístup vy, nebo ho má někdo jiný?', type: 'choice', options: ['Mají přístup sami', 'Má ho bývalý dodavatel', 'Nevědí', 'Doménu teprve koupí'] },
      { id: 'emails', label: 'E-maily na doméně', ask: 'Máte na doméně firemní e-maily? Ty musí při přechodu fungovat dál.', type: 'text' },
      { id: 'analytics', label: 'Měření a reklama', ask: 'Používáte Google Analytics, reklamu na Googlu nebo Facebooku, firemní profil na Googlu?', type: 'multi', options: ['Google Analytics', 'Google Ads', 'Reklama na Facebooku / Instagramu', 'Firemní profil na Googlu', 'Nic z toho'] },
      { id: 'decision', label: 'Kdo rozhoduje', ask: 'Rozhodujete o tom sami, nebo to ještě s někým proberete?', type: 'text' },
      { id: 'offer', label: 'Navržená cena', ask: 'Podle toho, co jste mi řekli, navrhuju… (řekněte orientační cenu).', type: 'long' },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = STEPS.flatMap((s) => s.questions);

/** What the client is asked when filling the questionnaire alone, in order. */
export const CLIENT_QUESTIONS: Question[] = ALL_QUESTIONS.filter((q) => q.client);

/** The client form refuses to send without these; the rest they may skip. */
export const CLIENT_REQUIRED = ['contactName', 'phone', 'about'];

export const isAnswered = (value: Answer | undefined): boolean =>
  Array.isArray(value) ? value.length > 0 : Boolean(value && value.trim());

export const answerText = (value: Answer | undefined): string =>
  Array.isArray(value) ? value.join(', ') : (value ?? '').trim();

export function progress(answers: Answers) {
  const required = ALL_QUESTIONS.filter((q) => q.required);
  const missing = required.filter((q) => !isAnswered(answers[q.id]));
  return {
    answered: ALL_QUESTIONS.filter((q) => isAnswered(answers[q.id])).length,
    total: ALL_QUESTIONS.length,
    requiredDone: required.length - missing.length,
    requiredTotal: required.length,
    missing,
  };
}

/** The recap as plain text: to read back, paste into an offer, or hand to whoever builds the site. */
export function recapMarkdown(answers: Answers, meta: { date?: string; by?: string } = {}): string {
  const title = answerText(answers.company) || answerText(answers.contactName) || 'Konzultace';
  const lines: string[] = [`# Rekapitulace konzultace: ${title}`];
  if (meta.date || meta.by) lines.push(`${[meta.date, meta.by ? `vedl(a) ${meta.by}` : ''].filter(Boolean).join(' · ')}`);
  for (const step of STEPS) {
    const rows = step.questions.filter((q) => isAnswered(answers[q.id]));
    if (rows.length === 0) continue;
    lines.push('', `## ${step.title}`);
    for (const q of rows) lines.push(`- **${q.label}:** ${answerText(answers[q.id]).replace(/\n+/g, ' / ')}`);
  }
  const { missing } = progress(answers);
  if (missing.length) {
    lines.push('', '## Chybí doplnit');
    for (const q of missing) lines.push(`- ${q.label}`);
  }
  return lines.join('\n');
}
