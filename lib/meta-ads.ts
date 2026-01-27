// Meta (Facebook) Marketing API Integration
// Docs: https://developers.facebook.com/docs/marketing-apis

const META_API_VERSION = "v21.0";
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

// Get access token from environment
function getAccessToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    throw new Error("META_ACCESS_TOKEN is not configured");
  }
  return token;
}

// Get ad account ID from environment
function getAdAccountId(): string {
  const accountId = process.env.META_AD_ACCOUNT_ID;
  if (!accountId) {
    throw new Error("META_AD_ACCOUNT_ID is not configured");
  }
  // Ensure it has the "act_" prefix
  return accountId.startsWith("act_") ? accountId : `act_${accountId}`;
}

// Generic API request helper
async function metaApiRequest<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "DELETE";
    params?: Record<string, string>;
    body?: Record<string, any>;
  } = {}
): Promise<T> {
  const { method = "GET", params = {}, body } = options;
  const accessToken = getAccessToken();

  const url = new URL(`${META_API_BASE}${endpoint}`);
  url.searchParams.set("access_token", accessToken);

  // Add additional params for GET requests
  if (method === "GET") {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json();

  if (!response.ok) {
    console.error("Meta API Error:", JSON.stringify(data, null, 2));
    throw new Error(
      data.error?.message || `Meta API error: ${response.status}`
    );
  }

  return data;
}

// ============================================
// TEST & CONNECTION
// ============================================

export async function testMetaAdsConnection(): Promise<{
  success: boolean;
  error?: string;
  accountInfo?: any;
}> {
  try {
    // Check if required env vars are set
    const accessToken = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;

    if (!accessToken || !adAccountId) {
      const missing = [];
      if (!accessToken) missing.push("META_ACCESS_TOKEN");
      if (!adAccountId) missing.push("META_AD_ACCOUNT_ID");
      return {
        success: false,
        error: `Missing environment variables: ${missing.join(", ")}`,
      };
    }

    const accountId = getAdAccountId();
    const accountInfo = await metaApiRequest<any>(`/${accountId}`, {
      params: {
        fields: "id,name,account_status,currency,timezone_name,amount_spent",
      },
    });

    return {
      success: true,
      accountInfo: {
        id: accountInfo.id,
        name: accountInfo.name,
        status: getAccountStatusName(accountInfo.account_status),
        currency: accountInfo.currency,
        timezone: accountInfo.timezone_name,
        amountSpent: accountInfo.amount_spent
          ? parseFloat(accountInfo.amount_spent) / 100
          : 0,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

// ============================================
// CAMPAIGNS
// ============================================

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  stopTime?: string;
}

export interface MetaCampaignInsights {
  campaignId: string;
  campaignName: string;
  status: string;
  objective: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  reach: number;
  frequency: number;
  conversions?: number;
  costPerConversion?: number;
}

export async function getCampaigns(): Promise<MetaCampaign[]> {
  const accountId = getAdAccountId();

  const response = await metaApiRequest<{
    data: any[];
    paging?: any;
  }>(`/${accountId}/campaigns`, {
    params: {
      fields:
        "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
      limit: "100",
    },
  });

  return response.data.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    objective: campaign.objective,
    dailyBudget: campaign.daily_budget
      ? parseFloat(campaign.daily_budget) / 100
      : undefined,
    lifetimeBudget: campaign.lifetime_budget
      ? parseFloat(campaign.lifetime_budget) / 100
      : undefined,
    startTime: campaign.start_time,
    stopTime: campaign.stop_time,
  }));
}

export async function getCampaignPerformance(
  datePreset:
    | "today"
    | "yesterday"
    | "last_7d"
    | "last_14d"
    | "last_30d"
    | "this_month" = "last_30d"
): Promise<MetaCampaignInsights[]> {
  const accountId = getAdAccountId();

  const response = await metaApiRequest<{
    data: any[];
  }>(`/${accountId}/insights`, {
    params: {
      level: "campaign",
      fields:
        "campaign_id,campaign_name,impressions,clicks,ctr,cpc,spend,reach,frequency,actions,cost_per_action_type",
      date_preset: datePreset,
      limit: "100",
    },
  });

  // Get campaign statuses and objectives
  const campaigns = await getCampaigns();
  const campaignMap = new Map(campaigns.map((c) => [c.id, c]));

  return response.data.map((insight) => {
    const campaign = campaignMap.get(insight.campaign_id);
    const conversions = getConversionsFromActions(insight.actions);
    const costPerConversion = getCostPerConversionFromActions(
      insight.cost_per_action_type
    );

    return {
      campaignId: insight.campaign_id,
      campaignName: insight.campaign_name,
      status: campaign?.status || "UNKNOWN",
      objective: campaign?.objective || "UNKNOWN",
      impressions: parseInt(insight.impressions || "0"),
      clicks: parseInt(insight.clicks || "0"),
      ctr: parseFloat(insight.ctr || "0"),
      cpc: parseFloat(insight.cpc || "0"),
      spend: parseFloat(insight.spend || "0"),
      reach: parseInt(insight.reach || "0"),
      frequency: parseFloat(insight.frequency || "0"),
      conversions,
      costPerConversion,
    };
  });
}

export async function getCampaignDetails(
  campaignId: string
): Promise<MetaCampaign & { insights?: any }> {
  const campaign = await metaApiRequest<any>(`/${campaignId}`, {
    params: {
      fields:
        "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time",
    },
  });

  // Get insights for this campaign
  let insights;
  try {
    const insightsResponse = await metaApiRequest<{ data: any[] }>(
      `/${campaignId}/insights`,
      {
        params: {
          fields:
            "impressions,clicks,ctr,cpc,spend,reach,frequency,actions,cost_per_action_type",
          date_preset: "last_30d",
        },
      }
    );
    insights = insightsResponse.data[0];
  } catch {
    // No insights available
  }

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    objective: campaign.objective,
    dailyBudget: campaign.daily_budget
      ? parseFloat(campaign.daily_budget) / 100
      : undefined,
    lifetimeBudget: campaign.lifetime_budget
      ? parseFloat(campaign.lifetime_budget) / 100
      : undefined,
    startTime: campaign.start_time,
    stopTime: campaign.stop_time,
    insights,
  };
}

