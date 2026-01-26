import { NextResponse } from "next/server";
import { getCampaignPerformance } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await getCampaignPerformance("LAST_30_DAYS");

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch campaigns",
      },
      { status: 500 }
    );
  }
}
