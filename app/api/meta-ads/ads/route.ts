import { NextRequest, NextResponse } from "next/server";
import { getAds, getAdPerformance, updateAdStatus } from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adSetId = searchParams.get("adset_id") || undefined;
    const withInsights = searchParams.get("insights") === "true";
    const datePreset = searchParams.get("date_preset") || "last_30d";

    if (withInsights) {
      const ads = await getAdPerformance(datePreset);
      return NextResponse.json({
        success: true,
        data: ads,
      });
    } else {
      const ads = await getAds(adSetId);
      return NextResponse.json({
        success: true,
        data: ads,
      });
    }
  } catch (error: any) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch ads",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, status } = body;

    if (!adId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: adId, status",
        },
        { status: 400 }
      );
    }

    await updateAdStatus(adId, status);

    return NextResponse.json({
      success: true,
      message: "Ad status updated",
    });
  } catch (error: any) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update ad",
      },
      { status: 500 }
    );
  }
}
