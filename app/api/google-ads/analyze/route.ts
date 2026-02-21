import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCampaignPerformance, getKeywordPerformance } from "@/lib/google-ads";
import { getGA4Overview, getGA4TopPages, getGA4TrafficSources } from "@/lib/google-analytics";
import { getSearchConsoleOverview, getSearchConsoleTopQueries, getSearchConsoleTopPages } from "@/lib/google-search-console";
import { getAccountInsights, getCampaigns as getMetaCampaigns } from "@/lib/meta-ads";
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

const QUALITY_MODEL = "claude-sonnet-4-6";

interface AnalysisRequest {
  websiteUrl: string;
  competitors?: string[];
  language: "cs" | "de" | "en";
  businessGoal?: string;
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
      .slice(0, 8000);
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

    const topCampaigns = campaigns.filter((c: any) => c.clicks > 10).sort((a: any, b: any) => b.ctr - a.ctr).slice(0, 10);
    const topKeywords = keywords.filter((k: any) => k.clicks > 5).sort((a: any, b: any) => b.ctr - a.ctr).slice(0, 30);
    const worstKeywords = keywords.filter((k: any) => k.impressions > 100 && k.ctr < 0.01).slice(0, 15);
    const totalSpend = campaigns.reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
    const totalClicks = campaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0);
    const totalConversions = campaigns.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0);

    return `
ACCOUNT SUMMARY: Total spend ${totalSpend.toFixed(0)} CZK, ${totalClicks} clicks, ${totalConversions} conversions, Avg CPC ${totalClicks > 0 ? (totalSpend / totalClicks).toFixed(1) : 'N/A'} CZK
TOP CAMPAIGNS: ${topCampaigns.map((c: any) => `${c.name} (CTR ${(c.ctr * 100).toFixed(2)}%, CPC ${c.averageCpc?.toFixed(1) || 'N/A'} CZK, ${c.conversions} conv, cost ${c.cost?.toFixed(0) || 0} CZK)`).join("; ")}
TOP KEYWORDS BY CTR: ${topKeywords.map((k: any) => `"${k.keyword}" (match: ${k.matchType}, CTR ${(k.ctr * 100).toFixed(2)}%, CPC ${k.averageCpc?.toFixed(1) || 'N/A'} CZK, ${k.clicks} clicks)`).join("; ")}
LOW PERFORMING KEYWORDS: ${worstKeywords.map((k: any) => `"${k.keyword}" (${k.impressions} imp, CTR ${(k.ctr * 100).toFixed(2)}%)`).join(", ")}
    `.trim();
  } catch {
    return "Google Ads data not available - no historical campaign data";
  }
}

