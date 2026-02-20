// Scheduled Campaign Analysis Cron Job
// Runs daily via Vercel Cron to check and analyze campaigns

import { NextRequest, NextResponse } from 'next/server';
import {
  getCampaignsDueForAnalysis,
  updateCampaignTracking,
  saveAnalysis,
  savePendingRecommendation,
  updateRecommendationStatus,
  calculateCampaignPhase,
  calculateHealthScore,
  RECOMMENDATION_TYPE_INFO,
  type CampaignTracking,
} from '@/lib/turso/google-marketing';
import { generateRecommendations, getImpactComparison } from '@/lib/google-marketing-recommendations';
import { getCampaignPerformance, getKeywordPerformance } from '@/lib/google-ads';
import { getGA4Overview, getGA4TopPages } from '@/lib/google-analytics';
import { getSearchConsoleOverview, getSearchConsoleTopQueries } from '@/lib/google-search-console';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for thorough analysis

// Vercel Cron config - run daily at 6 AM
export const runtime = 'nodejs';

interface AnalysisResult {
  campaignId: string;
  campaignName: string;
  recommendations: number;
  autoApplied: number;
  pendingApproval: number;
  healthScore: number;
  phase: string;
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow local/manual testing without secret
    const isLocalOrManual = request.headers.get('x-manual-trigger') === 'true';
    if (!isLocalOrManual) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Get all campaigns due for analysis
    const campaignsDue = await getCampaignsDueForAnalysis();

