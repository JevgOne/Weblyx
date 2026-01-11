// Turso EroWeb Analysis Data Access Layer
import { executeQuery, executeOne, dateToUnix, unixToDate, parseJSON, stringifyJSON } from '../turso';
import type {
  EroWebAnalysis,
  AnalysisScores,
  AnalysisDetails,
  Finding,
  BusinessType,
  PackageType,
  AnalysisStatus,
  AnalysisFormData,
} from '@/types/eroweb';

// Generate unique ID
function generateId(): string {
  return `ero_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Map database row to EroWebAnalysis type
function mapRowToAnalysis(row: any): EroWebAnalysis {
  return {
    id: row.id,
    url: row.url,
    domain: row.domain,
    businessType: row.business_type as BusinessType,
    status: row.status as AnalysisStatus,
    analyzedAt: unixToDate(row.analyzed_at),
    scores: {
      speed: row.speed_score || 0,
      mobile: row.mobile_score || 0,
      security: row.security_score || 0,
      seo: row.seo_score || 0,
      geo: row.geo_score || 0,
      design: row.design_score || 0,
      total: row.total_score || 0,
    },
    details: parseJSON<AnalysisDetails>(row.details) || {} as AnalysisDetails,
    findings: parseJSON<Finding[]>(row.findings) || [],
    recommendation: row.recommendation || '',
    recommendedPackage: row.recommended_package as PackageType,
    screenshotUrl: row.screenshot_url,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    emailSent: Boolean(row.email_sent),
    emailSentAt: unixToDate(row.email_sent_at),
    emailOpened: Boolean(row.email_opened),
    emailOpenedAt: unixToDate(row.email_opened_at),
    notes: row.notes,
    createdAt: unixToDate(row.created_at) || new Date(),
    updatedAt: unixToDate(row.updated_at) || new Date(),
  };
}

/**
 * Create a new analysis record (pending state)
 */
export async function createAnalysis(data: AnalysisFormData): Promise<EroWebAnalysis> {
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);
  const domain = new URL(data.url).hostname.replace('www.', '');

  await executeQuery(
    `INSERT INTO eroweb_analyses (
      id, url, domain, business_type, status,
      contact_name, contact_email,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.url,
      domain,
      data.businessType,
      'pending',
      data.contactName || null,
      data.contactEmail || null,
      now,
      now,
    ]
  );

  const analysis = await getAnalysisById(id);
  if (!analysis) throw new Error('Failed to create analysis');
  return analysis;
}

/**
 * Get analysis by ID
 */
export async function getAnalysisById(id: string): Promise<EroWebAnalysis | null> {
  const row = await executeOne<any>(
    'SELECT * FROM eroweb_analyses WHERE id = ?',
    [id]
  );

  if (!row) return null;
  return mapRowToAnalysis(row);
}

/**
 * Get analysis by domain
 */
export async function getAnalysisByDomain(domain: string): Promise<EroWebAnalysis | null> {
  const row = await executeOne<any>(
    'SELECT * FROM eroweb_analyses WHERE domain = ? ORDER BY created_at DESC LIMIT 1',
    [domain.replace('www.', '')]
  );

  if (!row) return null;
  return mapRowToAnalysis(row);
}

/**
 * Get all analyses with pagination
 */
export async function getAllAnalyses(
  options: {
    limit?: number;
    offset?: number;
    status?: AnalysisStatus;
    businessType?: BusinessType;
    orderBy?: 'created_at' | 'total_score' | 'domain';
    orderDir?: 'ASC' | 'DESC';
  } = {}
): Promise<{ analyses: EroWebAnalysis[]; total: number }> {
  const {
    limit = 20,
    offset = 0,
    status,
    businessType,
    orderBy = 'created_at',
    orderDir = 'DESC',
  } = options;

  // Build WHERE clause
  const conditions: string[] = [];
  const params: any[] = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (businessType) {
    conditions.push('business_type = ?');
    params.push(businessType);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await executeOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM eroweb_analyses ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get paginated results
  const rows = await executeQuery<any>(
    `SELECT * FROM eroweb_analyses ${whereClause}
     ORDER BY ${orderBy} ${orderDir}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    analyses: rows.map(mapRowToAnalysis),
    total,
  };
}

/**
 * Update analysis status
 */
export async function updateAnalysisStatus(
  id: string,
  status: AnalysisStatus
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await executeQuery(
    `UPDATE eroweb_analyses
     SET status = ?, updated_at = ?
     WHERE id = ?`,
    [status, now, id]
  );
}

/**
 * Save analysis results
 */
export async function saveAnalysisResults(
  id: string,
  data: {
    scores: AnalysisScores;
    details: AnalysisDetails;
    findings: Finding[];
    recommendation: string;
    recommendedPackage: PackageType;
    screenshotUrl?: string | null;
  }
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await executeQuery(
    `UPDATE eroweb_analyses
     SET status = 'completed',
         analyzed_at = ?,
         speed_score = ?,
         mobile_score = ?,
         security_score = ?,
         seo_score = ?,
         geo_score = ?,
         design_score = ?,
         total_score = ?,
         details = ?,
         findings = ?,
         recommendation = ?,
         recommended_package = ?,
         screenshot_url = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      now,
      data.scores.speed,
      data.scores.mobile,
      data.scores.security,
      data.scores.seo,
      data.scores.geo,
      data.scores.design,
      data.scores.total,
      stringifyJSON(data.details),
      stringifyJSON(data.findings),
      data.recommendation,
      data.recommendedPackage,
      data.screenshotUrl || null,
      now,
      id,
    ]
  );
}

