import { NextRequest, NextResponse } from "next/server";
import { testGoogleAdsConnection } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await testGoogleAdsConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Google Ads API connection successful",
        data: result.customerInfo,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Google Ads API connection failed",
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error testing Google Ads API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to test Google Ads API connection",
        error: "Unknown error",
      },
      { status: 500 }
    );
  }
}
