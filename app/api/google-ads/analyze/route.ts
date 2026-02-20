import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCampaignPerformance, getKeywordPerformance } from "@/lib/google-ads";
import { getGA4Overview, getGA4TopPages, getGA4TrafficSources } from "@/lib/google-analytics";
import { getSearchConsoleOverview, getSearchConsoleTopQueries, getSearchConsoleTopPages } from "@/lib/google-search-console";
import {
  getCampaignTracking,
  createCampaignTracking,
  saveAnalysis,
  updateCampaignTracking,
  initGoogleMarketingTables,
} from "@/lib/turso/google-marketing";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FAST_MODEL = "claude-haiku-4-5-20251001";
const QUALITY_MODEL = "claude-sonnet-4-6";

interface AnalysisRequest {
  websiteUrl: string;
  competitors?: string[];
  language: "cs" | "de" | "en";
  businessGoal?: string;
  monthlyBudget?: number;
}

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WeblyxBot/1.0)" },
    });
    const html = await response.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return "";
  }
}

async function getGoogleAdsInsights(): Promise<string> {
  try {
    const [campaigns, keywords] = await Promise.all([
      getCampaignPerformance("LAST_30_DAYS"),
      getKeywordPerformance(undefined, "LAST_30_DAYS"),
    ]);

    const topCampaigns = campaigns.filter((c: any) => c.clicks > 10).sort((a: any, b: any) => b.ctr - a.ctr).slice(0, 5);
    const topKeywords = keywords.filter((k: any) => k.clicks > 5).sort((a: any, b: any) => b.ctr - a.ctr).slice(0, 20);
    const worstKeywords = keywords.filter((k: any) => k.impressions > 100 && k.ctr < 0.01).slice(0, 10);

    return `
TOP CAMPAIGNS: ${topCampaigns.map((c: any) => `${c.name} (CTR ${(c.ctr * 100).toFixed(2)}%, ${c.conversions} conv)`).join("; ")}
TOP KEYWORDS: ${topKeywords.map((k: any) => `"${k.keyword}" CTR ${(k.ctr * 100).toFixed(2)}%`).join("; ")}
AVOID KEYWORDS: ${worstKeywords.map((k: any) => `"${k.keyword}"`).join(", ")}
    `.trim();
  } catch {
    return "Google Ads data not available";
  }
}

async function getGA4Insights(): Promise<string> {
  try {
    const [overview, topPages, trafficSources] = await Promise.all([
      getGA4Overview("30daysAgo", "today"),
      getGA4TopPages("30daysAgo", "today", 10),
      getGA4TrafficSources("30daysAgo", "today"),
    ]);

    const summary = overview.summary;

    return `
OVERVIEW: ${summary.totalUsers} users, ${summary.totalSessions} sessions, ${summary.totalPageViews} pageviews
BOUNCE RATE: ${summary.avgBounceRate.toFixed(1)}%, AVG SESSION: ${Math.round(summary.avgSessionDuration)}s
TOP PAGES: ${topPages.map((p: any) => `${p.path} (${p.pageViews} views, ${p.bounceRate.toFixed(0)}% bounce)`).join("; ")}
TRAFFIC SOURCES: ${trafficSources.map((s: any) => `${s.source}: ${s.sessions} sessions`).join("; ")}
    `.trim();
  } catch (error) {
    console.error("GA4 insights error:", error);
    return "GA4 data not available";
  }
}

async function getSearchConsoleInsights(): Promise<string> {
  try {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL || "sc-domain:weblyx.cz";
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [overview, topQueries, topPages] = await Promise.all([
      getSearchConsoleOverview(siteUrl, startDate, endDate),
      getSearchConsoleTopQueries(siteUrl, startDate, endDate, 20),
      getSearchConsoleTopPages(siteUrl, startDate, endDate, 10),
    ]);

    const summary = overview.summary;

    return `
ORGANIC OVERVIEW: ${summary.totalClicks} clicks, ${summary.totalImpressions} impressions, CTR ${summary.avgCtr.toFixed(2)}%, Avg Position ${summary.avgPosition.toFixed(1)}
TOP ORGANIC QUERIES: ${topQueries.map((q: any) => `"${q.query}" (${q.clicks} clicks, pos ${q.position.toFixed(1)})`).join("; ")}
TOP ORGANIC PAGES: ${topPages.map((p: any) => `${p.page.replace(/https?:\/\/[^/]+/, '')} (${p.clicks} clicks)`).join("; ")}
    `.trim();
  } catch (error) {
    console.error("Search Console insights error:", error);
    return "Search Console data not available";
  }
}

