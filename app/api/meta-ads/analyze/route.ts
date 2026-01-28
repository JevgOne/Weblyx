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
      max_tokens: 8000,
      temperature: 0.9,
      system: `Jsi KOMPLETNÍ NÁHRADA za marketingovou agenturu. Klient ti platí aby NEMUSEL platit marketérovi.

TVÁ PRÁCE:
1. Analyzuj web a pochop byznys DO HLOUBKY - co prodávají, komu, proč jsou lepší než konkurence
2. Vytvoř KOMPLETNÍ KAMPAŇ ready to copy-paste do Meta Ads Manager
3. Napiš SKUTEČNÉ reklamní texty - ne šablony, ne placeholder, HOTOVÉ TEXTY které půjdou rovnou použít
4. Navrhni KONKRÉTNÍ kreativy - přesně co vyfotit/natočit, jaké barvy, jaká kompozice

PRAVIDLA:
- Veškerý reklamní text MUSÍ být ${langMap[language]}
- Žádné generic fráze jako "kvalitní služby" nebo "profesionální přístup" - buď SPECIFICKÝ
- Každý text musí být UNIKÁTNÍ a relevantní pro TENTO KONKRÉTNÍ byznys
- Představ si že klient za 5 minut otevře Meta Ads Manager a začne zadávat přesně to co napíšeš`,
      messages: [{
        role: "user",
        content: `Jsi marketingová agentura. Klient ti poslal web a chce KOMPLETNÍ KAMPAŇ ready to use.

ANALYZUJ TENTO BYZNYS:
${dataContext}

TVŮJ ÚKOL:
Vytvoř KOMPLETNÍ kampaň kterou klient za 10 minut zkopíruje do Meta Ads Manager a spustí.

- Reklamní texty MUSÍ být HOTOVÉ, ne šablony - klient je jen zkopíruje
- Texty musí být chytlavé, s emoji, zastavit scroll
- Kreativy musí být tak detailní že je grafik/kameraman vytvoří bez dalších dotazů
- Cílení musí být konkrétní - ne "lidé co mají zájem o X" ale PŘESNÉ zájmy z Meta Ads

Vrať POUZE tento JSON (bez markdown bloků):
{
  "business_analysis": {
    "what_they_sell": "Co přesně tento byznys prodává/nabízí - buď specifický",
    "target_customer": "Kdo je ideální zákazník - buď VELMI specifický (věk, situace, problém)",
    "main_pain_point": "Hlavní problém který řeší - proč zákazník hledá toto řešení",
    "unique_advantage": "Čím jsou lepší než konkurence - konkrétní důvod proč jít k nim",
    "price_positioning": "Cenová kategorie - levnější/střed/premium a proč"
  },
  "strategy": {
    "target_audience": "Detailní popis ideálního zákazníka - situace, potřeby, obavy",
    "unique_value_proposition": "Jedna věta proč koupit/objednat právě tady",
    "budget_split": {"facebook": 65, "instagram": 35},
    "campaign_objective": "${businessGoal}",
    "daily_budget": ${Math.round(monthlyBudget / 30)},
    "recommended_audiences": [
      {
        "name": "Konkrétní název audience",
        "size": "Odhadovaná velikost",
        "interests": ["Přesné zájmy z Meta Ads - např. 'Small business owners', 'Entrepreneurship'"],
        "behaviors": ["Přesné behaviors z Meta Ads - např. 'Engaged shoppers', 'Small business owners'"],
        "why": "Proč tato audience bude konvertovat"
      }
    ]
  },
  "ad_copy": {
    "primary_texts": [
      {"text": "HOTOVÝ text reklamy v ${langMap[language]} - chytlavý, s emoji, zastaví scroll, max 125 znaků", "angle": "benefit"},
      {"text": "HOTOVÝ urgentní text - časové omezení, akce, FOMO", "angle": "urgency"},
      {"text": "HOTOVÝ text se social proof - konkrétní čísla, reference", "angle": "social-proof"},
      {"text": "HOTOVÝ text s otázkou která rezonuje s problémem", "angle": "question"},
      {"text": "HOTOVÝ text s překvapivým faktem nebo statistikou", "angle": "curiosity"}
    ],
    "headlines": [
      {"text": "HOTOVÝ headline max 40 znaků - benefit"},
      {"text": "HOTOVÝ headline s konkrétním číslem"},
      {"text": "HOTOVÝ headline s urgencí"},
      {"text": "HOTOVÝ headline jako otázka"},
      {"text": "HOTOVÝ headline zaměřený na výsledek"}
    ],
    "descriptions": ["HOTOVÝ popis 1 max 30 znaků", "HOTOVÝ popis 2", "HOTOVÝ popis 3"],
    "ctas": ["Learn More", "Contact Us", "Shop Now"]
  },
  "creative_concepts": [
    {
      "name": "VIDEO: Konkrétní název",
      "format": "video",
      "duration": "15 sekund",
      "description": "Detailní popis co je ve videu - jaké záběry, co je vidět, jaká atmosféra",
      "hook": "PŘESNĚ co divák uvidí/uslyší v prvních 3 sekundách co ho zastaví",
      "script": "0-3s: [HOOK - přesný text/vizuál], 3-7s: [PROBLÉM - co divák zažívá], 7-12s: [ŘEŠENÍ - jak to vyřešíme], 12-15s: [CTA - co má udělat + urgence]",
      "visual_style": "Barvy, filtry, styl natáčení",
      "audio": "Typ hudby + voiceover ano/ne",
      "thumbnail": "Co bude na náhledu videa"
    },
    {
      "name": "CAROUSEL: Konkrétní název",
      "format": "carousel",
      "slides": [
        {"headline": "Slide 1 headline", "visual": "Co je na obrázku", "text": "Text pod obrázkem"},
        {"headline": "Slide 2 headline", "visual": "Co je na obrázku", "text": "Text"},
        {"headline": "Slide 3 headline", "visual": "Co je na obrázku", "text": "Text"},
        {"headline": "Slide 4 headline", "visual": "Co je na obrázku", "text": "Text"},
        {"headline": "CTA Slide", "visual": "Call to action vizuál", "text": "Silné CTA"}
      ],
      "visual_style": "Jednotný styl všech slidů - barvy, fonty"
    },
    {
      "name": "IMAGE: Konkrétní název",
      "format": "image",
      "description": "Přesně co je na obrázku - kompozice, co je v popředí/pozadí",
      "text_overlay": "Přesný text který bude NA obrázku",
      "visual_style": "Barvy, styl, nálada",
      "dimensions": "1080x1080 pro feed / 1080x1920 pro stories",
      "ai_prompt": "Detailed English prompt for Midjourney/DALL-E to generate this image"
    }
  ],
  "hashtags": ["#relevantní", "#specifické", "#hashtagy", "#pro", "#tento", "#byznys", "#minimum", "#deset", "#hashtagů", "#celkem"],
  "expert_notes": {
    "project_manager": "Co udělat jako PRVNÍ, na co si dát pozor, kdy čekat první výsledky",
    "marketing": "Jaký tone of voice, jaké emoce vyvolat, jaké námitky zákazníků adresovat",
    "facebook": "Které FB placements fungují pro tento typ byznysu, jaká frekvence",
    "instagram": "Jak využít IG Stories a Reels pro tento byznys, jaký content style",
    "ppc": "Jaký bidding použít, kdy začít škálovat, warning signs"
  },
  "quick_wins": [
    "Co udělat DNES pro rychlé výsledky - konkrétní akce",
    "Druhý quick win - konkrétní akce",
    "Třetí quick win - konkrétní akce"
  ],
  "common_mistakes": [
    "Nejčastější chyba v této branži a jak se jí vyhnout",
    "Druhá častá chyba"
  ],
  "campaign_setup_guide": {
    "step1_campaign": {
      "name": "Přesný název kampaně k použití",
      "objective": "LEADS/CONVERSIONS/TRAFFIC - konkrétní volba",
      "budget_type": "Daily",
      "budget_amount": ${Math.round(monthlyBudget / 30)},
      "bid_strategy": "Lowest cost"
    },
    "step2_adset": {
      "name": "Přesný název ad setu",
      "optimization_event": "Lead/Purchase/Link Click - konkrétní volba",
      "audience": {
        "locations": ["Czechia"],
        "age_min": 25,
        "age_max": 55,
        "genders": "All",
        "detailed_targeting": ["Přesné zájmy které zadat do Meta Ads - použij skutečné názvy z Meta"],
        "exclusions": ["Koho vyloučit"]
      },
      "placements": "Advantage+ placements / Manual - konkrétní doporučení",
      "schedule": "Spustit ihned, testovat 7 dní před změnami"
    },
    "step3_ad": {
      "format": "Single image/Video/Carousel - konkrétní volba",
      "primary_text": "Použij text #1 z primary_texts",
      "headline": "Použij headline #1",
      "description": "Použij description #1",
      "cta_button": "Learn More / Contact Us / Shop Now",
      "destination": "${websiteUrl}"
    },
    "testing_plan": {
      "week1": "Nechat běžet, nešahat - sbírat data",
      "week2": "Vyhodnotit CTR a CPC, vypnout nejhorší varianty",
      "week4": "Škálovat vítěze o 20%, přidat nové kreativy"
    }
  },
  "ab_test_plan": {
    "test1": {"what": "Co testovat první", "variants": ["Varianta A", "Varianta B"], "success_metric": "CTR/CPC/CPL"},
    "test2": {"what": "Co testovat druhé", "variants": ["Varianta A", "Varianta B"], "success_metric": "Metrika"}
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