/**
 * Mark analysis as failed
 */
export async function markAnalysisFailed(
  id: string,
  errorMessage?: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await executeQuery(
    `UPDATE eroweb_analyses
     SET status = 'failed',
         notes = ?,
         updated_at = ?
     WHERE id = ?`,
    [errorMessage || 'Analysis failed', now, id]
  );
}

/**
 * Update email sent status
 */
export async function markEmailSent(id: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await executeQuery(
    `UPDATE eroweb_analyses
     SET email_sent = 1,
         email_sent_at = ?,
         updated_at = ?
     WHERE id = ?`,
    [now, now, id]
  );
}

/**
 * Update email opened status
 */
export async function markEmailOpened(id: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await executeQuery(
    `UPDATE eroweb_analyses
     SET email_opened = 1,
         email_opened_at = ?,
         updated_at = ?
     WHERE id = ?`,
    [now, now, id]
  );
}

/**
 * Update contact info
 */
export async function updateContactInfo(
  id: string,
  contactName: string | null,
  contactEmail: string | null
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await executeQuery(
    `UPDATE eroweb_analyses
     SET contact_name = ?,
         contact_email = ?,
         updated_at = ?
     WHERE id = ?`,
    [contactName, contactEmail, now, id]
  );
}

/**
 * Update admin notes
 */
export async function updateNotes(id: string, notes: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await executeQuery(
    `UPDATE eroweb_analyses
     SET notes = ?,
         updated_at = ?
     WHERE id = ?`,
    [notes, now, id]
  );
}

/**
 * Delete analysis
 */
export async function deleteAnalysis(id: string): Promise<void> {
  await executeQuery(
    'DELETE FROM eroweb_analyses WHERE id = ?',
    [id]
  );
}

/**
 * Get statistics
 */
export async function getAnalysisStats(): Promise<{
  total: number;
  completed: number;
  pending: number;
  failed: number;
  emailsSent: number;
  avgScore: number;
  byBusinessType: Record<BusinessType, number>;
  byPackage: Record<PackageType, number>;
}> {
  // Total counts by status
  const statusCounts = await executeQuery<{ status: string; count: number }>(
    `SELECT status, COUNT(*) as count
     FROM eroweb_analyses
     GROUP BY status`
  );

  const statusMap: Record<string, number> = {};
  statusCounts.forEach(row => {
    statusMap[row.status] = row.count;
  });

  // Emails sent
  const emailResult = await executeOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM eroweb_analyses WHERE email_sent = 1'
  );

  // Average score
  const avgResult = await executeOne<{ avg: number }>(
    'SELECT AVG(total_score) as avg FROM eroweb_analyses WHERE status = ?',
    ['completed']
  );

  // By business type
  const byTypeCounts = await executeQuery<{ business_type: string; count: number }>(
    `SELECT business_type, COUNT(*) as count
     FROM eroweb_analyses
     GROUP BY business_type`
  );

  const byBusinessType: Record<BusinessType, number> = {
    massage: 0,
    privat: 0,
    escort: 0,
  };
  byTypeCounts.forEach(row => {
    byBusinessType[row.business_type as BusinessType] = row.count;
  });

  // By recommended package
  const byPkgCounts = await executeQuery<{ recommended_package: string; count: number }>(
    `SELECT recommended_package, COUNT(*) as count
     FROM eroweb_analyses
     WHERE recommended_package IS NOT NULL
     GROUP BY recommended_package`
  );

  const byPackage: Record<PackageType, number> = {
    basic: 0,
    premium: 0,
    enterprise: 0,
  };
  byPkgCounts.forEach(row => {
    if (row.recommended_package) {
      byPackage[row.recommended_package as PackageType] = row.count;
    }
  });

  return {
    total: Object.values(statusMap).reduce((a, b) => a + b, 0),
    completed: statusMap['completed'] || 0,
    pending: statusMap['pending'] || 0,
    failed: statusMap['failed'] || 0,
    emailsSent: emailResult?.count || 0,
    avgScore: Math.round(avgResult?.avg || 0),
    byBusinessType,
    byPackage,
  };
}

/**
 * Get recent analyses
 */
export async function getRecentAnalyses(limit: number = 10): Promise<EroWebAnalysis[]> {
  const rows = await executeQuery<any>(
    `SELECT * FROM eroweb_analyses
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map(mapRowToAnalysis);
}

/**
 * Search analyses by domain
 */
export async function searchAnalyses(query: string): Promise<EroWebAnalysis[]> {
  const rows = await executeQuery<any>(
    `SELECT * FROM eroweb_analyses
     WHERE domain LIKE ? OR url LIKE ? OR contact_name LIKE ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );

  return rows.map(mapRowToAnalysis);
}

/**
 * Get today's analysis count (for rate limiting)
 */
export async function getTodayAnalysisCount(): Promise<number> {
  const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

  const result = await executeOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM eroweb_analyses WHERE created_at >= ?',
    [startOfDay]
  );

  return result?.count || 0;
}