async function runAgent(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7,
  maxTokens = 2000,
  model: string = FAST_MODEL
): Promise<string> {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.content[0].type === "text" ? response.content[0].text : "";
    } catch (error: any) {
      const isOverloaded = error?.status === 529 || error?.status === 503;
      console.error(`Agent call attempt ${attempt + 1}/${maxRetries + 1} failed (${error?.status || 'unknown'}):`, error?.message?.slice(0, 200) || error);
      if (attempt === maxRetries) throw error;
      const delay = isOverloaded ? 3000 * (attempt + 1) : 2000 * (attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { websiteUrl, competitors = [], language, businessGoal = "leads", monthlyBudget = 15000 } = body;

    if (!websiteUrl || !language) {
      return NextResponse.json({ success: false, error: "Missing websiteUrl or language" }, { status: 400 });
    }

    const langNames = { cs: "Czech", de: "German", en: "English" };
    const langFull = langNames[language];

    // ========================================
    // PHASE 1: DATA GATHERING (parallel, no AI)
    // ========================================

    const [websiteContent, ...competitorContents] = await Promise.all([
      fetchWebsiteContent(websiteUrl),
      ...competitors.slice(0, 3).map(fetchWebsiteContent),
    ]);

    const [googleAdsData, ga4Data, gscData] = await Promise.all([
      getGoogleAdsInsights(),
      getGA4Insights(),
      getSearchConsoleInsights(),
    ]);

    const rawData = `
=== CLIENT WEBSITE (${websiteUrl}) ===
${websiteContent}

=== COMPETITOR WEBSITES ===
${competitors.map((url, i) => `[${url}]: ${competitorContents[i]?.slice(0, 4000) || "N/A"}`).join("\n\n")}

=== GOOGLE ADS HISTORICAL DATA (Paid Traffic) ===
${googleAdsData}

=== GOOGLE ANALYTICS 4 DATA (Website Behavior) ===
${ga4Data}

=== GOOGLE SEARCH CONSOLE DATA (Organic Search) ===
${gscData}

=== BUSINESS CONTEXT ===
Goal: ${businessGoal}
Monthly Budget: ${monthlyBudget} CZK
Target Language: ${langFull}
    `.trim();

    // ========================================
    // PHASE 2: PM BRIEF (Haiku - fast ~3-5s)
    // ========================================

    const pmBrief = await runAgent(
      `You are a Digital Marketing Project Manager. Analyze data and create a concise strategic brief.
Be decisive and specific. Output in ${langFull}.`,
      `Create a strategic brief based on this data:

${rawData}

Include:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. TARGET AUDIENCE - Who are we targeting?
3. COMPETITIVE GAPS - Key opportunities
4. 3 CUSTOMER PERSONAS: Name, Age, Position, Pain Points (3), Goals (3), Objections (3)
5. 3 UVP ANGLES for A/B testing: Angle name + positioning statement
6. DIRECTION for Marketing Strategist, SEO Expert, and PPC Specialist`,
      0.7,
      2000,
      FAST_MODEL
    );

    // ========================================
    // PHASE 3: PARALLEL SPECIALIST WORK (Haiku - fast ~5-8s)
    // ========================================

    const [marketingDraft, seoDraft, ppcDraft] = await Promise.all([
      // Marketing Strategist
      runAgent(
        `You are a Brand & Marketing Strategist. Focus on positioning, value proposition, emotional triggers, trust builders.
Be concise. Output in ${langFull}.`,
        `PM BRIEF:
${pmBrief}

RAW DATA:
${rawData.slice(0, 6000)}

Develop:
1. POSITIONING STATEMENT
2. UNIQUE VALUE PROPOSITION
3. KEY MESSAGES (5-7)
4. EMOTIONAL TRIGGERS
5. TRUST BUILDERS
6. COMPETITIVE DIFFERENTIATION`,
        0.7,
        2000,
        FAST_MODEL
      ),

      // SEO Expert
      runAgent(
        `You are a Senior SEO & Keyword Research Specialist. Focus on search intent, keyword clustering.
Be data-driven. Output in ${langFull}.`,
        `PM BRIEF:
${pmBrief}

RAW DATA:
${rawData.slice(0, 6000)}

Develop:
1. PRIMARY KEYWORDS (5-10) with intent
2. SECONDARY KEYWORDS (10-15)
3. LONG-TAIL KEYWORDS (10-20)
4. KEYWORD CLUSTERS by theme
5. NEGATIVE KEYWORDS (15-20)
6. COMPETITOR KEYWORD GAPS`,
        0.7,
        2000,
        FAST_MODEL
      ),

      // PPC Specialist
      runAgent(
        `You are an elite Google Ads Copywriter. Headlines MAX 30 chars, Descriptions MAX 90 chars.
FORBIDDEN: "Professional website", "Quality services", "Best solution", generic phrases.
Output in ${langFull}.`,
        `PM BRIEF:
${pmBrief}

Create ads using 5 HEADLINE FORMULAS (3 headlines each, under 30 chars):
1. NUMBER+BENEFIT 2. PAIN+SOLUTION 3. GUARANTEE 4. URGENCY 5. SOCIAL PROOF

DESCRIPTIONS (9 total, under 90 chars each):
- 3x BENEFIT, 3x PROBLEM-SOLUTION, 3x SOCIAL PROOF

Also: CTA options, callouts (4), sitelinks (4), structured snippets`,
        0.7,
        2000,
        FAST_MODEL
      ),
    ]);

    // ========================================
    // PHASE 4: COMBINED FINAL (Sonnet - quality ~15-25s)
    // Cross-review + PPC refinement + PM recommendations + JSON compilation in ONE call
    // ========================================

    const combinedFinalCall = async () => {
      const response = await anthropic.messages.create({
        model: QUALITY_MODEL,
        max_tokens: 6000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: `You are a senior marketing team lead. Review all specialist outputs, cross-reference them, and compile the final campaign plan as JSON.

PM BRIEF:
${pmBrief.slice(0, 2000)}

MARKETING STRATEGY:
${marketingDraft.slice(0, 2500)}

KEYWORD RESEARCH:
${seoDraft.slice(0, 2500)}

PPC AD CONCEPTS:
${ppcDraft.slice(0, 2500)}

YOUR TASKS:
1. Cross-review: Ensure keywords align with messaging, ad copy includes top keywords
2. Refine PPC copy: Fix any character limit violations, improve based on keyword/marketing insights
3. Add campaign recommendations: bidding strategy for ${monthlyBudget} CZK/month, scheduling, testing plan
4. Add expert notes for each role

ALL text content MUST be in ${langFull}.
Headlines MUST be UNDER 30 characters. Descriptions MUST be UNDER 90 characters.
This is ONLY for Google Ads Search - NO Meta/Facebook ads.

Output ONLY valid JSON (no markdown fences, no explanation):
{
  "strategy": {
    "campaign_objective": "string",
    "target_audience": "string",
    "unique_value_proposition": "string",
    "key_differentiators": ["string"],
    "brand_positioning": "string",
    "recommended_budget_split": {"search": 70, "display": 20, "remarketing": 10}
  },
  "personas": [
    {"name": "string", "age": "string", "position": "string", "pain_points": ["string"], "goals": ["string"], "objections": ["string"]}
  ],
  "uvp_angles": [
    {"name": "string", "positioning": "string"}
  ],
  "headlines": [
    {"text": "Max 30 char headline in ${langFull}", "angle": "benefit|urgency|trust|feature|cta", "chars": 25}
  ],
  "headlines_by_angle": [
    {"angle": "UVP angle name", "headlines": [{"text": "headline", "formula": "number_benefit|pain_solution|guarantee|urgency|social_proof", "chars": 25}]}
  ],
  "descriptions": [
    {"text": "Max 90 char description in ${langFull}", "angle": "problem-solution|benefit|social-proof|cta", "chars": 80}
  ],
  "descriptions_by_type": {
    "benefit": [{"text": "string", "chars": 80}],
    "problem_solution": [{"text": "string", "chars": 80}],
    "social_proof": [{"text": "string", "chars": 80}]
  },
  "keywords": {
    "high_intent": [{"text": "keyword", "matchType": "EXACT", "intent": "transactional"}],
    "medium_intent": [{"text": "keyword", "matchType": "PHRASE", "intent": "commercial"}],
    "discovery": [{"text": "keyword", "matchType": "BROAD", "intent": "informational"}]
  },
  "negative_keywords": ["word"],
  "extensions": {
    "callouts": ["text"],
    "sitelinks": [{"text": "Link", "description": "Desc"}],
    "structured_snippets": {"header": "Services", "values": ["val"]}
  },
  "campaign_settings": {
    "bidding_strategy": "string",
    "daily_budget": ${Math.round(monthlyBudget / 30)},
    "target_cpa": 0,
    "ad_schedule": "string",
    "locations": ["string"],
    "devices": "all"
  },
  "testing_plan": {
    "week_1": "string",
    "week_2": "string",
    "week_4": "string"
  },
  "expert_notes": {
    "project_manager": {"insight": "string", "test_first": "string", "warning": "string"},
    "marketing": {"insight": "string", "test_first": "string", "warning": "string"},
    "seo": {"insight": "string", "test_first": "string", "warning": "string"},
    "ppc": {"insight": "string", "test_first": "string", "warning": "string"}
  }
}`,
          },
        ],
      });
      return response;
    };

    // Retry logic for final compilation
    let finalOutput;
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        finalOutput = await combinedFinalCall();
        break;
      } catch (error: any) {
        console.error(`Final compilation attempt ${attempt + 1} failed:`, error?.message || error);
        if (attempt === 2) throw error;
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      }
    }

    const responseText = finalOutput!.content[0].type === "text" ? finalOutput!.content[0].text : "";

    let result;
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      result = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
    } catch {
      return NextResponse.json({ success: false, error: "Failed to parse final output", raw: responseText }, { status: 500 });
    }

    // Validate character limits
    result.headlines = result.headlines?.filter((h: any) => h.text && h.text.length <= 30) || [];
    result.descriptions = result.descriptions?.filter((d: any) => d.text && d.text.length <= 90) || [];

    if (result.headlines_by_angle) {
      for (const group of result.headlines_by_angle) {
        group.headlines = group.headlines?.filter((h: any) => h.text && h.text.length <= 30) || [];
      }
      if (result.headlines.length === 0) {
        result.headlines = result.headlines_by_angle.flatMap((g: any) =>
          g.headlines.map((h: any) => ({ text: h.text, angle: g.angle, chars: h.chars || h.text.length }))
        );
      }
    }

    if (result.descriptions_by_type) {
      for (const key of ["benefit", "problem_solution", "social_proof"]) {
        if (result.descriptions_by_type[key]) {
          result.descriptions_by_type[key] = result.descriptions_by_type[key].filter((d: any) => d.text && d.text.length <= 90);
        }
      }
      if (result.descriptions.length === 0) {
        result.descriptions = [
          ...(result.descriptions_by_type.benefit || []).map((d: any) => ({ text: d.text, angle: "benefit", chars: d.chars || d.text.length })),
          ...(result.descriptions_by_type.problem_solution || []).map((d: any) => ({ text: d.text, angle: "problem-solution", chars: d.chars || d.text.length })),
          ...(result.descriptions_by_type.social_proof || []).map((d: any) => ({ text: d.text, angle: "social-proof", chars: d.chars || d.text.length })),
        ];
      }
    }

    delete result.meta_ads;

    // ========================================
    // PERSIST ANALYSIS TO DATABASE
    // ========================================
    try {
      await initGoogleMarketingTables();

      const trackingCampaignId = "multi-agent-analysis";
      let tracking = await getCampaignTracking(trackingCampaignId);

      if (!tracking) {
        tracking = await createCampaignTracking({
          campaignId: trackingCampaignId,
          campaignName: "Multi-Agent AI Analysis",
        });
      }

      const agentOutputsData = {
        pmBrief: pmBrief.slice(0, 800) + "...",
        marketingStrategy: marketingDraft.slice(0, 800) + "...",
        seoKeywords: seoDraft.slice(0, 800) + "...",
        ppcAds: ppcDraft.slice(0, 800) + "...",
        pmRecommendations: "Included in final compilation",
      };

      await saveAnalysis({
        campaignTrackingId: tracking.id,
        analysisType: "manual",
        dataSources: {
          googleAds: googleAdsData !== "Google Ads data not available",
          ga4: ga4Data !== "GA4 data not available",
          searchConsole: gscData !== "Search Console data not available",
        },
        metrics: { before: {} },
        recommendations: [],
        aiInsights: JSON.stringify(result),
        expertNotes: agentOutputsData,
      });

      await updateCampaignTracking(trackingCampaignId, {
        lastAnalysisDate: new Date(),
        analysisCount: (tracking.analysisCount || 0) + 1,
      });
    } catch (saveError) {
      console.error("Failed to save analysis to DB (non-blocking):", saveError);
    }

    return NextResponse.json({
      success: true,
      data: result,
      collaboration: {
        phases: [
          "Data Gathering",
          "PM Strategic Brief (Haiku)",
          "Parallel Specialist Work (Haiku x3)",
          "Combined Final Review + JSON (Sonnet)"
        ],
        agentInteractions: 4,
        totalApiCalls: 5,
      },
      agentOutputs: {
        pmBrief: pmBrief.slice(0, 800) + "...",
        marketingStrategy: marketingDraft.slice(0, 800) + "...",
        seoKeywords: seoDraft.slice(0, 800) + "...",
        ppcAds: ppcDraft.slice(0, 800) + "...",
      },
      metadata: {
        websiteAnalyzed: websiteUrl,
        competitorsAnalyzed: competitors.length,
        dataSources: {
          googleAds: googleAdsData !== "Google Ads data not available",
          ga4: ga4Data !== "GA4 data not available",
          searchConsole: gscData !== "Search Console data not available",
        },
        language,
        collaborationModel: "optimized-fast",
      },
    });
  } catch (error: any) {
    console.error("Multi-agent analysis error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
