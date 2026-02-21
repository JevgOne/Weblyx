import { NextRequest, NextResponse } from "next/server";
import { getAccountInsights } from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datePreset = searchParams.get("date_preset") || "last_30d";

    const insights = await getAccountInsights(datePreset);

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error: any) {
    console.error("Error fetching account insights:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch account insights",
      },
      { status: 500 }
    );
  }
}
