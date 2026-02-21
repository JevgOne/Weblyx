import { NextRequest, NextResponse } from "next/server";
import { createSearchCampaign } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

// Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.dailyBudgetCzk) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, dailyBudgetCzk" },
        { status: 400 }
      );
    }

    const result = await createSearchCampaign({
      name: body.name,
      dailyBudgetCzk: body.dailyBudgetCzk,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create campaign",
      },
      { status: 500 }
    );
  }
}
