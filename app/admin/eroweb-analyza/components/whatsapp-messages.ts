/**
 * WhatsApp message templates for EroWeb analysis
 * WAU-level messages with real data from the analysis
 */

export interface WhatsAppMessageParams {
  domain: string;
  businessType: string;
  businessTypeEn: string;
  score: number;
  analysisId: string;
  language: 'cs' | 'en' | 'de' | 'ru';
  // Extended data for personalized messages
  scores?: {
    speed: number;
    mobile: number;
    security: number;
    seo: number;
    geo: number;
    design: number;
    total: number;
  };
  findings?: Array<{
    type: 'critical' | 'warning' | 'opportunity';
    category: string;
    title: string;
    impact: string;
  }>;
  details?: {
    lcp?: number;
    pageSpeedScore?: number;
    hasHttps?: boolean;
    hasViewportMeta?: boolean;
    hasMetaDescription?: boolean;
    hasH1?: boolean;
    imageCount?: number;
    hasSchemaOrg?: boolean;
  };
}

/**
 * Get the worst metric to highlight (most shocking data point)
 */
function getWorstMetric(params: WhatsAppMessageParams): { emoji: string; text: string; textEn: string; textDe: string; textRu: string } | null {
  const { scores, details } = params;
  if (!scores || !details) return null;

  // Prioritize by shock value
  if (details.pageSpeedScore !== undefined && details.pageSpeedScore < 40) {
    return {
      emoji: '🐌',
      text: `Google PageSpeed: ${details.pageSpeedScore}/100 (průměr v ČR je 43, ale top weby mají 90+)`,
      textEn: `Google PageSpeed: ${details.pageSpeedScore}/100 (top websites score 90+)`,
      textDe: `Google PageSpeed: ${details.pageSpeedScore}/100 (Top-Websites erreichen 90+)`,
      textRu: `Google PageSpeed: ${details.pageSpeedScore}/100 (топовые сайты набирают 90+)`,
    };
  }
  if (details.lcp !== undefined && details.lcp > 4000) {
    const secs = (details.lcp / 1000).toFixed(1);
    return {
      emoji: '⏱️',
      text: `Váš web se načítá ${secs}s — Google říká, že 53 % lidí odejde po 3s`,
      textEn: `Your site loads in ${secs}s — Google says 53% of visitors leave after 3s`,
      textDe: `Ihre Website lädt in ${secs}s — Google sagt, 53% der Besucher gehen nach 3s`,
      textRu: `Ваш сайт загружается ${secs}s — Google говорит, что 53% посетителей уходят после 3с`,
    };
  }
  if (!details.hasHttps) {
    return {
      emoji: '🔓',
      text: `Web nemá HTTPS — prohlížeče ukazují "Nezabezpečeno" a Google ho penalizuje`,
      textEn: `No HTTPS — browsers show "Not Secure" and Google penalizes it`,
      textDe: `Kein HTTPS — Browser zeigen "Nicht sicher" und Google bestraft es`,
      textRu: `Нет HTTPS — браузеры показывают "Не защищено" и Google наказывает`,
    };
  }
  if (!details.hasMetaDescription) {
    return {
      emoji: '👻',
      text: `Web nemá meta description — ve vyhledávání vypadá jako prázdný výsledek`,
      textEn: `No meta description — looks like an empty result in search`,
      textDe: `Keine Meta-Description — sieht in der Suche wie ein leeres Ergebnis aus`,
      textRu: `Нет мета-описания — в поиске выглядит как пустой результат`,
    };
  }
  if (scores.geo < 5) {
    return {
      emoji: '🤖',
      text: `AI vyhledávače (ChatGPT, Perplexity) váš web kompletně ignorují — ${scores.geo}/15 bodů`,
      textEn: `AI search engines (ChatGPT, Perplexity) completely ignore your site — ${scores.geo}/15 points`,
      textDe: `KI-Suchmaschinen (ChatGPT, Perplexity) ignorieren Ihre Website komplett — ${scores.geo}/15 Punkte`,
      textRu: `AI-поисковики (ChatGPT, Perplexity) полностью игнорируют ваш сайт — ${scores.geo}/15 баллов`,
    };
  }
  if (scores.mobile < 5) {
    return {
      emoji: '📱',
      text: `Na mobilu je web téměř nepoužitelný — ${scores.mobile}/15 bodů (70 % návštěvníků přijde z mobilu)`,
      textEn: `Your site is nearly unusable on mobile — ${scores.mobile}/15 points (70% of visitors come from mobile)`,
      textDe: `Ihre Website ist auf dem Handy kaum nutzbar — ${scores.mobile}/15 Punkte (70% kommen vom Handy)`,
      textRu: `На мобильных сайт почти непригоден — ${scores.mobile}/15 баллов (70% посетителей с мобильных)`,
    };
  }

  return null;
}

/**
 * Count critical findings
 */
function getCriticalCount(findings?: WhatsAppMessageParams['findings']): number {
  if (!findings) return 0;
  return findings.filter(f => f.type === 'critical').length;
}

/**
 * Get top 3 critical finding titles
 */
