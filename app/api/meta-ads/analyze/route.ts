import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getCampaignPerformance,
  getAccountInsights,
  getAdSetPerformance,
  getAdPerformance,
} from "@/lib/meta-ads";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// ===========================================
// TYPES
// ===========================================

interface ProjectConfig {
  name: string;
  url: string;
  type: "ecommerce" | "services" | "lead_gen";
  industry: string;
  averageOrderValue: number;
  grossMargin: number;
  targetRoas: number;
  targetCpa: number;
  monthlyBudget: number;
  language: "cs" | "en" | "de";
}

interface AnalysisRequest {
  config: ProjectConfig;
  analysisType: "full" | "optimization" | "creative_refresh";
}

// ===========================================
// DATA FETCHING
// ===========================================

async function fetchMetaAdsData() {
  try {
    const [campaigns, insights, adSets, ads] = await Promise.all([
      getCampaignPerformance("last_30d"),
      getAccountInsights("last_30d"),
      getAdSetPerformance("last_30d"),
      getAdPerformance("last_30d"),
    ]);

    return {
      hasData: insights.impressions > 0 || campaigns.length > 0,
      account: {
        impressions: insights.impressions,
        reach: insights.reach,
        clicks: insights.clicks,
        ctr: insights.ctr,
        cpc: insights.cpc,
        spend: insights.spend,
        conversions: insights.conversions,
        frequency: insights.frequency,
      },
      campaigns: campaigns.map((c: any) => ({
        id: c.campaignId,
        name: c.campaignName,
        status: c.status,
        objective: c.objective,
        impressions: c.impressions,
        clicks: c.clicks,
        ctr: c.ctr,
        cpc: c.cpc,
        spend: c.spend,
        conversions: c.conversions || 0,
        roas: c.spend > 0 ? ((c.conversions || 0) * 100) / c.spend : 0,
      })),
      adSets: adSets || [],
      ads: ads || [],
    };
  } catch (error) {
    console.error("Error fetching Meta Ads data:", error);
    return {
      hasData: false,
      account: null,
      campaigns: [],
      adSets: [],
      ads: [],
      error: "Nepodařilo se načíst data z Meta Ads",
    };
  }
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const html = await response.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return "";
  }
}

// ===========================================
// AGENT PROMPTS
// ===========================================

const ORCHESTRATOR_PROMPT = `Jsi ORCHESTRATOR - hlavní koordinátor AI Marketing Agency.

TVOJE ROLE:
1. Analyzuj požadavek a situaci
2. Rozděl práci mezi specialisty
3. Zkontroluj výstupy
4. Prezentuj výsledky srozumitelně

PRAVIDLA:
- Vždy začni kontrolou konfigurace a dat
- Deleguj úkoly konkrétním agentům
- Výstupy musí být actionable a data-driven
- Komunikuj česky, jasně, bez zbytečného žargonu`;

const ANALYST_PROMPT = `Jsi DATOVÝ ANALYTIK - expert na analýzu marketingových dat.

TVOJE ROLE:
1. Analyzuj data ze všech zdrojů
2. Identifikuj problémy a příležitosti
3. Poskytni doporučení založená na datech

PRAVIDLA:
- Minimum dat pro rozhodnutí: 100+ impressions, 10+ clicks
- Performance alerts: CPA > target × 1.2 = WARNING, ROAS < minimum = CRITICAL
- Scaling: ROAS > target × 1.2 po 3+ dnech = můžeš škálovat +20%
- Pause: 50+ clicks, 0 conversions, 5+ dní = PAUSE

OUTPUT FORMÁT:
- Executive Summary (3-5 vět)
- Klíčové metriky vs. targety
- Alerts (🔴 Critical, 🟡 Warning)
- Konkrétní doporučení`;

