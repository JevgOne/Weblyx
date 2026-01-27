import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getCampaignPerformance,
  getAdSetPerformance,
  getAdPerformance,
  getAccountInsights,
} from "@/lib/meta-ads";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
      .slice(0, 10000);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return "";
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
ACCOUNT OVERVIEW (Last 30 days):
- Reach: ${insights.reach}, Impressions: ${insights.impressions}
- Clicks: ${insights.clicks}, CTR: ${insights.ctr.toFixed(2)}%
- Spend: ${insights.spend.toFixed(0)} CZK, CPC: ${insights.cpc.toFixed(2)} CZK
- Conversions: ${insights.conversions}, Frequency: ${insights.frequency.toFixed(1)}

TOP CAMPAIGNS:
${topCampaigns.map((c: any) => `- ${c.campaignName}: CTR ${c.ctr.toFixed(2)}%, ${c.conversions || 0} conv, ${c.spend.toFixed(0)} CZK spent`).join("\n")}
    `.trim();
  } catch {
    return "Meta Ads data not available - this is a new account or no campaigns yet.";
  }
}

async function runAgent(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.7
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 3000,
    },
  });

  return result.response.text();
}

export async function POST(request: NextRequest) {
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
        { success: false, error: "Missing websiteUrl or language" },
        { status: 400 }
      );
    }

    const langNames = { cs: "Czech", de: "German", en: "English" };
    const langFull = langNames[language];

    console.log("🚀 Starting Meta Ads multi-agent analysis...");

    // ========================================
    // PHASE 1: DATA GATHERING
    // ========================================
    console.log("📥 Phase 1: Gathering data...");

    const [websiteContent, ...competitorContents] = await Promise.all([
      fetchWebsiteContent(websiteUrl),
      ...competitors.slice(0, 3).map(fetchWebsiteContent),
    ]);

    const metaAdsData = await getMetaAdsInsights();

    const rawData = `
=== CLIENT WEBSITE (${websiteUrl}) ===
${websiteContent}

=== COMPETITOR WEBSITES ===
${competitors.map((url, i) => `[${url}]: ${competitorContents[i]?.slice(0, 3000) || "N/A"}`).join("\n\n")}

=== META ADS HISTORICAL DATA ===
${metaAdsData}

=== BUSINESS CONTEXT ===
Goal: ${businessGoal}
Monthly Budget: ${monthlyBudget} CZK
Target Language: ${langFull}
Target Platform: ${targetPlatform === "both" ? "Facebook + Instagram" : targetPlatform}
    `.trim();

    // ========================================
    // PHASE 2: PROJECT MANAGER - STRATEGIC BRIEF
    // ========================================
    console.log("👔 Phase 2: Project Manager creating brief...");

    const pmBrief = await runAgent(
      `You are a Senior Digital Marketing Project Manager specializing in Meta (Facebook/Instagram) advertising.
Your role is to analyze the situation and create a strategic brief for your team of specialists.
Be decisive, specific, and data-driven. Output in English.`,
      `Create a strategic brief for Meta Ads campaign based on this data:

${rawData}

Your brief should include:
1. EXECUTIVE SUMMARY - What's the situation?
2. CAMPAIGN OBJECTIVES - What must we achieve? (${businessGoal})
3. TARGET AUDIENCE - Who are we targeting? Be specific about demographics, interests, behaviors.
4. COMPETITIVE ANALYSIS - What are competitors doing on social media? Opportunities?
5. BUDGET ALLOCATION - How to split ${monthlyBudget} CZK/month between FB/IG?
6. PLATFORM STRATEGY - Facebook vs Instagram priorities
7. FUNNEL STRATEGY - Cold → Warm → Hot audience approach
8. DIRECTION FOR EACH SPECIALIST:
   - For Marketing Strategist: What positioning?
   - For Facebook Expert: What formats and placements?
   - For Instagram Expert: What content style?
   - For PPC Specialist: What bidding and optimization?

Be decisive. The team relies on your direction.`
    );

    // ========================================
    // PHASE 3: PARALLEL SPECIALIST WORK
    // ========================================
    console.log("🔄 Phase 3: Specialists working in parallel...");

    const [marketingDraft, facebookDraft, instagramDraft, ppcDraft] =
      await Promise.all([
        // Marketing Strategist
        runAgent(
          `You are a Brand & Marketing Strategist specializing in social media advertising.
Focus on: positioning, messaging, emotional triggers, value propositions, audience psychology.
Be creative but strategic. Output in English.`,
          `PROJECT MANAGER'S BRIEF:
${pmBrief}

Develop the marketing strategy for Meta Ads:
1. BRAND POSITIONING - How to position on social media?
2. UNIQUE VALUE PROPOSITION - The #1 reason to engage/buy
3. KEY MESSAGES (5-7) - Core messages for ads
4. EMOTIONAL TRIGGERS - What motivates our audience?
5. CONTENT PILLARS - 3-4 themes for ad content
6. TONE & VOICE - How should ads feel?
7. CUSTOMER JOURNEY - Awareness → Consideration → Conversion messaging`
        ),

        // Facebook Ads Expert
        runAgent(
          `You are a Facebook Ads Expert with 10+ years of experience.
