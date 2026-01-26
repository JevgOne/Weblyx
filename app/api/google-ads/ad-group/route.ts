import { NextRequest, NextResponse } from "next/server";
import { createAdGroup, getAdGroupPerformance } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

// Get ad groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const dateRange = (searchParams.get("dateRange") as "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH") || "LAST_30_DAYS";

    const adGroups = await getAdGroupPerformance(campaignId, dateRange);

    return NextResponse.json({
      success: true,
      data: adGroups,
    });
  } catch (error: any) {
    console.error("Error fetching ad groups:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch ad groups",
      },
      { status: 500 }
    );
  }
}

// Create new ad group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.campaignId || !body.name || !body.cpcBidCzk) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: campaignId, name, cpcBidCzk" },
        { status: 400 }
      );
    }

    const result = await createAdGroup({
      campaignId: body.campaignId,
      name: body.name,
      cpcBidCzk: body.cpcBidCzk,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating ad group:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create ad group",
      },
      { status: 500 }
    );
  }
}
