// Google Marketing Recommendations Engine
// "Marketing pro každého" - jednoduché vysvětlení pro běžné uživatele

import { Recommendation, RecommendationType, RecommendationPriority } from './turso/google-marketing';

// ============================================
// SIMPLE EXPLANATIONS (Czech)
// ============================================

export const SIMPLE_EXPLANATIONS = {
  ctr: {
    what: "CTR (Click-Through Rate) = kolik procent lidí klikne na vaši reklamu",
    good: "Dobrý CTR je nad 2%. Znamená to, že reklama lidi zaujme.",
    bad: "Nízký CTR (pod 1%) = reklama lidi nezaujme, platíte za zobrazení zbytečně.",
    tip: "Vyšší CTR = Google vás odměňuje nižší cenou za klik!",
  },
  cpc: {
    what: "CPC (Cost Per Click) = kolik platíte za jeden klik",
    good: "Nižší CPC = více kliků za stejné peníze.",
    bad: "Vysoký CPC znamená, že konkurence je velká nebo reklama není relevantní.",
    tip: "Lepší Quality Score = nižší CPC. Google odměňuje kvalitní reklamy.",
  },
  conversions: {
    what: "Konverze = když někdo udělá to, co chcete (poptávka, nákup, registrace)",
    good: "Více konverzí = více zákazníků. To je hlavní cíl!",
    bad: "Málo konverzí = lidé chodí, ale neobjednávají. Problém je na webu nebo v cílení.",
    tip: "1 konverze za 500 Kč je lepší než 10 kliků za 50 Kč bez konverze!",
  },
  quality_score: {
    what: "Quality Score = známka od Googlu (1-10) jak dobrá je vaše reklama",
    good: "Skóre 7+ = Google vás bude ukazovat častěji a levněji.",
    bad: "Skóre pod 5 = platíte zbytečně moc, Google vás penalizuje.",
    tip: "Zlepšete: relevanci reklamy, landing page a CTR.",
  },
  impressions: {
    what: "Zobrazení = kolikrát se reklama ukázala lidem",
    good: "Hodně zobrazení = hodně příležitostí oslovit zákazníky.",
    bad: "Málo zobrazení = možná máte nízký rozpočet nebo úzké cílení.",
    tip: "Zobrazení bez kliků = reklama lidi nezaujme.",
  },
};

// ============================================
// IMPACT COMPARISONS
// ============================================

interface ImpactComparison {
  action: string;
  ifYouDo: string;
  ifYouDont: string;
  bestCase: string;
  worstCase: string;
  recommendation: string;
}

