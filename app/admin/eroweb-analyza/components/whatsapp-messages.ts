/**
 * WhatsApp message templates for EroWeb analysis
 * ULTRA SHORT — max 3 sentences, copy-paste ready
 */

export interface WhatsAppMessageParams {
  domain: string;
  businessType: string;
  businessTypeEn: string;
  score: number;
  analysisId: string;
  language: 'cs' | 'en' | 'de' | 'ru';
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
 * Get the single most shocking data point — one line
 */
function getShockLine(params: WhatsAppMessageParams): { cs: string; en: string; de: string; ru: string } | null {
  const { scores, details, score } = params;

  if (details?.lcp && details.lcp > 3500) {
    const s = (details.lcp / 1000).toFixed(1);
    return {
      cs: `Váš web se načítá ${s}s — 53 % lidí odejde po 3s.`,
      en: `Your site loads in ${s}s — 53% of visitors leave after 3s.`,
      de: `Ihre Website lädt ${s}s — 53% der Besucher gehen nach 3s.`,
      ru: `Ваш сайт грузится ${s}с — 53% посетителей уходят после 3с.`,
    };
  }
  if (details?.pageSpeedScore !== undefined && details.pageSpeedScore < 50) {
    return {
      cs: `Google PageSpeed: ${details.pageSpeedScore}/100 — kvůli tomu vás Google řadí níž.`,
      en: `Google PageSpeed: ${details.pageSpeedScore}/100 — this is hurting your Google ranking.`,
      de: `Google PageSpeed: ${details.pageSpeedScore}/100 — das schadet Ihrem Google-Ranking.`,
      ru: `Google PageSpeed: ${details.pageSpeedScore}/100 — это вредит вашему рейтингу в Google.`,
    };
  }
  if (!details?.hasHttps) {
    return {
      cs: `Váš web nemá HTTPS — prohlížeč ukazuje "Nezabezpečeno" a zákazníci odchází.`,
      en: `No HTTPS — browsers show "Not Secure" and customers leave.`,
      de: `Kein HTTPS — Browser zeigen "Nicht sicher" und Kunden gehen.`,
      ru: `Нет HTTPS — браузер показывает "Не защищено" и клиенты уходят.`,
    };
  }
  if (scores && scores.mobile < 5) {
    return {
      cs: `Na mobilu je váš web skoro nepoužitelný — a 70 % zákazníků přijde z mobilu.`,
      en: `Your site is nearly unusable on mobile — and 70% of customers come from mobile.`,
      de: `Ihre Website ist auf dem Handy kaum nutzbar — und 70% der Kunden kommen vom Handy.`,
      ru: `На мобильных ваш сайт почти непригоден — а 70% клиентов приходят с мобильных.`,
    };
  }
  if (score < 40) {
    return {
      cs: `Skóre ${score}/100 — to znamená, že přicházíte o zákazníky každý den.`,
      en: `Score ${score}/100 — you're losing customers every day because of this.`,
      de: `Score ${score}/100 — Sie verlieren deswegen jeden Tag Kunden.`,
      ru: `Оценка ${score}/100 — вы теряете клиентов каждый день из-за этого.`,
    };
  }

  return null;
}

function getCriticalCount(findings?: WhatsAppMessageParams['findings']): number {
  if (!findings) return 0;
  return findings.filter(f => f.type === 'critical').length;
}

export function getWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { language } = params;
  if (language === 'cs') return getCzechMessages(params);
  if (language === 'de') return getGermanMessages(params);
  if (language === 'ru') return getRussianMessages(params);
  return getEnglishMessages(params);
}

// ── ALL VARIATIONS (returned as array, UI shows all to pick from) ──

export function getAllWhatsAppMessages(params: WhatsAppMessageParams): string[] {
  const { language } = params;
  if (language === 'cs') return getAllCzech(params);
  if (language === 'de') return getAllGerman(params);
  if (language === 'ru') return getAllRussian(params);
  return getAllEnglish(params);
}

