import { NextRequest, NextResponse } from "next/server";
import { getDailyPerformance } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "30";
    const campaignId = searchParams.get("campaignId") || undefined;

    const dateRangeMap: Record<string, "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS"> = {
      "7": "LAST_7_DAYS",
      "30": "LAST_30_DAYS",
      "90": "LAST_90_DAYS",
    };

    const dateRange = dateRangeMap[days] || "LAST_30_DAYS";

    const data = await getDailyPerformance(dateRange, campaignId);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Daily performance error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch daily performance" },
      { status: 500 }
    );
  }
}