You know every ad format, placement, and optimization technique.
Focus on: ad formats, placements, audience targeting, Facebook-specific strategies.
Output in English.`,
          `PROJECT MANAGER'S BRIEF:
${pmBrief}

Create Facebook-specific ad strategy:
1. RECOMMENDED AD FORMATS:
   - Feed ads (single image, video, carousel)
   - Stories ads
   - Reels ads
   - Marketplace ads
   - Right column
   Which to prioritize and why?

2. AUDIENCE STRATEGY:
   - Core audiences (interests, behaviors)
   - Custom audiences (website visitors, engagement)
   - Lookalike audiences (sources and percentages)

3. CAMPAIGN STRUCTURE:
   - How many campaigns?
   - Campaign objectives (awareness, traffic, conversions)?
   - Ad set organization

4. CREATIVE SPECIFICATIONS:
   - Image sizes and ratios
   - Video length recommendations
   - Carousel best practices

5. FACEBOOK-SPECIFIC TIPS:
   - What works specifically on Facebook?
   - Common mistakes to avoid`
        ),

        // Instagram Ads Expert
        runAgent(
          `You are an Instagram Ads Expert and social media specialist.
You understand Instagram culture, aesthetics, and what makes content viral.
Focus on: Instagram-specific formats, Reels, Stories, visual aesthetics, influencer style.
Output in English.`,
          `PROJECT MANAGER'S BRIEF:
${pmBrief}

Create Instagram-specific ad strategy:
1. CONTENT STYLE:
   - Visual aesthetic recommendations
   - Instagram-native look and feel
   - UGC vs polished content

2. RECOMMENDED FORMATS:
   - Feed posts (single, carousel)
   - Stories (15s max)
   - Reels (trending formats)
   - Explore ads
   Which to prioritize?

3. REELS STRATEGY:
   - Hook techniques (first 1-3 seconds)
   - Trending audio/music
   - Length recommendations
   - CTA placement

4. STORIES STRATEGY:
   - Interactive elements (polls, questions)
   - Swipe-up/link stickers
   - Story sequence ideas

5. INSTAGRAM-SPECIFIC TIPS:
   - Hashtag strategy
   - Best posting times
   - Engagement tactics
   - What makes content feel native`
        ),

        // PPC Specialist
        runAgent(
          `You are a Meta Ads PPC Specialist focused on performance and ROI.
You optimize campaigns for maximum conversions at lowest cost.
Focus on: bidding strategies, budget optimization, A/B testing, pixel setup, attribution.
Output in English.`,
          `PROJECT MANAGER'S BRIEF:
${pmBrief}

Create PPC optimization strategy:
1. CAMPAIGN OBJECTIVES:
   - Which campaign objectives for ${businessGoal}?
   - Conversion events to optimize for

2. BIDDING STRATEGY:
   - Lowest cost vs cost cap vs bid cap?
   - When to use each?

3. BUDGET ALLOCATION:
   - CBO vs ABO recommendation
   - Daily vs lifetime budget
   - Testing budget vs scaling budget

4. OPTIMIZATION TIMELINE:
   - Learning phase considerations
   - When to make changes?
   - Scaling strategy (20% rule)

5. PIXEL & TRACKING:
   - Essential pixel events
   - Conversion API setup
   - Attribution settings

6. A/B TESTING PLAN:
   - What to test first?
   - How long to run tests?
   - Statistical significance

7. PERFORMANCE BENCHMARKS:
   - Target CTR, CPC, CPM
   - Expected conversion rates
   - Warning signs to watch`
        ),
      ]);

    // ========================================
    // PHASE 4: CROSS-REVIEW
    // ========================================
    console.log("🤝 Phase 4: Cross-review...");

    const crossReview = await runAgent(
      `You are the Project Manager reviewing all specialist outputs for alignment and synergy.`,
      `Review these specialist outputs and identify:

MARKETING STRATEGY:
${marketingDraft}

FACEBOOK STRATEGY:
${facebookDraft}

INSTAGRAM STRATEGY:
${instagramDraft}

PPC STRATEGY:
${ppcDraft}

Provide:
1. KEY SYNERGIES - Where strategies align well
2. CONFLICTS - Any contradictions to resolve
3. GAPS - What's missing?
4. UNIFIED RECOMMENDATIONS - Final direction for ad creation`
    );

    // ========================================
    // PHASE 5: FINAL AD CREATION
    // ========================================
    console.log("✍️ Phase 5: Creating final ads...");

    const finalAds = await runAgent(
      `You are a Meta Ads Copywriter creating the final ad content.
All text MUST be in ${langFull}.
You write ads that CONVERT with perfect platform-native style.`,
      `Based on all specialist input, create the final ads in ${langFull}:

MARKETING STRATEGY:
${marketingDraft}

FACEBOOK STRATEGY:
${facebookDraft}

INSTAGRAM STRATEGY:
${instagramDraft}

CROSS-REVIEW:
${crossReview}

CREATE FINAL ADS in ${langFull}:

1. PRIMARY TEXT OPTIONS (5 variations, max 125 chars before "See more"):
   - Format: "Text" [angle: benefit/urgency/social-proof/question/story]