    if (campaignsDue.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No campaigns due for analysis',
        analyzed: 0,
      });
    }

    const results: AnalysisResult[] = [];

    for (const campaign of campaignsDue) {
      try {
        const result = await analyzeCampaign(campaign);
        results.push(result);
      } catch (error) {
        console.error(`Error analyzing campaign ${campaign.campaignName}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      analyzed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function analyzeCampaign(tracking: CampaignTracking): Promise<AnalysisResult> {
  // Gather all data sources
  const dataSources = {
    googleAds: false,
    ga4: false,
    searchConsole: false,
  };

  // 1. Get Google Ads data
  let campaignMetrics: any = null;
  let keywords: any[] = [];
  let searchTerms: any[] = [];

  try {
    const campaigns = await getCampaignPerformance('LAST_30_DAYS');
    campaignMetrics = campaigns.find((c: any) => c.id === tracking.campaignId);
    keywords = await getKeywordPerformance(tracking.campaignId, 'LAST_30_DAYS');

    // Search terms report - TODO: implement getSearchTermsReport in google-ads.ts
    // For now, we'll work without search terms data
    searchTerms = [];

    dataSources.googleAds = true;
  } catch (error) {
    console.warn('Google Ads data not available');
  }

  // 2. Get GA4 data
  let ga4Data: any = null;
  try {
    const [overview, topPages] = await Promise.all([
      getGA4Overview('30daysAgo', 'today'),
      getGA4TopPages('30daysAgo', 'today', 10),
    ]);
    ga4Data = {
      bounceRate: overview.summary.avgBounceRate,
      avgSessionDuration: overview.summary.avgSessionDuration,
      topPages,
    };
    dataSources.ga4 = true;
  } catch (error) {
    console.warn('GA4 data not available');
  }

  // 3. Get Search Console data
  let gscData: any = null;
  try {
    const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL || 'sc-domain:weblyx.cz';
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const topQueries = await getSearchConsoleTopQueries(siteUrl, startDate, endDate, 50);
    gscData = { topQueries };
    dataSources.searchConsole = true;
  } catch (error) {
    console.warn('Search Console data not available');
  }

  // Build metrics object
  const currentMetrics = campaignMetrics ? {
    impressions: campaignMetrics.impressions || 0,
    clicks: campaignMetrics.clicks || 0,
    ctr: campaignMetrics.ctr || 0,
    cost: campaignMetrics.cost || 0,
    conversions: campaignMetrics.conversions || 0,
    conversionRate: campaignMetrics.clicks > 0 ? campaignMetrics.conversions / campaignMetrics.clicks : 0,
    cpc: campaignMetrics.avgCpc || 0,
    costPerConversion: campaignMetrics.costPerConversion || 0,
  } : null;

  // Generate recommendations
  const recommendations = currentMetrics ? generateRecommendations({
    campaignId: tracking.campaignId,
    campaignName: tracking.campaignName,
    metrics: currentMetrics,
    keywords: keywords.map((k: any) => ({
      keyword: k.keyword,
      matchType: k.matchType,
      impressions: k.impressions,
      clicks: k.clicks,
      ctr: k.ctr,
      cost: k.cost,
      conversions: k.conversions,
    })),
    searchTerms: searchTerms.map((t: any) => ({
      term: t.searchTerm,
      impressions: t.impressions,
      clicks: t.clicks,
      conversions: t.conversions,
      cost: t.cost,
    })),
    ga4Data,
    gscData,
  }) : [];

  // Auto-apply safe recommendations
  let autoApplied = 0;
  const pendingForApproval: typeof recommendations = [];

  for (const rec of recommendations) {
    const typeInfo = RECOMMENDATION_TYPE_INFO[rec.type];

    if (rec.autoApplicable && typeInfo.autoApplicable && typeInfo.riskLevel === 'low') {
      // Auto-apply this recommendation
      try {
        await applyRecommendation(tracking.campaignId, rec);
        rec.status = 'auto_applied';
        autoApplied++;
      } catch (error) {
        console.error(`Failed to auto-apply: ${rec.title}`, error);
        rec.status = 'pending';
        pendingForApproval.push(rec);
      }
    } else {
      rec.status = 'pending';
      pendingForApproval.push(rec);
    }
  }

  // Calculate new phase and health score
  const updatedTracking = {
    ...tracking,
    currentMetrics: currentMetrics || undefined,
  } as CampaignTracking;
  const newPhase = calculateCampaignPhase(updatedTracking);
  const newHealthScore = calculateHealthScore(updatedTracking);

  // Determine next analysis date based on phase
  let daysUntilNext = 14; // Default
  if (newPhase === 'new' || newPhase === 'learning') {
    daysUntilNext = 7;
  } else if (newPhase === 'declining') {
    daysUntilNext = 3; // More frequent for declining campaigns
  } else if (newPhase === 'mature') {
    daysUntilNext = 14;
  }

  const nextAnalysisDate = new Date();
  nextAnalysisDate.setDate(nextAnalysisDate.getDate() + daysUntilNext);

  // Save to database
  const analysisId = await saveAnalysis({
    campaignTrackingId: tracking.id,
    analysisType: 'scheduled',
    dataSources,
    metrics: {
      before: tracking.currentMetrics || {},
      after: currentMetrics || {},
    },
    recommendations,
    aiInsights: generateInsightsSummary(recommendations, newPhase, newHealthScore),
    appliedActions: recommendations
      .filter(r => r.status === 'auto_applied')
      .map(r => ({
        recommendationId: r.id,
        type: r.type,
        description: r.title,
        appliedAt: new Date(),
        automatic: true,
        result: 'success' as const,
      })),
  });

  // Save pending recommendations
  for (const rec of pendingForApproval) {
    await savePendingRecommendation({
      campaignTrackingId: tracking.id,
      analysisId,
      recommendation: rec,
    });
  }

  // Update campaign tracking
  await updateCampaignTracking(tracking.campaignId, {
    phase: newPhase,
    healthScore: newHealthScore,
    lastAnalysisDate: new Date(),
    nextAnalysisDate,
    analysisCount: tracking.analysisCount + 1,
    currentMetrics: currentMetrics || undefined,
    baselineMetrics: tracking.analysisCount === 0 ? (currentMetrics || undefined) : tracking.baselineMetrics,
  });

  return {
    campaignId: tracking.campaignId,
    campaignName: tracking.campaignName,
    recommendations: recommendations.length,
    autoApplied,
    pendingApproval: pendingForApproval.length,
    healthScore: newHealthScore,
    phase: newPhase,
  };
}

async function applyRecommendation(campaignId: string, recommendation: any): Promise<void> {
  // Implementation depends on recommendation type
  switch (recommendation.type) {
    case 'keyword_negative':
      // TODO: Call Google Ads API to add negative keyword
      // await addNegativeKeyword(campaignId, recommendation.data.keyword);
      break;

    case 'keyword_remove':
      // TODO: Call Google Ads API to pause/remove keyword
      // await pauseKeyword(campaignId, recommendation.data.keyword);
      break;

    default:
      throw new Error(`Cannot auto-apply recommendation type: ${recommendation.type}`);
  }
}

function generateInsightsSummary(recommendations: any[], phase: string, healthScore: number): string {
  const critical = recommendations.filter(r => r.priority === 'critical').length;
  const high = recommendations.filter(r => r.priority === 'high').length;
  const autoApplied = recommendations.filter(r => r.status === 'auto_applied').length;

  const phaseMessages: Record<string, string> = {
    new: 'Kampaň je nová, sbíráme data pro první analýzu.',
    learning: 'Kampaň se učí - Google optimalizuje zobrazování.',
    optimizing: 'Kampaň běží a lze ji aktivně optimalizovat.',
    mature: 'Kampaň je stabilní a funguje konzistentně.',
    declining: 'Výkon kampaně klesá - je potřeba zásah!',
  };

  let summary = `## Stav kampaně\n`;
  summary += `- **Fáze:** ${phase} - ${phaseMessages[phase] || ''}\n`;
  summary += `- **Health Score:** ${healthScore}/100\n\n`;

  if (critical > 0) {
    summary += `**${critical} kritických problémů** vyžaduje okamžitou pozornost!\n\n`;
  }

  if (high > 0) {
    summary += `**${high} důležitých doporučení** pro zlepšení výkonu.\n\n`;
  }

  if (autoApplied > 0) {
    summary += `**${autoApplied} změn bylo automaticky aplikováno** (bezpečné optimalizace).\n\n`;
  }

  if (recommendations.length === 0) {
    summary += `Kampaň vypadá dobře! Žádné akutní problémy nenalezeny.\n`;
  }

  return summary;
}

// Manual trigger endpoint
export async function POST(request: NextRequest) {
  // This allows manual triggering from admin panel
  const body = await request.json().catch(() => ({}));
  const campaignId = body.campaignId;

  if (campaignId) {
    // Analyze specific campaign
    // TODO: Implement single campaign analysis
    return NextResponse.json({ success: true, message: 'Single campaign analysis not yet implemented' });
  }

  // Trigger full analysis
  const mockRequest = new Request(request.url, {
    headers: { 'x-manual-trigger': 'true' },
  });

  return GET(mockRequest as NextRequest);
}
