import { NextResponse } from "next/server";
import { getGA4Overview, getGA4TopPages, getGA4TrafficSources, getGA4DeviceBreakdown } from "@/lib/google-analytics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "today";

    const [overview, topPages, trafficSources, devices] = await Promise.all([
      getGA4Overview(startDate, endDate),
      getGA4TopPages(startDate, endDate, 10),
      getGA4TrafficSources(startDate, endDate),
      getGA4DeviceBreakdown(startDate, endDate),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...overview,
        topPages,
        trafficSources,
        devices,
      },
    });
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch analytics data",
      },
      { status: 500 }
    );
  }
}
