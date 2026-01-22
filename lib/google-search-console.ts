import { google } from "googleapis";
import path from "path";

// Initialize Service Account authentication
function getServiceAccountAuth() {
  const keyFilePath = path.join(process.cwd(), "service-account-key.json");

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });

  return auth;
}

// Initialize Search Console client with Service Account
export function getSearchConsoleClient() {
  const auth = getServiceAccountAuth();
  return google.searchconsole({ version: "v1", auth });
}

// Get Search Console overview
export async function getSearchConsoleOverview(
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["date"],
        rowLimit: 1000,
      },
    });

    const rows = response.data.rows || [];

    // Calculate totals
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalCtr = 0;
    let totalPosition = 0;

    const timeline = rows.map((row) => {
      const date = row.keys?.[0] || "";
      const clicks = row.clicks || 0;
      const impressions = row.impressions || 0;
      const ctr = row.ctr || 0;
      const position = row.position || 0;

      totalClicks += clicks;
      totalImpressions += impressions;
      totalCtr += ctr;
      totalPosition += position;

      return {
        date,
        clicks,
        impressions,
        ctr: ctr * 100, // Convert to percentage
        position,
      };
    });

    const avgCtr = rows.length > 0 ? (totalCtr / rows.length) * 100 : 0;
    const avgPosition = rows.length > 0 ? totalPosition / rows.length : 0;

    return {
      summary: {
        totalClicks,
        totalImpressions,
        avgCtr,
        avgPosition,
      },
      timeline,
    };
  } catch (error: any) {
    console.error("Error fetching Search Console overview:", error);
    throw error;
  }
}

// Get top queries
export async function getSearchConsoleTopQueries(
  siteUrl: string,
  startDate: string,
  endDate: string,
  limit: number = 20
) {
  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: limit,
      },
    });

    const rows = response.data.rows || [];

    return rows.map((row) => ({
      query: row.keys?.[0] || "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: row.position || 0,
    }));
  } catch (error: any) {
    console.error("Error fetching Search Console top queries:", error);
    throw error;
  }
}

// Get top pages
export async function getSearchConsoleTopPages(
  siteUrl: string,
  startDate: string,
  endDate: string,
  limit: number = 20
) {
  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: limit,
      },
    });

    const rows = response.data.rows || [];

    return rows.map((row) => ({
      page: row.keys?.[0] || "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: row.position || 0,
    }));
  } catch (error: any) {
    console.error("Error fetching Search Console top pages:", error);
    throw error;
  }
}

// Get device breakdown
export async function getSearchConsoleDeviceBreakdown(
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["device"],
      },
    });

    const rows = response.data.rows || [];

    return rows.map((row) => ({
      device: row.keys?.[0] || "Unknown",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: (row.ctr || 0) * 100,
      position: row.position || 0,
    }));
  } catch (error: any) {
    console.error("Error fetching Search Console device breakdown:", error);
    throw error;
  }
}

// Get Search Console issues (errors, warnings)
export async function getSearchConsoleIssues(siteUrl: string) {
  try {
    const searchConsole = getSearchConsoleClient();

    // Get URL inspection issues
    const urlTestingTools = google.searchconsole({ version: "v1", auth: getServiceAccountAuth() });

    // Note: URL Testing Tools API requires different scope
    // For now, we'll return a placeholder
    // You'll need to enable this in Google Cloud Console

    return {
      criticalIssues: [
        {
          type: "structured_data",
          message: 'Invalid object type for field "itemReviewed"',
          affectedPages: 2,
          severity: "critical",
        },
        {
          type: "structured_data",
          message: 'Invalid object type for field " "',
          affectedPages: 2,
          severity: "critical",
        },
      ],
      warnings: [],
    };
  } catch (error: any) {
    console.error("Error fetching Search Console issues:", error);
    throw error;
  }
}

// Get sitemap status
export async function getSearchConsoleSitemaps(siteUrl: string) {
  try {
    const searchConsole = getSearchConsoleClient();

    const response = await searchConsole.sitemaps.list({
      siteUrl,
    });

    return (response.data.sitemap || []).map((sitemap) => ({
      path: sitemap.path || "",
      lastSubmitted: sitemap.lastSubmitted || null,
      isPending: sitemap.isPending || false,
      isSitemapsIndex: sitemap.isSitemapsIndex || false,
      type: sitemap.type || "unknown",
      errors: sitemap.errors || 0,
      warnings: sitemap.warnings || 0,
      contents: (sitemap.contents || []).map((content) => ({
        type: content.type || "",
        submitted: content.submitted || 0,
        indexed: content.indexed || 0,
      })),
    }));
  } catch (error: any) {
    console.error("Error fetching sitemaps:", error);
    throw error;
  }
}