// ────────────────────────────────────────────────────────
// CZECH
// ────────────────────────────────────────────────────────
function getAllCzech(p: WhatsAppMessageParams): string[] {
  const { domain, score } = p;
  const shock = getShockLine(p);
  const critical = getCriticalCount(p.findings);
  const msgs: string[] = [];

  // V1: Shock fact + question (2 sentences)
  if (shock) {
    msgs.push(`Ahoj 👋 Kouknul jsem na *${domain}* — ${shock.cs} Mám konkrétní plán co s tím, chcete?`);
  }

  // V2: Score + critical count (2 sentences)
  msgs.push(`Ahoj 👋 Udělal jsem audit *${domain}* — skóre ${score}/100.${critical > 0 ? ` ${critical} kritických problémů.` : ''} Mám report s doporučeními, pošlu?`);

  // V3: Competitor angle (3 sentences)
  msgs.push(`Ahoj 👋 Dělám analýzy webů a narazil jsem na *${domain}*. Skóre ${score}/100 — konkurence na tom není o moc líp, ale kdo to opraví první, vyhraje. Mám plán — zajímá vás?`);

  // V4: Screenshot lead (for sending WITH a screenshot)
  msgs.push(`Ahoj 👋 Tohle vidí vaši zákazníci na mobilu 👆 *${domain}* — ${score}/100. Mám kompletní rozbor, chcete?`);

  // V5: Voice message script (to read aloud)
  msgs.push(`🎙️ HLASOVKA:\n"Ahoj, já jsem Jevgenij z Weblyx. Kouknul jsem na váš web ${domain} a našel jsem tam pár věcí, které vás pravděpodobně stojí zákazníky. Mám pro vás kompletní rozbor zdarma — dejte vědět jestli by vás to zajímalo. Díky!"`);

  // V6: Ultra minimal (1 sentence)
  if (shock) {
    msgs.push(`Ahoj, *${domain}*: ${shock.cs} Můžu pomoct 👋`);
  }

  return msgs;
}

function getCzechMessages(p: WhatsAppMessageParams): string {
  const all = getAllCzech(p);
  const seed = p.analysisId ? parseInt(p.analysisId.replace(/\D/g, '').slice(-4) || '0', 10) : 0;
  return all[seed % all.length];
}

// ────────────────────────────────────────────────────────
// ENGLISH
// ────────────────────────────────────────────────────────
function getAllEnglish(p: WhatsAppMessageParams): string[] {
  const { domain, score } = p;
  const shock = getShockLine(p);
  const critical = getCriticalCount(p.findings);
  const msgs: string[] = [];

  if (shock) {
    msgs.push(`Hi 👋 I checked *${domain}* — ${shock.en} I have a specific fix plan, interested?`);
  }

  msgs.push(`Hi 👋 I audited *${domain}* — score ${score}/100.${critical > 0 ? ` ${critical} critical issues.` : ''} I have a report with fixes, want it?`);

  msgs.push(`Hey 👋 I analyze websites and came across *${domain}*. Score ${score}/100 — competitors aren't much better, but whoever fixes it first wins. Interested?`);

  msgs.push(`Hi 👋 This is what your customers see on mobile 👆 *${domain}* — ${score}/100. Full report ready, want it?`);

  msgs.push(`🎙️ VOICE SCRIPT:\n"Hi, I'm Jevgenij from Weblyx. I looked at your website ${domain} and found a few things that are probably costing you customers. I have a full report ready for free — let me know if you'd be interested. Thanks!"`);

  if (shock) {
    msgs.push(`Hi, *${domain}*: ${shock.en} I can help 👋`);
  }

  return msgs;
}

function getEnglishMessages(p: WhatsAppMessageParams): string {
  const all = getAllEnglish(p);
  const seed = p.analysisId ? parseInt(p.analysisId.replace(/\D/g, '').slice(-4) || '0', 10) : 0;
  return all[seed % all.length];
}

