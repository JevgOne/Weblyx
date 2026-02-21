import { NextRequest, NextResponse } from "next/server";
import { getCampaignPerformance, getAllCampaigns } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = (searchParams.get("date_range") || "LAST_30_DAYS") as
      "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH";

    // Try to get campaigns with performance metrics first
    const campaigns = await getCampaignPerformance(dateRange);

    // If no campaigns with recent metrics, fallback to listing all campaigns
    if (campaigns.length === 0) {
      const allCampaigns = await getAllCampaigns();
      return NextResponse.json({
        success: true,
        data: allCampaigns,
      });
    }

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaigns",
      },
      { status: 500 }
    );
  }
}