async function getGA4Insights(): Promise<string> {
  try {
    const [overview, topPages, trafficSources] = await Promise.all([
      getGA4Overview("30daysAgo", "today"),
      getGA4TopPages("30daysAgo", "today", 15),
      getGA4TrafficSources("30daysAgo", "today"),
    ]);

    const summary = overview.summary;

    return `
OVERVIEW (Last 30 days): ${summary.totalUsers} unique users, ${summary.totalSessions} sessions, ${summary.totalPageViews} pageviews
ENGAGEMENT: Bounce Rate ${summary.avgBounceRate.toFixed(1)}%, Avg Session Duration ${Math.round(summary.avgSessionDuration)}s, Pages/Session ${(summary.totalPageViews / Math.max(summary.totalSessions, 1)).toFixed(1)}
TOP PAGES BY VIEWS: ${topPages.map((p: any) => `${p.path} (${p.pageViews} views, ${p.bounceRate.toFixed(0)}% bounce, avg ${Math.round(p.avgSessionDuration || 0)}s)`).join("; ")}
TRAFFIC SOURCES: ${trafficSources.map((s: any) => `${s.source}/${s.medium || 'direct'}: ${s.sessions} sessions (${s.users} users)`).join("; ")}
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
      getSearchConsoleTopQueries(siteUrl, startDate, endDate, 30),
      getSearchConsoleTopPages(siteUrl, startDate, endDate, 15),
    ]);

    const summary = overview.summary;

    return `
ORGANIC OVERVIEW (Last 30 days): ${summary.totalClicks} clicks, ${summary.totalImpressions} impressions, CTR ${summary.avgCtr.toFixed(2)}%, Avg Position ${summary.avgPosition.toFixed(1)}
TOP ORGANIC QUERIES: ${topQueries.map((q: any) => `"${q.query}" (${q.clicks} clicks, ${q.impressions} imp, CTR ${(q.ctr * 100).toFixed(1)}%, pos ${q.position.toFixed(1)})`).join("; ")}
TOP ORGANIC PAGES: ${topPages.map((p: any) => `${p.page.replace(/https?:\/\/[^/]+/, '')} (${p.clicks} clicks, ${p.impressions} imp, pos ${p.position.toFixed(1)})`).join("; ")}
    `.trim();
  } catch (error) {
    console.error("Search Console insights error:", error);
    return "Search Console data not available";
  }
}

async function getMetaAdsInsights(): Promise<string> {
  try {
    const [accountInsights, campaigns] = await Promise.all([
      getAccountInsights("last_30d"),
      getMetaCampaigns(),
    ]);

    const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE" || c.effective_status === "ACTIVE");

    return `
META ADS ACCOUNT (Last 30 days): Spend ${accountInsights.spend || 'N/A'}, Reach ${accountInsights.reach || 'N/A'}, Impressions ${accountInsights.impressions || 'N/A'}, Clicks ${accountInsights.clicks || 'N/A'}, CTR ${accountInsights.ctr || 'N/A'}
ACTIVE CAMPAIGNS (${activeCampaigns.length}): ${activeCampaigns.map((c: any) => `${c.name} (objective: ${c.objective}, status: ${c.effective_status})`).join("; ")}
ALL CAMPAIGNS (${campaigns.length}): ${campaigns.slice(0, 10).map((c: any) => `${c.name} (${c.status})`).join("; ")}
    `.trim();
  } catch (error) {
    console.error("Meta Ads insights error:", error);
    return "Meta Ads data not available";
  }
}

async function runAgent(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.5,
  maxTokens = 4000,
  model: string = QUALITY_MODEL
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
      const delay = isOverloaded ? 5000 * (attempt + 1) : 3000 * (attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { websiteUrl, competitors = [], language, businessGoal = "leads" } = body;

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

    const [googleAdsData, ga4Data, gscData, metaAdsData] = await Promise.all([
      getGoogleAdsInsights(),
      getGA4Insights(),
      getSearchConsoleInsights(),
      getMetaAdsInsights(),
    ]);

    const rawData = `
=== CLIENT WEBSITE (${websiteUrl}) ===
${websiteContent}

=== COMPETITOR WEBSITES ===
${competitors.map((url, i) => `[${url}]: ${competitorContents[i]?.slice(0, 3000) || "N/A"}`).join("\n\n")}

=== GOOGLE ADS HISTORICAL DATA (Paid Traffic - Last 30 Days) ===
${googleAdsData}

=== GOOGLE ANALYTICS 4 DATA (Website Behavior - Last 30 Days) ===
${ga4Data}

=== GOOGLE SEARCH CONSOLE DATA (Organic Search - Last 30 Days) ===
${gscData}

=== META ADS DATA (Facebook & Instagram - Last 30 Days) ===
${metaAdsData}

=== BUSINESS CONTEXT ===
Goal: ${businessGoal}
Target Language: ${langFull}
Website: ${websiteUrl}
    `.trim();

    timing.dataGathering = Date.now() - t0;
    console.log(`[TIMING] Data gathering: ${timing.dataGathering}ms`);

    // ========================================
    // PHASE 2: PARALLEL SPECIALISTS (Sonnet - full data, detailed prompts)
    // 4 agents work simultaneously with full context
    // ========================================

    const [marketingDraft, seoDraft, ppcDraft, budgetDraft] = await Promise.all([
      // Agent 1: Marketing Strategist
      runAgent(
        `You are a senior Brand & Marketing Strategist with 15+ years of experience in digital marketing for small/medium businesses in Central Europe. You think deeply about positioning, messaging, and customer psychology. Output everything in ${langFull}.`,
        `Analyze this business thoroughly and create a marketing strategy for Google Ads.

${rawData}

Based on ALL the data above, provide a DETAILED analysis:

1. TARGET AUDIENCE: Who exactly are these people? Be specific about demographics, psychographics, and behavior patterns you can see from the GA4 and Search Console data.

2. 3 DETAILED PERSONAS: For each persona provide:
   - Name, age range, job title/role
   - 3 specific pain points (based on the search queries they use)
   - 3 specific goals
   - 2 objections they might have about the service
   - What would convince them to take action

3. 3 UNIQUE VALUE PROPOSITION ANGLES: Each should be a different strategic approach to positioning. Not generic - based on what the competitors are NOT doing well.

4. KEY MESSAGES: 7-10 bullet points of messaging that would resonate with the target audience. Use language THEY would use, not marketing jargon.

5. COMPETITIVE DIFFERENTIATION: Based on the competitor websites, what are 5 specific things this business does better or differently? Be concrete.

6. BRAND POSITIONING STATEMENT: One paragraph that captures the unique position in the market.`,
        0.6, 3000, QUALITY_MODEL
      ),

      // Agent 2: SEO & Keyword Specialist
      runAgent(
        `You are a senior SEO & PPC Keyword Specialist with deep expertise in Czech/German markets. You understand search intent, keyword economics, and how to structure keyword strategies for maximum ROI. Output in ${langFull}.`,
        `Analyze this business and create a comprehensive keyword strategy for Google Ads.

${rawData}

Based on ALL the data (especially Search Console queries, GA4 top pages, and Google Ads history), provide:

1. HIGH INTENT KEYWORDS (15 keywords): These are keywords where the searcher is ready to buy/contact. For each: keyword text, match type [EXACT], estimated CPC range in CZK, estimated monthly search volume, and WHY this keyword shows buying intent.

2. MEDIUM INTENT KEYWORDS (15 keywords): Research/comparison phase. For each: keyword text, match type [PHRASE], estimated CPC, volume, and the intent behind it.

3. DISCOVERY KEYWORDS (8 keywords): Top-of-funnel awareness. Match type [BROAD]. Include why each could drive qualified traffic.

4. NEGATIVE KEYWORDS (20+): Keywords to EXCLUDE. Group them by category (e.g., "free/DIY", "jobs/careers", "irrelevant services"). Explain why each group should be excluded.

5. KEYWORD CLUSTERS: Group all keywords into 4-6 thematic clusters. For each cluster: name, keywords in it, recommended ad group structure, and estimated combined volume.

6. SEARCH INTENT ANALYSIS: Based on Search Console data, what are people ACTUALLY searching for? What gaps exist between organic queries and paid keyword opportunities?`,
        0.5, 3000, QUALITY_MODEL
      ),

      // Agent 3: PPC Ad Copywriter
      runAgent(
        `You are an elite Google Ads copywriter who has written ads for thousands of campaigns. You know every psychological trigger, every formula that works. You write in ${langFull} natively - your ads sound natural, not translated. Headlines MUST be ≤30 characters. Descriptions MUST be ≤90 characters. Count characters carefully.`,
        `Create high-converting Google Ads copy for this business.

${rawData}

Create ALL of the following. Every piece of text must be in ${langFull}:

1. 15 HEADLINES (each MUST be ≤30 characters, count carefully!):
   Use these proven formulas - at least 2 of each:
   - Number + Benefit: "5x Více Poptávek"
   - Pain → Solution: "Starý Web? Nový za 14 Dní"
   - Social Proof: "500+ Spokojených Klientů"
   - Urgency/Scarcity: "Pouze 3 Místa v Lednu"
   - Question: "Potřebujete Nový Web?"
   For each headline, specify the formula used and character count.

2. 9 DESCRIPTIONS (each MUST be ≤90 characters):
   - 3x Benefit-focused: What the customer GETS
   - 3x Problem-solution: Address a pain point, offer the fix
   - 3x Social proof/Trust: Reviews, numbers, guarantees
   For each, specify the angle and character count.

3. 4 CALLOUT EXTENSIONS: Short, punchy additional benefits (≤25 chars each)

4. 4 SITELINK EXTENSIONS: Each with a title (≤25 chars) and description (≤35 chars). Link to logical pages.

5. STRUCTURED SNIPPETS: Header type and 4-6 values

6. AD VARIATIONS: Suggest 3 different ad combinations (which headlines + descriptions work together) for A/B testing.`,
        0.7, 3000, QUALITY_MODEL
      ),

      // Agent 4: Budget & Strategy Planner
      runAgent(
        `You are a senior PPC Budget Strategist and Google Ads account manager. You've managed millions in ad spend across Central European markets. You understand CPC benchmarks, conversion rates, and realistic expectations for different industries and budgets. You explain things simply so even someone who has never run ads understands. Output in ${langFull}.`,
        `Create 3 detailed budget plans for this business's Google Ads campaigns.

${rawData}

IMPORTANT CONTEXT:
- This is a real business. Use realistic CPC estimates for the Czech market based on the industry.
- If Google Ads historical data is available, use ACTUAL CPCs from the data.
- If no historical data, estimate based on the industry and competition level visible from the competitor analysis.

Create EXACTLY 3 budget tiers. For each tier, think deeply about what's REALISTICALLY achievable:

TIER 1 - "Starter" (lowest reasonable budget for this industry):
- Monthly budget in CZK
- Daily budget
- How many clicks per month (realistic range based on CPC)
- How many leads/conversions to expect (use realistic conversion rates 2-5% for landing pages)
- Cost per lead
- What campaign structure is possible at this budget (e.g., "1 search campaign with your top 20 keywords")
- WHO this plan is for (e.g., "Pro podnikatele, kteří chtějí vyzkoušet Google Ads s minimálním rizikem")
- SIMPLE explanation: Explain in 2-3 sentences what happens at this budget. Use analogies. No jargon. Like explaining to a friend over coffee.

TIER 2 - "Growth" (recommended, sweet spot):
- Same structure as above but with the RECOMMENDED budget
- This should be the tier you'd recommend to most clients
- Mark this as recommended=true
- Explain WHY this is the sweet spot - what you get extra compared to Starter

TIER 3 - "Scale" (aggressive growth):
- Same structure, higher budget
- Explain what extra reach and capabilities this unlocks
- When does it make sense to spend this much

Also provide:
- GENERAL CAMPAIGN SETTINGS: Recommended bidding strategy, ad schedule, target locations, device targeting
- TESTING PLAN: Week 1 plan, Week 2 adjustments, Week 4 optimization
- WARNING: What could go wrong and how to avoid it

Output as structured text with clear headings.`,
        0.4, 4000, QUALITY_MODEL
      ),
    ]);

    timing.specialists = Date.now() - t0 - timing.dataGathering;
    console.log(`[TIMING] Specialists (parallel Sonnet x4): ${timing.specialists}ms`);

    // ========================================
    // PHASE 3: FINAL COMPILATION (Sonnet - comprehensive JSON assembly)
    // Takes all specialist outputs and compiles into structured JSON
    // ========================================

    const compilationPrompt = `You are compiling the work of 4 marketing specialists into a single structured JSON. All text MUST be in ${langFull}. Google Ads character limits are STRICT: headlines ≤30 chars, descriptions ≤90 chars.

=== MARKETING STRATEGY ===
${marketingDraft}

=== KEYWORD RESEARCH ===
${seoDraft}

=== AD COPY ===
${ppcDraft}

=== BUDGET ANALYSIS ===
${budgetDraft}

COMPILE everything into this exact JSON structure. Output ONLY the raw JSON object - no markdown fences, no text before or after.
CRITICAL: Count characters for headlines (≤30) and descriptions (≤90). If a headline is too long, rewrite it shorter.
MANDATORY: exactly 15 headlines, exactly 9 descriptions, 3 personas, 3 uvp_angles, exactly 3 budget_tiers.

{
  "strategy": {
    "campaign_objective": "string - main goal",
    "target_audience": "string - detailed audience description",
    "unique_value_proposition": "string - core UVP",
    "key_differentiators": ["string - 5 specific differentiators"],
    "brand_positioning": "string - positioning statement"
  },
  "personas": [
    {
      "name": "string",
      "age": "string",
      "position": "string",
      "pain_points": ["3 specific pain points"],
      "goals": ["3 specific goals"],
      "objections": ["2 objections"]
    }
  ],
  "uvp_angles": [
    {"name": "string", "positioning": "string - 1-2 sentence positioning"}
  ],
  "headlines": [
    {"text": "Max 30 chars in ${langFull}", "angle": "benefit|urgency|trust|social-proof|question", "chars": 25}
  ],
  "descriptions": [
    {"text": "Max 90 chars in ${langFull}", "angle": "benefit|problem-solution|social-proof", "chars": 80}
  ],
  "keywords": {
    "high_intent": [{"text": "keyword", "matchType": "EXACT"}],
    "medium_intent": [{"text": "keyword", "matchType": "PHRASE"}],
    "discovery": [{"text": "keyword", "matchType": "BROAD"}]
  },
  "negative_keywords": ["word"],
  "extensions": {
    "callouts": ["text"],
    "sitelinks": [{"text": "Link title", "description": "Description"}],
    "structured_snippets": {"header": "Type", "values": ["val"]}
  },
  "budget_tiers": [
    {
      "name": "Starter",
      "monthly_budget": 5000,
      "daily_budget": 167,
      "expected_clicks": "150-300",
      "expected_leads": "3-8",
      "expected_cpa": "600-1500 CZK",
      "campaign_plan": "Detailed description of what campaigns and strategy this budget allows",
      "best_for": "Who is this tier for - 1 sentence",
      "recommended": false,
      "explanation": "2-3 sentence simple explanation. Like explaining to a friend who never heard of Google Ads. Use everyday language and analogies."
    },
    {
      "name": "Growth",
      "monthly_budget": 15000,
      "daily_budget": 500,
      "expected_clicks": "500-1000",
      "expected_leads": "15-30",
      "expected_cpa": "500-1000 CZK",
      "campaign_plan": "string",
      "best_for": "string",
      "recommended": true,
      "explanation": "string"
    },
    {
      "name": "Scale",
      "monthly_budget": 30000,
      "daily_budget": 1000,
      "expected_clicks": "1000-2000",
      "expected_leads": "30-60",
      "expected_cpa": "400-800 CZK",
      "campaign_plan": "string",
      "best_for": "string",
      "recommended": false,
      "explanation": "string"
    }
  ],
  "campaign_settings": {
    "bidding_strategy": "string - recommended strategy with explanation",
    "ad_schedule": "string - when to show ads",
    "locations": ["string - target locations"],
    "devices": "all"
  },
  "testing_plan": {
    "week_1": "string - what to do first week",
    "week_2": "string - what to adjust",
    "week_4": "string - optimization steps"
  },
  "expert_notes": {
    "project_manager": {"insight": "string - strategic insight", "test_first": "string - what to test first", "warning": "string - biggest risk"},
    "marketing": {"insight": "string", "test_first": "string", "warning": "string"},
    "seo": {"insight": "string", "test_first": "string", "warning": "string"},
    "ppc": {"insight": "string", "test_first": "string", "warning": "string"}
  }
}`;

    let finalOutput;
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        finalOutput = await anthropic.messages.create({
          model: QUALITY_MODEL,
          max_tokens: 8000,
          temperature: 0.2,
          messages: [{ role: "user", content: compilationPrompt }],
        });
        break;
      } catch (error: any) {
        console.error(`Final compilation attempt ${attempt + 1} failed:`, error?.message || error);
        if (attempt === 2) throw error;
        await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      }
    }

    timing.finalCompilation = Date.now() - t0 - timing.dataGathering - timing.specialists;
    timing.total = Date.now() - t0;
    console.log(`[TIMING] Final compilation (Sonnet): ${timing.finalCompilation}ms`);
    console.log(`[TIMING] TOTAL: ${timing.total}ms`);

    const responseText = finalOutput!.content[0].type === "text" ? finalOutput!.content[0].text : "";

    let result;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
      result = JSON.parse(jsonStr.trim());
    } catch {
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

    // Ensure enough descriptions - generate missing ones if needed
    const existingDescs = result.descriptions || [];
    const needed = 9 - existingDescs.length;
    if (needed > 0) {
      console.log(`[FALLBACK] Have ${existingDescs.length} descriptions, need ${needed} more`);
      try {
        const existingAngles = existingDescs.map((d: any) => d.angle).join(", ");
        const descResult = await runAgent(
          `You are a Google Ads copywriter. Output ONLY a JSON array. No other text.`,
          `Write exactly ${needed} Google Ads descriptions in ${langFull}.
Product: ${result.strategy?.unique_value_proposition || websiteUrl}
Each MUST be ≤90 characters. Types needed: benefit, problem-solution, social-proof.
${existingAngles ? `Already have: ${existingAngles}. Fill missing types to reach 3 of each.` : "Write 3 benefit, 3 problem-solution, 3 social-proof."}
Output ONLY: [{"text":"...","angle":"benefit|problem-solution|social-proof","chars":80}]`,
          0.3, 1500, QUALITY_MODEL
        );
        const arrMatch = descResult.match(/\[[\s\S]*\]/);
        if (arrMatch) {
          const newDescs = JSON.parse(arrMatch[0]).filter((d: any) => d.text && d.text.length <= 90);
          result.descriptions = [...existingDescs, ...newDescs].slice(0, 9);
        }
      } catch (e) {
        console.error("Fallback descriptions failed:", e);
      }
    }

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
        marketingStrategy: marketingDraft,
        seoKeywords: seoDraft,
        ppcAds: ppcDraft,
        budgetAnalysis: budgetDraft,
      };

      await saveAnalysis({
        campaignTrackingId: tracking.id,
        analysisType: "manual",
        dataSources: {
          googleAds: googleAdsData !== "Google Ads data not available - no historical campaign data",
          ga4: ga4Data !== "GA4 data not available",
          searchConsole: gscData !== "Search Console data not available",
          metaAds: metaAdsData !== "Meta Ads data not available",
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
          "Data Gathering (GA4 + GSC + Google Ads + Web Scraping)",
          "4x Parallel Specialists (Sonnet): Marketing, SEO, PPC Copy, Budget Strategy",
          "Final JSON Compilation (Sonnet)"
        ],
        agentInteractions: 4,
        totalApiCalls: 5,
        model: QUALITY_MODEL,
      },
      agentOutputs: {
        marketingStrategy: marketingDraft,
        seoKeywords: seoDraft,
        ppcAds: ppcDraft,
        budgetAnalysis: budgetDraft,
      },
      metadata: {
        websiteAnalyzed: websiteUrl,
        competitorsAnalyzed: competitors.length,
        dataSources: {
          googleAds: googleAdsData !== "Google Ads data not available - no historical campaign data",
          ga4: ga4Data !== "GA4 data not available",
          searchConsole: gscData !== "Search Console data not available",
          metaAds: metaAdsData !== "Meta Ads data not available",
        },
        language,
        collaborationModel: "quality-sonnet",
        timing,
      },
    });
  } catch (error: any) {
    console.error("Multi-agent analysis error:", error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
