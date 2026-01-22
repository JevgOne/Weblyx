import { GoogleAdsApi, Customer } from "google-ads-api";

// Google Ads API Configuration
const googleAdsConfig = {
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
};

// Initialize Google Ads API client
export const googleAdsClient = new GoogleAdsApi(googleAdsConfig);

// Get customer account
export function getGoogleAdsCustomer(): Customer {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN!;

  return googleAdsClient.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
  });
}

// Test API connection
export async function testGoogleAdsConnection(): Promise<{
  success: boolean;
  error?: string;
  customerInfo?: any;
}> {
  try {
    const customer = getGoogleAdsCustomer();

    // Query for basic account info to test connection
    const [response] = await customer.query(`
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone
      FROM customer
      LIMIT 1
    `);

    return {
      success: true,
      customerInfo: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

// Get campaign performance data
export async function getCampaignPerformance(
  dateRange: "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" = "LAST_30_DAYS"
) {
  try {
    const customer = getGoogleAdsCustomer();

    const campaigns = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.cost_per_conversion
      FROM campaign
      WHERE segments.date DURING ${dateRange}
      ORDER BY metrics.impressions DESC
    `);

    return campaigns.map((campaign: any) => ({
      id: campaign.campaign.id,
      name: campaign.campaign.name,
      status: campaign.campaign.status,
      channelType: campaign.campaign.advertising_channel_type,
      impressions: campaign.metrics.impressions,
      clicks: campaign.metrics.clicks,
      ctr: campaign.metrics.ctr,
      avgCpc: campaign.metrics.average_cpc / 1000000, // Convert micros to currency
      cost: campaign.metrics.cost_micros / 1000000, // Convert micros to currency
      conversions: campaign.metrics.conversions,
      costPerConversion: campaign.metrics.cost_per_conversion
        ? campaign.metrics.cost_per_conversion / 1000000
        : null,
    }));
  } catch (error: any) {
    console.error("Error fetching campaign performance:", error);
    throw error;
  }
}

// Get account budget summary
export async function getAccountBudgetSummary() {
  try {
    const customer = getGoogleAdsCustomer();

    const budgets = await customer.query(`
      SELECT
        campaign_budget.id,
        campaign_budget.name,
        campaign_budget.amount_micros,
        campaign_budget.delivery_method,
        campaign_budget.status
      FROM campaign_budget
    `);

    return budgets.map((budget: any) => ({
      id: budget.campaign_budget.id,
      name: budget.campaign_budget.name,
      amount: budget.campaign_budget.amount_micros / 1000000,
      deliveryMethod: budget.campaign_budget.delivery_method,
      status: budget.campaign_budget.status,
    }));
  } catch (error: any) {
    console.error("Error fetching budget summary:", error);
    throw error;
  }
}

// Get ad group performance
export async function getAdGroupPerformance(
  campaignId?: string,
  dateRange: "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" = "LAST_30_DAYS"
) {
  try {
    const customer = getGoogleAdsCustomer();

    const whereClause = campaignId
      ? `WHERE campaign.id = ${campaignId} AND segments.date DURING ${dateRange}`
      : `WHERE segments.date DURING ${dateRange}`;

    const adGroups = await customer.query(`
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions
      FROM ad_group
      ${whereClause}
      ORDER BY metrics.impressions DESC
    `);

    return adGroups.map((adGroup: any) => ({
      id: adGroup.ad_group.id,
      name: adGroup.ad_group.name,
      status: adGroup.ad_group.status,
      campaignId: adGroup.campaign.id,
      campaignName: adGroup.campaign.name,
      impressions: adGroup.metrics.impressions,
      clicks: adGroup.metrics.clicks,
      ctr: adGroup.metrics.ctr,
      avgCpc: adGroup.metrics.average_cpc / 1000000,
      cost: adGroup.metrics.cost_micros / 1000000,
      conversions: adGroup.metrics.conversions,
    }));
  } catch (error: any) {
    console.error("Error fetching ad group performance:", error);
    throw error;
  }
}

// Get keyword performance
export async function getKeywordPerformance(
  campaignId?: string,
  dateRange: "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" = "LAST_30_DAYS"
) {
  try {
    const customer = getGoogleAdsCustomer();

    const whereClause = campaignId
      ? `WHERE campaign.id = ${campaignId} AND segments.date DURING ${dateRange}`
      : `WHERE segments.date DURING ${dateRange}`;

    const keywords = await customer.query(`
      SELECT
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group.name,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions
      FROM keyword_view
      ${whereClause}
      ORDER BY metrics.impressions DESC
      LIMIT 100
    `);

    return keywords.map((kw: any) => ({
      keyword: kw.ad_group_criterion.keyword.text,
      matchType: kw.ad_group_criterion.keyword.match_type,
      status: kw.ad_group_criterion.status,
      adGroupName: kw.ad_group.name,
      campaignName: kw.campaign.name,
      impressions: kw.metrics.impressions,
      clicks: kw.metrics.clicks,
      ctr: kw.metrics.ctr,
      avgCpc: kw.metrics.average_cpc / 1000000,
      cost: kw.metrics.cost_micros / 1000000,
      conversions: kw.metrics.conversions,
    }));
  } catch (error: any) {
    console.error("Error fetching keyword performance:", error);
    throw error;
  }
}