2. HEADLINES (5 variations, max 40 chars):
   - Format: "Headline" [angle]

3. DESCRIPTIONS (3 variations, max 30 chars):
   - For link description under headline

4. CALL-TO-ACTION recommendations:
   - Best CTAs for ${businessGoal}

5. CREATIVE CONCEPTS (3 ideas):
   - Describe the visual/video concept
   - Include hook, body, CTA

6. CAROUSEL CONTENT (if applicable):
   - 3-5 card concepts with headlines

7. STORY/REEL SCRIPTS (2 concepts):
   - 15-second script with timing

8. HASHTAGS (10-15 relevant):
   - Mix of popular and niche`
    );

    // ========================================
    // PHASE 6: FINAL JSON OUTPUT
    // ========================================
    console.log("🎯 Phase 6: Compiling final output...");

    const finalOutput = await runAgent(
      `Compile all outputs into valid JSON. All ad text MUST be in ${langFull}.`,
      `Compile this into JSON:

FINAL ADS:
${finalAds}

PROJECT MANAGER BRIEF:
${pmBrief.slice(0, 2000)}

Output ONLY valid JSON:
\`\`\`json
{
  "strategy": {
    "campaign_objective": "${businessGoal}",
    "target_audience": "description",
    "unique_value_proposition": "main UVP",
    "key_messages": ["message1", "message2"],
    "content_pillars": ["pillar1", "pillar2"],
    "budget_split": {"facebook": 60, "instagram": 40},
    "funnel_strategy": {
      "cold": "awareness approach",
      "warm": "consideration approach",
      "hot": "conversion approach"
    }
  },
  "facebook_ads": {
    "recommended_formats": ["format1", "format2"],
    "placements": ["feed", "stories", "reels"],
    "audience_targeting": {
      "interests": ["interest1"],
      "behaviors": ["behavior1"],
      "lookalike_sources": ["source1"]
    }
  },
  "instagram_ads": {
    "content_style": "description",
    "recommended_formats": ["reels", "stories", "feed"],
    "reels_strategy": {
      "hook": "first 3 sec strategy",
      "length": "15-30s",
      "style": "ugc/polished"
    }
  },
  "ad_copy": {
    "primary_texts": [
      {"text": "ad text in ${langFull}", "angle": "benefit"}
    ],
    "headlines": [
      {"text": "headline in ${langFull}", "angle": "urgency"}
    ],
    "descriptions": ["desc1", "desc2"],
    "ctas": ["Shop Now", "Learn More"]
  },
  "creative_concepts": [
    {
      "name": "Concept 1",
      "format": "video/image/carousel",
      "description": "visual concept",
      "hook": "first 3 seconds",
      "script": "full script if video"
    }
  ],
  "hashtags": ["hashtag1", "hashtag2"],
  "campaign_settings": {
    "objective": "conversions/traffic/awareness",
    "bidding": "lowest_cost/cost_cap",
    "daily_budget": ${Math.round(monthlyBudget / 30)},
    "optimization_event": "purchase/lead/link_click"
  },
  "testing_plan": {
    "week_1": "what to test",
    "week_2": "what to test",
    "week_4": "optimization focus"
  },
  "expert_notes": {
    "project_manager": "key insight",
    "marketing": "key insight",
    "facebook": "key insight",
    "instagram": "key insight",
    "ppc": "key insight"
  }
}
\`\`\``,
      0.2
    );

    // Parse JSON
    let result;
    try {
      const jsonMatch =
        finalOutput.match(/```json\n([\s\S]*?)\n```/) ||
        finalOutput.match(/```\n([\s\S]*?)\n```/) ||
        finalOutput.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch
        ? jsonMatch[1] || jsonMatch[0]
        : finalOutput;
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e);
      return NextResponse.json(
        { success: false, error: "Failed to parse output", raw: finalOutput },
        { status: 500 }
      );
    }

    console.log("✅ Multi-agent Meta Ads analysis complete!");

    return NextResponse.json({
      success: true,
      data: result,
      collaboration: {
        phases: [
          "Data Gathering",
          "PM Strategic Brief",
          "Parallel Specialist Work (4 agents)",
          "Cross-Review",
          "Final Ad Creation",
          "JSON Compilation",
        ],
        agents: [
          "Project Manager",
          "Marketing Strategist",
          "Facebook Ads Expert",
          "Instagram Ads Expert",
          "PPC Specialist",
        ],
        totalApiCalls: 8,
      },
      agentOutputs: {
        pmBrief: pmBrief.slice(0, 1000) + "...",
        marketing: marketingDraft.slice(0, 800) + "...",
        facebook: facebookDraft.slice(0, 800) + "...",
        instagram: instagramDraft.slice(0, 800) + "...",
        ppc: ppcDraft.slice(0, 800) + "...",
      },
      metadata: {
        websiteAnalyzed: websiteUrl,
        competitorsAnalyzed: competitors.length,
        language,
        platform: targetPlatform,
        budget: monthlyBudget,
      },
    });
  } catch (error: any) {
    console.error("❌ Meta Ads analysis error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
