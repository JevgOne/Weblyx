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
      .slice(0, 6000);
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
    const t0 = Date.now();
    const timing: Record<string, number> = {};

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
${competitors.map((url, i) => `[${url}]: ${competitorContents[i]?.slice(0, 2000) || "N/A"}`).join("\n\n")}

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

    timing.dataGathering = Date.now() - t0;
    console.log(`[TIMING] Data gathering: ${timing.dataGathering}ms`);

    // ========================================
    // PHASE 2: PARALLEL SPECIALISTS (Haiku - no PM brief needed)
    // Each specialist works directly from raw data
    // ========================================

    const dataSlice = rawData.slice(0, 4000);

    const [marketingDraft, seoDraft, ppcDraft] = await Promise.all([
      runAgent(
        `You are a Brand Strategist. Be very concise - bullet points only. Output in ${langFull}.`,
        `DATA:\n${dataSlice}\n\nProvide:\n1. TARGET AUDIENCE (1 sentence)\n2. 3 PERSONAS: name, age, role, 2 pain points, 2 goals\n3. 3 UVP ANGLES: name + 1-sentence positioning\n4. KEY MESSAGES (5 bullet points)\n5. COMPETITIVE DIFFERENTIATION (3 points)`,
        0.7, 1000, FAST_MODEL
      ),
      runAgent(
        `You are an SEO Specialist. Be very concise - lists only. Output in ${langFull}.`,
        `DATA:\n${dataSlice}\n\nProvide:\n1. HIGH INTENT KEYWORDS (10): keyword [EXACT]\n2. MEDIUM INTENT (10): keyword [PHRASE]\n3. DISCOVERY (5): keyword [BROAD]\n4. NEGATIVE KEYWORDS (15)\n5. KEYWORD CLUSTERS: 3-4 theme groups`,
        0.7, 1000, FAST_MODEL
      ),
      runAgent(
        `You are a Google Ads Copywriter. Headlines MAX 30 chars. Descriptions MAX 90 chars. NO generic phrases. Output in ${langFull}.`,
        `DATA:\n${dataSlice}\n\nCreate:\n1. 15 HEADLINES (under 30 chars each) using formulas: number+benefit, pain+solution, guarantee, urgency, social proof\n2. 9 DESCRIPTIONS (under 90 chars): 3x benefit, 3x problem-solution, 3x social-proof\n3. 4 CALLOUTS\n4. 4 SITELINKS with descriptions`,
        0.7, 1000, FAST_MODEL
      ),
    ]);

    timing.specialists = Date.now() - t0 - timing.dataGathering;
    console.log(`[TIMING] Specialists (parallel): ${timing.specialists}ms`);

    // ========================================
    // PHASE 4: COMBINED FINAL (Haiku for speed - must complete under 60s total)
    // Cross-review + PPC refinement + PM recommendations + JSON compilation in ONE call
    // ========================================

    const combinedFinalCall = async () => {
      const response = await anthropic.messages.create({
        model: FAST_MODEL,
        max_tokens: 6000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: `Compile into JSON. All text in ${langFull}. Headlines ≤30 chars. Descriptions ≤90 chars. Google Ads only.

STRATEGY:\n${marketingDraft.slice(0, 1200)}

KEYWORDS:\n${seoDraft.slice(0, 1200)}

ADS:\n${ppcDraft.slice(0, 1200)}

IMPORTANT: Output ONLY the raw JSON object. No markdown fences. No text before or after. Be compact - short strings, no unnecessary whitespace. Include 15 headlines, 9 descriptions, 3 personas (2 pain_points each), 3 uvp_angles.
{
  "strategy": {"campaign_objective":"string","target_audience":"string","unique_value_proposition":"string","key_differentiators":["string"],"brand_positioning":"string"},
  "personas": [{"name":"string","age":"string","position":"string","pain_points":["string"],"goals":["string"],"objections":["string"]}],
  "uvp_angles": [{"name":"string","positioning":"string"}],
  "headlines": [{"text":"Max 30 chars in ${langFull}","angle":"benefit|urgency|trust","chars":25}],
  "descriptions": [{"text":"Max 90 chars in ${langFull}","angle":"problem-solution|benefit|social-proof","chars":80}],
  "keywords": {"high_intent":[{"text":"keyword","matchType":"EXACT"}],"medium_intent":[{"text":"keyword","matchType":"PHRASE"}],"discovery":[{"text":"keyword","matchType":"BROAD"}]},
  "negative_keywords": ["word"],
  "extensions": {"callouts":["text"],"sitelinks":[{"text":"Link","description":"Desc"}],"structured_snippets":{"header":"Services","values":["val"]}},
  "campaign_settings": {"bidding_strategy":"string","daily_budget":${Math.round(monthlyBudget / 30)},"target_cpa":0,"ad_schedule":"string","locations":["string"],"devices":"all"},
  "testing_plan": {"week_1":"string","week_2":"string","week_4":"string"},
  "expert_notes": {"project_manager":{"insight":"string","test_first":"string","warning":"string"},"marketing":{"insight":"string","test_first":"string","warning":"string"},"seo":{"insight":"string","test_first":"string","warning":"string"},"ppc":{"insight":"string","test_first":"string","warning":"string"}}
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

    timing.finalCompilation = Date.now() - t0 - timing.dataGathering - timing.specialists;
    timing.total = Date.now() - t0;
    console.log(`[TIMING] Final compilation: ${timing.finalCompilation}ms`);
    console.log(`[TIMING] TOTAL: ${timing.total}ms`);

    const responseText = finalOutput!.content[0].type === "text" ? finalOutput!.content[0].text : "";

    let result;
    try {
      // Try to extract JSON from markdown fences first, then parse raw
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
      result = JSON.parse(jsonStr.trim());
    } catch {
      // Try to find JSON object in the text
      const objectMatch = responseText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          result = JSON.parse(objectMatch[0]);
        } catch {
          return NextResponse.json({ success: false, error: "Failed to parse final output", raw: responseText.slice(0, 2000), timing }, { status: 500 });
        }
      } else {
        return NextResponse.json({ success: false, error: "No JSON found in output", raw: responseText.slice(0, 2000), timing }, { status: 500 });
      }
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
        marketingStrategy: marketingDraft.slice(0, 800) + "...",
        seoKeywords: seoDraft.slice(0, 800) + "...",
        ppcAds: ppcDraft.slice(0, 800) + "...",
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
          "Parallel Specialists (Haiku x3)",
          "Final JSON Compilation (Haiku)"
        ],
        agentInteractions: 3,
        totalApiCalls: 4,
      },
      agentOutputs: {
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
        timing,
      },
    });
  } catch (error: any) {
    console.error("Multi-agent analysis error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
