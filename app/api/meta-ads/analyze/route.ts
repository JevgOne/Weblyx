import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getCampaignPerformance,
  getAccountInsights,
} from "@/lib/meta-ads";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface AnalysisRequest {
  websiteUrl: string;
  competitors?: string[];
  language: "cs" | "de" | "en";
  businessGoal: "leads" | "traffic" | "sales" | "brand" | "app_installs";
  monthlyBudget: number;
  targetPlatform: "both" | "facebook" | "instagram";
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
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
    return `[Nepodařilo se načíst obsah webu ${url}]`;
  }
}

async function getMetaAdsInsights(): Promise<string> {
  try {
    const [campaigns, insights] = await Promise.all([
      getCampaignPerformance("last_30d"),
      getAccountInsights("last_30d"),
    ]);

    const topCampaigns = campaigns
      .filter((c: any) => c.clicks > 10)
      .sort((a: any, b: any) => b.ctr - a.ctr)
      .slice(0, 5);

    return `
PŘEHLED ÚČTU (posledních 30 dní):
- Dosah: ${insights.reach}, Zobrazení: ${insights.impressions}
- Kliknutí: ${insights.clicks}, CTR: ${insights.ctr.toFixed(2)}%
- Útrata: ${insights.spend.toFixed(0)} CZK, CPC: ${insights.cpc.toFixed(2)} CZK
- Konverze: ${insights.conversions}, Frekvence: ${insights.frequency.toFixed(1)}

TOP KAMPANĚ:
${topCampaigns.map((c: any) => `- ${c.campaignName}: CTR ${c.ctr.toFixed(2)}%, ${c.conversions || 0} konverzí`).join("\n")}
    `.trim();
  } catch {
    return "Meta Ads data nejsou k dispozici - nový účet nebo žádné kampaně.";
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AnalysisRequest = await request.json();
    const {
      websiteUrl,
      competitors = [],
      language,
      businessGoal = "leads",
      monthlyBudget = 15000,
      targetPlatform = "both",
    } = body;

    if (!websiteUrl || !language) {
      return NextResponse.json(
        { success: false, error: "Chybí URL webu nebo jazyk" },
        { status: 400 }
      );
    }

    const langMap = { cs: "česky", de: "německy", en: "anglicky" };
    const goalMap = {
      leads: "získání kontaktů/leadů",
      traffic: "zvýšení návštěvnosti",
      sales: "prodej produktů",
      brand: "budování značky",
      app_installs: "instalace aplikace"
    };

    console.log("🚀 Meta Ads analýza - start");

    // FÁZE 1: Sběr dat (paralelně)
    console.log("📥 Fáze 1: Sběr dat...");
    const [websiteContent, metaAdsData, ...competitorContents] = await Promise.all([
      fetchWebsiteContent(websiteUrl),
      getMetaAdsInsights(),
      ...competitors.slice(0, 2).map(fetchWebsiteContent),
    ]);

    const dataContext = `
=== KLIENTSKÝ WEB: ${websiteUrl} ===
${websiteContent}

=== KONKURENCE ===
${competitors.slice(0, 2).map((url, i) => `[${url}]:\n${competitorContents[i]?.slice(0, 3000) || "N/A"}`).join("\n\n")}

=== META ADS DATA ===
${metaAdsData}

=== ZADÁNÍ ===
- Cíl: ${goalMap[businessGoal]}
- Měsíční rozpočet: ${monthlyBudget} CZK
- Platforma: ${targetPlatform === "both" ? "Facebook + Instagram" : targetPlatform}
- Jazyk reklam: ${langMap[language]}
    `.trim();

    // FÁZE 2: Kompletní analýza v jednom volání
    console.log("🤖 Fáze 2: AI analýza...");

    const analysisResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.7,
      system: `Jsi expert na Meta (Facebook/Instagram) reklamy. Vytvoř kompletní analýzu a strategii pro klienta.

DŮLEŽITÉ: Veškerý text reklam MUSÍ být ${langMap[language]}.

Odpověz POUZE validním JSON ve formátu níže. Žádný jiný text.`,
      messages: [{
        role: "user",
        content: `Analyzuj následující data a vytvoř kompletní strategii pro Meta Ads:

${dataContext}

Vrať POUZE tento JSON (bez markdown bloků):
{
  "strategy": {
    "target_audience": "Detailní popis cílové skupiny - věk, pohlaví, zájmy, chování",
    "unique_value_proposition": "Hlavní hodnota a důvod proč koupit/kontaktovat",
    "budget_split": {"facebook": 60, "instagram": 40},
    "campaign_objective": "doporučený cíl kampaně",
    "daily_budget": ${Math.round(monthlyBudget / 30)}
  },
  "ad_copy": {
    "primary_texts": [
      {"text": "Hlavní text reklamy ${langMap[language]} - max 125 znaků", "angle": "benefit"},
      {"text": "Druhý text reklamy ${langMap[language]}", "angle": "urgency"},
      {"text": "Třetí text reklamy ${langMap[language]}", "angle": "social-proof"}
    ],
    "headlines": [
      {"text": "Headline 1 ${langMap[language]}"},
      {"text": "Headline 2 ${langMap[language]}"},
      {"text": "Headline 3 ${langMap[language]}"}
    ],
    "descriptions": ["Krátký popis 1", "Krátký popis 2"],
    "ctas": ["Learn More", "Contact Us"]
  },
  "creative_concepts": [
    {
      "name": "Název konceptu 1",
      "format": "video",
      "description": "Detailní popis vizuálu/videa",
      "hook": "První 3 sekundy - co zaujme",
      "script": "Celý scénář: 0-3s: ..., 3-10s: ..., 10-15s: CTA",
      "image_prompt": "Detailed English prompt for AI image generation"
    },
    {
      "name": "Název konceptu 2",
      "format": "carousel",
      "description": "Popis carousel reklamy",
      "hook": "Úvodní hook",
      "script": "Slide 1: ..., Slide 2: ..., Slide 3: ..."
    },
    {
      "name": "Název konceptu 3",
      "format": "image",
      "description": "Popis statického obrázku",
      "hook": "Hlavní sdělení",
      "image_prompt": "Detailed English prompt for AI image generation"
    }
  ],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "expert_notes": {
    "project_manager": "Strategické doporučení a hlavní insight",
    "marketing": "Tip pro messaging a positioning",
    "facebook": "Specifické doporučení pro Facebook",
    "instagram": "Specifické doporučení pro Instagram"
  }
}`
      }],
    });

    const analysisText = analysisResponse.content[0].type === "text"
      ? analysisResponse.content[0].text
      : "";

    console.log("📊 Fáze 3: Parsování výsledků...");

    // Parse JSON
    let result;
    try {
      // Zkusit najít JSON v odpovědi
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Vrátit raw text jako fallback
      return NextResponse.json({
        success: true,
        data: {
          executive_summary: "Analýza dokončena, ale nepodařilo se parsovat strukturovaná data.",
          raw_analysis: analysisText,
        },
        metadata: {
          websiteAnalyzed: websiteUrl,
          competitorsAnalyzed: competitors.length,
          language,
          processingTime: Date.now() - startTime,
          parseError: true,
        },
      });
    }

    console.log(`✅ Analýza dokončena za ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        websiteAnalyzed: websiteUrl,
        competitorsAnalyzed: competitors.length,
        language,
        platform: targetPlatform,
        budget: monthlyBudget,
        processingTime: Date.now() - startTime,
      },
    });

  } catch (error: any) {
    console.error("❌ Meta Ads analýza error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Neznámá chyba",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