function getTopFindings(findings?: WhatsAppMessageParams['findings'], lang: string = 'cs'): string[] {
  if (!findings) return [];
  return findings
    .filter(f => f.type === 'critical')
    .sort((a, b) => (b as any).priority - (a as any).priority)
    .slice(0, 3)
    .map(f => f.title);
}

export function getWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { domain, businessType, businessTypeEn, score, analysisId, language, scores, findings } = params;

  const worstMetric = getWorstMetric(params);
  const criticalCount = getCriticalCount(findings);
  const topFindings = getTopFindings(findings, language);

  // Use analysis ID as seed for consistent variation
  const seed = analysisId ? parseInt(analysisId.replace(/\D/g, '').slice(-4) || '0', 10) : 0;

  if (language === 'cs') return getCzechMessage(params, worstMetric, criticalCount, topFindings, seed);
  if (language === 'de') return getGermanMessage(params, worstMetric, criticalCount, topFindings, seed);
  if (language === 'ru') return getRussianMessage(params, worstMetric, criticalCount, topFindings, seed);
  return getEnglishMessage(params, worstMetric, criticalCount, topFindings, seed);
}

// ────────────────────────────────────────────────────────
// CZECH MESSAGES
// ────────────────────────────────────────────────────────
function getCzechMessage(
  params: WhatsAppMessageParams,
  worst: ReturnType<typeof getWorstMetric>,
  criticalCount: number,
  topFindings: string[],
  seed: number
): string {
  const { domain, businessType, score } = params;

  const variations = [
    // V1: Shock with data
    () => {
      let msg = `Ahoj 👋\n\nKouknul jsem na *${domain}* a udělal kompletní analýzu.\n\n`;
      msg += `📊 *Výsledek: ${score}/100 bodů*\n`;
      if (worst) msg += `${worst.emoji} ${worst.text}\n`;
      if (criticalCount > 0) msg += `🚨 Našel jsem ${criticalCount} kritických problémů\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `Nejhorší věci:\n`;
        topFindings.forEach(f => { msg += `• ${f}\n`; });
        msg += `\n`;
      }
      msg += `Mám kompletní rozbor s konkrétním plánem co opravit. Můžu poslat?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
      return msg;
    },

    // V2: Competitor angle + data
    () => {
      let msg = `Dobrý den 👋\n\nDělám analýzy webů pro ${businessType.toLowerCase()} a narazil jsem na *${domain}*.\n\n`;
      msg += `Udělal jsem si audit — *${score}/100 bodů*.\n`;
      if (worst) msg += `\n${worst.emoji} ${worst.text}\n`;
      msg += `\nUpřímně? Konkurence na tom není o moc líp. Ale kdo to opraví první, vyhraje.\n\n`;
      if (criticalCount > 0) msg += `Mám nachystaný ${criticalCount} konkrétních doporučení. `;
      msg += `Pošlu vám to?\n\n`;
      msg += `Jevgenij z Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short + curiosity
    () => {
      let msg = `Ahoj 👋\n\n*${domain}* — ${score}/100 bodů.\n`;
      if (worst) msg += `${worst.emoji} ${worst.text}\n\n`;
      else msg += `\n`;
      msg += `Udělal jsem kompletní audit vašeho webu. `;
      if (criticalCount > 0) msg += `${criticalCount} kritických věcí, které vás stojí zákazníky. `;
      msg += `Mám report — zajímá vás?\n\n`;
      msg += `Jevgenij, Weblyx`;
      return msg;
    },
  ];

  return variations[seed % variations.length]();
}

// ────────────────────────────────────────────────────────
// ENGLISH MESSAGES
// ────────────────────────────────────────────────────────
function getEnglishMessage(
  params: WhatsAppMessageParams,
  worst: ReturnType<typeof getWorstMetric>,
  criticalCount: number,
  topFindings: string[],
  seed: number
): string {
  const { domain, businessTypeEn, score } = params;

  const variations = [
    // V1: Data-driven shock
    () => {
      let msg = `Hi 👋\n\nI ran a full audit on *${domain}*.\n\n`;
      msg += `📊 *Score: ${score}/100*\n`;
      if (worst) msg += `${worst.emoji} ${worst.textEn}\n`;
      if (criticalCount > 0) msg += `🚨 Found ${criticalCount} critical issues\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `Top issues:\n`;
        topFindings.forEach(f => { msg += `• ${f}\n`; });
        msg += `\n`;
      }
      msg += `I have a detailed report with a fix plan. Want me to send it?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
      return msg;
    },

    // V2: Opportunity angle
    () => {
      let msg = `Hey 👋\n\nI analyze ${businessTypeEn} websites and came across *${domain}*.\n\n`;
      msg += `Ran a quick audit — *${score}/100 points*.\n`;
      if (worst) msg += `\n${worst.emoji} ${worst.textEn}\n`;
      msg += `\nMost of your competitors score similar. Whoever fixes it first wins.\n\n`;
      if (criticalCount > 0) msg += `I have ${criticalCount} specific recommendations. `;
      msg += `Interested?\n\n`;
      msg += `Jevgenij from Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short
    () => {
      let msg = `Hi 👋\n\n*${domain}* — ${score}/100.\n`;
      if (worst) msg += `${worst.emoji} ${worst.textEn}\n\n`;
      else msg += `\n`;
      msg += `I audited your website. `;
      if (criticalCount > 0) msg += `${criticalCount} critical issues costing you customers. `;
      msg += `Full report ready — interested?\n\n`;
      msg += `Jevgenij, Weblyx`;
      return msg;
    },
  ];

  return variations[seed % variations.length]();
}

