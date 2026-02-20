// Google Marketing - Campaign tracking, analysis history, and recommendations
import { turso, executeQuery, executeOne, dateToUnix, unixToDate, parseJSON, stringifyJSON } from '../turso';

// ============================================
// TYPES
// ============================================

export type CampaignPhase = 'new' | 'learning' | 'optimizing' | 'mature' | 'declining';
export type RecommendationType =
  | 'keyword_add'
  | 'keyword_remove'
  | 'keyword_negative'
  | 'bid_adjust'
  | 'budget_adjust'
  | 'ad_copy_refresh'
  | 'targeting_adjust'
  | 'schedule_adjust'
  | 'landing_page'
  | 'extension_add'
  | 'campaign_pause'
  | 'campaign_restructure';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'approved' | 'applied' | 'rejected' | 'auto_applied';

export interface CampaignTracking {
  id: number;
  campaignId: string; // Google Ads campaign ID
  campaignName: string;
  clientId?: string; // For multi-tenant
  phase: CampaignPhase;
  healthScore: number; // 0-100
  startDate: Date;
  lastAnalysisDate?: Date;
  nextAnalysisDate?: Date;
  analysisCount: number;
  baselineMetrics?: {
    ctr: number;
    cpc: number;
    conversions: number;
    conversionRate: number;
    costPerConversion: number;
  };
  currentMetrics?: {
    ctr: number;
    cpc: number;
    conversions: number;
    conversionRate: number;
    costPerConversion: number;
    impressions: number;
    clicks: number;
    cost: number;
  };
  settings?: {
    autoApplyNegativeKeywords: boolean;
    autoApplyLowPerformers: boolean;
    alertThresholdCtr: number;
    alertThresholdCpa: number;
    notifyEmail?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignAnalysis {
  id: number;
  campaignTrackingId: number;
  analysisType: 'scheduled' | 'manual' | 'alert_triggered';
  triggerReason?: string;
  dataSources: {
    googleAds: boolean;
    ga4: boolean;
    searchConsole: boolean;
  };
  metrics: {
    before: Record<string, number>;
    after?: Record<string, number>;
  };
  recommendations: Recommendation[];
  aiInsights: string;
  expertNotes?: {
    projectManager?: string;
    marketing?: string;
    seo?: string;
    ppc?: string;
  };
  appliedActions: AppliedAction[];
  createdAt: Date;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  title: string;
  description: string;
  reasoning: string; // WHY this recommendation
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  data?: Record<string, any>; // Specific data for the action
  appliedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface AppliedAction {
  recommendationId: string;
  type: RecommendationType;
  description: string;
  appliedAt: Date;
  automatic: boolean;
  result: 'success' | 'failed';
  details?: string;
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

export async function initGoogleMarketingTables() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS campaign_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id TEXT NOT NULL UNIQUE,
      campaign_name TEXT NOT NULL,
      client_id TEXT,
      phase TEXT DEFAULT 'new',
      health_score INTEGER DEFAULT 50,
      start_date INTEGER NOT NULL,
      last_analysis_date INTEGER,
      next_analysis_date INTEGER,
      analysis_count INTEGER DEFAULT 0,
      baseline_metrics TEXT,
      current_metrics TEXT,
      settings TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS campaign_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_tracking_id INTEGER NOT NULL,
      analysis_type TEXT NOT NULL,
      trigger_reason TEXT,
      data_sources TEXT,
      metrics TEXT,
      recommendations TEXT,
      ai_insights TEXT,
      expert_notes TEXT,
      applied_actions TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (campaign_tracking_id) REFERENCES campaign_tracking(id)
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS pending_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_tracking_id INTEGER NOT NULL,
      analysis_id INTEGER NOT NULL,
      recommendation_id TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      title TEXT NOT NULL,
      description TEXT,
      reasoning TEXT,
      expected_impact TEXT,
      effort TEXT,
      data TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      applied_at INTEGER,
      rejected_at INTEGER,
      rejection_reason TEXT,
      FOREIGN KEY (campaign_tracking_id) REFERENCES campaign_tracking(id),
      FOREIGN KEY (analysis_id) REFERENCES campaign_analyses(id)
    )
  `);

}

// ============================================
// CAMPAIGN TRACKING
// ============================================

export async function createCampaignTracking(data: {
  campaignId: string;
  campaignName: string;
  clientId?: string;
  startDate?: Date;
}): Promise<CampaignTracking> {
  const startDate = data.startDate || new Date();
  const nextAnalysisDate = new Date(startDate);
  nextAnalysisDate.setDate(nextAnalysisDate.getDate() + 7); // First analysis after 7 days

  const defaultSettings = {
    autoApplyNegativeKeywords: true,
    autoApplyLowPerformers: true,
    alertThresholdCtr: 0.8, // Alert if CTR drops by 20%
    alertThresholdCpa: 1.3, // Alert if CPA increases by 30%
  };

  await turso.execute({
    sql: `INSERT INTO campaign_tracking
          (campaign_id, campaign_name, client_id, phase, start_date, next_analysis_date, settings)
          VALUES (?, ?, ?, 'new', ?, ?, ?)`,
    args: [
      data.campaignId,
      data.campaignName,
      data.clientId || null,
      dateToUnix(startDate),
      dateToUnix(nextAnalysisDate),
      stringifyJSON(defaultSettings),
    ],
  });

  const result = await getCampaignTracking(data.campaignId);
  return result!;
}

export async function getCampaignTracking(campaignId: string): Promise<CampaignTracking | null> {
  const row = await executeOne<any>(
    `SELECT * FROM campaign_tracking WHERE campaign_id = ?`,
    [campaignId]
  );

  if (!row) return null;

  return {
    id: row.id,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    clientId: row.client_id,
    phase: row.phase as CampaignPhase,
    healthScore: row.health_score,
    startDate: unixToDate(row.start_date)!,
    lastAnalysisDate: unixToDate(row.last_analysis_date) || undefined,
    nextAnalysisDate: unixToDate(row.next_analysis_date) || undefined,
    analysisCount: row.analysis_count,
    baselineMetrics: parseJSON(row.baseline_metrics),
    currentMetrics: parseJSON(row.current_metrics),
    settings: parseJSON(row.settings),
    createdAt: unixToDate(row.created_at)!,
    updatedAt: unixToDate(row.updated_at)!,
  };
}

export async function getAllCampaignTracking(): Promise<CampaignTracking[]> {
  const rows = await executeQuery<any>(`SELECT * FROM campaign_tracking ORDER BY created_at DESC`);

  return rows.map(row => ({
    id: row.id,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    clientId: row.client_id,
    phase: row.phase as CampaignPhase,
    healthScore: row.health_score,
    startDate: unixToDate(row.start_date)!,
    lastAnalysisDate: unixToDate(row.last_analysis_date) || undefined,
    nextAnalysisDate: unixToDate(row.next_analysis_date) || undefined,
    analysisCount: row.analysis_count,
    baselineMetrics: parseJSON(row.baseline_metrics),
    currentMetrics: parseJSON(row.current_metrics),
    settings: parseJSON(row.settings),
    createdAt: unixToDate(row.created_at)!,
    updatedAt: unixToDate(row.updated_at)!,
  }));
}

export async function updateCampaignTracking(
  campaignId: string,
  updates: Partial<Omit<CampaignTracking, 'id' | 'campaignId' | 'createdAt'>>
): Promise<void> {
  const sets: string[] = ['updated_at = unixepoch()'];
  const args: any[] = [];

  if (updates.campaignName !== undefined) {
    sets.push('campaign_name = ?');
    args.push(updates.campaignName);
  }
  if (updates.phase !== undefined) {
    sets.push('phase = ?');
    args.push(updates.phase);
  }
  if (updates.healthScore !== undefined) {
    sets.push('health_score = ?');
    args.push(updates.healthScore);
  }
  if (updates.lastAnalysisDate !== undefined) {
    sets.push('last_analysis_date = ?');
    args.push(dateToUnix(updates.lastAnalysisDate));
  }
  if (updates.nextAnalysisDate !== undefined) {
    sets.push('next_analysis_date = ?');
    args.push(dateToUnix(updates.nextAnalysisDate));
  }
  if (updates.analysisCount !== undefined) {
    sets.push('analysis_count = ?');
    args.push(updates.analysisCount);
  }
  if (updates.baselineMetrics !== undefined) {
    sets.push('baseline_metrics = ?');
    args.push(stringifyJSON(updates.baselineMetrics));
  }
  if (updates.currentMetrics !== undefined) {
    sets.push('current_metrics = ?');
    args.push(stringifyJSON(updates.currentMetrics));
  }
  if (updates.settings !== undefined) {
    sets.push('settings = ?');
    args.push(stringifyJSON(updates.settings));
  }

  args.push(campaignId);

  await turso.execute({
    sql: `UPDATE campaign_tracking SET ${sets.join(', ')} WHERE campaign_id = ?`,
    args,
  });
}

export async function getCampaignsDueForAnalysis(): Promise<CampaignTracking[]> {
  const now = Math.floor(Date.now() / 1000);
  const rows = await executeQuery<any>(
    `SELECT * FROM campaign_tracking WHERE next_analysis_date <= ? ORDER BY next_analysis_date ASC`,
    [now]
  );

  return rows.map(row => ({
    id: row.id,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    clientId: row.client_id,
    phase: row.phase as CampaignPhase,
    healthScore: row.health_score,
    startDate: unixToDate(row.start_date)!,
    lastAnalysisDate: unixToDate(row.last_analysis_date) || undefined,
    nextAnalysisDate: unixToDate(row.next_analysis_date) || undefined,
    analysisCount: row.analysis_count,
    baselineMetrics: parseJSON(row.baseline_metrics),
    currentMetrics: parseJSON(row.current_metrics),
    settings: parseJSON(row.settings),
    createdAt: unixToDate(row.created_at)!,
    updatedAt: unixToDate(row.updated_at)!,
  }));
}

// ============================================
// ANALYSIS HISTORY
// ============================================

export async function saveAnalysis(data: {
  campaignTrackingId: number;
  analysisType: 'scheduled' | 'manual' | 'alert_triggered';
  triggerReason?: string;
  dataSources: { googleAds: boolean; ga4: boolean; searchConsole: boolean };
  metrics: { before: Record<string, number>; after?: Record<string, number> };
  recommendations: Recommendation[];
  aiInsights: string;
  expertNotes?: Record<string, string>;
  appliedActions?: AppliedAction[];
}): Promise<number> {
  const result = await turso.execute({
    sql: `INSERT INTO campaign_analyses
          (campaign_tracking_id, analysis_type, trigger_reason, data_sources, metrics,
           recommendations, ai_insights, expert_notes, applied_actions)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.campaignTrackingId,
      data.analysisType,
      data.triggerReason || null,
      stringifyJSON(data.dataSources),
      stringifyJSON(data.metrics),
      stringifyJSON(data.recommendations),
      data.aiInsights,
      stringifyJSON(data.expertNotes) || null,
      stringifyJSON(data.appliedActions || []),
    ],
  });

  return Number(result.lastInsertRowid);
}

