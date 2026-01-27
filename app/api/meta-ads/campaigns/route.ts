import { NextRequest, NextResponse } from "next/server";
import {
  getCampaignPerformance,
  getCampaigns,
  createCampaign,
} from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datePreset = searchParams.get("date_preset") || "last_30d";
    const withInsights = searchParams.get("insights") !== "false";

    if (withInsights) {
      const campaigns = await getCampaignPerformance(datePreset as any);
      return NextResponse.json({
        success: true,
        data: campaigns,
      });
    } else {
      const campaigns = await getCampaigns();
      return NextResponse.json({
        success: true,
        data: campaigns,
      });
    }
  } catch (error: any) {
    console.error("Error fetching Meta campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch campaigns",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, objective, dailyBudgetCzk, status } = body;

    if (!name || !objective || !dailyBudgetCzk) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, objective, dailyBudgetCzk",
        },
        { status: 400 }
      );
    }

    const result = await createCampaign({
      name,
      objective,
      dailyBudgetCzk,
      status,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating Meta campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create campaign",
      },
      { status: 500 }
    );
  }
}