// ────────────────────────────────────────────────────────
// GERMAN MESSAGES
// ────────────────────────────────────────────────────────
function getGermanMessage(
  params: WhatsAppMessageParams,
  worst: ReturnType<typeof getWorstMetric>,
  criticalCount: number,
  topFindings: string[],
  seed: number
): string {
  const { domain, businessTypeEn, score } = params;

  const variations = [
    // V1: Data shock
    () => {
      let msg = `Hallo 👋\n\nIch habe ein vollständiges Audit von *${domain}* durchgeführt.\n\n`;
      msg += `📊 *Ergebnis: ${score}/100 Punkte*\n`;
      if (worst) msg += `${worst.emoji} ${worst.textDe}\n`;
      if (criticalCount > 0) msg += `🚨 ${criticalCount} kritische Probleme gefunden\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `Wichtigste Probleme:\n`;
        topFindings.forEach(f => { msg += `• ${f}\n`; });
        msg += `\n`;
      }
      msg += `Ich habe einen detaillierten Bericht mit konkretem Maßnahmenplan. Soll ich ihn senden?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
      return msg;
    },

    // V2: Competitor angle
    () => {
      let msg = `Guten Tag 👋\n\nIch analysiere Websites im Bereich ${businessTypeEn} und bin auf *${domain}* gestoßen.\n\n`;
      msg += `Ergebnis: *${score}/100 Punkte*.\n`;
      if (worst) msg += `\n${worst.emoji} ${worst.textDe}\n`;
      msg += `\nEhrlich? Die Konkurrenz schneidet ähnlich ab. Wer zuerst optimiert, gewinnt.\n\n`;
      if (criticalCount > 0) msg += `Ich habe ${criticalCount} konkrete Empfehlungen. `;
      msg += `Interesse?\n\n`;
      msg += `Jevgenij von Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short
    () => {
      let msg = `Hallo 👋\n\n*${domain}* — ${score}/100.\n`;
      if (worst) msg += `${worst.emoji} ${worst.textDe}\n\n`;
      else msg += `\n`;
      msg += `Vollständiges Website-Audit durchgeführt. `;
      if (criticalCount > 0) msg += `${criticalCount} kritische Probleme, die Sie Kunden kosten. `;
      msg += `Report fertig — interessiert?\n\n`;
      msg += `Jevgenij, Weblyx`;
      return msg;
    },
  ];

  return variations[seed % variations.length]();
}

// ────────────────────────────────────────────────────────
// RUSSIAN MESSAGES
// ────────────────────────────────────────────────────────
function getRussianMessage(
  params: WhatsAppMessageParams,
  worst: ReturnType<typeof getWorstMetric>,
  criticalCount: number,
  topFindings: string[],
  seed: number
): string {
  const { domain, businessTypeEn, score } = params;

  const variations = [
    // V1: Data shock
    () => {
      let msg = `Привет 👋\n\nПровёл полный аудит *${domain}*.\n\n`;
      msg += `📊 *Результат: ${score}/100*\n`;
      if (worst) msg += `${worst.emoji} ${worst.textRu}\n`;
      if (criticalCount > 0) msg += `🚨 Найдено ${criticalCount} критических проблем\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `Главные проблемы:\n`;
        topFindings.forEach(f => { msg += `• ${f}\n`; });
        msg += `\n`;
      }
      msg += `Есть детальный отчёт с планом исправлений. Отправить?\n\n`;
      msg += `Евгений, Weblyx 🌐`;
      return msg;
    },

    // V2: Competitor angle
    () => {
      let msg = `Добрый день 👋\n\nАнализирую сайты в сфере ${businessTypeEn} и наткнулся на *${domain}*.\n\n`;
      msg += `Провёл аудит — *${score}/100 баллов*.\n`;
      if (worst) msg += `\n${worst.emoji} ${worst.textRu}\n`;
      msg += `\nЧестно? Конкуренты не сильно лучше. Кто исправит первым — тот и выиграет.\n\n`;
      if (criticalCount > 0) msg += `У меня ${criticalCount} конкретных рекомендаций. `;
      msg += `Интересно?\n\n`;
      msg += `Евгений из Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short
    () => {
      let msg = `Привет 👋\n\n*${domain}* — ${score}/100.\n`;
      if (worst) msg += `${worst.emoji} ${worst.textRu}\n\n`;
      else msg += `\n`;
      msg += `Провёл полный аудит вашего сайта. `;
      if (criticalCount > 0) msg += `${criticalCount} критических проблем, из-за которых теряете клиентов. `;
      msg += `Отчёт готов — интересно?\n\n`;
      msg += `Евгений, Weblyx`;
      return msg;
    },
  ];

  return variations[seed % variations.length]();
}
