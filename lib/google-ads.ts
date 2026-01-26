import { GoogleAdsApi, Customer, enums, resources, MutateOperation } from "google-ads-api";

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
    // Check if required env vars are set
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !developerToken || !customerId || !refreshToken) {
      const missing = [];
      if (!clientId) missing.push("GOOGLE_ADS_CLIENT_ID");
      if (!clientSecret) missing.push("GOOGLE_ADS_CLIENT_SECRET");
      if (!developerToken) missing.push("GOOGLE_ADS_DEVELOPER_TOKEN");
      if (!customerId) missing.push("GOOGLE_ADS_CUSTOMER_ID");
      if (!refreshToken) missing.push("GOOGLE_ADS_REFRESH_TOKEN");
      return {
        success: false,
        error: `Missing environment variables: ${missing.join(", ")}`,
      };
    }

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
    console.error("Google Ads API Error:", JSON.stringify(error, null, 2));

    // Try to extract detailed error message
    let errorMessage = "Unknown error";

    if (error.message) {
      errorMessage = error.message;
    } else if (error.errors && Array.isArray(error.errors)) {
      errorMessage = error.errors.map((e: any) => e.message || JSON.stringify(e)).join("; ");
    } else if (error.error) {
      errorMessage = typeof error.error === "string" ? error.error : JSON.stringify(error.error);
    } else if (error.response?.data) {
      errorMessage = JSON.stringify(error.response.data);
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }

    return {
      success: false,
      error: errorMessage,
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

// ============================================
// CAMPAIGN MANAGEMENT FUNCTIONS
// ============================================

// Update campaign status (ENABLED, PAUSED, REMOVED)
export async function updateCampaignStatus(
  campaignId: string,
  status: "ENABLED" | "PAUSED" | "REMOVED"
) {
  try {
    const customer = getGoogleAdsCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;

    const campaignResourceName = `customers/${customerId}/campaigns/${campaignId}`;

    const operation: MutateOperation<resources.ICampaign> = {
      entity: "campaign",
      operation: "update",
      resource: {
        resource_name: campaignResourceName,
        status: enums.CampaignStatus[status],
      },
      update_mask: {
        paths: ["status"],
      },
    };

    const response = await customer.mutateResources([operation]);

    return {
      success: true,
      resourceName: response.results[0]?.resource_name,
    };
  } catch (error: any) {
    console.error("Error updating campaign status:", error);
    throw error;
  }
}

// Update campaign budget
export async function updateCampaignBudget(
  budgetId: string,
  amountCzk: number
) {
  try {
    const customer = getGoogleAdsCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;

    const budgetResourceName = `customers/${customerId}/campaignBudgets/${budgetId}`;
    const amountMicros = Math.round(amountCzk * 1000000);

    const operation: MutateOperation<resources.ICampaignBudget> = {
      entity: "campaign_budget",
      operation: "update",
      resource: {
        resource_name: budgetResourceName,
        amount_micros: amountMicros,
      },
      update_mask: {
        paths: ["amount_micros"],
      },
    };

    const response = await customer.mutateResources([operation]);

    return {
      success: true,
      resourceName: response.results[0]?.resource_name,
    };
  } catch (error: any) {
    console.error("Error updating campaign budget:", error);
    throw error;
  }
}

// Get campaign with budget details for editing
export async function getCampaignDetails(campaignId: string) {
  try {
    const customer = getGoogleAdsCustomer();

    const [campaign] = await customer.query(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.campaign_budget,
        campaign_budget.id,
        campaign_budget.amount_micros,
        campaign_budget.delivery_method
      FROM campaign
      WHERE campaign.id = ${campaignId}
    `);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    return {
      id: campaign.campaign.id,
      name: campaign.campaign.name,
      status: campaign.campaign.status,
      channelType: campaign.campaign.advertising_channel_type,
      budgetId: campaign.campaign_budget.id,
      budgetAmount: campaign.campaign_budget.amount_micros / 1000000,
      budgetDeliveryMethod: campaign.campaign_budget.delivery_method,
    };
  } catch (error: any) {
    console.error("Error fetching campaign details:", error);
    throw error;
  }
}

// Create a new Search campaign
export async function createSearchCampaign(params: {
  name: string;
  dailyBudgetCzk: number;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
}) {
  try {
    const customer = getGoogleAdsCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;

    // Generate temporary IDs for the budget
    const tempBudgetId = -1;
    const budgetAmountMicros = Math.round(params.dailyBudgetCzk * 1000000);

    // Create budget first
    const budgetOperation: MutateOperation<resources.ICampaignBudget> = {
      entity: "campaign_budget",
      operation: "create",
      resource: {
        resource_name: `customers/${customerId}/campaignBudgets/${tempBudgetId}`,
        name: `Budget for ${params.name}`,
        amount_micros: budgetAmountMicros,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
        explicitly_shared: false,
      },
    };

    // Create campaign
    const campaignOperation: MutateOperation<resources.ICampaign> = {
      entity: "campaign",
      operation: "create",
      resource: {
        name: params.name,
        status: enums.CampaignStatus.PAUSED, // Start paused for safety
        advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
        campaign_budget: `customers/${customerId}/campaignBudgets/${tempBudgetId}`,
        manual_cpc: {
          enhanced_cpc_enabled: false,
        },
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: false,
        },
        start_date: params.startDate || formatDate(new Date()),
        end_date: params.endDate,
      },
    };

    const response = await customer.mutateResources([
      budgetOperation,
      campaignOperation,
    ]);

    return {
      success: true,
      budgetResourceName: response.results[0]?.resource_name,
      campaignResourceName: response.results[1]?.resource_name,
    };
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    throw error;
  }
}

// Create ad group in a campaign
export async function createAdGroup(params: {
  campaignId: string;
  name: string;
  cpcBidCzk: number;
}) {
  try {
    const customer = getGoogleAdsCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;

    const cpcBidMicros = Math.round(params.cpcBidCzk * 1000000);

    const operation: MutateOperation<resources.IAdGroup> = {
      entity: "ad_group",
      operation: "create",
      resource: {
        name: params.name,
        campaign: `customers/${customerId}/campaigns/${params.campaignId}`,
        status: enums.AdGroupStatus.ENABLED,
        type: enums.AdGroupType.SEARCH_STANDARD,
        cpc_bid_micros: cpcBidMicros,
      },
    };

    const response = await customer.mutateResources([operation]);

    return {
      success: true,
      resourceName: response.results[0]?.resource_name,
    };
  } catch (error: any) {
    console.error("Error creating ad group:", error);
    throw error;
  }
}

// Add keywords to an ad group
export async function addKeywords(params: {
  adGroupId: string;
  keywords: Array<{
    text: string;
    matchType: "EXACT" | "PHRASE" | "BROAD";
  }>;
}) {
  try {
    const customer = getGoogleAdsCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;

    const operations: MutateOperation<resources.IAdGroupCriterion>[] =
      params.keywords.map((kw, index) => ({
        entity: "ad_group_criterion",
        operation: "create",
        resource: {
          ad_group: `customers/${customerId}/adGroups/${params.adGroupId}`,
          status: enums.AdGroupCriterionStatus.ENABLED,
          keyword: {
            text: kw.text,
            match_type: enums.KeywordMatchType[kw.matchType],
          },
        },
      }));

    const response = await customer.mutateResources(operations);

    return {
      success: true,
      results: response.results.map((r) => r.resource_name),
    };
  } catch (error: any) {
    console.error("Error adding keywords:", error);
    throw error;
  }
}

// Update keyword status
export async function updateKeywordStatus(
  adGroupId: string,
  criterionId: string,
  status: "ENABLED" | "PAUSED" | "REMOVED"
) {
  try {
    const customer = getGoogleAdsCustomer();
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;

    const resourceName = `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`;

    const operation: MutateOperation<resources.IAdGroupCriterion> = {
      entity: "ad_group_criterion",
      operation: "update",
      resource: {
        resource_name: resourceName,
        status: enums.AdGroupCriterionStatus[status],
      },
      update_mask: {
        paths: ["status"],
      },
    };

    const response = await customer.mutateResources([operation]);

    return {
      success: true,
      resourceName: response.results[0]?.resource_name,
    };
  } catch (error: any) {
    console.error("Error updating keyword status:", error);
    throw error;
  }
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