export async function getAnalysisHistory(campaignTrackingId: number, limit = 10): Promise<CampaignAnalysis[]> {
  const rows = await executeQuery<any>(
    `SELECT * FROM campaign_analyses WHERE campaign_tracking_id = ? ORDER BY created_at DESC LIMIT ?`,
    [campaignTrackingId, limit]
  );

  return rows.map(row => ({
    id: row.id,
    campaignTrackingId: row.campaign_tracking_id,
    analysisType: row.analysis_type,
    triggerReason: row.trigger_reason,
    dataSources: parseJSON(row.data_sources) || { googleAds: false, ga4: false, searchConsole: false },
    metrics: parseJSON(row.metrics) || { before: {} },
    recommendations: parseJSON(row.recommendations) || [],
    aiInsights: row.ai_insights,
    expertNotes: parseJSON(row.expert_notes),
    appliedActions: parseJSON(row.applied_actions) || [],
    createdAt: unixToDate(row.created_at)!,
  }));
}

// ============================================
// PENDING RECOMMENDATIONS
// ============================================

export async function savePendingRecommendation(data: {
  campaignTrackingId: number;
  analysisId: number;
  recommendation: Recommendation;
}): Promise<void> {
  await turso.execute({
    sql: `INSERT INTO pending_recommendations
          (campaign_tracking_id, analysis_id, recommendation_id, type, priority, status,
           title, description, reasoning, expected_impact, effort, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.campaignTrackingId,
      data.analysisId,
      data.recommendation.id,
      data.recommendation.type,
      data.recommendation.priority,
      data.recommendation.status,
      data.recommendation.title,
      data.recommendation.description,
      data.recommendation.reasoning,
      data.recommendation.expectedImpact,
      data.recommendation.effort,
      stringifyJSON(data.recommendation.data),
    ],
  });
}

export async function getPendingRecommendations(campaignTrackingId?: number): Promise<Recommendation[]> {
  const sql = campaignTrackingId
    ? `SELECT * FROM pending_recommendations WHERE campaign_tracking_id = ? AND status = 'pending' ORDER BY
       CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`
    : `SELECT * FROM pending_recommendations WHERE status = 'pending' ORDER BY
       CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`;

  const args = campaignTrackingId ? [campaignTrackingId] : [];
  const rows = await executeQuery<any>(sql, args);

  return rows.map(row => ({
    id: row.recommendation_id,
    type: row.type as RecommendationType,
    priority: row.priority as RecommendationPriority,
    status: row.status as RecommendationStatus,
    title: row.title,
    description: row.description,
    reasoning: row.reasoning,
    expectedImpact: row.expected_impact,
    effort: row.effort,
    autoApplicable: false,
    data: parseJSON(row.data),
  }));
}

export async function updateRecommendationStatus(
  recommendationId: string,
  status: RecommendationStatus,
  rejectionReason?: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  if (status === 'applied' || status === 'auto_applied') {
    await turso.execute({
      sql: `UPDATE pending_recommendations SET status = ?, applied_at = ?, updated_at = ? WHERE recommendation_id = ?`,
      args: [status, now, now, recommendationId],
    });
  } else if (status === 'rejected') {
    await turso.execute({
      sql: `UPDATE pending_recommendations SET status = ?, rejected_at = ?, rejection_reason = ?, updated_at = ? WHERE recommendation_id = ?`,
      args: [status, now, rejectionReason || null, now, recommendationId],
    });
  } else {
    await turso.execute({
      sql: `UPDATE pending_recommendations SET status = ?, updated_at = ? WHERE recommendation_id = ?`,
      args: [status, now, recommendationId],
    });
  }
}

// ============================================
// HELPER: Calculate Campaign Phase
// ============================================

export function calculateCampaignPhase(tracking: CampaignTracking): CampaignPhase {
  const daysSinceStart = Math.floor((Date.now() - tracking.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const baseline = tracking.baselineMetrics;
  const current = tracking.currentMetrics;

  // New: first 7 days
  if (daysSinceStart < 7) return 'new';

  // Learning: 7-14 days
  if (daysSinceStart < 14) return 'learning';

  if (!baseline || !current) return 'optimizing';

  // Calculate performance trend
  const ctrChange = baseline.ctr > 0 ? (current.ctr - baseline.ctr) / baseline.ctr : 0;
  const cpaChange = baseline.costPerConversion > 0
    ? (current.costPerConversion - baseline.costPerConversion) / baseline.costPerConversion
    : 0;

  // Declining: CTR dropped >20% or CPA increased >30%
  if (ctrChange < -0.2 || cpaChange > 0.3) return 'declining';

  // Mature: stable performance after 30+ days
  if (daysSinceStart > 30 && Math.abs(ctrChange) < 0.1 && Math.abs(cpaChange) < 0.15) {
    return 'mature';
  }

  return 'optimizing';
}

// ============================================
// HELPER: Calculate Health Score
// ============================================

export function calculateHealthScore(tracking: CampaignTracking): number {
  let score = 50; // Base score

  const baseline = tracking.baselineMetrics;
  const current = tracking.currentMetrics;

  if (!current) return score;

  // Factor 1: CTR (0-25 points)
  if (current.ctr >= 0.05) score += 25;
  else if (current.ctr >= 0.03) score += 20;
  else if (current.ctr >= 0.02) score += 15;
  else if (current.ctr >= 0.01) score += 10;
  else score += 5;

  // Factor 2: Conversion Rate (0-25 points)
  if (current.conversionRate >= 0.05) score += 25;
  else if (current.conversionRate >= 0.03) score += 20;
  else if (current.conversionRate >= 0.02) score += 15;
  else if (current.conversionRate >= 0.01) score += 10;
  else score += 5;

  // Factor 3: Trend vs Baseline (0-25 points)
  if (baseline) {
    const ctrTrend = baseline.ctr > 0 ? (current.ctr - baseline.ctr) / baseline.ctr : 0;
    const cpaTrend = baseline.costPerConversion > 0
      ? (current.costPerConversion - baseline.costPerConversion) / baseline.costPerConversion
      : 0;

    if (ctrTrend > 0.1 && cpaTrend < -0.1) score += 25; // Improving
    else if (ctrTrend > 0 && cpaTrend < 0) score += 20;
    else if (Math.abs(ctrTrend) < 0.05 && Math.abs(cpaTrend) < 0.1) score += 15; // Stable
    else if (ctrTrend < -0.1 || cpaTrend > 0.2) score -= 10; // Declining
  } else {
    score += 10; // No baseline yet
  }

  // Factor 4: Volume (0-10 points)
  if (current.clicks >= 100) score += 10;
  else if (current.clicks >= 50) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ============================================
// RECOMMENDATION TYPES INFO
// ============================================

export const RECOMMENDATION_TYPE_INFO: Record<RecommendationType, {
  label: string;
  icon: string;
  description: string;
  autoApplicable: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}> = {
  keyword_add: {
    label: 'Přidat klíčové slovo',
    icon: '➕',
    description: 'Přidat nové klíčové slovo do kampaně',
    autoApplicable: false,
    riskLevel: 'medium',
  },
  keyword_remove: {
    label: 'Odebrat klíčové slovo',
    icon: '➖',
    description: 'Odstranit neefektivní klíčové slovo',
    autoApplicable: true,
    riskLevel: 'low',
  },
  keyword_negative: {
    label: 'Negativní klíčové slovo',
    icon: '🚫',
    description: 'Přidat negativní klíčové slovo pro úsporu rozpočtu',
    autoApplicable: true,
    riskLevel: 'low',
  },
  bid_adjust: {
    label: 'Úprava nabídky',
    icon: '💰',
    description: 'Změnit CPC nabídku pro lepší pozice nebo úsporu',
    autoApplicable: false,
    riskLevel: 'medium',
  },
  budget_adjust: {
    label: 'Úprava rozpočtu',
    icon: '📊',
    description: 'Navýšit nebo snížit denní rozpočet',
    autoApplicable: false,
    riskLevel: 'high',
  },
  ad_copy_refresh: {
    label: 'Obnovit reklamy',
    icon: '✏️',
    description: 'Aktualizovat texty reklam pro lepší CTR',
    autoApplicable: false,
    riskLevel: 'medium',
  },
  targeting_adjust: {
    label: 'Úprava cílení',
    icon: '🎯',
    description: 'Změnit geografické nebo demografické cílení',
    autoApplicable: false,
    riskLevel: 'medium',
  },
  schedule_adjust: {
    label: 'Úprava plánu',
    icon: '🕐',
    description: 'Optimalizovat časy zobrazování reklam',
    autoApplicable: false,
    riskLevel: 'low',
  },
  landing_page: {
    label: 'Landing page',
    icon: '🌐',
    description: 'Doporučení pro vylepšení cílové stránky',
    autoApplicable: false,
    riskLevel: 'medium',
  },
  extension_add: {
    label: 'Přidat rozšíření',
    icon: '📎',
    description: 'Přidat nové rozšíření reklamy',
    autoApplicable: false,
    riskLevel: 'low',
  },
  campaign_pause: {
    label: 'Pozastavit kampaň',
    icon: '⏸️',
    description: 'Dočasně pozastavit neefektivní kampaň',
    autoApplicable: false,
    riskLevel: 'high',
  },
  campaign_restructure: {
    label: 'Restrukturalizace',
    icon: '🔄',
    description: 'Přeorganizovat strukturu kampaně',
    autoApplicable: false,
    riskLevel: 'high',
  },
};