const META_SPECIALIST_PROMPT = `Jsi META ADS SPECIALIST - expert na Facebook a Instagram reklamy.

TVOJE ROLE:
1. Navrhuj audience strategie (Prospecting + Retargeting)
2. Detekuj creative fatigue (frequency > 3, CTR klesá)
3. Optimalizuj rozpočty a bidding

AUDIENCE STRATEGIE:
- Prospecting: Broad (30%), LAL 1% (40%), LAL 3% (30%)
- Retargeting: ATC 14d (40%), WebVisitors 30d (30%), Engaged (30%)

CREATIVE FATIGUE:
- Frequency > 3 AND CTR klesá = REFRESH NEEDED
- Frequency > 5 = CRITICAL

SCALING:
- ROAS > target × 1.2 po 3+ dnech stabilně = +20%
- ROAS < minimum po 5+ dnech = PAUSE`;

const CREATIVE_DIRECTOR_PROMPT = `Jsi CREATIVE DIRECTOR - expert na vizuální koncepty a creative briefs.

TVOJE ROLE:
1. Navrhuj vizuální koncepty pro reklamy
2. Vytvářej detailní creative briefs
3. Specifikuj formáty a rozměry

FORMÁTY META ADS:
- Feed: 1080x1080 (1:1) nebo 1080x1350 (4:5)
- Stories/Reels: 1080x1920 (9:16)

VIDEO STRUKTURA:
- 0-3s: HOOK (zastaví scroll)
- 3-10s: PROBLEM → SOLUTION
- 10-20s: BENEFITS
- 20-25s: CTA

PRAVIDLA:
- Mobile-first
- Thumb-stopping vizuály
- Min 3 varianty (Product / Lifestyle / Social Proof)`;

const CONTENT_WRITER_PROMPT = `Jsi CONTENT WRITER - expert na reklamní copy.

TVOJE ROLE:
1. Piš ad copy pro všechny platformy
2. Dodržuj messaging pillars ze strategie
3. Vytvářej varianty pro A/B testing

META ADS COPY:
- Primary Text: max 125 znaků (ideál), hook + benefit + CTA
- Headline: max 40 znaků
- Description: max 30 znaků

ČESKÉ TRIGGERY:
- "Zdarma" / "Doprava zdarma"
- "Sleva X %" / "Akce"
- "Pouze dnes" / "Jen do X"
- "Česká firma" / "Made in CZ"

PRAVIDLA:
- Žádné superlativy bez důkazu
- Čísla: 9 990 Kč (s mezerou)
- Emoji střídmě, ale efektivně`;

const STRATEGIST_PROMPT = `Jsi MARKETINGOVÝ STRATÉG - expert na celkovou strategii.

TVOJE ROLE:
1. Analyzuj trh a konkurenci
2. Definuj cílové skupiny a persony
3. Navrhni channel mix a funnel strategii

FUNNEL STRATEGIE:
- TOFU (30%): Awareness - Broad, LAL 3-5%, metriky: CPM, Reach
- MOFU (30%): Consideration - Engaged audiences, metriky: CPC, CTR
- BOFU (40%): Conversion - Retargeting, High intent, metriky: CPA, ROAS

VÝPOČTY:
- Break-even ROAS = 1 / marže
- Target CPA = AOV / Target ROAS
- Max CPA = AOV / Break-even ROAS

OUTPUT: Kompletní strategický brief`;

