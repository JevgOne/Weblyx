import { NextRequest, NextResponse } from "next/server";
import { generateMetaRecommendations, META_TIPS, META_EXPLANATIONS } from "@/lib/meta-marketing-recommendations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const recommendations = await generateMetaRecommendations();

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        tips: META_TIPS,
        explanations: META_EXPLANATIONS,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate recommendations",
      },
      { status: 500 }
    );
  }
}