// ────────────────────────────────────────────────────────
// GERMAN
// ────────────────────────────────────────────────────────
function getAllGerman(p: WhatsAppMessageParams): string[] {
  const { domain, score } = p;
  const shock = getShockLine(p);
  const critical = getCriticalCount(p.findings);
  const msgs: string[] = [];

  if (shock) {
    msgs.push(`Hallo 👋 Ich habe *${domain}* gecheckt — ${shock.de} Ich habe einen konkreten Plan, Interesse?`);
  }

  msgs.push(`Hallo 👋 Audit von *${domain}* — Score ${score}/100.${critical > 0 ? ` ${critical} kritische Probleme.` : ''} Report mit Empfehlungen fertig, soll ich senden?`);

  msgs.push(`Hallo 👋 Ich analysiere Websites und bin auf *${domain}* gestoßen. Score ${score}/100 — die Konkurrenz ist nicht viel besser, aber wer zuerst optimiert, gewinnt. Interesse?`);

  msgs.push(`Hallo 👋 Das sehen Ihre Kunden auf dem Handy 👆 *${domain}* — ${score}/100. Vollständiger Report fertig, Interesse?`);

  msgs.push(`🎙️ SPRACHNOTIZ:\n"Hallo, ich bin Jevgenij von Weblyx. Ich habe Ihre Website ${domain} angeschaut und ein paar Dinge gefunden, die Sie wahrscheinlich Kunden kosten. Ich habe einen kostenlosen Report — lassen Sie mich wissen, ob Sie interessiert sind. Danke!"`);

  if (shock) {
    msgs.push(`Hallo, *${domain}*: ${shock.de} Ich kann helfen 👋`);
  }

  return msgs;
}

function getGermanMessages(p: WhatsAppMessageParams): string {
  const all = getAllGerman(p);
  const seed = p.analysisId ? parseInt(p.analysisId.replace(/\D/g, '').slice(-4) || '0', 10) : 0;
  return all[seed % all.length];
}

// ────────────────────────────────────────────────────────
// RUSSIAN
// ────────────────────────────────────────────────────────
function getAllRussian(p: WhatsAppMessageParams): string[] {
  const { domain, score } = p;
  const shock = getShockLine(p);
  const critical = getCriticalCount(p.findings);
  const msgs: string[] = [];

  if (shock) {
    msgs.push(`Привет 👋 Посмотрел *${domain}* — ${shock.ru} Есть конкретный план, интересно?`);
  }

  msgs.push(`Привет 👋 Провёл аудит *${domain}* — оценка ${score}/100.${critical > 0 ? ` ${critical} критических проблем.` : ''} Отчёт с рекомендациями готов, отправить?`);

  msgs.push(`Привет 👋 Анализирую сайты и наткнулся на *${domain}*. Оценка ${score}/100 — конкуренты не сильно лучше, но кто исправит первым — выиграет. Интересно?`);

  msgs.push(`Привет 👋 Вот что видят ваши клиенты на мобильном 👆 *${domain}* — ${score}/100. Полный отчёт готов, хотите?`);

  msgs.push(`🎙️ ГОЛОСОВОЕ:\n"Привет, я Евгений из Weblyx. Посмотрел ваш сайт ${domain} и нашёл несколько вещей, которые скорее всего стоят вам клиентов. Есть бесплатный отчёт — дайте знать, если интересно. Спасибо!"`);

  if (shock) {
    msgs.push(`Привет, *${domain}*: ${shock.ru} Могу помочь 👋`);
  }

  return msgs;
}

function getRussianMessages(p: WhatsAppMessageParams): string {
  const all = getAllRussian(p);
  const seed = p.analysisId ? parseInt(p.analysisId.replace(/\D/g, '').slice(-4) || '0', 10) : 0;
  return all[seed % all.length];
}
