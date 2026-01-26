import { NextRequest, NextResponse } from "next/server";
import { addKeywords, getKeywordPerformance, updateKeywordStatus } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

// Get keywords
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const dateRange = (searchParams.get("dateRange") as "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH") || "LAST_30_DAYS";

    const keywords = await getKeywordPerformance(campaignId, dateRange);

    return NextResponse.json({
      success: true,
      data: keywords,
    });
  } catch (error: any) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch keywords",
      },
      { status: 500 }
    );
  }
}

// Add keywords to ad group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.adGroupId || !body.keywords || !Array.isArray(body.keywords)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: adGroupId, keywords (array)" },
        { status: 400 }
      );
    }

    // Validate keywords
    for (const kw of body.keywords) {
      if (!kw.text || !kw.matchType) {
        return NextResponse.json(
          { success: false, error: "Each keyword must have text and matchType" },
          { status: 400 }
        );
      }
      if (!["EXACT", "PHRASE", "BROAD"].includes(kw.matchType)) {
        return NextResponse.json(
          { success: false, error: "matchType must be EXACT, PHRASE, or BROAD" },
          { status: 400 }
        );
      }
    }

    const result = await addKeywords({
      adGroupId: body.adGroupId,
      keywords: body.keywords,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error adding keywords:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add keywords",
      },
      { status: 500 }
    );
  }
}

// Update keyword status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.adGroupId || !body.criterionId || !body.status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: adGroupId, criterionId, status" },
        { status: 400 }
      );
    }

    if (!["ENABLED", "PAUSED", "REMOVED"].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "status must be ENABLED, PAUSED, or REMOVED" },
        { status: 400 }
      );
    }

    const result = await updateKeywordStatus(
      body.adGroupId,
      body.criterionId,
      body.status
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating keyword:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update keyword",
      },
      { status: 500 }
    );
  }
}
