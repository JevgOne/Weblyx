import { NextResponse } from "next/server";
import {
  getCampaignTracking,
  getAnalysisHistory,
  initGoogleMarketingTables,
} from "@/lib/turso/google-marketing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initGoogleMarketingTables();

    const tracking = await getCampaignTracking("multi-agent-analysis");
    if (!tracking) {
      return NextResponse.json({ success: true, data: null });
    }

    const history = await getAnalysisHistory(tracking.id, 1);
    if (history.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const latest = history[0];

    let analysisResult = null;
    try {
      analysisResult = JSON.parse(latest.aiInsights);
    } catch {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
      agentOutputs: latest.expertNotes || null,
      createdAt: latest.createdAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Failed to load analysis history:", error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
