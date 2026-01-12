// EroWeb Findings Generator
// Generates actionable findings based on analysis details

import type { AnalysisDetails, Finding, FindingType, BusinessType } from '@/types/eroweb';
import { BUSINESS_TYPE_LABELS } from '@/types/eroweb';

let findingIdCounter = 0;

function createFinding(
  type: FindingType,
  category: Finding['category'],
  title: string,
  description: string,
  impact: string,
  priority: number
): Finding {
  return {
    id: `finding-${++findingIdCounter}`,
    type,
    category,
    title,
    description,
    impact,
    priority,
  };
}

/**
 * Generate speed-related findings
 */
function generateSpeedFindings(details: AnalysisDetails): Finding[] {
  const findings: Finding[] = [];

  // LCP issues
  if (details.lcp > 6000) {
    findings.push(createFinding(
      'critical',
      'speed',
      'Web se načítá přes 6 sekund',
      `Největší obsahový prvek (LCP) se načítá ${(details.lcp / 1000).toFixed(1)} sekund. Google doporučuje pod 2.5 sekundy.`,
      '53% návštěvníků odejde před načtením stránky',
      10
    ));
  } else if (details.lcp > 4000) {
    findings.push(createFinding(
      'warning',
      'speed',
      'Pomalé načítání hlavního obsahu',
      `LCP je ${(details.lcp / 1000).toFixed(1)} sekund. Optimální je pod 2.5 sekundy.`,
      'Pomalé načítání snižuje konverze o 20-30%',
      7
    ));
  }

  // TTFB issues
  if (details.ttfb > 1800) {
    findings.push(createFinding(
      'warning',
      'speed',
      'Pomalá odezva serveru',
      `Server odpovídá za ${(details.ttfb / 1000).toFixed(1)} sekund (TTFB). Doporučeno pod 0.8 sekundy.`,
      'Může signalizovat přetížený nebo špatně nakonfigurovaný hosting',
      6
    ));
  }

  // PageSpeed score
  if (details.pageSpeedScore < 50) {
    findings.push(createFinding(
      'critical',
      'speed',
      `Google PageSpeed skóre pouze ${details.pageSpeedScore}/100`,
      'Nízké skóre negativně ovlivňuje pozice ve vyhledávání a uživatelskou zkušenost.',
      'Google upřednostňuje rychlé weby v mobilním vyhledávání',
      9
    ));
  } else if (details.pageSpeedScore < 70) {
    findings.push(createFinding(
      'warning',
      'speed',
      `PageSpeed skóre ${details.pageSpeedScore}/100 - prostor pro zlepšení`,
      'Optimalizací obrázků a kódu lze dosáhnout skóre 90+.',
      'Rychlejší web = více konverzí',
      5
    ));
  }

  return findings;
}

/**
 * Generate mobile-related findings
 */
function generateMobileFindings(details: AnalysisDetails): Finding[] {
  const findings: Finding[] = [];

  if (!details.hasViewportMeta) {
    findings.push(createFinding(
      'critical',
      'mobile',
      'Web není optimalizován pro mobily',
      'Chybí viewport meta tag - web se na mobilech zobrazuje jako desktop verze.',
      '70%+ návštěvníků přichází z mobilních zařízení',
      10
    ));
  }

  if (details.hasHorizontalScroll) {
    findings.push(createFinding(
      'warning',
      'mobile',
      'Horizontální scrollování na mobilu',
      'Některé prvky přesahují šířku obrazovky, což zhoršuje použitelnost.',
      'Frustruje uživatele a snižuje čas strávený na webu',
      6
    ));
  }

  if (!details.touchTargetsOk) {
    findings.push(createFinding(
      'warning',
      'mobile',
      'Tlačítka jsou příliš malá pro dotyk',
      'Interaktivní prvky mají méně než 48px, což ztěžuje ovládání na mobilu.',
      'Uživatelé mohou kliknout na špatný odkaz',
      5
    ));
  }

  if (!details.textReadable) {
    findings.push(createFinding(
      'warning',
      'mobile',
      'Text je na mobilu špatně čitelný',
      'Font je příliš malý nebo má špatný kontrast.',
      'Nutí uživatele přibližovat, což zhoršuje UX',
      4
    ));
  }

  return findings;
}

