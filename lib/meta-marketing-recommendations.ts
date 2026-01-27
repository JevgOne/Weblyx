// Meta Marketing Recommendations Engine
// AI-powered tips and recommendations for Facebook/Instagram Ads

import { getCampaignPerformance, getAdSetPerformance, getAccountInsights } from './meta-ads';

// ============================================
// SIMPLE EXPLANATIONS (Czech)
// ============================================

export const META_EXPLANATIONS = {
  reach: {
    what: "Dosah = kolik unikátních lidí vidělo vaši reklamu",
    good: "Velký dosah = oslovujete hodně potenciálních zákazníků.",
    bad: "Malý dosah = možná máte úzké cílení nebo nízký rozpočet.",
    tip: "Dosah vs. Zobrazení: 1 člověk může vidět reklamu vícekrát.",
  },
  frequency: {
    what: "Frekvence = kolikrát průměrně 1 člověk viděl vaši reklamu",
    good: "Frekvence 1-3 je ideální. Lidé si vás zapamatují.",
    bad: "Frekvence nad 5 = 'ad fatigue' - lidé začnou reklamu ignorovat.",
    tip: "Vysoká frekvence? Obměňte kreativy nebo rozšiřte publikum.",
  },
  ctr: {
    what: "CTR (Click-Through Rate) = % lidí, kteří klikli na reklamu",
    good: "CTR nad 1% je dobrý. Nad 2% je výborný!",
    bad: "CTR pod 0.5% = reklama lidi nezaujme, zkuste jinou kreativu.",
    tip: "Video reklamy mají obvykle vyšší CTR než statické obrázky.",
  },
  cpc: {
    what: "CPC (Cost Per Click) = kolik platíte za jeden klik",
    good: "Nižší CPC = více kliků za stejné peníze.",
    bad: "Vysoký CPC může znamenat špatné cílení nebo neatraktivní reklamu.",
    tip: "Lepší relevance reklamy = nižší CPC. Meta odměňuje kvalitu.",
  },
  cpm: {
    what: "CPM (Cost Per Mille) = cena za 1000 zobrazení",
    good: "Nižší CPM = efektivnější reklama.",
    bad: "Vysoký CPM = konkurenční publikum nebo špatné cílení.",
    tip: "CPM se liší podle cílení - mladší publikum je dražší.",
  },
  conversions: {
    what: "Konverze = akce které chcete (nákup, lead, registrace)",
    good: "Více konverzí = kampaň funguje!",
    bad: "Málo konverzí = problém s cílením, reklamou nebo landing page.",
    tip: "Pixel musí být správně nastavený pro měření konverzí!",
  },
  roas: {
    what: "ROAS (Return on Ad Spend) = kolik vyděláte na každou utracenou korunu",
    good: "ROAS 3+ = na každou 1 Kč vyděláte 3 Kč. Skvělé!",
    bad: "ROAS pod 1 = tratíte peníze. Urgentně optimalizujte.",
    tip: "ROAS 2 je break-even pro většinu e-shopů (po započtení marže).",
  },
};

// ============================================
// RECOMMENDATION TYPES
// ============================================

export type MetaRecommendationType =
  | 'audience_expand'
  | 'audience_narrow'
  | 'creative_refresh'
  | 'budget_increase'
  | 'budget_decrease'
  | 'frequency_cap'
  | 'placement_optimize'
  | 'bidding_change'
  | 'schedule_optimize'
  | 'lookalike_create'
  | 'retargeting_setup'
  | 'pixel_fix'
  | 'ad_format_change'
  | 'copy_improve';

export type MetaRecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface MetaRecommendation {
  id: string;
  type: MetaRecommendationType;
  priority: MetaRecommendationPriority;
  title: string;
  description: string;
  impact: string;
  howTo: string[];
  metrics?: {
    current: string;
    target: string;
    potential: string;
  };
  relatedCampaigns?: string[];
}

// ============================================
// GENERATE RECOMMENDATIONS
// ============================================