export function getImpactComparison(type: RecommendationType, context: any): ImpactComparison {
  switch (type) {
    case 'keyword_negative':
      return {
        action: `Přidat "${context.keyword}" jako negativní klíčové slovo`,
        ifYouDo: `Přestanete platit za irelevantní kliky. Ušetříte cca ${context.estimatedSavings || '?'} Kč/měsíc.`,
        ifYouDont: `Budete dál platit za lidi, kteří hledají něco jiného a nekonvertují.`,
        bestCase: `Ušetříte rozpočet a CTR se zlepší (méně špatných kliků).`,
        worstCase: `Minimální riziko. Můžete to kdykoli zrušit.`,
        recommendation: `✅ Doporučujeme - nízké riziko, jasná úspora.`,
      };

    case 'keyword_remove':
      return {
        action: `Odebrat klíčové slovo "${context.keyword}"`,
        ifYouDo: `Přestanete utrácet za slovo, které nepřináší výsledky.`,
        ifYouDont: `Budete dál platit ${context.cost || '?'} Kč za ${context.clicks || '?'} kliků bez konverzí.`,
        bestCase: `Ušetřený rozpočet použijete na slova, která fungují.`,
        worstCase: `Možná přijdete o pár zobrazení, ale ta stejně nekonvertovala.`,
        recommendation: context.clicks > 100 && context.conversions === 0
          ? `✅ Silně doporučujeme - 100+ kliků bez jediné konverze je jasný signál.`
          : `⚠️ Zvážit - sledujte ještě týden, možná se to zlepší.`,
      };

    case 'bid_adjust':
      const bidDirection = context.newBid > context.currentBid ? 'zvýšit' : 'snížit';
      const bidDiff = Math.abs(context.newBid - context.currentBid);
      return {
        action: `${bidDirection.charAt(0).toUpperCase() + bidDirection.slice(1)} nabídku z ${context.currentBid} Kč na ${context.newBid} Kč`,
        ifYouDo: bidDirection === 'zvýšit'
          ? `Dostanete lepší pozice v Google, více kliků. Ale každý klik bude dražší.`
          : `Ušetříte na každém kliku, ale můžete ztratit pozice a kliků bude méně.`,
        ifYouDont: `Současná situace zůstane stejná.`,
        bestCase: bidDirection === 'zvýšit'
          ? `Lepší pozice → více kliků → více konverzí (pokud web funguje).`
          : `Méně utratíte za stejné množství konverzí = lepší ROI.`,
        worstCase: bidDirection === 'zvýšit'
          ? `Zaplatíte více, ale konverze se nezvednou. Rozpočet vyčerpáte rychleji.`
          : `Ztratíte pozice, méně lidí vás uvidí, méně konverzí.`,
        recommendation: `⚠️ Střední riziko - vyzkoušejte na týden a sledujte výsledky.`,
      };

    case 'budget_adjust':
      const budgetDirection = context.newBudget > context.currentBudget ? 'navýšit' : 'snížit';
      return {
        action: `${budgetDirection.charAt(0).toUpperCase() + budgetDirection.slice(1)} denní rozpočet z ${context.currentBudget} Kč na ${context.newBudget} Kč`,
        ifYouDo: budgetDirection === 'navýšit'
          ? `Reklamy se budou ukazovat déle během dne, oslovíte více lidí.`
          : `Ušetříte peníze, ale reklamy se můžou přestat ukazovat dřív.`,
        ifYouDont: budgetDirection === 'navýšit'
          ? `Reklamy se vypnou dřív než skončí den - přicházíte o potenciální zákazníky.`
          : `Utratíte více, ale pokud kampaň funguje dobře, je to OK.`,
        bestCase: budgetDirection === 'navýšit'
          ? `Více zobrazení → více kliků → více konverzí.`
          : `Stejné konverze za méně peněz = lepší efektivita.`,
        worstCase: budgetDirection === 'navýšit'
          ? `Utratíte více, ale konverze se nezvýší (problém je jinde).`
          : `Méně konverzí, méně zákazníků.`,
        recommendation: context.conversionRate > 0.02
          ? `✅ Kampaň konvertuje dobře - ${budgetDirection === 'navýšit' ? 'navýšení dává smysl' : 'ale zvažte, jestli chcete méně zákazníků'}.`
          : `⚠️ Kampaň zatím moc nekonvertuje - ${budgetDirection === 'navýšit' ? 'nejdřív optimalizujte, pak navyšte' : 'snížení je rozumné'}.`,
      };

    case 'ad_copy_refresh':
      return {
        action: `Aktualizovat texty reklam`,
        ifYouDo: `Nové texty mohou lépe zaujmout a zvýšit CTR. Google má rád čerstvý obsah.`,
        ifYouDont: `Stávající reklamy "unaví" publikum, CTR bude dál klesat.`,
        bestCase: `CTR se zvedne o 20-50%, což sníží CPC a zvýší konverze.`,
        worstCase: `Nové reklamy budou horší - ale můžete se vrátit k původním.`,
        recommendation: `✅ Doporučujeme - vždy testujte nové varianty. A/B testování je základ.`,
      };

    case 'landing_page':
      return {
        action: `Vylepšit cílovou stránku`,
        ifYouDo: `Lepší stránka = více konverzí ze stejného počtu kliků.`,
        ifYouDont: `Platíte za kliky, ale lidé odcházejí bez akce. Vyhazujete peníze.`,
        bestCase: `Konverzní poměr se zdvojnásobí - dvojnásobek zákazníků za stejné peníze!`,
        worstCase: `Změny nepomůžou - ale aspoň budete vědět, že problém je jinde.`,
        recommendation: `✅ Silně doporučujeme - landing page je 50% úspěchu!`,
      };

    case 'schedule_adjust':
      return {
        action: `Optimalizovat časy zobrazování reklam`,
        ifYouDo: `Reklamy se budou ukazovat když jsou zákazníci aktivní a nakupují.`,
        ifYouDont: `Utrácíte rozpočet i v noci nebo o víkendu, kdy nikdo nekonvertuje.`,
        bestCase: `Stejný rozpočet, ale více konverzí (efektivnější využití).`,
        worstCase: `Přijdete o pár kliků v "mrtvých" hodinách, ale ty stejně nekonvertovaly.`,
        recommendation: `✅ Doporučujeme - analyzujte kdy zákazníci konvertují a cílte na tyto časy.`,
      };

    case 'keyword_add':
      return {
        action: `Přidat nové klíčové slovo "${context.keyword}"`,
        ifYouDo: `Oslovíte nové zákazníky, kteří hledají toto slovo.`,
        ifYouDont: `Přicházíte o potenciální zákazníky, které osloví konkurence.`,
        bestCase: `Nové slovo přinese konverze za rozumnou cenu.`,
        worstCase: `Slovo nebude fungovat - ale uvidíte to rychle a můžete ho vypnout.`,
        recommendation: context.searchVolume > 100
          ? `✅ Doporučujeme - slovo má dobrý objem hledání.`
          : `⚠️ Nízký objem - zkuste to, ale sledujte výsledky.`,
      };

    default:
      return {
        action: context.title || 'Provést změnu',
        ifYouDo: 'Situace se může zlepšit.',
        ifYouDont: 'Situace zůstane stejná.',
        bestCase: 'Zlepšení výkonu kampaně.',
        worstCase: 'Změna nepřinese očekávaný výsledek.',
        recommendation: '⚠️ Zvažte - záleží na situaci.',
      };
  }
}