// ============================================
// CAMPAIGN MANAGEMENT
// ============================================

export async function updateCampaignStatus(
  campaignId: string,
  status: "ACTIVE" | "PAUSED" | "DELETED"
): Promise<{ success: boolean }> {
  await metaApiRequest(`/${campaignId}`, {
    method: "POST",
    body: { status },
  });

  return { success: true };
}

export async function updateCampaignBudget(
  campaignId: string,
  dailyBudgetCzk: number
): Promise<{ success: boolean }> {
  // Meta API expects budget in cents
  const budgetCents = Math.round(dailyBudgetCzk * 100);

  await metaApiRequest(`/${campaignId}`, {
    method: "POST",
    body: { daily_budget: budgetCents },
  });

  return { success: true };
}

export async function createCampaign(params: {
  name: string;
  objective:
    | "OUTCOME_AWARENESS"
    | "OUTCOME_ENGAGEMENT"
    | "OUTCOME_LEADS"
    | "OUTCOME_SALES"
    | "OUTCOME_TRAFFIC";
  dailyBudgetCzk: number;
  status?: "ACTIVE" | "PAUSED";
}): Promise<{ success: boolean; campaignId: string }> {
  const accountId = getAdAccountId();
  const budgetCents = Math.round(params.dailyBudgetCzk * 100);

  const response = await metaApiRequest<{ id: string }>(
    `/${accountId}/campaigns`,
    {
      method: "POST",
      body: {
        name: params.name,
        objective: params.objective,
        status: params.status || "PAUSED",
        special_ad_categories: [],
        daily_budget: budgetCents,
      },
    }
  );

  return {
    success: true,
    campaignId: response.id,
  };
}

// ============================================
// AD SETS
// ============================================

export interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  campaignId: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  targeting?: any;
  optimization_goal?: string;
}

export async function getAdSets(campaignId?: string): Promise<MetaAdSet[]> {
  const accountId = getAdAccountId();
  const endpoint = campaignId
    ? `/${campaignId}/adsets`
    : `/${accountId}/adsets`;

  const response = await metaApiRequest<{ data: any[] }>(endpoint, {
    params: {
      fields:
        "id,name,status,campaign_id,daily_budget,lifetime_budget,targeting,optimization_goal",
      limit: "100",
    },
  });

  return response.data.map((adset) => ({
    id: adset.id,
    name: adset.name,
    status: adset.status,
    campaignId: adset.campaign_id,
    dailyBudget: adset.daily_budget
      ? parseFloat(adset.daily_budget) / 100
      : undefined,
    lifetimeBudget: adset.lifetime_budget
      ? parseFloat(adset.lifetime_budget) / 100
      : undefined,
    targeting: adset.targeting,
    optimization_goal: adset.optimization_goal,
  }));
}

export async function getAdSetPerformance(
  datePreset: string = "last_30d"
): Promise<any[]> {
  const accountId = getAdAccountId();

  const response = await metaApiRequest<{ data: any[] }>(
    `/${accountId}/insights`,
    {
      params: {
        level: "adset",
        fields:
          "adset_id,adset_name,campaign_name,impressions,clicks,ctr,cpc,spend,reach,frequency,actions",
        date_preset: datePreset,
        limit: "100",
      },
    }
  );

  return response.data.map((insight) => ({
    adSetId: insight.adset_id,
    adSetName: insight.adset_name,
    campaignName: insight.campaign_name,
    impressions: parseInt(insight.impressions || "0"),
    clicks: parseInt(insight.clicks || "0"),
    ctr: parseFloat(insight.ctr || "0"),
    cpc: parseFloat(insight.cpc || "0"),
    spend: parseFloat(insight.spend || "0"),
    reach: parseInt(insight.reach || "0"),
    frequency: parseFloat(insight.frequency || "0"),
    conversions: getConversionsFromActions(insight.actions),
  }));
}