// ===========================================
// MAIN ANALYSIS FUNCTION
// ===========================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AnalysisRequest = await request.json();
    const { config, analysisType = "full" } = body;

    // Validate config
    if (!config || !config.url || !config.name) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_CONFIG",
          message: "Chybí konfigurace projektu. Vyplň prosím základní údaje.",
        },
        { status: 400 }
      );
    }

    console.log("🚀 AI Marketing Agency - Starting analysis...");
    console.log(`   Project: ${config.name}`);
    console.log(`   Type: ${analysisType}`);

    // Calculate derived metrics
    const breakEvenRoas = config.grossMargin > 0 ? 1 / config.grossMargin : 2;
    const targetCpa = config.targetCpa || config.averageOrderValue / config.targetRoas;
    const maxCpa = config.averageOrderValue / breakEvenRoas;
    const dailyBudget = Math.round(config.monthlyBudget / 30);

    // Fetch all data in parallel
    console.log("📥 Fetching data...");
    const [metaData, websiteContent] = await Promise.all([
      fetchMetaAdsData(),
      fetchWebsiteContent(config.url),
    ]);

    // Build context for AI
    const dataContext = `
=== KONFIGURACE PROJEKTU ===
Název: ${config.name}
URL: ${config.url}
Typ: ${config.type}
Odvětví: ${config.industry || "Neurčeno"}

=== BYZNYS METRIKY ===
Průměrná hodnota objednávky (AOV): ${config.averageOrderValue} Kč
Hrubá marže: ${(config.grossMargin * 100).toFixed(0)}%
Break-even ROAS: ${breakEvenRoas.toFixed(2)}x
Target ROAS: ${config.targetRoas}x
Target CPA: ${targetCpa.toFixed(0)} Kč
Max CPA (break-even): ${maxCpa.toFixed(0)} Kč

=== ROZPOČET ===
Měsíční: ${config.monthlyBudget} Kč
Denní: ${dailyBudget} Kč

=== META ADS DATA (posledních 30 dní) ===
${metaData.hasData ? `
Account:
- Impressions: ${metaData.account?.impressions || 0}
- Reach: ${metaData.account?.reach || 0}
- Clicks: ${metaData.account?.clicks || 0}
- CTR: ${((metaData.account?.ctr || 0) * 100).toFixed(2)}%
- CPC: ${(metaData.account?.cpc || 0).toFixed(2)} Kč
- Spend: ${(metaData.account?.spend || 0).toFixed(0)} Kč
- Conversions: ${metaData.account?.conversions || 0}
- Frequency: ${(metaData.account?.frequency || 0).toFixed(1)}

