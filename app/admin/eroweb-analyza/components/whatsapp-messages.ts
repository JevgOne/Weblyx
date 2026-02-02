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
 * Visual score bar: ████████░░ 78/100
 */
function getScoreBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${score}/100`;
}

/**
 * Star rating: ⭐⭐⭐☆☆
 */
function getStarRating(score: number): string {
  const stars = Math.round(score / 20); // 0-5
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
}

/**
 * Estimate lost customers per month based on speed
 * Google data: 53% bounce after 3s, each second adds ~7% bounce
 */
function getCustomerLossEstimate(lcp?: number, lang: string = 'cs'): string | null {
  if (!lcp || lcp < 2500) return null;
  const seconds = lcp / 1000;
  // Rough estimate: base 100 visitors/day for small biz, bounce increase per slow second
  const extraBouncePercent = Math.min(Math.round((seconds - 2) * 7), 40);

  const templates: Record<string, string> = {
    cs: `💸 Odhad: ${extraBouncePercent} % návštěvníků odejde kvůli pomalému načítání (${seconds.toFixed(1)}s)`,
    en: `💸 Estimated ${extraBouncePercent}% of visitors leave due to slow loading (${seconds.toFixed(1)}s)`,
    de: `💸 Geschätzt ${extraBouncePercent}% der Besucher gehen wegen langsamer Ladezeit (${seconds.toFixed(1)}s)`,
    ru: `💸 Примерно ${extraBouncePercent}% посетителей уходят из-за медленной загрузки (${seconds.toFixed(1)}с)`,
  };
  return templates[lang] || templates.cs;
}

/**
 * Success story teaser
 */
function getSuccessTeaser(lang: string): string {
  const teasers: Record<string, string[]> = {
    cs: [
      '📈 Poslední klient: z 28 na 94 bodů za 10 dní',
      '📈 Minulý měsíc jsme klientovi zdvojnásobili návštěvnost za 2 týdny',
      '📈 Podobný web jsme opravili za 5 dní — PageSpeed z 31 na 96',
    ],
    en: [
      '📈 Last client: from 28 to 94 points in 10 days',
      '📈 Last month we doubled a client\'s traffic in 2 weeks',
      '📈 We fixed a similar site in 5 days — PageSpeed from 31 to 96',
    ],
    de: [
      '📈 Letzter Kunde: von 28 auf 94 Punkte in 10 Tagen',
      '📈 Letzten Monat haben wir den Traffic eines Kunden in 2 Wochen verdoppelt',
      '📈 Ähnliche Website in 5 Tagen repariert — PageSpeed von 31 auf 96',
    ],
    ru: [
      '📈 Последний клиент: с 28 до 94 баллов за 10 дней',
      '📈 В прошлом месяце удвоили трафик клиента за 2 недели',
      '📈 Похожий сайт исправили за 5 дней — PageSpeed с 31 до 96',
    ],
  };
  const arr = teasers[lang] || teasers.cs;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Mobile screenshot tease
 */
function getMobileTease(lang: string): string {
  const texts: Record<string, string> = {
    cs: '📱 Mám screenshot vašeho webu na mobilu — chcete vidět jak to vypadá zákazníkům?',
    en: '📱 I have a screenshot of your site on mobile — want to see how customers see it?',
    de: '📱 Ich habe einen Screenshot Ihrer Website auf dem Handy — wollen Sie sehen, wie Kunden es sehen?',
    ru: '📱 У меня есть скриншот вашего сайта на мобильном — хотите увидеть, как его видят клиенты?',
  };
  return texts[lang] || texts.cs;
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

  const customerLoss = getCustomerLossEstimate(params.details?.lcp, 'cs');
  const successTeaser = getSuccessTeaser('cs');
  const mobileTease = getMobileTease('cs');

  const variations = [
    // V1: Visual score bar + shock data + success story
    () => {
      let msg = `Ahoj 👋\n\nKouknul jsem na *${domain}* a udělal kompletní analýzu.\n\n`;
      msg += `${getScoreBar(score)}\n${getStarRating(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.text}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      if (criticalCount > 0) msg += `🚨 ${criticalCount} kritických problémů\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `Co vás stojí zákazníky:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
        msg += `\n`;
      }
      msg += `${successTeaser}\n\n`;
      msg += `Mám kompletní rozbor s plánem oprav. Pošlu?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
      return msg;
    },

    // V2: Competitor + mobile screenshot tease
    () => {
      let msg = `Dobrý den 👋\n\nDělám analýzy webů pro ${businessType.toLowerCase()} a narazil jsem na *${domain}*.\n\n`;
      msg += `📊 *${score}/100* ${getStarRating(score)}\n`;
      if (worst) msg += `${worst.emoji} ${worst.text}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\nUpřímně? Konkurence na tom není o moc líp. Ale kdo to opraví první, vyhraje.\n\n`;
      msg += `${mobileTease}\n\n`;
      if (criticalCount > 0) msg += `Mám nachystaný ${criticalCount} konkrétních doporučení. `;
      msg += `Pošlu vám to?\n\n`;
      msg += `Jevgenij z Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short + money loss + teaser
    () => {
      let msg = `Ahoj 👋\n\n*${domain}*\n${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.text}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\n`;
      if (criticalCount > 0) msg += `${criticalCount} kritických věcí, které vás stojí zákazníky.\n\n`;
      msg += `${successTeaser}\n\n`;
      msg += `Mám report — zajímá vás?\n\n`;
      msg += `Jevgenij, Weblyx`;
      return msg;
    },

    // V4: Question opener + data
    () => {
      let msg = `Ahoj 👋\n\nVíte, jak váš web *${domain}* vypadá v porovnání s konkurencí?\n\n`;
      msg += `Udělal jsem audit:\n`;
      msg += `${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.text}\n`;
      if (criticalCount > 0) {
        msg += `\n${criticalCount}× kritický problém:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
      }
      msg += `\n${successTeaser}\n\n`;
      msg += `Chcete kompletní rozbor zdarma?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
      return msg;
    },

    // V5: Mobile screenshot lead
    () => {
      let msg = `Ahoj 👋\n\n${mobileTease}\n\n`;
      msg += `Provedl jsem audit *${domain}*:\n`;
      msg += `📊 *${score}/100* ${getStarRating(score)}\n`;
      if (worst) msg += `${worst.emoji} ${worst.text}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\n`;
      if (criticalCount > 0) msg += `Našel jsem ${criticalCount} věcí co opravit. `;
      msg += `Detailní report mám hotový — pošlu?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
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

  const customerLoss = getCustomerLossEstimate(params.details?.lcp, 'en');
  const successTeaser = getSuccessTeaser('en');
  const mobileTease = getMobileTease('en');

  const variations = [
    // V1: Visual score + shock + success
    () => {
      let msg = `Hi 👋\n\nI ran a full audit on *${domain}*.\n\n`;
      msg += `${getScoreBar(score)}\n${getStarRating(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textEn}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      if (criticalCount > 0) msg += `🚨 ${criticalCount} critical issues found\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `What's costing you customers:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
        msg += `\n`;
      }
      msg += `${successTeaser}\n\n`;
      msg += `Full report ready. Want me to send it?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
      return msg;
    },

    // V2: Competitor + mobile tease
    () => {
      let msg = `Hey 👋\n\nI analyze ${businessTypeEn} websites and came across *${domain}*.\n\n`;
      msg += `📊 *${score}/100* ${getStarRating(score)}\n`;
      if (worst) msg += `${worst.emoji} ${worst.textEn}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\nMost competitors score similar. Whoever fixes it first wins.\n\n`;
      msg += `${mobileTease}\n\n`;
      if (criticalCount > 0) msg += `I have ${criticalCount} specific fixes ready. `;
      msg += `Interested?\n\n`;
      msg += `Jevgenij from Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short + money + teaser
    () => {
      let msg = `Hi 👋\n\n*${domain}*\n${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textEn}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\n`;
      if (criticalCount > 0) msg += `${criticalCount} critical issues costing you customers.\n\n`;
      msg += `${successTeaser}\n\n`;
      msg += `Report ready — interested?\n\n`;
      msg += `Jevgenij, Weblyx`;
      return msg;
    },

    // V4: Question opener
    () => {
      let msg = `Hi 👋\n\nDo you know how *${domain}* compares to your competition?\n\n`;
      msg += `I ran an audit:\n`;
      msg += `${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textEn}\n`;
      if (criticalCount > 0) {
        msg += `\n${criticalCount} critical issues:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
      }
      msg += `\n${successTeaser}\n\n`;
      msg += `Want the full report for free?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
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

  const customerLoss = getCustomerLossEstimate(params.details?.lcp, 'de');
  const successTeaser = getSuccessTeaser('de');
  const mobileTease = getMobileTease('de');

  const variations = [
    // V1: Visual + shock + success
    () => {
      let msg = `Hallo 👋\n\nIch habe ein vollständiges Audit von *${domain}* durchgeführt.\n\n`;
      msg += `${getScoreBar(score)}\n${getStarRating(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textDe}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      if (criticalCount > 0) msg += `🚨 ${criticalCount} kritische Probleme\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `Was Sie Kunden kostet:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
        msg += `\n`;
      }
      msg += `${successTeaser}\n\n`;
      msg += `Detaillierter Report fertig. Soll ich ihn senden?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
      return msg;
    },

    // V2: Competitor + mobile
    () => {
      let msg = `Guten Tag 👋\n\nIch analysiere Websites im Bereich ${businessTypeEn} und bin auf *${domain}* gestoßen.\n\n`;
      msg += `📊 *${score}/100* ${getStarRating(score)}\n`;
      if (worst) msg += `${worst.emoji} ${worst.textDe}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\nEhrlich? Die Konkurrenz schneidet ähnlich ab. Wer zuerst optimiert, gewinnt.\n\n`;
      msg += `${mobileTease}\n\n`;
      if (criticalCount > 0) msg += `${criticalCount} konkrete Empfehlungen fertig. `;
      msg += `Interesse?\n\n`;
      msg += `Jevgenij von Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short + money + teaser
    () => {
      let msg = `Hallo 👋\n\n*${domain}*\n${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textDe}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\n`;
      if (criticalCount > 0) msg += `${criticalCount} kritische Probleme, die Sie Kunden kosten.\n\n`;
      msg += `${successTeaser}\n\n`;
      msg += `Report fertig — interessiert?\n\n`;
      msg += `Jevgenij, Weblyx`;
      return msg;
    },

    // V4: Question opener
    () => {
      let msg = `Hallo 👋\n\nWissen Sie, wie *${domain}* im Vergleich zur Konkurrenz abschneidet?\n\n`;
      msg += `Audit-Ergebnis:\n`;
      msg += `${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textDe}\n`;
      if (criticalCount > 0) {
        msg += `\n${criticalCount} kritische Probleme:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
      }
      msg += `\n${successTeaser}\n\n`;
      msg += `Kostenlosen Report?\n\n`;
      msg += `Jevgenij, Weblyx 🌐`;
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

  const customerLoss = getCustomerLossEstimate(params.details?.lcp, 'ru');
  const successTeaser = getSuccessTeaser('ru');
  const mobileTease = getMobileTease('ru');

  const variations = [
    // V1: Visual + shock + success
    () => {
      let msg = `Привет 👋\n\nПровёл полный аудит *${domain}*.\n\n`;
      msg += `${getScoreBar(score)}\n${getStarRating(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textRu}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      if (criticalCount > 0) msg += `🚨 ${criticalCount} критических проблем\n`;
      msg += `\n`;
      if (topFindings.length > 0) {
        msg += `Из-за чего теряете клиентов:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
        msg += `\n`;
      }
      msg += `${successTeaser}\n\n`;
      msg += `Детальный отчёт готов. Отправить?\n\n`;
      msg += `Евгений, Weblyx 🌐`;
      return msg;
    },

    // V2: Competitor + mobile
    () => {
      let msg = `Добрый день 👋\n\nАнализирую сайты в сфере ${businessTypeEn} и наткнулся на *${domain}*.\n\n`;
      msg += `📊 *${score}/100* ${getStarRating(score)}\n`;
      if (worst) msg += `${worst.emoji} ${worst.textRu}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\nЧестно? Конкуренты не сильно лучше. Кто исправит первым — выиграет.\n\n`;
      msg += `${mobileTease}\n\n`;
      if (criticalCount > 0) msg += `${criticalCount} конкретных рекомендаций готово. `;
      msg += `Интересно?\n\n`;
      msg += `Евгений из Weblyx 🌐`;
      return msg;
    },

    // V3: Ultra short + money + teaser
    () => {
      let msg = `Привет 👋\n\n*${domain}*\n${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textRu}\n`;
      if (customerLoss) msg += `${customerLoss}\n`;
      msg += `\n`;
      if (criticalCount > 0) msg += `${criticalCount} критических проблем, из-за которых теряете клиентов.\n\n`;
      msg += `${successTeaser}\n\n`;
      msg += `Отчёт готов — интересно?\n\n`;
      msg += `Евгений, Weblyx`;
      return msg;
    },

    // V4: Question opener
    () => {
      let msg = `Привет 👋\n\nЗнаете, как *${domain}* выглядит по сравнению с конкурентами?\n\n`;
      msg += `Результат аудита:\n`;
      msg += `${getScoreBar(score)}\n\n`;
      if (worst) msg += `${worst.emoji} ${worst.textRu}\n`;
      if (criticalCount > 0) {
        msg += `\n${criticalCount} критических проблем:\n`;
        topFindings.forEach(f => { msg += `❌ ${f}\n`; });
      }
      msg += `\n${successTeaser}\n\n`;
      msg += `Бесплатный отчёт — интересно?\n\n`;
      msg += `Евгений, Weblyx 🌐`;
      return msg;
    },
  ];

  return variations[seed % variations.length]();
}
