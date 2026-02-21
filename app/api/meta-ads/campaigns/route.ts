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
      // Try to get campaigns with insights first
      const campaignsWithInsights = await getCampaignPerformance(datePreset as any);
      
      // If insights returns empty (new campaigns with no data yet), 
      // fallback to just listing campaigns
      if (campaignsWithInsights.length === 0) {
        const allCampaigns = await getCampaigns();
        const fallbackData = allCampaigns.map(c => ({
          campaignId: c.id,
          campaignName: c.name,
          status: c.status,
          objective: c.objective,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          cpc: 0,
          spend: 0,
          reach: 0,
          frequency: 0,
          conversions: 0,
        }));
        return NextResponse.json({
          success: true,
          data: fallbackData,
        });
      }
      
      return NextResponse.json({
        success: true,
        data: campaignsWithInsights,
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
        error: "Failed to fetch campaigns",
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
        error: "Failed to create campaign",
      },
      { status: 500 }
    );
  }
}
