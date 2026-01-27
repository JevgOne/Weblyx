// Google Marketing Recommendations API
import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingRecommendations,
  updateRecommendationStatus,
  getAllCampaignTracking,
  getAnalysisHistory,
  initGoogleMarketingTables,
} from '@/lib/turso/google-marketing';
import { getImpactComparison, PRIORITY_INFO, EFFORT_INFO } from '@/lib/google-marketing-recommendations';

export const dynamic = 'force-dynamic';

// GET - Get all pending recommendations with detailed explanations
export async function GET(request: NextRequest) {
  try {
    // Initialize tables if needed
    await initGoogleMarketingTables();

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    // Get campaign tracking
    const campaigns = await getAllCampaignTracking();

    if (campaigns.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          campaigns: [],
          recommendations: [],
          summary: {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            autoApplied: 0,
          },
        },
      });
    }

    // Get pending recommendations
    const campaignTrackingId = campaignId
      ? campaigns.find(c => c.campaignId === campaignId)?.id
      : undefined;

    const recommendations = await getPendingRecommendations(campaignTrackingId);

    // Enrich recommendations with impact comparisons and explanations
    const enrichedRecommendations = recommendations.map(rec => ({
      ...rec,
      priorityInfo: PRIORITY_INFO[rec.priority],
      effortInfo: EFFORT_INFO[rec.effort],
      impactComparison: getImpactComparison(rec.type, rec.data || {}),
    }));

    // Calculate summary
    const summary = {
      total: recommendations.length,
      critical: recommendations.filter(r => r.priority === 'critical').length,
      high: recommendations.filter(r => r.priority === 'high').length,
      medium: recommendations.filter(r => r.priority === 'medium').length,
      low: recommendations.filter(r => r.priority === 'low').length,
      autoApplied: 0, // Would need to query this from applied actions
    };

    // Get analysis history for each campaign
    const campaignsWithHistory = await Promise.all(
      campaigns.map(async campaign => {
        const history = await getAnalysisHistory(campaign.id, 5);
        return {
          ...campaign,
          recentAnalyses: history,
          pendingRecommendations: recommendations.filter(r => {
            // Match by campaign - would need to add campaignTrackingId to recommendations
            return true;
          }).length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaignsWithHistory,
        recommendations: enrichedRecommendations,
        summary,
      },
    });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Apply or reject a recommendation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationId, action, rejectionReason } = body;

    if (!recommendationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing recommendationId or action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // TODO: Actually apply the recommendation via Google Ads API
      // For now, just mark as applied
      await updateRecommendationStatus(recommendationId, 'applied');

      return NextResponse.json({
        success: true,
        message: 'Recommendation approved and will be applied',
        appliedAt: new Date().toISOString(),
      });
    } else {
      await updateRecommendationStatus(recommendationId, 'rejected', rejectionReason);

      return NextResponse.json({
        success: true,
        message: 'Recommendation rejected',
        rejectedAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Error processing recommendation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Bulk actions on recommendations
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { recommendationIds, action } = body;

    if (!Array.isArray(recommendationIds) || recommendationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recommendations selected' },
        { status: 400 }
      );
    }

    const results = [];

    for (const id of recommendationIds) {
      try {
        if (action === 'approve') {
          await updateRecommendationStatus(id, 'applied');
          results.push({ id, status: 'applied' });
        } else if (action === 'reject') {
          await updateRecommendationStatus(id, 'rejected');
          results.push({ id, status: 'rejected' });
        }
      } catch (error) {
        results.push({ id, status: 'error', error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
