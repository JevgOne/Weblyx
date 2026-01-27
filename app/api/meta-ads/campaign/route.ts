import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignDetails,
  updateCampaignStatus,
  updateCampaignBudget,
} from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing campaign ID",
        },
        { status: 400 }
      );
    }

    const campaign = await getCampaignDetails(campaignId);

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error("Error fetching campaign details:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch campaign details",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, status, dailyBudgetCzk } = body;

    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing campaign ID",
        },
        { status: 400 }
      );
    }

    const results: any = {};

    if (status) {
      await updateCampaignStatus(campaignId, status);
      results.statusUpdated = true;
    }

    if (dailyBudgetCzk !== undefined) {
      await updateCampaignBudget(campaignId, dailyBudgetCzk);
      results.budgetUpdated = true;
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update campaign",
      },
      { status: 500 }
    );
  }
}
