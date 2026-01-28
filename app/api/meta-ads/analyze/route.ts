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
      max_tokens: 6000,
      temperature: 0.8,
      system: `Jsi SENIOR Meta Ads specialista s 10+ lety zkušeností. Tvoje analýzy jsou vždy:
- KONKRÉTNÍ - žádné obecné fráze, vše specifické pro daný byznys
- ACTIONABLE - každý tip jde okamžitě implementovat
- DATA-DRIVEN - i bez dat víš co funguje v dané branži

DŮLEŽITÉ:
- Veškerý reklamní text MUSÍ být ${langMap[language]}
- Buď kreativní a originální - žádné generic texty
- Každý koncept musí být unikátní a promyšlený`,
      messages: [{
        role: "user",
        content: `Vytvoř KOMPLETNÍ Meta Ads strategii pro tento byznys:

${dataContext}

POŽADAVKY:
1. Reklamní texty musí být chytlavé, s emoji, různými úhly pohledu
2. Kreativní koncepty musí být detailní - přesně co natočit/vyfotit
3. Expert notes musí obsahovat KONKRÉTNÍ tipy co dělat

Vrať POUZE tento JSON (bez markdown bloků):
{
  "strategy": {
    "target_audience": "KONKRÉTNÍ popis: věk 25-45, ženy i muži, zájmy: [konkrétní zájmy relevantní pro byznys], chování: [konkrétní chování], lokace: Česká republika",
    "unique_value_proposition": "Hlavní konkurenční výhoda - proč právě tento byznys a ne konkurenci",
    "budget_split": {"facebook": 65, "instagram": 35},
    "campaign_objective": "${businessGoal}",
    "daily_budget": ${Math.round(monthlyBudget / 30)},
    "recommended_audiences": [
      {"name": "Název audience 1", "targeting": "Detailní popis cílení", "why": "Proč tato audience"},
      {"name": "Název audience 2", "targeting": "Detailní popis cílení", "why": "Proč tato audience"}
    ],
    "funnel_strategy": {
      "tofu": "TOFU (Top of Funnel) - jak oslovit studené publikum",
      "mofu": "MOFU (Middle of Funnel) - jak zahřát zájemce",
      "bofu": "BOFU (Bottom of Funnel) - jak konvertovat"
    }
  },
  "ad_copy": {
    "primary_texts": [
      {"text": "🎯 Chytlavý text s emoji, max 125 znaků, konkrétní benefit", "angle": "benefit"},
      {"text": "⚡ Urgentní text s časovým omezením nebo akcí", "angle": "urgency"},
      {"text": "⭐ Text s social proof - reference, čísla, výsledky", "angle": "social-proof"},
      {"text": "❓ Otázka která rezonuje s problémem cílovky", "angle": "question"},
      {"text": "💡 Překvapivý fakt nebo statistika", "angle": "curiosity"}
    ],
    "headlines": [
      {"text": "Headline max 40 znaků", "angle": "benefit"},
      {"text": "Headline s číslem", "angle": "specific"},
      {"text": "Headline s urgencí", "angle": "urgency"},
      {"text": "Headline otázka", "angle": "question"},
      {"text": "Headline výsledek", "angle": "result"}
    ],
    "descriptions": [
      "Krátký popis 1 - max 30 znaků",
      "Krátký popis 2 - max 30 znaků",
      "Krátký popis 3 - max 30 znaků"
    ],
    "ctas": ["Zjistit více", "Kontaktovat", "Objednat"]
  },
  "creative_concepts": [
    {
      "name": "Konkrétní název konceptu",
      "format": "video",
      "description": "DETAILNÍ popis: Co přesně je ve videu, jaké záběry, jaká atmosféra, jaké barvy",
      "hook": "První 3 sekundy - konkrétně co divák uvidí/uslyší co ho zastaví při scrollování",
      "script": "KOMPLETNÍ scénář: 0-3s: [hook - co přesně], 3-8s: [problém/pain point], 8-12s: [řešení/produkt], 12-15s: [CTA + urgence]",
      "music_style": "Typ hudby - upbeat/emotional/corporate",
      "image_prompt": "Detailed English prompt for Midjourney/DALL-E: style, composition, lighting, mood, colors"
    },
    {
      "name": "Konkrétní název carousel konceptu",
      "format": "carousel",
      "description": "Téma a účel carouselu",
      "hook": "Proč někdo přejede na další slide",
      "script": "Slide 1: [headline + vizuál], Slide 2: [headline + vizuál], Slide 3: [headline + vizuál], Slide 4: [headline + vizuál], Slide 5: [CTA slide]",
      "image_prompt": "Style guide for all slides: colors, fonts, imagery style"
    },
    {
      "name": "Konkrétní název image konceptu",
      "format": "image",
      "description": "Co přesně je na obrázku, kompozice, text overlay",
      "hook": "Proč tento obrázek zastaví scroll",
      "text_overlay": "Text který bude na obrázku",
      "image_prompt": "Detailed English prompt: subject, background, lighting, style, composition, mood"
    }
  ],
  "hashtags": ["#relevantní", "#hashtagy", "#pro", "#daný", "#byznys", "#minimum10"],
  "expert_notes": {
    "project_manager": "KONKRÉTNÍ strategické doporučení: 1) První krok co udělat, 2) Na co si dát pozor, 3) Kdy očekávat výsledky",
    "marketing": "KONKRÉTNÍ tip pro messaging: Jaký tone of voice použít, jaké emoce vyvolat, jaké námitky adresovat",
    "facebook": "KONKRÉTNÍ tip pro FB: Který placement funguje nejlépe, jaký formát, jaká frekvence",
    "instagram": "KONKRÉTNÍ tip pro IG: Jaký content style, kdy postovat, jak využít Reels",
    "ppc": "KONKRÉTNÍ tip pro optimalizaci: Jaký bidding, jak nastavit rozpočet, kdy škálovat"
  },
  "quick_wins": [
    "Konkrétní tip co udělat DNES pro rychlé výsledky",
    "Druhý quick win",
    "Třetí quick win"
  ],
  "common_mistakes": [
    "Častá chyba kterou byznys v této branži dělá + jak se jí vyhnout",
    "Druhá častá chyba"
  ],
  "campaign_setup_guide": {
    "step1_campaign": {
      "name": "Doporučený název kampaně",
      "objective": "CONVERSIONS/TRAFFIC/LEADS - který vybrat",
      "special_ad_categories": "Žádné / Housing / Credit / Employment",
      "budget_type": "Daily budget / Lifetime budget",
      "budget_amount": ${Math.round(monthlyBudget / 30)},
      "bid_strategy": "Lowest cost / Cost cap - který a proč"
    },
    "step2_adset": {
      "name": "Doporučený název ad setu",
      "optimization_event": "Co optimalizovat - Lead, Purchase, Link Click",
      "audience": {
        "locations": ["Česká republika"],
        "age_min": 25,
        "age_max": 55,
        "genders": "all / men / women",
        "detailed_targeting": ["Konkrétní zájmy a chování k nastavení"],
        "custom_audiences": "Jaké custom audiences vytvořit",
        "lookalike": "Z čeho vytvořit lookalike a jaké %"
      },
      "placements": "Automatic / Manual - které vybrat",
      "schedule": "Kdy spustit, jak dlouho testovat"
    },
    "step3_ad": {
      "format": "Single image / Video / Carousel",
      "primary_text": "Který z vygenerovaných textů použít první",
      "headline": "Který headline",
      "description": "Který popis",
      "cta_button": "Které CTA tlačítko",
      "destination": "Kam odkazovat - landing page URL"
    },
    "testing_plan": {
      "week1": "Co testovat první týden",
      "week2": "Jak vyhodnotit a co změnit",
      "week4": "Kdy a jak škálovat"
    }
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