/**
 * Generate security-related findings
 */
function generateSecurityFindings(details: AnalysisDetails): Finding[] {
  const findings: Finding[] = [];

  if (!details.hasHttps) {
    findings.push(createFinding(
      'critical',
      'security',
      'Web nemá HTTPS zabezpečení',
      'Prohlížeče označují web jako "Nezabezpečený" - odrazuje zákazníky.',
      'Ztráta důvěry a negativní vliv na SEO',
      10
    ));
  }

  if (details.hasMixedContent) {
    findings.push(createFinding(
      'warning',
      'security',
      'Smíšený obsah (HTTP na HTTPS stránce)',
      'Některé obrázky nebo skripty se načítají přes nezabezpečené HTTP.',
      'Může způsobit varování v prohlížeči',
      5
    ));
  }

  if (!details.hasSecurityHeaders && details.hasHttps) {
    findings.push(createFinding(
      'opportunity',
      'security',
      'Chybí bezpečnostní hlavičky',
      'Security headers (CSP, X-Frame-Options) nejsou nastaveny.',
      'Zvýšené riziko útoků (XSS, clickjacking)',
      3
    ));
  }

  return findings;
}

/**
 * Generate SEO-related findings
 */
function generateSeoFindings(details: AnalysisDetails): Finding[] {
  const findings: Finding[] = [];

  if (!details.title) {
    findings.push(createFinding(
      'critical',
      'seo',
      'Chybí title tag',
      'Stránka nemá definovaný title - Google zobrazí náhodný text.',
      'Výrazně snižuje CTR ve výsledcích vyhledávání',
      10
    ));
  } else if (details.titleLength > 70) {
    findings.push(createFinding(
      'warning',
      'seo',
      `Title tag je příliš dlouhý (${details.titleLength} znaků)`,
      'Optimální délka je 50-60 znaků. Delší text bude oříznut.',
      'Oříznutý title snižuje atraktivitu ve výsledcích',
      4
    ));
  } else if (details.titleLength < 30) {
    findings.push(createFinding(
      'warning',
      'seo',
      `Title tag je příliš krátký (${details.titleLength} znaků)`,
      'Nevyužíváte plný potenciál pro klíčová slova.',
      'Méně informací = nižší CTR',
      3
    ));
  }

  if (!details.metaDescription) {
    findings.push(createFinding(
      'critical',
      'seo',
      'Chybí meta description',
      'Google zobrazuje náhodný text z webu místo vašeho popisu.',
      'Nemůžete ovlivnit, co zákazníci vidí ve výsledcích',
      9
    ));
  }

  if (!details.h1 || details.h1Count === 0) {
    findings.push(createFinding(
      'warning',
      'seo',
      'Chybí H1 nadpis',
      'Hlavní nadpis stránky není definován nebo není označen jako H1.',
      'Google neví, o čem stránka je',
      6
    ));
  } else if (details.h1Count > 1) {
    findings.push(createFinding(
      'warning',
      'seo',
      `Více H1 nadpisů na stránce (${details.h1Count})`,
      'Měl by být pouze jeden H1 nadpis - hlavní téma stránky.',
      'Matoucí pro vyhledávače',
      4
    ));
  }

  if (details.totalImages > 0) {
    const altRatio = details.imagesWithAlt / details.totalImages;
    if (altRatio < 0.5) {
      findings.push(createFinding(
        'critical',
        'seo',
        `Obrázky bez alt textů (${Math.round((1 - altRatio) * 100)}%)`,
        `${details.totalImages - details.imagesWithAlt} z ${details.totalImages} obrázků nemá alt text.`,
        'Google nemůže indexovat obrázky, ztrácíte image search traffic',
        8
      ));
    } else if (altRatio < 0.9) {
      findings.push(createFinding(
        'warning',
        'seo',
        'Některé obrázky nemají alt text',
        `${details.totalImages - details.imagesWithAlt} obrázků bez popisu.`,
        'Ztrácíte potenciální návštěvníky z Google Images',
        4
      ));
    }
  }

  if (!details.hasSitemap) {
    findings.push(createFinding(
      'warning',
      'seo',
      'Chybí sitemap.xml',
      'Google má problém najít všechny stránky webu.',
      'Některé stránky nemusí být indexovány',
      5
    ));
  }

  if (!details.hasStructuredData) {
    findings.push(createFinding(
      'opportunity',
      'seo',
      'Chybí strukturovaná data (Schema.org)',
      'Web nemá JSON-LD schema markup pro rich snippets.',
      'Přidání LocalBusiness schema zvýší viditelnost v lokálním vyhledávání',
      6
    ));
  }

  return findings;
}

