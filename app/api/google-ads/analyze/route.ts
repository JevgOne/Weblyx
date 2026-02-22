import { NextRequest, NextResponse } from "next/server";
import { runFullAnalysis, type AnalysisInput } from "@/lib/google-ads-analysis";
import {
  getCampaignTracking,
  createCampaignTracking,
  saveAnalysis,
  updateCampaignTracking,
  initGoogleMarketingTables,
} from "@/lib/turso/google-marketing";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5 minutes for thorough multi-agent collaboration

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisInput = await request.json();
    const { websiteUrl, language } = body;

    if (!websiteUrl || !language) {
      return NextResponse.json({ success: false, error: "Missing websiteUrl or language" }, { status: 400 });
    }

    console.log("🚀 Starting collaborative multi-agent analysis...");

    const { result, agentOutputs, metadata } = await runFullAnalysis(body, (progress) => {
      console.log(`Phase ${progress.phase}/7: ${progress.message} (${progress.percent}%)`);
    });

    console.log("✅ Collaborative multi-agent analysis complete!");

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

      await saveAnalysis({
        campaignTrackingId: tracking.id,
        analysisType: "manual",
        dataSources: metadata.dataSources,
        metrics: { before: {} },
        recommendations: [],
        aiInsights: JSON.stringify(result),
        expertNotes: agentOutputs,
      });

      await updateCampaignTracking(trackingCampaignId, {
        lastAnalysisDate: new Date(),
        analysisCount: (tracking.analysisCount || 0) + 1,
      });

      console.log("💾 Analysis saved to database");
    } catch (saveError) {
      console.error("⚠️ Failed to save analysis to DB (non-blocking):", saveError);
    }

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
      agentOutputs,
      metadata: {
        websiteAnalyzed: websiteUrl,
        competitorsAnalyzed: body.competitors?.length || 0,
        dataSources: metadata.dataSources,
        language,
        collaborationModel: "cross-review-iteration",
      },
    });
  } catch (error: any) {
    console.error("❌ Multi-agent analysis error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