export async function generateMetaRecommendations(): Promise<MetaRecommendation[]> {
  const recommendations: MetaRecommendation[] = [];

  try {
    const [campaigns, insights] = await Promise.all([
      getCampaignPerformance('last_30d'),
      getAccountInsights('last_30d'),
    ]);

    // Analyze overall account performance
    if (insights.impressions > 0) {
      const overallCtr = (insights.clicks / insights.impressions) * 100;
      const overallFrequency = insights.frequency;

      // High frequency warning
      if (overallFrequency > 4) {
        recommendations.push({
          id: `freq-${Date.now()}`,
          type: 'frequency_cap',
          priority: 'high',
          title: 'Vysoká frekvence reklam',
          description: `Průměrná frekvence je ${overallFrequency.toFixed(1)}x. Lidé vidí vaše reklamy příliš často a začínají je ignorovat.`,
          impact: 'Snížení "ad fatigue", lepší CTR, efektivnější využití rozpočtu',
          howTo: [
            'Rozšiřte cílové publikum o podobné zájmy',
            'Vytvořte nové kreativy (jiné obrázky/videa)',
            'Nastavte frequency cap v ad setu',
            'Zvažte Reach & Frequency kampaň místo Auction',
          ],
          metrics: {
            current: `${overallFrequency.toFixed(1)}x`,
            target: '2-3x',
            potential: 'CTR +20-40%',
          },
        });
      }

      // Low CTR
      if (overallCtr < 0.8) {
        recommendations.push({
          id: `ctr-${Date.now()}`,
          type: 'creative_refresh',
          priority: 'high',
          title: 'Nízký CTR - reklamy nezaujmou',
          description: `CTR je pouze ${overallCtr.toFixed(2)}%. Reklamy nepřitahují pozornost.`,
          impact: 'Vyšší CTR = více kliků za stejné peníze',
          howTo: [
            'Použijte video místo statických obrázků',
            'Přidejte výrazný call-to-action',
            'Otestujte carousel formát',
            'Zlepšete první 3 sekundy videa (hook)',
            'Použijte UGC (User Generated Content) styl',
          ],
          metrics: {
            current: `${overallCtr.toFixed(2)}%`,
            target: '1.5-2%',
            potential: 'CPC -30%',
          },
        });
      }

      // Good performance - scale up
      if (overallCtr > 1.5 && insights.conversions > 5) {
        recommendations.push({
          id: `scale-${Date.now()}`,
          type: 'budget_increase',
          priority: 'medium',
          title: 'Kampaně fungují - zvažte škálování',
          description: `CTR ${overallCtr.toFixed(2)}% a ${insights.conversions} konverzí. Kampaně mají potenciál růst.`,
          impact: 'Více konverzí při zachování efektivity',
          howTo: [
            'Zvyšte rozpočet o 20% každé 3-4 dny',
            'Nezvyšujte skokově - Meta potřebuje čas na optimalizaci',
            'Vytvořte Lookalike audience z konvertujících',
            'Duplikujte úspěšné ad sety do nových kampaní',
          ],
          metrics: {
            current: `${insights.conversions} konverzí`,
            target: '+50% konverzí',
            potential: 'Při správném škálování',
          },
        });
      }
    }

    // Analyze individual campaigns
    for (const campaign of campaigns) {
      // Paused campaigns with good historical performance
      if (campaign.status === 'PAUSED' && campaign.conversions && campaign.conversions > 0) {
        recommendations.push({
          id: `resume-${campaign.campaignId}`,
          type: 'budget_increase',
          priority: 'medium',
          title: `Obnovte kampaň "${campaign.campaignName}"`,
          description: `Tato pozastavená kampaň měla ${campaign.conversions} konverzí. Zvažte její obnovení.`,
          impact: 'Potenciální ztráta zákazníků',
          howTo: [
            'Zkontrolujte proč byla pozastavena',
            'Obnovte s testovacím rozpočtem',
            'Sledujte výkon první 3 dny',
          ],
          relatedCampaigns: [campaign.campaignName],
        });
      }

      // High spend, no conversions
      if (campaign.spend > 500 && (!campaign.conversions || campaign.conversions === 0)) {
        recommendations.push({
          id: `noconv-${campaign.campaignId}`,
          type: 'audience_narrow',
          priority: 'critical',
          title: `"${campaign.campaignName}" utrácí bez konverzí`,
          description: `Utraceno ${campaign.spend.toFixed(0)} Kč bez jediné konverze. Urgentně optimalizujte.`,
          impact: 'Zastavení plýtvání rozpočtem',
          howTo: [
            'Zkontrolujte Facebook Pixel - měří správně?',
            'Zužte cílové publikum',
            'Změňte kreativy - současné nefungují',
            'Zkontrolujte landing page - načítá se rychle?',
            'Zvažte pozastavení a restart s novým nastavením',
          ],
          relatedCampaigns: [campaign.campaignName],
          metrics: {
            current: `${campaign.spend.toFixed(0)} Kč, 0 konverzí`,
            target: 'Alespoň 1 konverze',
            potential: 'Úspora rozpočtu',
          },
        });
      }

      // Low reach
      if (campaign.reach > 0 && campaign.reach < 1000 && campaign.status === 'ACTIVE') {
        recommendations.push({
          id: `reach-${campaign.campaignId}`,
          type: 'audience_expand',
          priority: 'medium',
          title: `"${campaign.campaignName}" má malý dosah`,
          description: `Pouze ${campaign.reach} oslovených lidí. Publikum může být příliš úzké.`,
          impact: 'Větší pool potenciálních zákazníků',
          howTo: [
            'Rozšiřte zájmové cílení',
            'Zvětšete Lookalike z 1% na 2-3%',
            'Přidejte více lokací',
            'Zvyšte rozpočet pro větší dosah',
          ],
          relatedCampaigns: [campaign.campaignName],
        });
      }
    }

    // General recommendations
    if (campaigns.length > 0 && campaigns.every(c => c.status !== 'ACTIVE')) {
      recommendations.push({
        id: `noactive-${Date.now()}`,
        type: 'budget_increase',
        priority: 'critical',
        title: 'Žádné aktivní kampaně',
        description: 'Všechny kampaně jsou pozastavené. Neprobíhá žádná reklama.',
        impact: 'Ztrácíte potenciální zákazníky každý den',
        howTo: [
          'Obnovte alespoň jednu kampaň',
          'Nastavte testovací rozpočet (200-500 Kč/den)',
          'Sledujte výkon a optimalizujte',
        ],
      });
    }

    // Lookalike suggestion
    if (insights.conversions > 20) {
      recommendations.push({
        id: `lookalike-${Date.now()}`,
        type: 'lookalike_create',
        priority: 'medium',
        title: 'Vytvořte Lookalike audience',
        description: `Máte ${insights.conversions} konverzí - ideální základ pro Lookalike publikum.`,
        impact: 'Oslovte lidi podobné vašim zákazníkům',
        howTo: [
          'V Ads Manager jděte do Audiences',
          'Create Audience → Lookalike Audience',
          'Zvolte zdroj: Custom Audience (purchasers/leads)',
          'Začněte s 1% Lookalike, postupně testujte 2-5%',
        ],
        metrics: {
          current: `${insights.conversions} konverzí jako zdroj`,
          target: 'Lookalike 1-3%',
          potential: 'Nové kvalitní publikum',
        },
      });
    }

    // Retargeting suggestion
    if (insights.clicks > 500 && insights.conversions < 10) {
      recommendations.push({
        id: `retarget-${Date.now()}`,
        type: 'retargeting_setup',
        priority: 'high',
        title: 'Nastavte retargeting kampaň',
        description: `${insights.clicks} kliků ale pouze ${insights.conversions} konverzí. Vraťte návštěvníky zpět.`,
        impact: 'Konverze z lidí, kteří už projevili zájem',
        howTo: [
          'Vytvořte Custom Audience z návštěvníků webu (180 dní)',
          'Vytvořte speciální retargeting kreativy',
          'Nabídněte slevu nebo bonus pro ty, co se vrátí',
          'Nastavte nízký rozpočet - retargeting je levný',
        ],
        metrics: {
          current: `${((insights.conversions / insights.clicks) * 100).toFixed(2)}% konverzní poměr`,
          target: '+50% konverzí',
          potential: 'Z existujících návštěvníků',
        },
      });
    }

  } catch (error) {
    console.error('Error generating Meta recommendations:', error);
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

// ============================================
// TIPS & BEST PRACTICES
// ============================================

export const META_TIPS = {
  creative: [
    {
      title: "Video je král",
      tip: "Video reklamy mají 2-3x vyšší engagement než statické obrázky. Ideální délka: 15-30 sekund.",
      icon: "video",
    },
    {
      title: "Hook v prvních 3 sekundách",
      tip: "80% lidí scrolluje dál do 3 sekund. Začněte něčím, co zastaví palec!",
      icon: "zap",
    },
    {
      title: "UGC funguje lépe",
      tip: "User Generated Content (natočené na mobil) má často lepší výkon než profesionální produkce.",
      icon: "users",
    },
    {
      title: "Carousel pro více produktů",
      tip: "Carousel formát má vyšší CTR a umožňuje ukázat více produktů/benefitů.",
      icon: "layers",
    },
    {
      title: "Testujte 3-5 kreativ",
      tip: "Nikdy nepoužívejte jen 1 kreativu. Meta vybere nejlepší automaticky.",
      icon: "shuffle",
    },
  ],
  targeting: [
    {
      title: "Broad je nový smart",
      tip: "Meta algoritmus je chytrý. Často funguje lépe široké cílení než mikrodetailní.",
      icon: "target",
    },
    {
      title: "Lookalike 1% je základ",
      tip: "Lookalike z vašich zákazníků je nejcennější publikum. Začněte s 1%.",
      icon: "users",
    },
    {
      title: "Retargeting je levný",
      tip: "Lidé, co už byli na webu, konvertují 3-5x častěji. Nastavte retargeting!",
      icon: "refresh-cw",
    },
    {
      title: "Vylučte zákazníky",
      tip: "Nevyhazujte peníze za reklamu lidem, co už koupili. Excludujte je.",
      icon: "user-x",
    },
  ],
  optimization: [
    {
      title: "Nedotýkejte se 3-4 dny",
      tip: "Po spuštění nechte kampaň běžet 3-4 dny. Meta potřebuje čas na learning phase.",
      icon: "clock",
    },
    {
      title: "Škálujte pomalu",
      tip: "Zvyšujte rozpočet max o 20% každé 3-4 dny. Skokové změny rozbijí optimalizaci.",
      icon: "trending-up",
    },
    {
      title: "CBO vs ABO",
      tip: "Campaign Budget Optimization (CBO) funguje lépe s více ad sety. Pro 1-2 ad sety použijte ABO.",
      icon: "sliders",
    },
    {
      title: "Advantage+ Placements",
      tip: "Nechte Meta vybrat placements automaticky. Ruční výběr omezuje optimalizaci.",
      icon: "check-circle",
    },
  ],
  copywriting: [
    {
      title: "Emoji zvyšují engagement",
      tip: "Reklamy s emoji mají vyšší CTR. Ale nepřehánějte to - 2-3 emoji stačí.",
      icon: "smile",
    },
    {
      title: "Social proof funguje",
      tip: "'Už 5000+ spokojených zákazníků' je silnější než 'Kvalitní produkt'.",
      icon: "star",
    },
    {
      title: "FOMO prodává",
      tip: "Urgence a limitované nabídky zvyšují konverze. 'Jen do neděle', 'Posledních 10 kusů'.",
      icon: "alert-triangle",
    },
    {
      title: "Krátce a jasně",
      tip: "Lidé nečtou dlouhé texty. Hlavní message v prvních 125 znacích (před 'See more').",
      icon: "file-text",
    },
  ],
};

// ============================================
// AD COPY SUGGESTIONS
// ============================================

export interface AdCopySuggestion {
  headline: string;
  primaryText: string;
  description: string;
  callToAction: string;
  angle: string;
}

export function generateAdCopySuggestions(
  businessType: string,
  product: string,
  benefit: string,
  language: 'cs' | 'en' = 'cs'
): AdCopySuggestion[] {
  const templates = {
    cs: [
      {
        angle: 'benefit',
        headline: `${benefit} s ${product}`,
        primaryText: `Objevte, jak vám ${product} pomůže ${benefit.toLowerCase()}. Tisíce spokojených zákazníků už ví proč.`,
        description: `✅ ${benefit} • Doprava zdarma • 30 dní na vrácení`,
        callToAction: 'Zjistit více',
      },
      {
        angle: 'social-proof',
        headline: `Proč ${product} miluje 5000+ lidí`,
        primaryText: `"Nejlepší investice!" ⭐⭐⭐⭐⭐ Přidejte se k tisícům spokojených zákazníků.`,
        description: `Hodnocení 4.9/5 • ${benefit}`,
        callToAction: 'Nakoupit',
      },
      {
        angle: 'urgency',
        headline: `🔥 ${product} - pouze tento týden`,
        primaryText: `SLEVA 20% končí v neděli! Nečekejte - ${benefit.toLowerCase()} na vás čeká.`,
        description: `⏰ Limitovaná nabídka • Doprava zdarma`,
        callToAction: 'Využít slevu',
      },
      {
        angle: 'problem-solution',
        headline: `Trápí vás...? ${product} pomůže`,
        primaryText: `Konec frustrace! ${product} vám zajistí ${benefit.toLowerCase()}. Vyzkoušejte bez rizika.`,
        description: `💡 Jednoduché řešení • Záruka spokojenosti`,
        callToAction: 'Vyzkoušet',
      },
      {
        angle: 'question',
        headline: `Chcete ${benefit.toLowerCase()}?`,
        primaryText: `${product} je odpověď. Zjistěte, proč nám důvěřují tisíce zákazníků.`,
        description: `✨ ${benefit} • Rychlé dodání`,
        callToAction: 'Zjistit jak',
      },
    ],
    en: [
      {
        angle: 'benefit',
        headline: `${benefit} with ${product}`,
        primaryText: `Discover how ${product} helps you ${benefit.toLowerCase()}. Join thousands of happy customers.`,
        description: `✅ ${benefit} • Free Shipping • 30-Day Returns`,
        callToAction: 'Learn More',
      },
      // ... more English templates
    ],
  };

  return templates[language] || templates.cs;
}
