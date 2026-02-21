import { NextResponse } from "next/server";
import {
  getSearchConsoleOverview,
  getSearchConsoleTopQueries,
  getSearchConsoleTopPages,
  getSearchConsoleDeviceBreakdown,
} from "@/lib/google-search-console";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL || "https://weblyx.cz";

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const { startDate, endDate } = getDateRange(days);

    const [overview, topQueries, topPages, devices] = await Promise.all([
      getSearchConsoleOverview(SITE_URL, startDate, endDate),
      getSearchConsoleTopQueries(SITE_URL, startDate, endDate, 20),
      getSearchConsoleTopPages(SITE_URL, startDate, endDate, 20),
      getSearchConsoleDeviceBreakdown(SITE_URL, startDate, endDate),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...overview,
        topQueries,
        topPages,
        devices,
        siteUrl: SITE_URL,
        dateRange: { startDate, endDate },
      },
    });
  } catch (error: any) {
    console.error("Search Console API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Search Console data",
      },
      { status: 500 }
    );
  }
}