/**
 * Generate GEO-related findings (AI Engine Optimization)
 */
function generateGeoFindings(details: AnalysisDetails, businessType: BusinessType): Finding[] {
  const findings: Finding[] = [];
  const businessLabel = BUSINESS_TYPE_LABELS[businessType];

  if (!details.hasFaqSection && !details.hasQaFormat) {
    findings.push(createFinding(
      'warning',
      'geo',
      'Chybí FAQ sekce',
      'AI asistenti (ChatGPT, Perplexity) potřebují strukturované odpovědi na časté dotazy.',
      'FAQ sekce s 10+ otázkami může zvýšit citovanost v AI odpovědích o 40%',
      7
    ));
  }

  if (!details.hasLocalBusinessSchema) {
    findings.push(createFinding(
      'warning',
      'geo',
      'Chybí LocalBusiness schema',
      'AI vyhledávače nedokáží ověřit důvěryhodnost a lokaci vašeho podniku.',
      'Přidání schema s otevírací dobou a ceníkem zvýší citovanost v AI',
      6
    ));
  }

  if (!details.hasAddress && !details.hasOpeningHours) {
    findings.push(createFinding(
      'warning',
      'geo',
      'Chybí konkrétní informace o podniku',
      'Web neobsahuje adresu ani otevírací dobu.',
      'AI asistenti nemohou odpovědět na dotazy typu "kde najdu" nebo "kdy máte otevřeno"',
      5
    ));
  }

  if (!details.hasPricing) {
    findings.push(createFinding(
      'opportunity',
      'geo',
      'Ceník není strukturovaný',
      'Přehledný ceník s konkrétními cenami pomáhá AI odpovídat na cenové dotazy.',
      `Zákazníci hledající "${businessLabel} cena" vás nenajdou`,
      4
    ));
  }

  const currentYear = new Date().getFullYear();
  if (details.contentYear < currentYear - 2) {
    findings.push(createFinding(
      'warning',
      'geo',
      'Obsah působí zastarale',
      `Copyright nebo datum aktualizace je z roku ${details.contentYear || 'neznámý'}.`,
      'AI preferuje aktuální obsah při generování odpovědí',
      4
    ));
  }

  // Always add GEO opportunity for adult industry
  if (!details.hasLocalBusinessSchema || !details.hasFaqSection) {
    findings.push(createFinding(
      'opportunity',
      'geo',
      'Optimalizace pro AI vyhledávače (GEO)',
      'V roce 2025 přes 400 milionů lidí používá ChatGPT týdně. Optimalizace pro AI je nový standard.',
      'Weby optimalizované pro GEO mají až 40% vyšší citovanost',
      8
    ));
  }

  return findings;
}

/**
 * Generate design-related findings
 */