// ============================================
// GENERATE RECOMMENDATIONS
// ============================================

interface CampaignData {
  campaignId: string;
  campaignName: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
    conversions: number;
    conversionRate: number;
    cpc: number;
    costPerConversion: number;
  };
  keywords: Array<{
    keyword: string;
    matchType: string;
    impressions: number;
    clicks: number;
    ctr: number;
    cost: number;
    conversions: number;
  }>;
  searchTerms?: Array<{
    term: string;
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
  }>;
  ga4Data?: {
    bounceRate: number;
    avgSessionDuration: number;
    topPages: Array<{ path: string; bounceRate: number }>;
  };
  gscData?: {
    topQueries: Array<{ query: string; clicks: number; impressions: number; position: number }>;
  };
}

export function generateRecommendations(data: CampaignData): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { metrics, keywords, searchTerms, ga4Data, gscData } = data;

  // ============================================
  // 1. CRITICAL ISSUES
  // ============================================

  // Very low CTR
  if (metrics.ctr < 0.01 && metrics.impressions > 500) {
    recommendations.push({
      id: `crit-low-ctr-${Date.now()}`,
      type: 'ad_copy_refresh',
      priority: 'critical',
      status: 'pending',
      title: '🚨 Kriticky nízký CTR - reklamy lidi nezaujaly',
      description: `Váš CTR je pouze ${(metrics.ctr * 100).toFixed(2)}%. To znamená, že z 1000 zobrazení klikne méně než 10 lidí.`,
      reasoning: `
**Proč je to problém?**
- Platíte Googlu za zobrazení, ale nikdo nekliká
- Nízký CTR = Google si myslí, že reklama není relevantní
- To vede k vyšší ceně za klik (CPC) a horším pozicím

**Pravděpodobná příčina:**
- Headlines nezaujmou - nejsou dost konkrétní nebo lákavé
- Klíčová slova nesedí s tím, co lidé hledají
- Konkurence má lepší nabídky v reklamách
      `.trim(),
      expectedImpact: 'Zlepšení CTR na 2%+ může snížit CPC až o 30% a zvýšit počet kliků.',
      effort: 'medium',
      autoApplicable: false,
      data: { currentCtr: metrics.ctr },
    });
  }

  // High CPA with low conversions
  if (metrics.conversions > 0 && metrics.costPerConversion > 1000 && metrics.cost > 3000) {
    recommendations.push({
      id: `crit-high-cpa-${Date.now()}`,
      type: 'targeting_adjust',
      priority: 'critical',
      status: 'pending',
      title: '🚨 Příliš drahé konverze',
      description: `Jedna konverze vás stojí ${Math.round(metrics.costPerConversion)} Kč. Je to víc než byste měli platit?`,
      reasoning: `
**Proč je to problém?**
- Pokud z jedné konverze vyděláte méně než ${Math.round(metrics.costPerConversion)} Kč, proděláváte
- Reklama přivádí špatné zákazníky nebo web nekonvertuje

**Co to může způsobovat:**
- Široké cílení - oslovujete lidi, kteří nekupují
- Špatná landing page - lidé přijdou, ale neobjednají
- Klíčová slova s nízkou nákupní intencí
      `.trim(),
      expectedImpact: 'Cíl: snížit CPA alespoň o 30% pomocí lepšího cílení.',
      effort: 'high',
      autoApplicable: false,
      data: { currentCpa: metrics.costPerConversion },
    });
  }

  // ============================================
  // 2. NEGATIVE KEYWORDS (Auto-applicable)
  // ============================================

  if (searchTerms) {
    // Find search terms with impressions but no clicks or conversions
    const badTerms = searchTerms.filter(t =>
      t.impressions > 50 && t.clicks < 2 && t.conversions === 0
    );

    badTerms.slice(0, 5).forEach((term, i) => {
      recommendations.push({
        id: `neg-kw-${i}-${Date.now()}`,
        type: 'keyword_negative',
        priority: 'high',
        status: 'pending',
        title: `🚫 Přidat negativní: "${term.term}"`,
        description: `Tento hledaný výraz měl ${term.impressions} zobrazení, ale jen ${term.clicks} kliků a 0 konverzí.`,
        reasoning: `
**Proč to doporučujeme?**
- Lidé hledající "${term.term}" zřejmě hledají něco jiného
- ${term.impressions} zobrazení = platíte za to, že Google ukazuje vaši reklamu
- ${term.clicks} kliků = málo lidí klikne = reklama pro ně není relevantní
- 0 konverzí = i ti co klikli, nekoupili

**Co se stane když přidáte negativní slovo?**
- Reklama se přestane ukazovat na toto hledání
- Ušetříte rozpočet na relevantní hledání
- CTR se zlepší (méně "špatných" zobrazení)
        `.trim(),
        expectedImpact: `Ušetříte cca ${Math.round(term.cost || term.clicks * metrics.cpc)} Kč/měsíc na irelevantních klikách.`,
        effort: 'low',
        autoApplicable: true,
        data: { keyword: term.term, impressions: term.impressions, clicks: term.clicks },
      });
    });
  }

  // ============================================
  // 3. UNDERPERFORMING KEYWORDS
  // ============================================

  const underperformingKws = keywords.filter(kw =>
    kw.clicks > 50 && kw.conversions === 0 && kw.cost > 500
  );

  underperformingKws.slice(0, 3).forEach((kw, i) => {
    recommendations.push({
      id: `remove-kw-${i}-${Date.now()}`,
      type: 'keyword_remove',
      priority: 'high',
      status: 'pending',
      title: `❌ Zvážit odebrání: "${kw.keyword}"`,
      description: `${kw.clicks} kliků za ${Math.round(kw.cost)} Kč, ale 0 konverzí.`,
      reasoning: `
**Proč to doporučujeme?**
- Utratili jste ${Math.round(kw.cost)} Kč za ${kw.clicks} kliků
- Ani jeden člověk nekonvertoval (neposlal poptávku, nekoupil)
- To je ${kw.clicks} šancí a žádný úspěch

**Co to může znamenat?**
- Slovo "${kw.keyword}" přitahuje špatné publikum
- Lidé hledají něco jiného, než nabízíte
- Nebo je problém na landing page

**Co se stane když slovo odeberete?**
- Přestanete utrácet za něco, co nefunguje
- Rozpočet se přesměruje na slova, která fungují
- Můžete ho kdykoliv vrátit zpět
      `.trim(),
      expectedImpact: `Ušetříte cca ${Math.round(kw.cost)} Kč/měsíc.`,
      effort: 'low',
      autoApplicable: true,
      data: { keyword: kw.keyword, clicks: kw.clicks, cost: kw.cost, conversions: kw.conversions },
    });
  });

  // ============================================
  // 4. HIGH POTENTIAL KEYWORDS FROM GSC
  // ============================================

  if (gscData?.topQueries) {
    // Find organic queries with good impressions that aren't in paid keywords
    const keywordTexts = keywords.map(k => k.keyword.toLowerCase());
    const potentialKws = gscData.topQueries.filter(q =>
      q.impressions > 100 &&
      q.position > 5 && // Not ranking well organically
      !keywordTexts.some(k => q.query.toLowerCase().includes(k) || k.includes(q.query.toLowerCase()))
    );

    potentialKws.slice(0, 3).forEach((query, i) => {
      recommendations.push({
        id: `add-kw-gsc-${i}-${Date.now()}`,
        type: 'keyword_add',
        priority: 'medium',
        status: 'pending',
        title: `➕ Přidat klíčové slovo: "${query.query}"`,
        description: `Lidé vás hledají organicky (${query.impressions} zobrazení), ale nejste v placených výsledcích.`,
        reasoning: `
**Proč to doporučujeme?**
- Podle Search Console lidé hledají "${query.query}" a vy se jim zobrazujete
- Ale vaše organická pozice je ${query.position.toFixed(1)} - to je stránka ${Math.ceil(query.position / 10)}
- Na stránce 2+ vás téměř nikdo nevidí

**Co se stane když přidáte jako klíčové slovo do Ads?**
- Zobrazíte se v placených výsledcích (nad organickými)
- Lidi, kteří vás hledají, vás uvidí první
- Zvýšíte šanci na konverzi

**Data z Search Console:**
- ${query.impressions} organických zobrazení za měsíc
- ${query.clicks} kliků (průměrná pozice ${query.position.toFixed(1)})
        `.trim(),
        expectedImpact: `Potenciálně ${Math.round(query.impressions * 0.03)} kliků navíc měsíčně.`,
        effort: 'low',
        autoApplicable: false,
        data: { keyword: query.query, searchVolume: query.impressions, organicPosition: query.position },
      });
    });
  }

  // ============================================
  // 5. LANDING PAGE ISSUES
  // ============================================

  if (ga4Data && ga4Data.bounceRate > 70) {
    recommendations.push({
      id: `landing-bounce-${Date.now()}`,
      type: 'landing_page',
      priority: 'high',
      status: 'pending',
      title: '🌐 Vysoký bounce rate - lidé rychle odcházejí',
      description: `${ga4Data.bounceRate.toFixed(0)}% návštěvníků odejde bez jakékoli interakce.`,
      reasoning: `
**Co je bounce rate?**
- Procento lidí, kteří přijdou na web a hned odejdou
- Neprohlédnou si další stránky, nekliknou na nic

**Proč je ${ga4Data.bounceRate.toFixed(0)}% problém?**
- Platíte za každý klik, ale ${ga4Data.bounceRate.toFixed(0)}% lidí odejde bez akce
- To znamená, že 7 z 10 kliků je "vyhozených"
- Problém je buď v cílení (špatní lidé) nebo na webu

**Co může způsobovat vysoký bounce rate:**
- Pomalé načítání stránky (lidi čekat nebudou)
- Stránka neodpovídá tomu, co hledali
- Nepřehledný design, těžké najít co chtějí
- Chybí jasná výzva k akci (CTA)
- Nedůvěryhodný vzhled
      `.trim(),
      expectedImpact: 'Snížení bounce rate o 20% může zdvojnásobit počet konverzí!',
      effort: 'high',
      autoApplicable: false,
      data: { bounceRate: ga4Data.bounceRate, avgSessionDuration: ga4Data.avgSessionDuration },
    });
  }

  // ============================================
  // 6. SCHEDULE OPTIMIZATION
  // ============================================

  // This would need hourly data, but we can suggest analysis
  if (metrics.clicks > 100 && metrics.conversions < metrics.clicks * 0.02) {
    recommendations.push({
      id: `schedule-opt-${Date.now()}`,
      type: 'schedule_adjust',
      priority: 'medium',
      status: 'pending',
      title: '🕐 Optimalizovat časy zobrazování',
      description: 'Analyzujte, kdy vaši zákazníci skutečně konvertují.',
      reasoning: `
**Proč je to důležité?**
- Ne všechny hodiny jsou stejně hodnotné
- Lidé v noci většinou nekupují (prohlížejí)
- B2B zákazníci kupují v pracovní době
- B2C spíše večer a o víkendu

**Co zjistit:**
- V kolik hodin máte nejvíc konverzí?
- Které dny v týdnu fungují nejlépe?
- Kdy je nejvyšší CTR?

**Co pak udělat:**
- Zvýšit nabídky v "zlatých" hodinách
- Snížit nebo vypnout reklamy v mrtvých časech
- Ušetřit rozpočet a cílit efektivněji
      `.trim(),
      expectedImpact: 'Lepší časování může zvýšit konverze o 10-30% při stejném rozpočtu.',
      effort: 'low',
      autoApplicable: false,
      data: {},
    });
  }

  // ============================================
  // 7. POSITIVE SIGNALS
  // ============================================

  // Find best performing keywords
  const topKws = keywords
    .filter(kw => kw.conversions > 0)
    .sort((a, b) => {
      const aROI = a.conversions / (a.cost || 1);
      const bROI = b.conversions / (b.cost || 1);
      return bROI - aROI;
    })
    .slice(0, 3);

  if (topKws.length > 0 && metrics.cost < 10000) {
    recommendations.push({
      id: `budget-top-kw-${Date.now()}`,
      type: 'budget_adjust',
      priority: 'medium',
      status: 'pending',
      title: '📈 Zvážit navýšení rozpočtu',
      description: `Máte klíčová slova, která konvertují dobře. Více rozpočtu = více zákazníků.`,
      reasoning: `
**Vaše nejlepší klíčová slova:**
${topKws.map(kw => `- "${kw.keyword}": ${kw.conversions} konverzí za ${Math.round(kw.cost)} Kč`).join('\n')}

**Proč navýšit rozpočet?**
- Máte ověřeno, že kampaň funguje
- Více rozpočtu = více zobrazení = více kliků = více konverzí
- Tyto klíčová slova už přinášejí zákazníky

**Riziko:**
- Pokud navýšíte moc, můžete saturovat trh
- Sledujte, jestli se CPA nezvyšuje
      `.trim(),
      expectedImpact: `Navýšení rozpočtu o 50% by mohlo přinést cca ${Math.round(metrics.conversions * 0.5)} konverzí navíc.`,
      effort: 'low',
      autoApplicable: false,
      data: {
        currentBudget: Math.round(metrics.cost / 30),
        newBudget: Math.round((metrics.cost / 30) * 1.5),
        topKeywords: topKws.map(k => k.keyword),
      },
    });
  }

  return recommendations;
}

