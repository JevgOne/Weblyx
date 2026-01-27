import { NextRequest, NextResponse } from "next/server";
import { testMetaAdsConnection } from "@/lib/meta-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await testMetaAdsConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Meta Ads API connection successful",
        data: result.accountInfo,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Meta Ads API connection failed",
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error testing Meta Ads API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to test Meta Ads API connection",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
