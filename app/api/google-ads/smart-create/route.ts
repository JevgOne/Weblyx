import { NextRequest, NextResponse } from "next/server";
import { runFullAnalysis } from "@/lib/google-ads-analysis";
import {
  createSearchCampaign,
  createAdGroup,
  addKeywords,
  createResponsiveSearchAd,
  extractIdFromResourceName,
} from "@/lib/google-ads";
import {
  initGoogleMarketingTables,
  createCampaignTracking,
  saveAnalysis,
} from "@/lib/turso/google-marketing";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface SmartCreateRequest {
  websiteUrl: string;
  monthlyBudget: number; // CZK per month
  goal: "leads" | "sales" | "traffic";
  language?: "cs" | "de" | "en";
  competitors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SmartCreateRequest = await request.json();
    const { websiteUrl, monthlyBudget, goal, language = "cs", competitors = [] } = body;

    // 1. Validate inputs
    if (!websiteUrl || !monthlyBudget || !goal) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: websiteUrl, monthlyBudget, goal" },
        { status: 400 }
      );
    }

    if (monthlyBudget < 1000) {
      return NextResponse.json(
        { success: false, error: "Minimum monthly budget is 1000 CZK" },
        { status: 400 }
      );
    }

    const dailyBudget = Math.round(monthlyBudget / 30);

    // 2. Run AI analysis
    const { result: analysis, agentOutputs, metadata } = await runFullAnalysis(
      {
        websiteUrl,
        competitors,
        language,
        businessGoal: goal,
        monthlyBudget,
      }
    );

    // 3. Extract campaign creation data from analysis
    const campaignName = `Smart - ${new URL(websiteUrl).hostname} - ${goal}`;

    // Get top keywords from analysis
    const allKeywords: Array<{ text: string; matchType: "EXACT" | "PHRASE" | "BROAD" }> = [];

    // High intent → EXACT
    if (analysis.keywords?.high_intent) {
      for (const kw of analysis.keywords.high_intent.slice(0, 5)) {
        allKeywords.push({ text: kw.text, matchType: "EXACT" });
      }
    }

    // Medium intent → PHRASE
    if (analysis.keywords?.medium_intent) {
      for (const kw of analysis.keywords.medium_intent.slice(0, 5)) {
        allKeywords.push({ text: kw.text, matchType: "PHRASE" });
      }
    }

    // Discovery → BROAD (limited)
    if (analysis.keywords?.discovery) {
      for (const kw of analysis.keywords.discovery.slice(0, 3)) {
        allKeywords.push({ text: kw.text, matchType: "BROAD" });
      }
    }

    // Get headlines and descriptions for RSA
    const headlines = (analysis.headlines || [])
      .filter((h: any) => h.text && h.text.length <= 30)
      .map((h: any) => h.text)
      .slice(0, 15);

    const descriptions = (analysis.descriptions || [])
      .filter((d: any) => d.text && d.text.length <= 90)
      .map((d: any) => d.text)
      .slice(0, 4);

    // Ensure minimum RSA requirements
    if (headlines.length < 3) {
      return NextResponse.json(
        { success: false, error: "AI analysis didn't generate enough headlines (minimum 3). Try again.", analysis },
        { status: 422 }
      );
    }
    if (descriptions.length < 2) {
      return NextResponse.json(
        { success: false, error: "AI analysis didn't generate enough descriptions (minimum 2). Try again.", analysis },
        { status: 422 }
      );
    }

    // 4. Create campaign in Google Ads (PAUSED)
    const campaignResult = await createSearchCampaign({
      name: campaignName,
      dailyBudgetCzk: dailyBudget,
    });

    if (!campaignResult.success || !campaignResult.campaignResourceName) {
      return NextResponse.json(
        { success: false, error: "Failed to create campaign in Google Ads" },
        { status: 500 }
      );
    }

    const campaignId = extractIdFromResourceName(campaignResult.campaignResourceName);

    // 5. Create ad group
    const cpcBid = analysis.campaign_settings?.target_cpa
      ? Math.round(analysis.campaign_settings.target_cpa * 0.1) // 10% of target CPA as initial bid
      : Math.round(dailyBudget * 0.15); // 15% of daily budget as fallback

    const adGroupResult = await createAdGroup({
      campaignId,
      name: `${goal} - hlavní`,
      cpcBidCzk: Math.max(cpcBid, 5), // Minimum 5 CZK CPC
    });

    if (!adGroupResult.success || !adGroupResult.resourceName) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign created but failed to create ad group",
          campaignId,
        },
        { status: 500 }
      );
    }

    const adGroupId = extractIdFromResourceName(adGroupResult.resourceName);

    // 6. Add keywords
    let keywordsResult = null;
    if (allKeywords.length > 0) {
      try {
        keywordsResult = await addKeywords({
          adGroupId,
          keywords: allKeywords,
        });
      } catch (err) {
        console.error("Warning: Failed to add some keywords:", err);
      }
    }

    // 7. Create RSA ad
    let rsaResult = null;
    try {
      rsaResult = await createResponsiveSearchAd({
        adGroupId,
        headlines: headlines.slice(0, 15),
        descriptions: descriptions.slice(0, 4),
        finalUrl: websiteUrl,
      });
    } catch (err) {
      console.error("Warning: Failed to create RSA:", err);
    }

    // 8. Save to DB
    try {
      await initGoogleMarketingTables();

      const tracking = await createCampaignTracking({
        campaignId,
        campaignName,
      });

      await saveAnalysis({
        campaignTrackingId: tracking.id,
        analysisType: "manual",
        dataSources: metadata.dataSources,
        metrics: { before: {} },
        recommendations: [],
        aiInsights: JSON.stringify(analysis),
        expertNotes: agentOutputs,
      });
    } catch (dbErr) {
      console.error("Warning: Failed to save to DB:", dbErr);
    }

    // Calculate estimated clicks
    const estimatedCpc = analysis.campaign_settings?.target_cpa
      ? analysis.campaign_settings.target_cpa * 0.15
      : dailyBudget * 0.2;
    const estimatedMonthlyClicks = estimatedCpc > 0 ? Math.round(monthlyBudget / estimatedCpc) : 0;

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        campaignName,
        status: "PAUSED",
        adGroupId,
        keywordsAdded: allKeywords.length,
        rsaCreated: !!rsaResult?.success,
        monthlyBudget,
        dailyBudget,
        estimatedMonthlyClicks,
        // Summary for the user
        summary: {
          keywords: allKeywords.map((k) => k.text),
          headlines: headlines.slice(0, 5),
          descriptions: descriptions.slice(0, 2),
          goal,
        },
        // Full analysis for reference
        analysis,
      },
    });
  } catch (error: any) {
    console.error("Smart create error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create smart campaign" },
      { status: 500 }
    );
  }
}