export async function updateAdSetStatus(
  adSetId: string,
  status: "ACTIVE" | "PAUSED" | "DELETED"
): Promise<{ success: boolean }> {
  await metaApiRequest(`/${adSetId}`, {
    method: "POST",
    body: { status },
  });

  return { success: true };
}

// ============================================
// ADS
// ============================================

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  adSetId: string;
  creative?: any;
}

export async function getAds(adSetId?: string): Promise<MetaAd[]> {
  const accountId = getAdAccountId();
  const endpoint = adSetId ? `/${adSetId}/ads` : `/${accountId}/ads`;

  const response = await metaApiRequest<{ data: any[] }>(endpoint, {
    params: {
      fields: "id,name,status,adset_id,creative",
      limit: "100",
    },
  });

  return response.data.map((ad) => ({
    id: ad.id,
    name: ad.name,
    status: ad.status,
    adSetId: ad.adset_id,
    creative: ad.creative,
  }));
}

export async function getAdPerformance(
  datePreset: string = "last_30d"
): Promise<any[]> {
  const accountId = getAdAccountId();

  const response = await metaApiRequest<{ data: any[] }>(
    `/${accountId}/insights`,
    {
      params: {
        level: "ad",
        fields:
          "ad_id,ad_name,adset_name,campaign_name,impressions,clicks,ctr,cpc,spend,reach,frequency,actions",
        date_preset: datePreset,
        limit: "100",
      },
    }
  );

  return response.data.map((insight) => ({
    adId: insight.ad_id,
    adName: insight.ad_name,
    adSetName: insight.adset_name,
    campaignName: insight.campaign_name,
    impressions: parseInt(insight.impressions || "0"),
    clicks: parseInt(insight.clicks || "0"),
    ctr: parseFloat(insight.ctr || "0"),
    cpc: parseFloat(insight.cpc || "0"),
    spend: parseFloat(insight.spend || "0"),
    reach: parseInt(insight.reach || "0"),
    frequency: parseFloat(insight.frequency || "0"),
    conversions: getConversionsFromActions(insight.actions),
  }));
}

export async function updateAdStatus(
  adId: string,
  status: "ACTIVE" | "PAUSED" | "DELETED"
): Promise<{ success: boolean }> {
  await metaApiRequest(`/${adId}`, {
    method: "POST",
    body: { status },
  });

  return { success: true };
}

// ============================================
// ACCOUNT INSIGHTS
// ============================================

export async function getAccountInsights(
  datePreset: string = "last_30d"
): Promise<{
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  reach: number;
  frequency: number;
  conversions: number;
}> {
  const accountId = getAdAccountId();

  const response = await metaApiRequest<{ data: any[] }>(
    `/${accountId}/insights`,
    {
      params: {
        fields:
          "impressions,clicks,ctr,cpc,spend,reach,frequency,actions,cost_per_action_type",
        date_preset: datePreset,
      },
    }
  );

  const insight = response.data[0] || {};

  return {
    impressions: parseInt(insight.impressions || "0"),
    clicks: parseInt(insight.clicks || "0"),
    ctr: parseFloat(insight.ctr || "0"),
    cpc: parseFloat(insight.cpc || "0"),
    spend: parseFloat(insight.spend || "0"),
    reach: parseInt(insight.reach || "0"),
    frequency: parseFloat(insight.frequency || "0"),
    conversions: getConversionsFromActions(insight.actions),
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAccountStatusName(status: number): string {
  const statuses: Record<number, string> = {
    1: "ACTIVE",
    2: "DISABLED",
    3: "UNSETTLED",
    7: "PENDING_RISK_REVIEW",
    8: "PENDING_SETTLEMENT",
    9: "IN_GRACE_PERIOD",
    100: "PENDING_CLOSURE",
    101: "CLOSED",
    201: "ANY_ACTIVE",
    202: "ANY_CLOSED",
  };
  return statuses[status] || "UNKNOWN";
}

function getConversionsFromActions(actions?: any[]): number {
  if (!actions) return 0;

  // Count various conversion types
  const conversionTypes = [
    "lead",
    "purchase",
    "complete_registration",
    "contact",
    "submit_application",
    "offsite_conversion.fb_pixel_lead",
    "offsite_conversion.fb_pixel_purchase",
  ];

  let total = 0;
  for (const action of actions) {
    if (conversionTypes.includes(action.action_type)) {
      total += parseInt(action.value || "0");
    }
  }

  return total;
}

function getCostPerConversionFromActions(
  costPerActionType?: any[]
): number | undefined {
  if (!costPerActionType) return undefined;

  const conversionTypes = [
    "lead",
    "purchase",
    "complete_registration",
    "offsite_conversion.fb_pixel_lead",
    "offsite_conversion.fb_pixel_purchase",
  ];

  for (const cost of costPerActionType) {
    if (conversionTypes.includes(cost.action_type)) {
      return parseFloat(cost.value);
    }
  }

  return undefined;
}
