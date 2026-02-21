import { NextRequest, NextResponse } from "next/server";
import { testGoogleAdsConnection } from "@/lib/google-ads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await testGoogleAdsConnection();

    if (result.success) {
      const customer = result.customerInfo?.customer;
      return NextResponse.json({
        success: true,
        message: "Google Ads API connection successful",
        data: {
          customerId: customer?.id?.toString(),
          descriptiveName: customer?.descriptive_name,
          currencyCode: customer?.currency_code,
          timeZone: customer?.time_zone,
        },
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
