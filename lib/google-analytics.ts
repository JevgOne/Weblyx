import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { google } from "googleapis";
import path from "path";

// Google Analytics 4 Configuration
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID!;

// Initialize Service Account authentication
function getServiceAccountAuth() {
  const keyFilePath = path.join(process.cwd(), "service-account-key.json");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
    ],
  });

  return auth;
}

// Initialize GA4 client with Service Account
export function getGA4Client() {
  const auth = getServiceAccountAuth();

  return new BetaAnalyticsDataClient({
    auth: auth as any,
  });
}

// Get GA4 overview stats
export async function getGA4Overview(
  startDate: string = "30daysAgo",
  endDate: string = "today"
) {
  try {
    const analyticsDataClient = getGA4Client();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        {
          name: "date",
        },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
    });

    // Transform data
    const rows = response.rows || [];

    // Calculate totals
    let totalUsers = 0;
    let totalSessions = 0;
    let totalPageViews = 0;
    let totalBounceRate = 0;
    let totalDuration = 0;
    let totalConversions = 0;

    const timeline = rows.map((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      const users = parseInt(row.metricValues?.[0]?.value || "0");
      const sessions = parseInt(row.metricValues?.[1]?.value || "0");
      const pageViews = parseInt(row.metricValues?.[2]?.value || "0");
      const bounceRate = parseFloat(row.metricValues?.[3]?.value || "0");
      const duration = parseFloat(row.metricValues?.[4]?.value || "0");
      const conversions = parseInt(row.metricValues?.[5]?.value || "0");

      totalUsers += users;
      totalSessions += sessions;
      totalPageViews += pageViews;
      totalBounceRate += bounceRate;
      totalDuration += duration;
      totalConversions += conversions;

      return {
        date,
        users,
        sessions,
        pageViews,
        bounceRate,
        duration,
        conversions,
      };
    });

    const avgBounceRate = rows.length > 0 ? totalBounceRate / rows.length : 0;
    const avgDuration = rows.length > 0 ? totalDuration / rows.length : 0;

    return {
      summary: {
        totalUsers,
        totalSessions,
        totalPageViews,
        avgBounceRate: avgBounceRate * 100, // Convert to percentage
        avgSessionDuration: avgDuration,
        totalConversions,
      },
      timeline,
    };
  } catch (error: any) {
    console.error("Error fetching GA4 data:", error);
    throw error;
  }
}

// Get top pages
export async function getGA4TopPages(
  startDate: string = "30daysAgo",
  endDate: string = "today",
  limit: number = 10
) {
  try {
    const analyticsDataClient = getGA4Client();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        {
          name: "pagePath",
        },
        {
          name: "pageTitle",
        },
      ],
      metrics: [
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
      orderBys: [
        {
          metric: {
            metricName: "screenPageViews",
          },
          desc: true,
        },
      ],
      limit,
    });

    const rows = response.rows || [];

    return rows.map((row) => ({
      path: row.dimensionValues?.[0]?.value || "",
      title: row.dimensionValues?.[1]?.value || "",
      pageViews: parseInt(row.metricValues?.[0]?.value || "0"),
      avgDuration: parseFloat(row.metricValues?.[1]?.value || "0"),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || "0") * 100,
    }));
  } catch (error: any) {
    console.error("Error fetching GA4 top pages:", error);
    throw error;
  }
}

// Get traffic sources
export async function getGA4TrafficSources(
  startDate: string = "30daysAgo",
  endDate: string = "today"
) {
  try {
    const analyticsDataClient = getGA4Client();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        {
          name: "sessionDefaultChannelGroup",
        },
      ],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "conversions" },
      ],
      orderBys: [
        {
          metric: {
            metricName: "sessions",
          },
          desc: true,
        },
      ],
    });

    const rows = response.rows || [];

    return rows.map((row) => ({
      source: row.dimensionValues?.[0]?.value || "Unknown",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
      conversions: parseInt(row.metricValues?.[2]?.value || "0"),
    }));
  } catch (error: any) {
    console.error("Error fetching GA4 traffic sources:", error);
    throw error;
  }
}

// Get device breakdown
export async function getGA4DeviceBreakdown(
  startDate: string = "30daysAgo",
  endDate: string = "today"
) {
  try {
    const analyticsDataClient = getGA4Client();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        {
          name: "deviceCategory",
        },
      ],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "bounceRate" },
      ],
    });

    const rows = response.rows || [];

    return rows.map((row) => ({
      device: row.dimensionValues?.[0]?.value || "Unknown",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
      bounceRate: parseFloat(row.metricValues?.[2]?.value || "0") * 100,
    }));
  } catch (error: any) {
    console.error("Error fetching GA4 device breakdown:", error);
    throw error;
  }
}
