import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCampaignPerformance, getKeywordPerformance } from "@/lib/google-ads";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const dynamic = "force-dynamic";
export const maxDuration = 120; // Allow up to 2 minutes for thorough multi-agent collaboration

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

async function runAgent(systemPrompt: string, userPrompt: string, temperature = 0.7): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 3000,
    temperature,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
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
    console.log("🚀 Starting collaborative multi-agent analysis...");

    // ========================================
    // PHASE 1: DATA GATHERING
    // ========================================
    console.log("📥 Phase 1: Gathering all data...");

    const [websiteContent, ...competitorContents] = await Promise.all([
      fetchWebsiteContent(websiteUrl),
      ...competitors.slice(0, 3).map(fetchWebsiteContent),
    ]);
    const googleAdsData = await getGoogleAdsInsights();

    const rawData = `
=== CLIENT WEBSITE (${websiteUrl}) ===
${websiteContent}

=== COMPETITOR WEBSITES ===
${competitors.map((url, i) => `[${url}]: ${competitorContents[i]?.slice(0, 4000) || "N/A"}`).join("\n\n")}

=== GOOGLE ADS HISTORICAL DATA ===
${googleAdsData}

=== BUSINESS CONTEXT ===
Goal: ${businessGoal}
Monthly Budget: ${monthlyBudget} CZK
Target Language: ${langFull}
    `.trim();

    // ========================================
    // PHASE 2: PROJECT MANAGER - INITIAL BRIEF
    // ========================================
    console.log("👔 Phase 2: Project Manager creating strategic brief...");

    const pmBrief = await runAgent(
      `You are an experienced Digital Marketing Project Manager. Your job is to:
1. Analyze all available data and create a comprehensive strategic brief
2. Define clear objectives, constraints, and success criteria
3. Identify key insights that the team must leverage
4. Set the direction for each specialist

Be thorough but concise. Think strategically. Output in English.`,
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

Be decisive and specific. The team relies on your direction.`
    );

    // ========================================
    // PHASE 3: PARALLEL SPECIALIST WORK
    // ========================================
    console.log("🔄 Phase 3: Specialists working in parallel...");

    const [marketingDraft, seoDraft, ppcDraft] = await Promise.all([
      // Marketing Strategist
      runAgent(
        `You are a Brand & Marketing Strategist. You receive direction from the Project Manager and must develop the messaging strategy.
Focus on: positioning, value proposition, emotional triggers, trust builders, competitive differentiation.
Be creative but strategic. Ground everything in data. Output in English.`,
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

      // SEO Expert
      runAgent(
        `You are a Senior SEO & Keyword Research Specialist. You analyze search intent and find the most valuable keywords.
Focus on: search intent, keyword clustering, competition analysis, long-tail opportunities.
Be thorough and data-driven. Output in English.`,
        `PROJECT MANAGER'S BRIEF:
${pmBrief}

RAW DATA FOR REFERENCE:
${rawData.slice(0, 8000)}

Develop the keyword strategy:
1. PRIMARY KEYWORDS (5-10) - Highest commercial intent, most valuable
   - Include estimated monthly search volume if possible
   - Note the search intent (transactional, commercial, informational)

2. SECONDARY KEYWORDS (10-15) - Supporting terms with good potential

3. LONG-TAIL KEYWORDS (10-20) - Specific, lower competition, higher conversion

4. KEYWORD CLUSTERS - Group keywords by theme/intent
   - Cluster 1: [theme] - keywords
   - Cluster 2: [theme] - keywords

5. NEGATIVE KEYWORDS (15-20) - What to exclude to avoid wasted spend

6. SEARCH INTENT ANALYSIS - What does our audience actually search for at each buying stage?

7. COMPETITOR KEYWORD GAPS - Keywords competitors rank for that we should target

8. SEASONAL CONSIDERATIONS - Any timing factors to consider?`
      ),

      // PPC Specialist - First Draft
      runAgent(
        `You are an elite Google Ads Copywriter. You write ads that CONVERT.
You know character limits perfectly:
- Headlines: MAX 30 characters
- Descriptions: MAX 90 characters

Focus on: high CTR copy, clear CTAs, emotional resonance, testing angles.
Output in English.`,
        `PROJECT MANAGER'S BRIEF:
${pmBrief}

Create initial ad concepts:
1. HEADLINE ANGLES - List 5 different angles we could use:
   - Benefit-focused
   - Urgency/scarcity
   - Trust/social proof
   - Feature/specific
   - Question/curiosity

2. For each angle, draft 3 sample headlines (under 30 chars each)

3. DESCRIPTION APPROACHES - List 4 different approaches:
   - Problem-solution
   - Benefit stacking
   - Social proof
   - Direct CTA

4. For each approach, draft 1 sample description (under 90 chars)

5. CALL-TO-ACTION OPTIONS - What CTAs will work best?

6. AD EXTENSION IDEAS - Callouts, sitelinks, structured snippets`
      ),
    ]);

    // ========================================
    // PHASE 4: CROSS-REVIEW & COLLABORATION
    // ========================================
    console.log("🤝 Phase 4: Cross-review and collaboration...");

    // Marketing reviews SEO keywords
    const marketingReviewOfSEO = await runAgent(
      `You are the Marketing Strategist. Review the SEO Expert's keyword research from a messaging perspective.`,
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
    );

    // SEO reviews PPC copy
    const seoReviewOfPPC = await runAgent(
      `You are the SEO Expert. Review the PPC copy from a keyword optimization perspective.`,
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
    );

    // ========================================
    // PHASE 5: PPC SPECIALIST FINAL CREATION
    // ========================================
    console.log("✍️ Phase 5: PPC Specialist creating final ads with team input...");

    const ppcFinal = await runAgent(
      `You are the PPC Specialist. Now create the FINAL ad content incorporating all team feedback.

CRITICAL REQUIREMENTS:
- Headlines MUST be in ${langFull}
- Headlines MUST be UNDER 30 characters (count carefully!)
- Descriptions MUST be in ${langFull}
- Descriptions MUST be UNDER 90 characters
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

NOW CREATE THE FINAL ADS in ${langFull}:

1. HEADLINES (15 total, each UNDER 30 characters):
   - 3x benefit-focused
   - 3x urgency/scarcity
   - 3x trust/proof
   - 3x feature/specific
   - 3x CTA/action

   Format: "Headline text" (XX chars) [angle]

2. DESCRIPTIONS (4 total, each UNDER 90 characters):
   Format: "Description text" (XX chars) [approach]

3. KEYWORDS with match types:
   - HIGH INTENT (EXACT match): list with [EXACT]
   - MEDIUM INTENT (PHRASE match): list with [PHRASE]
   - DISCOVERY (BROAD match): list with [BROAD]

4. NEGATIVE KEYWORDS: list

5. AD EXTENSIONS:
   - Callouts (4):
   - Sitelinks (4) with descriptions:
   - Structured snippet header and values:`
    );

    // ========================================
    // PHASE 6: PROJECT MANAGER FINAL REVIEW
    // ========================================
    console.log("📋 Phase 6: Project Manager final review and recommendations...");

    const pmFinalReview = await runAgent(
      `You are the Project Manager. Review all team outputs and create the final strategic recommendations.`,
      `TEAM OUTPUTS:

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
6. TESTING PLAN - What to A/B test first?
7. SUCCESS METRICS - What KPIs to track?
8. RISK FACTORS - What could go wrong?
9. OPTIMIZATION ROADMAP - Week 1, 2, 4, 8 plans`
    );

    // ========================================
    // PHASE 7: FINAL JSON OUTPUT
    // ========================================
    console.log("🎯 Phase 7: Generating final structured output...");

    const finalOutput = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: `Compile all team outputs into a final JSON structure.

MARKETING STRATEGY:
${marketingDraft}

FINAL ADS (in ${langFull}):
${ppcFinal}

PROJECT MANAGER RECOMMENDATIONS:
${pmFinalReview}

CRITICAL: Extract the actual headlines and descriptions from the PPC output. They MUST be in ${langFull}.
- Headlines max 30 chars
- Descriptions max 90 chars

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
  "headlines": [
    {"text": "Max 30 char headline in ${langFull}", "angle": "benefit|urgency|trust|feature|cta", "chars": 25}
  ],
  "descriptions": [
    {"text": "Max 90 char description in ${langFull}", "angle": "problem-solution|benefit|social-proof|cta", "chars": 80}
  ],
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
    "project_manager": "key insight",
    "marketing": "key insight",
    "seo": "key insight",
    "ppc": "key insight"
  }
}
\`\`\``,
        },
      ],
    });

    const responseText = finalOutput.content[0].type === "text" ? finalOutput.content[0].text : "";

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

    console.log("✅ Collaborative multi-agent analysis complete!");

    return NextResponse.json({
      success: true,
      data: result,
      collaboration: {
        phases: [
          "Data Gathering",
          "PM Strategic Brief",
          "Parallel Specialist Work",
          "Cross-Review & Collaboration",
          "PPC Final Creation with Feedback",
          "PM Final Review",
          "JSON Compilation"
        ],
        agentInteractions: 7,
        totalApiCalls: 9,
      },
      agentOutputs: {
        pmBrief: pmBrief.slice(0, 800) + "...",
        marketingStrategy: marketingDraft.slice(0, 800) + "...",
        seoKeywords: seoDraft.slice(0, 800) + "...",
        ppcAds: ppcFinal.slice(0, 800) + "...",
        pmRecommendations: pmFinalReview.slice(0, 800) + "...",
      },
      metadata: {
        websiteAnalyzed: websiteUrl,
        competitorsAnalyzed: competitors.length,
        googleAdsDataUsed: googleAdsData !== "Google Ads data not available",
        language,
        collaborationModel: "cross-review-iteration",
      },
    });
  } catch (error: any) {
    console.error("❌ Multi-agent analysis error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
