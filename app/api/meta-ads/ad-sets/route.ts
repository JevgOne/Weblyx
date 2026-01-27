import { NextRequest, NextResponse } from "next/server";
import {
  getAdSets,
  getAdSetPerformance,
  updateAdSetStatus,
} from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaign_id") || undefined;
    const withInsights = searchParams.get("insights") === "true";
    const datePreset = searchParams.get("date_preset") || "last_30d";

    if (withInsights) {
      const adSets = await getAdSetPerformance(datePreset);
      return NextResponse.json({
        success: true,
        data: adSets,
      });
    } else {
      const adSets = await getAdSets(campaignId);
      return NextResponse.json({
        success: true,
        data: adSets,
      });
    }
  } catch (error: any) {
    console.error("Error fetching ad sets:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch ad sets",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { adSetId, status } = body;

    if (!adSetId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: adSetId, status",
        },
        { status: 400 }
      );
    }

    await updateAdSetStatus(adSetId, status);

    return NextResponse.json({
      success: true,
      message: "Ad set status updated",
    });
  } catch (error: any) {
    console.error("Error updating ad set:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update ad set",
      },
      { status: 500 }
    );
  }
}
