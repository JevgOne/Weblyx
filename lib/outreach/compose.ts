import type { AuditResult } from '@/lib/audits/report';

/**
 * Writes the outreach e-mail from what the analyzer found on the company's
 * own website.
 *
 * The list's stock text says "your website is not quite current" to everyone.
 * This one names the site, gives its score and two or three things that are
 * actually wrong with it, in the words an owner would use — and offers the
 * full report for a reply. Every sentence comes from a check that failed on
 * that site; a site with too little wrong keeps the stock text.
 */

/** Failed checks worth telling an owner about, most telling first. */
const POINTS: Array<[checkId: string, sentence: string]> = [
  ['https', 'web neběží na zabezpečeném spojení (https), takže u něj prohlížeče ukazují varování „Nezabezpečeno“'],
  ['viewport', 'na telefonu se nepřizpůsobí displeji a návštěvník musí zvětšovat a posouvat'],
  ['tel', 'telefonní číslo nejde na mobilu vytočit jedním klepnutím'],
  ['fresh', 'podle obsahu web vypadá, že se delší dobu neaktualizoval'],
  ['maps', 'chybí napojení na Google mapy, takže se k vám zákazník z webu nedostane jedním klepnutím'],
  ['meta', 've výsledcích Googlu se zobrazuje bez pořádného titulku a popisu'],
  ['stars', 'nejsou na něm vidět žádné recenze zákazníků'],
  ['og', 'při sdílení na Facebooku nebo WhatsAppu se neukáže náhled s obrázkem'],
  ['images', 'obrázky jsou ve starém formátu a zbytečně zpomalují načítání'],
  ['contact', 'kontakt a adresa nejsou na webu napsané jako text, takže se hůř dohledávají'],
  ['sitemap', 'chybí mapa webu pro Google, který tak některé stránky nemusí vůbec najít'],
  ['faq', 'chybí odpovědi na časté otázky, které dnes čte Google i AI vyhledávače'],
];

const things = (n: number) => (n === 1 ? 'věc' : n < 5 ? 'věci' : 'věcí');
const NUM = ['', 'jednu', 'dvě', 'tři'];

export function composeFromAudit(
  result: AuditResult,
  lead: { company: string; website: string }
): { subject: string; body: string } | null {
  const failed = new Set((result.checks ?? []).filter((c) => c.ok === false).map((c) => c.id));
  const points = POINTS.filter(([id]) => failed.has(id)).map(([, sentence]) => sentence);

  const speed = result.categories?.find((c) => c.key === 'performance')?.score;
  if (typeof speed === 'number' && speed < 50) points.splice(Math.min(points.length, 2), 0, `načítá se pomalu, za rychlost dostal ${speed} bodů ze 100`);

  // With one thing wrong there is no analysis to speak of.
  if (points.length < 2) return null;

  const domain = lead.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  const top = points.slice(0, 3);
  const total = failed.size + (typeof speed === 'number' && speed < 50 ? 1 : 0);
  const more = total - top.length;

  const body = [
    'Dobrý den,',
    `podíval jsem se na váš web ${domain} a krátce ho změřil stejným nástrojem, kterým kontrolujeme weby našich klientů. Vyšlo mu ${result.score} bodů ze 100.`,
    `Nejvíc mě zaujaly ${NUM[top.length]} ${things(top.length)}:\n${top.map((p) => `– ${p}`).join('\n')}`,
    `${more > 0 ? `Dalších ${more} ${things(more)} mám sepsaných i s tím, jak je opravit. ` : ''}Pokud chcete, pošlu vám celý rozbor zdarma a bez závazků, stačí na tento e-mail odpovědět.`,
    `A kdyby vás zajímalo, jak by mohl vypadat nový web ${lead.company.trim() ? `pro ${lead.company.trim()}` : 'pro vás'}, rád připravím i nezávazný návrh.`,
  ].join('\n\n');

  return { subject: `Krátký rozbor webu ${domain}`, body };
}