// ============================================
// PRIORITY EXPLANATIONS
// ============================================

export const PRIORITY_INFO = {
  critical: {
    label: 'Kritické',
    emoji: '🚨',
    color: 'red',
    description: 'Okamžitě řešit - přicházíte o peníze nebo zákazníky',
  },
  high: {
    label: 'Vysoká',
    emoji: '⚠️',
    color: 'orange',
    description: 'Řešit tento týden - výrazně zlepší výkon',
  },
  medium: {
    label: 'Střední',
    emoji: '💡',
    color: 'yellow',
    description: 'Zvážit - pomůže optimalizovat kampaň',
  },
  low: {
    label: 'Nízká',
    emoji: '📌',
    color: 'blue',
    description: 'Drobné vylepšení - nice to have',
  },
};

// ============================================
// EFFORT EXPLANATIONS
// ============================================

export const EFFORT_INFO = {
  low: {
    label: 'Snadné',
    emoji: '⚡',
    description: 'Pár kliků, hotovo za minutu',
  },
  medium: {
    label: 'Střední',
    emoji: '🔧',
    description: 'Potřebuje nějakou práci, 10-30 minut',
  },
  high: {
    label: 'Náročné',
    emoji: '🏗️',
    description: 'Větší změna, možná potřebuje specialistu',
  },
};
