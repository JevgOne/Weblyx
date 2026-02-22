import Anthropic from "@anthropic-ai/sdk";
import { getCampaignPerformance, getKeywordPerformance } from "@/lib/google-ads";
import { getGA4Overview, getGA4TopPages, getGA4TrafficSources } from "@/lib/google-analytics";
import { getSearchConsoleOverview, getSearchConsoleTopQueries, getSearchConsoleTopPages } from "@/lib/google-search-console";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// DATA GATHERING FUNCTIONS
// ============================================

export async function fetchWebsiteContent(url: string): Promise<string> {
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

export async function getGoogleAdsInsights(): Promise<string> {
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

export async function getGA4Insights(): Promise<string> {
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

export async function getSearchConsoleInsights(): Promise<string> {
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

// ============================================
// AI AGENT RUNNER
// ============================================

export async function runAgent(systemPrompt: string, userPrompt: string, temperature = 0.7, maxTokens = 3000): Promise<string> {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      return response.content[0].type === "text" ? response.content[0].text : "";
    } catch (error: any) {
      console.error(`Agent call attempt ${attempt + 1} failed:`, error?.message || error);
      if (attempt === maxRetries) throw error;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return "";
}

// ============================================
// FULL ANALYSIS PIPELINE
// ============================================

export interface AnalysisInput {
  websiteUrl: string;
  competitors?: string[];
  language: "cs" | "de" | "en";
  businessGoal?: string;
  monthlyBudget?: number;
}

export interface AnalysisProgress {
  phase: number;
  totalPhases: number;
  message: string;
  percent: number;
}

export async function runFullAnalysis(
  input: AnalysisInput,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<{
  result: any;
  agentOutputs: Record<string, string>;
  metadata: {
    dataSources: { googleAds: boolean; ga4: boolean; searchConsole: boolean };
  };
}> {
  const { websiteUrl, competitors = [], language, businessGoal = "leads", monthlyBudget = 15000 } = input;
  const langNames = { cs: "Czech", de: "German", en: "English" };
  const langFull = langNames[language];

  const report = (phase: number, message: string, percent: number) => {
    onProgress?.({ phase, totalPhases: 7, message, percent });
  };

  // ========================================
  // PHASE 1: DATA GATHERING
  // ========================================
  report(1, "Gathering website and competitor data...", 10);

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
  // PHASE 2: PROJECT MANAGER - INITIAL BRIEF
  // ========================================
  report(2, "Project Manager analyzing situation...", 20);

  const pmBrief = await runAgent(
    `You are an experienced Digital Marketing Project Manager. Your job is to:
1. Analyze all available data and create a comprehensive strategic brief
2. Define clear objectives, constraints, and success criteria
3. Identify key insights that the team must leverage
4. Set the direction for each specialist

Be thorough but concise. Think strategically. Output in ${langFull}.`,
    `Create a strategic brief for the team based on this data:

${rawData}

Your brief should include:
1. EXECUTIVE SUMMARY - What are we dealing with?
2. BUSINESS OBJECTIVES - What must this campaign achieve?
3. TARGET AUDIENCE PROFILE - Who are we targeting? Be specific.
4. COMPETITIVE LANDSCAPE - What are competitors doing? Gaps and opportunities?
5. KEY CONSTRAINTS - Budget, market, timing considerations
6. CRITICAL SUCCESS FACTORS - What will make or break this campaign?
7. DIRECTION FOR EACH TEAM MEMBER:
   - For Marketing Strategist: What positioning angle to explore?
   - For SEO Expert: What keyword themes to prioritize?
   - For PPC Specialist: What ad angles will resonate?
8. PERSONAS - Define 3 specific customer personas:
   For each persona provide:
   - Name (fictional but realistic)
   - Age and position/role
   - Top 3 pain points
   - Top 3 goals
   - Top 3 objections to buying
9. UVP ANGLES - Propose 3 different unique value proposition angles for A/B testing:
   - Angle 1: [name] - positioning statement
   - Angle 2: [name] - positioning statement
   - Angle 3: [name] - positioning statement

Be decisive and specific. The team relies on your direction.`
  );

  // ========================================
  // PHASE 3: PARALLEL SPECIALIST WORK
  // ========================================
  report(3, "Specialists working in parallel...", 40);

  const [marketingDraft, seoDraft, ppcDraft] = await Promise.all([
    runAgent(
      `You are a Brand & Marketing Strategist. You receive direction from the Project Manager and must develop the messaging strategy.
Focus on: positioning, value proposition, emotional triggers, trust builders, competitive differentiation.
Be creative but strategic. Ground everything in data. Output in ${langFull}.`,
      `PROJECT MANAGER'S BRIEF:
${pmBrief}

RAW DATA FOR REFERENCE:
${rawData.slice(0, 8000)}

Develop the marketing strategy:
1. POSITIONING STATEMENT - How should we position against competitors?
2. UNIQUE VALUE PROPOSITION - The #1 compelling reason to choose this company
3. KEY MESSAGES (5-7) - Core messages that will resonate with the target audience
4. EMOTIONAL TRIGGERS - What motivates our audience? Fear, aspiration, urgency?
5. TRUST BUILDERS - What overcomes objections and builds credibility?
6. MESSAGE HIERARCHY - Which messages are primary vs. supporting?
7. TONE & VOICE - How should the ads sound?
8. COMPETITIVE DIFFERENTIATION - Specific angles that competitors DON'T use`
    ),

    runAgent(
      `You are a Senior SEO & Keyword Research Specialist. You analyze search intent and find the most valuable keywords.
Focus on: search intent, keyword clustering, competition analysis, long-tail opportunities.
Be thorough and data-driven. Output in ${langFull}.`,
      `PROJECT MANAGER'S BRIEF:
${pmBrief}

RAW DATA FOR REFERENCE:
${rawData.slice(0, 8000)}

Develop the keyword strategy:
1. PRIMARY KEYWORDS (5-10) - Highest commercial intent, most valuable
2. SECONDARY KEYWORDS (10-15) - Supporting terms with good potential
3. LONG-TAIL KEYWORDS (10-20) - Specific, lower competition, higher conversion
4. KEYWORD CLUSTERS - Group keywords by theme/intent
5. NEGATIVE KEYWORDS (15-20) - What to exclude to avoid wasted spend
6. SEARCH INTENT ANALYSIS - What does our audience actually search for at each buying stage?
7. COMPETITOR KEYWORD GAPS - Keywords competitors rank for that we should target
8. SEASONAL CONSIDERATIONS - Any timing factors to consider?`
    ),

    runAgent(
      `You are an elite Google Ads Copywriter. You write ads that CONVERT.
You know character limits perfectly:
- Headlines: MAX 30 characters
- Descriptions: MAX 90 characters

Focus on: high CTR copy, clear CTAs, emotional resonance, testing angles.
Output in ${langFull}.`,
      `PROJECT MANAGER'S BRIEF:
${pmBrief}

Create initial ad concepts using these 5 HEADLINE FORMULAS:
1. NUMBER + BENEFIT (e.g. "3x More Leads in 30 Days")
2. PAIN + SOLUTION (e.g. "Slow Website? We Fix It Fast")
3. GUARANTEE (e.g. "Results or Money Back")
4. URGENCY (e.g. "Only 3 Slots Left This Month")
5. SOCIAL PROOF (e.g. "Trusted by 200+ Companies")

For each formula, draft 3 sample headlines (under 30 chars each) in ${langFull}.

FORBIDDEN GENERIC PHRASES - NEVER use these:
- "Professional website" / "Profesionální web"
- "Quality services" / "Kvalitní služby"
- "Best solution" / "Nejlepší řešení"
- "Great prices" / "Skvělé ceny"
- Any headline that could apply to ANY business

DESCRIPTIONS - Write 9 descriptions (under 90 chars each) in ${langFull}, in 3 categories:
- 3x BENEFIT descriptions (what the customer gains)
- 3x PROBLEM-SOLUTION descriptions (pain point → resolution)
- 3x SOCIAL PROOF descriptions (trust, numbers, results)

Also provide:
- CALL-TO-ACTION OPTIONS - What CTAs will work best?
- AD EXTENSION IDEAS - Callouts, sitelinks, structured snippets`
    ),
  ]);

  // ========================================
  // PHASE 4: CROSS-REVIEW & COLLABORATION
  // ========================================
  report(4, "Team cross-reviewing each other's work...", 60);

  const [marketingReviewOfSEO, seoReviewOfPPC] = await Promise.all([
    runAgent(
      `You are the Marketing Strategist. Review the SEO Expert's keyword research from a messaging perspective. Output in ${langFull}.`,
      `Your marketing strategy:
${marketingDraft}

SEO Expert's keyword research:
${seoDraft}

REVIEW THE KEYWORDS:
1. Which keywords align perfectly with our messaging strategy?
2. Which keywords need different messaging angles?
3. Are there any keywords that conflict with our brand positioning?
4. What keyword-to-message mapping do you recommend?
5. Any keywords missing that would support our messaging?`
    ),

    runAgent(
      `You are the SEO Expert. Review the PPC copy from a keyword optimization perspective. Output in ${langFull}.`,
      `Your keyword research:
${seoDraft}

PPC Specialist's ad concepts:
${ppcDraft}

REVIEW THE AD COPY:
1. Do the headlines include our top keywords naturally?
2. Which headlines will likely have best Quality Score?
3. Are there keyword opportunities missing from the copy?
4. Suggest specific keyword insertions for headlines
5. Which ad angles will best match search intent?`
    ),
  ]);

  // ========================================
  // PHASE 5: PPC SPECIALIST FINAL CREATION
  // ========================================
  report(5, "PPC Specialist creating final ads...", 75);

  const ppcFinal = await runAgent(
    `You are the PPC Specialist. Now create the FINAL ad content incorporating all team feedback.

CRITICAL REQUIREMENTS:
- ALL text content MUST be in ${langFull}
- Headlines MUST be UNDER 30 characters (count carefully!)
- Descriptions MUST be UNDER 90 characters
- Meta Ads primary texts MUST be UNDER 500 characters (125 visible)
- Meta Ads headlines MUST be UNDER 40 characters
- Meta Ads descriptions MUST be UNDER 30 characters
- Double-check every character count!`,
    `YOUR INITIAL CONCEPTS:
${ppcDraft}

MARKETING STRATEGIST'S INPUT ON KEYWORDS:
${marketingReviewOfSEO}

SEO EXPERT'S INPUT ON YOUR COPY:
${seoReviewOfPPC}

MARKETING STRATEGY TO FOLLOW:
${marketingDraft}

KEYWORDS TO INCORPORATE:
${seoDraft}

PM BRIEF (for personas and UVP angles):
${pmBrief}

NOW CREATE THE FINAL ADS in ${langFull}:

1. PERSONAS - Confirm or refine the 3 customer personas from the PM brief:
   For each: Name, Age, Position, Pain Points (3), Goals (3), Objections (3)

2. UVP ANGLES - Confirm or refine 3 unique value proposition angles:
   For each: Angle name + positioning statement

3. HEADLINES grouped by UVP angle (3 angles × 5 headlines = 15 total, each UNDER 30 characters):
   Use these 5 formulas for each angle:
   - Number+Benefit
   - Pain+Solution
   - Guarantee
   - Urgency
   - Social Proof
   Format: "Headline text" (XX chars) [formula]

4. DESCRIPTIONS by type (9 total, each UNDER 90 characters):
   - 3x BENEFIT descriptions
   - 3x PROBLEM-SOLUTION descriptions
   - 3x SOCIAL PROOF descriptions
   Format: "Description text" (XX chars) [type]

5. META ADS SECTION:
   - 3x Primary Text (max 500 chars, first 125 visible) - one per UVP angle
   - 3x Headline (max 40 chars)
   - 3x Description (max 30 chars)
   - Creative recommendations (image/video suggestions)

6. KEYWORDS with match types:
   - HIGH INTENT (EXACT match): list with [EXACT]
   - MEDIUM INTENT (PHRASE match): list with [PHRASE]
   - DISCOVERY (BROAD match): list with [BROAD]

7. NEGATIVE KEYWORDS: list

8. AD EXTENSIONS:
   - Callouts (4):
   - Sitelinks (4) with descriptions:
   - Structured snippet header and values:`,
    0.7,
    4000
  );

  // ========================================
  // PHASE 6: PROJECT MANAGER FINAL REVIEW
  // ========================================
  report(6, "Project Manager final review...", 90);

  const pmFinalReview = await runAgent(
    `You are the Project Manager. Review all team outputs and create the final strategic recommendations.
You also perform a LANDING PAGE AUDIT based on real data - website content, GA4 metrics, and Google Ads conversion data.
Output in ${langFull}.`,
    `RAW DATA FOR LANDING PAGE AUDIT:

=== WEBSITE CONTENT (first 3000 chars) ===
${websiteContent.slice(0, 3000)}

=== GOOGLE ADS PERFORMANCE ===
${googleAdsData}

=== GA4 WEBSITE BEHAVIOR ===
${ga4Data}

=== SEARCH CONSOLE ===
${gscData}

TEAM OUTPUTS:

MARKETING STRATEGY:
${marketingDraft}

KEYWORD RESEARCH:
${seoDraft}

FINAL ADS:
${ppcFinal}

Create the final campaign recommendations:
1. CAMPAIGN STRUCTURE - How should campaigns be organized?
2. BIDDING STRATEGY - What approach for a ${monthlyBudget} CZK/month budget?
3. TARGET CPA/ROAS - What should we aim for?
4. AD SCHEDULING - Best times/days to run?
5. AUDIENCE TARGETING - Any additional targeting recommendations?
6. TESTING PLAN - What to A/B test first? Provide specific Week 1, Week 2, Week 4 plans.
7. SUCCESS METRICS - What KPIs to track?
8. RISK FACTORS - What could go wrong?
9. OPTIMIZATION ROADMAP - Week 1, 2, 4, 8 plans

10. STRUCTURED EXPERT NOTES - For EACH team member (project_manager, marketing, seo, ppc), provide:
    - INSIGHT: Why were these approaches chosen? Key strategic reasoning.
    - TEST FIRST: What should be tested first and why?
    - WARNING: What to watch out for, potential pitfalls.

11. ACTION PLAN - Based on the RAW DATA above, perform a landing page audit:
    a) READINESS SCORE (0-100): How ready is this website for paid traffic?
       - Score 80-100: Ready to go
       - Score 40-79: Needs improvements
       - Score 0-39: Critical issues, do NOT launch until fixed
    b) READINESS LABEL: One of "Připraven", "Potřebuje úpravy", "Kritické problémy"
    c) BLOCKING ISSUES: Critical problems that will waste ad budget. For EACH issue provide:
       - What the issue is
       - EVIDENCE from data (cite specific GA4 metrics, bounce rates, session durations, keyword conversion rates)
       - How to fix it
       - Priority: "critical" or "high"
    d) WEBSITE CHANGES: Specific changes needed on the website. For EACH:
       - Which page
       - What to change
       - Why (cite data)
       - Priority: "critical", "high", or "medium"
    e) CAMPAIGN CHANGES: Adjustments for the campaign based on data. For EACH:
       - What to change
       - Why (cite specific keywords with clicks but 0 conversions, or other data)
       - Priority: "critical", "high", or "medium"

    IMPORTANT for ACTION PLAN:
    - Base EVERYTHING on actual data from RAW DATA section
    - If GA4 shows high bounce rate, cite the exact number
    - If Google Ads shows keywords with clicks but 0 conversions, cite those keywords
    - If website content is missing CTA, forms, or trust signals, cite what you found
    - Do NOT make generic recommendations - be specific to THIS website`,
    0.3,
    4000
  );

  // ========================================
  // PHASE 7: FINAL JSON OUTPUT
  // ========================================
  report(7, "Compiling final results...", 95);

  const marketingTrunc = marketingDraft.slice(0, 3000);
  const ppcTrunc = ppcFinal.slice(0, 6000);
  const pmTrunc = pmFinalReview.slice(0, 8000);
  const pmBriefTrunc = pmBrief.slice(0, 2000);

  const phase7Call = async () => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: `Compile all team outputs into a final JSON structure.

PM BRIEF (contains personas and UVP angles):
${pmBriefTrunc}

MARKETING STRATEGY:
${marketingTrunc}

FINAL ADS (in ${langFull}):
${ppcTrunc}

PROJECT MANAGER RECOMMENDATIONS:
${pmTrunc}

CRITICAL: Extract the actual headlines and descriptions from the PPC output. They MUST be in ${langFull}.
- Headlines max 30 chars
- Descriptions max 90 chars
- Meta Ads primary texts max 500 chars
- Meta Ads headlines max 40 chars

Output ONLY valid JSON:
\`\`\`json
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
  "meta_ads": {
    "primary_texts": [{"text": "max 500 chars", "angle": "UVP angle name"}],
    "headlines": [{"text": "max 40 chars"}],
    "descriptions": [{"text": "max 30 chars"}],
    "creative_recommendations": "string"
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
    "daily_budget": number,
    "target_cpa": number,
    "ad_schedule": "string",
    "locations": ["string"],
    "devices": "all|mobile|desktop"
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
  },
  "action_plan": {
    "readiness_score": 65,
    "readiness_label": "Potřebuje úpravy",
    "blocking_issues": [
      {"issue": "string", "evidence": "string (cite specific data)", "fix": "string", "priority": "critical|high"}
    ],
    "website_changes": [
      {"page": "/", "change": "string", "reason": "string (cite data)", "priority": "critical|high|medium"}
    ],
    "campaign_changes": [
      {"change": "string", "reason": "string (cite data)", "priority": "critical|high|medium"}
    ]
  }
}
\`\`\``,
        },
      ],
    });
    return response;
  };

  let finalOutput;
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      finalOutput = await phase7Call();
      break;
    } catch (error: any) {
      console.error(`Phase 7 attempt ${attempt + 1} failed:`, error?.message || error);
      if (attempt === 2) throw error;
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }

  const responseText = finalOutput!.content[0].type === "text" ? finalOutput!.content[0].text : "";

  let result;
  try {
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
    result = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
  } catch (parseError) {
    console.error("Phase 7 JSON parse failed, attempting recovery:", parseError);
    // Try to find any JSON object in the response
    const objectMatch = responseText.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      result = JSON.parse(objectMatch[0]);
    } else {
      throw new Error("AI analysis produced invalid output. Please try again.");
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

  if (result.meta_ads) {
    result.meta_ads.primary_texts = result.meta_ads.primary_texts?.filter((t: any) => t.text && t.text.length <= 500) || [];
    result.meta_ads.headlines = result.meta_ads.headlines?.filter((h: any) => h.text && h.text.length <= 40) || [];
    result.meta_ads.descriptions = result.meta_ads.descriptions?.filter((d: any) => d.text && d.text.length <= 30) || [];
  }

  // Validate action_plan structure (with fallback if missing)
  if (!result.action_plan) {
    result.action_plan = {
      readiness_score: 50,
      readiness_label: "Potřebuje úpravy",
      blocking_issues: [],
      website_changes: [],
      campaign_changes: [],
    };
  }
  {
    const ap = result.action_plan;
    const validPriorities = ["critical", "high", "medium"];
    ap.readiness_score = Math.max(0, Math.min(100, Number(ap.readiness_score) || 50));
    ap.readiness_label = ap.readiness_label || (ap.readiness_score >= 80 ? "Připraven" : ap.readiness_score >= 50 ? "Potřebuje úpravy" : "Kritické problémy");
    ap.blocking_issues = (ap.blocking_issues || [])
      .filter((i: any) => i.issue && i.evidence)
      .map((i: any) => ({ ...i, priority: validPriorities.includes(i.priority?.toLowerCase()) ? i.priority.toLowerCase() : "high" }))
      .slice(0, 10);
    ap.website_changes = (ap.website_changes || [])
      .filter((c: any) => c.change && c.reason)
      .map((c: any) => ({ ...c, priority: validPriorities.includes(c.priority?.toLowerCase()) ? c.priority.toLowerCase() : "medium" }))
      .slice(0, 10);
    ap.campaign_changes = (ap.campaign_changes || [])
      .filter((c: any) => c.change && c.reason)
      .map((c: any) => ({ ...c, priority: validPriorities.includes(c.priority?.toLowerCase()) ? c.priority.toLowerCase() : "medium" }))
      .slice(0, 10);
  }

  report(7, "Analysis complete!", 100);

  const agentOutputs = {
    pmBrief: pmBrief.slice(0, 800) + "...",
    marketingStrategy: marketingDraft.slice(0, 800) + "...",
    seoKeywords: seoDraft.slice(0, 800) + "...",
    ppcAds: ppcFinal.slice(0, 800) + "...",
    pmRecommendations: pmFinalReview.slice(0, 800) + "...",
  };

  return {
    result,
    agentOutputs,
    metadata: {
      dataSources: {
        googleAds: googleAdsData !== "Google Ads data not available",
        ga4: ga4Data !== "GA4 data not available",
        searchConsole: gscData !== "Search Console data not available",
      },
    },
  };
}
