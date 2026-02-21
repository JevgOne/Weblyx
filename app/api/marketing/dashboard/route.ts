import { NextRequest, NextResponse } from "next/server";
import { getCampaignPerformance } from "@/lib/google-ads";
import { getGA4Overview } from "@/lib/google-analytics";
import { getSearchConsoleOverview } from "@/lib/google-search-console";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Format for GA4 and Search Console
    const ga4StartDate = `${period}daysAgo`;
    const ga4EndDate = "today";

    // Fetch data from all sources in parallel
    const [googleAdsData, ga4Data, searchConsoleData] = await Promise.allSettled([
      getCampaignPerformance("LAST_30_DAYS").catch((e) => ({
        error: e.message,
        data: null,
      })),
      getGA4Overview(ga4StartDate, ga4EndDate).catch((e) => ({
        error: e.message,
        data: null,
      })),
      getSearchConsoleOverview(
        process.env.SEARCH_CONSOLE_SITE_URL || "https://weblyx.cz",
        startDateStr,
        endDateStr
      ).catch((e) => ({
        error: e.message,
        data: null,
      })),
    ]);

    // Process Google Ads data
    let googleAds = {
      status: "error" as "success" | "error",
      error: null as string | null,
      data: null as any,
    };

    if (googleAdsData.status === "fulfilled") {
      const campaigns = googleAdsData.value as any[];
      if (Array.isArray(campaigns)) {
        const summary = campaigns.reduce(
          (acc, campaign) => ({
            impressions: acc.impressions + (campaign.impressions || 0),
            clicks: acc.clicks + (campaign.clicks || 0),
            cost: acc.cost + (campaign.cost || 0),
            conversions: acc.conversions + (campaign.conversions || 0),
          }),
          { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
        );

        const ctr = summary.impressions > 0 ? (summary.clicks / summary.impressions) * 100 : 0;
        const cpa = summary.conversions > 0 ? summary.cost / summary.conversions : 0;

        googleAds = {
          status: "success",
          error: null,
          data: {
            summary: {
              ...summary,
              ctr,
              cpa,
            },
            topCampaigns: campaigns
              .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
              .slice(0, 5)
              .map((c) => ({
                name: c.name,
                conversions: c.conversions || 0,
                cost: c.cost || 0,
                ctr: c.ctr || 0,
              })),
          },
        };
      }
    } else {
      googleAds.status = "error";
      googleAds.error = "Developer token not approved or account not accessible";
    }

    // Process GA4 data
    let analytics = {
      status: "error" as "success" | "error",
      error: null as string | null,
      data: null as any,
    };

    if (ga4Data.status === "fulfilled" && ga4Data.value) {
      const data = ga4Data.value as any;
      if (!data.error) {
        analytics = {
          status: "success",
          error: null,
          data: data,
        };
      } else {
        analytics.error = data.error;
      }
    } else {
      analytics.error = "GA4 Property ID not configured or API not enabled";
    }

    // Process Search Console data
    let searchConsole = {
      status: "error" as "success" | "error",
      error: null as string | null,
      data: null as any,
    };

    if (searchConsoleData.status === "fulfilled" && searchConsoleData.value) {
      const data = searchConsoleData.value as any;
      if (!data.error) {
        searchConsole = {
          status: "success",
          error: null,
          data: data,
        };
      } else {
        searchConsole.error = data.error;
      }
    } else {
      searchConsole.error = "Search Console API not enabled or site not verified";
    }

    return NextResponse.json({
      success: true,
      period: parseInt(period),
      timestamp: new Date().toISOString(),
      googleAds,
      analytics,
      searchConsole,
    });
  } catch (error: any) {
    console.error("Error in marketing dashboard:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch marketing dashboard data",
      },
      { status: 500 }
    );
  }
}