function generateDesignFindings(details: AnalysisDetails, businessType: BusinessType): Finding[] {
  const findings: Finding[] = [];
  const currentYear = new Date().getFullYear();

  if (details.copyrightYear && details.copyrightYear < currentYear - 5) {
    findings.push(createFinding(
      'critical',
      'design',
      `Design vypadá jako z roku ${details.copyrightYear}`,
      'Vizuální styl webu je zastaralý a neodpovídá moderním standardům.',
      'První dojem odrazuje moderní zákazníky hledající kvalitní služby',
      9
    ));
  } else if (details.copyrightYear && details.copyrightYear < currentYear - 3) {
    findings.push(createFinding(
      'warning',
      'design',
      'Design by zasloužil modernizaci',
      'Web funguje, ale vizuálně zaostává za konkurencí.',
      'Modernější vzhled zvyšuje důvěryhodnost',
      5
    ));
  }

  // Note: Image quality check removed for erotic websites
  // Blurred faces are intentional for privacy protection, not a quality issue

  if (!details.hasBookingSystem) {
    findings.push(createFinding(
      'warning',
      'design',
      'Chybí online rezervace',
      'Klienti musí volat pro objednání - mnoho raději odejde ke konkurenci.',
      'Online rezervace může zvýšit počet zákazníků o 25-40%',
      7
    ));
  }

  if (!details.hasWhatsApp && !details.hasPhone) {
    findings.push(createFinding(
      'critical',
      'design',
      'Chybí kontaktní možnosti',
      'Web nemá viditelné telefonní číslo ani WhatsApp.',
      'Zákazníci nemohou kontaktovat - kritická chyba',
      10
    ));
  } else if (!details.hasWhatsApp) {
    findings.push(createFinding(
      'opportunity',
      'design',
      'Přidejte WhatsApp tlačítko',
      'Mnoho klientů preferuje diskrétní komunikaci přes WhatsApp.',
      'WhatsApp tlačítko může zvýšit konverze o 25%',
      5
    ));
  }

  if (!details.hasPricing) {
    findings.push(createFinding(
      'warning',
      'design',
      'Ceník není přehledný',
      'Zákazníci nevědí, co mohou očekávat - mnoho odejde.',
      'Transparentní ceny budují důvěru',
      6
    ));
  }

  // CMS detection
  if (details.cmsDetected === 'wordpress') {
    findings.push(createFinding(
      'opportunity',
      'design',
      'Web běží na WordPress',
      'WordPress je náchylný k bezpečnostním problémům a bývá pomalý.',
      'Moderní technologie (Next.js) jsou rychlejší a bezpečnější',
      4
    ));
  }

  return findings;
}

/**
 * Generate all findings for an analysis
 */
export function generateFindings(details: AnalysisDetails, businessType: BusinessType): Finding[] {
  // Reset counter for each analysis
  findingIdCounter = 0;

  const allFindings: Finding[] = [
    ...generateSpeedFindings(details),
    ...generateMobileFindings(details),
    ...generateSecurityFindings(details),
    ...generateSeoFindings(details),
    ...generateGeoFindings(details, businessType),
    ...generateDesignFindings(details, businessType),
  ];

  // Sort by priority (highest first)
  return allFindings.sort((a, b) => b.priority - a.priority);
}

/**
 * Get findings by type
 */
export function getFindingsByType(findings: Finding[], type: FindingType): Finding[] {
  return findings.filter(f => f.type === type);
}

/**
 * Get top N findings
 */
export function getTopFindings(findings: Finding[], count: number = 5): Finding[] {
  return findings.slice(0, count);
}

/**
 * Count findings by type
 */
export function countFindings(findings: Finding[]): Record<FindingType, number> {
  return {
    critical: findings.filter(f => f.type === 'critical').length,
    warning: findings.filter(f => f.type === 'warning').length,
    opportunity: findings.filter(f => f.type === 'opportunity').length,
  };
}