Kampaně:
${metaData.campaigns.map((c: any) => `- ${c.name}: ${c.impressions} impr, ${c.clicks} clicks, ${c.spend.toFixed(0)} Kč, ${c.conversions} conv`).join("\n")}
` : "ŽÁDNÁ DATA - nový účet nebo žádné kampaně"}

=== OBSAH WEBU ===
${websiteContent.slice(0, 4000) || "Nepodařilo se načíst obsah webu"}
`;

    // Run main analysis
    console.log("🤖 Running AI analysis...");

    const analysisResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      temperature: 0.7,
      system: `Jsi AI MARKETING AGENCY - kompletní náhrada marketingové agentury.

Tvůj tým:
- ORCHESTRATOR: Koordinuje práci
- ANALYST: Analyzuje data
- STRATEGIST: Vytváří strategii
- META SPECIALIST: Expert na Facebook/Instagram
- CREATIVE DIRECTOR: Vizuální koncepty
- CONTENT WRITER: Reklamní texty

DŮLEŽITÉ:
- Všechny texty v ČEŠTINĚ
- Data-driven rozhodnutí
- Konkrétní, actionable výstupy
- Žádné generic fráze

${metaData.hasData ?
  "MÁŠ DATA - analyzuj výkon a navrhni optimalizace." :
  "NEMÁŠ DATA - navrhni kompletní novou kampaň od začátku."
}`,
      messages: [
        {
          role: "user",
          content: `Proveď kompletní ${analysisType === "full" ? "analýzu a strategii" : analysisType === "optimization" ? "optimalizaci" : "refresh kreativ"} pro tento projekt:

${dataContext}

Vrať POUZE validní JSON v tomto formátu:
{
  "executive_summary": "3-5 vět: co je nejdůležitější, co funguje, co ne, hlavní doporučení",

  "alerts": [
    {"level": "critical/warning/info", "message": "Popis problému nebo příležitosti", "action": "Co s tím udělat"}
  ],

  "performance": {
    "current": {
      "spend": 0,
      "conversions": 0,
      "cpa": 0,
      "roas": 0,
      "ctr": 0
    },
    "vs_target": {
      "cpa_status": "ok/warning/critical",
      "roas_status": "ok/warning/critical",
      "trend": "improving/stable/declining"
    }
  },

  "strategy": {
    "target_audience": {
      "primary_persona": {
        "name": "Jméno persony",
        "demographics": "Věk, pohlaví, lokace",
        "pain_points": ["Problém 1", "Problém 2"],
        "motivations": ["Motivace 1", "Motivace 2"]
      },
      "meta_targeting": {
        "interests": ["Konkrétní zájmy z Meta Ads"],
        "behaviors": ["Konkrétní behaviors"],
        "lookalike_source": "Z čeho udělat LAL"
      }
    },
    "unique_value_proposition": "Jedna věta - proč koupit právě tady",
    "messaging_pillars": ["Pilíř 1", "Pilíř 2", "Pilíř 3"],
    "funnel_allocation": {
      "tofu_percent": 30,
      "mofu_percent": 30,
      "bofu_percent": 40
    }
  },

  "campaigns": [
    {
      "name": "Název kampaně",
      "objective": "CONVERSIONS/TRAFFIC/LEADS",
      "daily_budget": ${dailyBudget},
      "audience": {
        "type": "prospecting/retargeting",
        "targeting": "Popis cílení",
        "estimated_size": "100k-500k"
      },
      "status": "new/optimize/scale/pause"
    }
  ],

  "ad_copy": {
    "primary_texts": [
      {"text": "Hotový text reklamy v češtině, max 125 znaků, s emoji", "angle": "benefit/urgency/social-proof/question"},
      {"text": "Druhá varianta", "angle": "..."},
      {"text": "Třetí varianta", "angle": "..."}
    ],
    "headlines": [
      {"text": "Headline max 40 znaků"},
      {"text": "Druhý headline"},
      {"text": "Třetí headline"}
    ],
    "descriptions": ["Popis 1 max 30 zn", "Popis 2", "Popis 3"],
    "ctas": ["Learn More", "Contact Us", "Shop Now"]
  },

  "creative_concepts": [
    {
      "name": "Název konceptu",
      "format": "video/image/carousel",
      "description": "Detailní popis vizuálu",
      "hook": "Co zastaví scroll (první 3 sekundy)",
      "script": "Scénář: 0-3s: ..., 3-10s: ..., 10-15s: ...",
      "specs": {
        "dimensions": "1080x1080 / 1080x1920",
        "duration": "15s (pro video)"
      },
      "ai_image_prompt": "Detailed English prompt for Midjourney/DALL-E"
    }
  ],

  "optimization_actions": [
    {
      "priority": "critical/high/medium/low",
      "action": "Co udělat",
      "reason": "Proč (data)",
      "expected_impact": "Očekávaný dopad"
    }
  ],

  "setup_guide": {
    "step1_campaign": {
      "name": "Přesný název",
      "objective": "CONVERSIONS",
      "budget": ${dailyBudget},
      "bid_strategy": "Lowest cost"
    },
    "step2_adset": {
      "name": "Přesný název",
      "audience": {
        "locations": ["Czechia"],
        "age_min": 25,
        "age_max": 55,
        "interests": ["Konkrétní zájmy"]
      },
      "placements": "Advantage+ placements",
      "optimization": "Conversions"
    },
    "step3_ad": {
      "format": "Single image",
      "text": "Který primary text použít",
      "headline": "Který headline",
      "cta": "Learn More"
    }
  },

  "next_steps": [
    {"timeframe": "Dnes", "action": "Co udělat ihned"},
    {"timeframe": "Tento týden", "action": "Co udělat tento týden"},
    {"timeframe": "Za 2 týdny", "action": "Co vyhodnotit"}
  ]
}`,
        },
      ],
    });

    const responseText =
      analysisResponse.content[0].type === "text"
        ? analysisResponse.content[0].text
        : "";

    // Parse JSON
    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({
        success: true,
        data: {
          executive_summary: "Analýza dokončena, ale nepodařilo se zpracovat strukturovaná data.",
          raw_analysis: responseText,
        },
        metadata: {
          parseError: true,
          processingTime: Date.now() - startTime,
        },
      });
    }

    console.log(`✅ Analysis complete in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        project: config.name,
        analysisType,
        hasMetaData: metaData.hasData,
        processingTime: Date.now() - startTime,
        calculatedMetrics: {
          breakEvenRoas,
          targetCpa,
          maxCpa,
          dailyBudget,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Neznámá chyba",
      },
      { status: 500 }
    );
  }
}
