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
  type: 'text' | 'long' | 'choice' | 'multi';
  options?: string[];
  placeholder?: string;
  /** Without it the site cannot be quoted or built; listed under "chybí doplnit". */
  required?: boolean;
}

export interface Step {
  id: string;
  title: string;
  /** What this part of the call is for. */
  intro: string;
  questions: Question[];
}

export const STEPS: Step[] = [
  {
    id: 'firma',
    title: 'Firma a kontakt',
    intro: 'S kým mluvíte a čím se firma zabývá.',
    questions: [
      { id: 'contactName', label: 'Kontaktní osoba', ask: 'S kým mám tu čest? Jste ten, kdo o webu rozhoduje?', type: 'text', required: true },
      { id: 'company', label: 'Firma', ask: 'Jak se firma přesně jmenuje?', type: 'text', required: true },
      { id: 'phone', label: 'Telefon', ask: 'Na jakém čísle vás nejlíp zastihnu?', type: 'text', required: true },
      { id: 'email', label: 'E-mail', ask: 'Na jaký e-mail vám mám poslat shrnutí a nabídku?', type: 'text', required: true },
      { id: 'ico', label: 'IČO', ask: 'Máte po ruce IČO? Budu ho potřebovat do nabídky a na fakturu.', type: 'text' },
      { id: 'about', label: 'Čím se firma zabývá', ask: 'Řekněte mi jednou dvěma větami, co děláte a pro koho.', type: 'long', required: true },
      { id: 'industry', label: 'Obor', ask: 'Jak byste svůj obor pojmenovali?', type: 'text' },
      { id: 'area', label: 'Kde působí', ask: 'Působíte v jednom městě, v kraji, nebo po celé republice?', type: 'text' },
      { id: 'existingWebsite', label: 'Stávající web', ask: 'Máte teď nějaký web? Na jaké adrese?', type: 'text', placeholder: 'www… nebo „nemá“' },
    ],
  },
  {
    id: 'cil',
    title: 'Cíl webu',
    intro: 'Proč web chtějí a co má přinést. Od tohohle se odvíjí všechno ostatní.',
    questions: [
      { id: 'goal', label: 'Co má web přinést', ask: 'Co by vám měl web hlavně přinést?', type: 'multi', required: true, options: ['Poptávky a telefonáty', 'Rezervace nebo objednávky online', 'Prodej zboží (e-shop)', 'Být vidět na Googlu', 'Představit firmu a působit důvěryhodně', 'Ukázat reference a hotovou práci', 'Odlišit se od konkurence', 'Nahradit zastaralý web', 'Informovat stávající zákazníky', 'Sbírat kontakty (newsletter)', 'Nábor lidí', 'Méně dotazů po telefonu'] },
      { id: 'whyNow', label: 'Proč právě teď', ask: 'Proč to řešíte právě teď? Co se stalo nebo změnilo?', type: 'long' },
      { id: 'audience', label: 'Zákazníci', ask: 'Kdo jsou vaši typičtí zákazníci? Firmy, nebo lidé? Odkud?', type: 'long', required: true },
      { id: 'mainAction', label: 'Co má návštěvník udělat', ask: 'Když někdo na web přijde, co chcete, aby udělal? Zavolal, napsal, objednal?', type: 'text', required: true },
      { id: 'acquisition', label: 'Odkud chodí zákazníci dnes', ask: 'Odkud k vám zákazníci chodí teď? Doporučení, Google, sociální sítě, reklama?', type: 'long' },
      { id: 'usp', label: 'Čím se liší od konkurence', ask: 'Proč by si měl zákazník vybrat vás a ne konkurenci?', type: 'long' },
      { id: 'competitors', label: 'Konkurence', ask: 'Kdo je vaše hlavní konkurence? Stačí dva tři názvy nebo weby.', type: 'long' },
    ],
  },
  {
    id: 'rozsah',
    title: 'Rozsah a stránky',
    intro: 'Jak velký web to bude. Tohle určuje balíček a cenu.',
    questions: [
      { id: 'projectType', label: 'Typ webu', ask: 'Podle toho, co říkáte, by to byl… (navrhněte typ a ověřte si ho).', type: 'choice', required: true, options: ['Landing page (jedna stránka)', 'Základní web (3–5 podstránek)', 'Standardní web (10+ podstránek)', 'E-shop', 'Systém na míru (CRM, rezervace…)', 'Zatím není jasné'] },
      { id: 'pages', label: 'Stránky', ask: 'Jaké stránky na webu potřebujete? Projdu vám obvyklé a řeknete mi, které ano.', type: 'multi', required: true, options: ['Úvod', 'O nás', 'Služby', 'Ceník', 'Reference / realizace', 'Galerie', 'Recenze', 'Blog / novinky', 'Časté otázky', 'Kariéra', 'Kontakt'] },
      { id: 'pagesOther', label: 'Další stránky', ask: 'Napadá vás ještě nějaká stránka, kterou jsem nejmenoval?', type: 'text' },
      { id: 'servicesCount', label: 'Počet služeb / produktů', ask: 'Kolik služeb nebo produktů chcete na webu představit?', type: 'text' },
      { id: 'languages', label: 'Jazyky', ask: 'Stačí čeština, nebo potřebujete web i v dalším jazyce?', type: 'text', placeholder: 'čeština' },
      { id: 'selfEdit', label: 'Vlastní úpravy obsahu', ask: 'Chcete si texty a obrázky na webu měnit sami, nebo vám to budeme dělat my?', type: 'choice', options: ['Chtějí upravovat sami', 'Budeme upravovat my', 'Je jim to jedno'] },
    ],
  },
  {
    id: 'funkce',
    title: 'Funkce',
    intro: 'Co má web umět kromě toho, že ukáže informace.',
    questions: [
      { id: 'features', label: 'Funkce', ask: 'Co z tohohle by se vám na webu hodilo?', type: 'multi', options: ['Kontaktní formulář', 'Online rezervace', 'Online platba', 'Dárkové poukazy', 'Mapa a otevírací doba', 'Recenze z Googlu', 'Newsletter', 'Chat / WhatsApp tlačítko', 'Přihlášení pro klienty', 'Věrnostní program'] },
      { id: 'integrations', label: 'Napojení na jiné systémy', ask: 'Používáte nějaký systém, na který má web navázat? Rezervace, účetnictví, sklad, CRM?', type: 'long' },
      { id: 'custom', label: 'Vlastní požadavky', ask: 'Je něco specifického, co web musí umět a zatím jsme to nezmínili?', type: 'long' },
    ],
  },
  {
    id: 'obsah',
    title: 'Obsah a podklady',
    intro: 'Kdo dodá texty, fotky a logo. Na tomhle se weby nejčastěji zaseknou.',
    questions: [
      { id: 'logo', label: 'Logo', ask: 'Máte logo? V jakém formátu?', type: 'choice', required: true, options: ['Má ve vektoru (SVG, AI, PDF)', 'Má jen jako obrázek', 'Nemá, potřebuje vytvořit'] },
      { id: 'texts', label: 'Texty', ask: 'Texty na web máte, nebo je máme napsat my?', type: 'choice', required: true, options: ['Dodají hotové', 'Dodají podklady, doladíme', 'Napíšeme my'] },
      { id: 'photos', label: 'Fotky', ask: 'Máte vlastní fotky provozovny, týmu a práce?', type: 'choice', required: true, options: ['Mají vlastní kvalitní', 'Mají, ale slabé', 'Nemají, použijeme fotobanku', 'Chtějí nafotit'] },
      { id: 'otherMaterials', label: 'Další podklady', ask: 'Máte ještě něco, co na web patří? Ceník, certifikáty, videa, reference?', type: 'long' },
      { id: 'materialsWho', label: 'Kdo dodá podklady', ask: 'Kdo nám podklady pošle a na koho se máme obracet?', type: 'text' },
      { id: 'materialsWhen', label: 'Kdy dodají podklady', ask: 'Do kdy byste nám podklady zvládli poslat?', type: 'text', required: true },
    ],
  },
  {
    id: 'vzhled',
    title: 'Vzhled',
    intro: 'Jak má web působit. Stačí pár slov a pár příkladů.',
    questions: [
      { id: 'style', label: 'Styl', ask: 'Jak má web působit? Řeknu pár slov a vyberte, co sedí.', type: 'multi', options: ['Moderní a čistý', 'Luxusní', 'Přátelský a osobní', 'Seriózní a firemní', 'Hravý a barevný', 'Minimalistický', 'Tradiční'] },
      { id: 'colors', label: 'Barvy', ask: 'Máte firemní barvy, nebo je máme navrhnout?', type: 'text' },
      { id: 'likes', label: 'Weby, které se líbí', ask: 'Je nějaký web, který se vám líbí? Klidně i z jiného oboru.', type: 'long' },
      { id: 'dislikes', label: 'Co nechtějí', ask: 'A je naopak něco, co na webu určitě nechcete?', type: 'long' },
    ],
  },
  {
    id: 'technika',
    title: 'Doména a technika',
    intro: 'Kde web poběží a kdo má přístupy. Bez toho nejde spustit.',
    questions: [
      { id: 'domain', label: 'Doména', ask: 'Máte už doménu? Jakou a u koho je registrovaná?', type: 'text', required: true, placeholder: 'firma.cz u Wedosu / nemá' },
      { id: 'domainAccess', label: 'Přístup k doméně', ask: 'Máte k doméně přístup vy, nebo ho má někdo jiný?', type: 'choice', options: ['Mají přístup sami', 'Má ho bývalý dodavatel', 'Nevědí', 'Doménu teprve koupí'] },
      { id: 'emails', label: 'E-maily na doméně', ask: 'Máte na doméně firemní e-maily? Ty musí při přechodu fungovat dál.', type: 'text' },
      { id: 'analytics', label: 'Měření a reklama', ask: 'Používáte Google Analytics, reklamu na Googlu nebo Facebooku, firemní profil na Googlu?', type: 'multi', options: ['Google Analytics', 'Google Ads', 'Reklama na Facebooku / Instagramu', 'Firemní profil na Googlu', 'Nic z toho'] },
    ],
  },
  {
    id: 'dohoda',
    title: 'Termín, rozpočet a další krok',
    intro: 'Na čem jste se domluvili. Tohle zopakujte nahlas, než se rozloučíte.',
    questions: [
      { id: 'launch', label: 'Kdy má web běžet', ask: 'Do kdy potřebujete mít web hotový? Je k tomu nějaký důvod, třeba sezóna nebo akce?', type: 'text', required: true },
      { id: 'budget', label: 'Rozpočet', ask: 'S jakým rozpočtem zhruba počítáte?', type: 'text', required: true },
      { id: 'decision', label: 'Kdo rozhoduje', ask: 'Rozhodujete o tom sami, nebo to ještě s někým proberete?', type: 'text' },
      { id: 'offer', label: 'Navržený balíček a cena', ask: 'Podle toho, co jste mi řekli, navrhuju… (řekněte balíček a orientační cenu).', type: 'long' },
      { id: 'nextStep', label: 'Další krok', ask: 'Takže se domluvíme takhle: … Souhlasíte?', type: 'choice', required: true, options: ['Pošlu nabídku', 'Čekáme na podklady', 'Další hovor', 'Rozmyslí si to', 'Nemají zájem'] },
      { id: 'nextStepWhen', label: 'Termín dalšího kroku', ask: 'Kdy se vám mám ozvat / do kdy to pošlu?', type: 'text', required: true },
      { id: 'notes', label: 'Poznámky z hovoru', ask: '(Vaše poznámky: dojem z hovoru, na co si dát pozor.)', type: 'long' },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = STEPS.flatMap((s) => s.questions);

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
