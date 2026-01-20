// EroWeb Analysis API - Main Analysis Endpoint
// POST /api/eroweb/analyze - Run full website analysis

import { NextRequest, NextResponse } from 'next/server';

// Increase timeout for this route (Vercel Pro: max 60s, Hobby: max 10s)
export const maxDuration = 60; // seconds
import { z } from 'zod';
import {
  createAnalysis,
  saveAnalysisResults,
  updateAnalysisStatus,
  markAnalysisFailed,
  getTodayAnalysisCount,
} from '@/lib/turso/eroweb';
import {
  getPageSpeedMetrics,
  checkSecurityBasics,
  checkUrlExists,
  fetchHtml,
} from '@/lib/eroweb/pagespeed';
import { parseHtml, buildAnalysisDetails } from '@/lib/eroweb/html-parser';
import { calculateAllScores } from '@/lib/eroweb/scoring';
import { generateFindings } from '@/lib/eroweb/findings';
import { generateRecommendation } from '@/lib/eroweb/recommendations';
import { getRecommendedPackage } from '@/types/eroweb';
import type { BusinessType } from '@/types/eroweb';
import type { FindingLocale } from '@/lib/eroweb/finding-translations';

// Validation schema
const AnalyzeSchema = z.object({
  url: z.string().url('Invalid URL format'),
  businessType: z.enum(['massage', 'privat', 'escort']),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  language: z.enum(['cs', 'en', 'de', 'ru']).optional().default('cs'),
});

// Rate limit: 20 analyses per day
const DAILY_LIMIT = 20;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = AnalyzeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { url, businessType, contactName, contactEmail, language } = validationResult.data;
    const lang = language as FindingLocale;

    // Check rate limit
    const todayCount = await getTodayAnalysisCount();
    if (todayCount >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Denní limit analýz vyčerpán. Zkuste to zítra.' },
        { status: 429 }
      );
    }

    // Create analysis record (pending state)
    const analysis = await createAnalysis({
      url,
      businessType,
      contactName: contactName || undefined,
      contactEmail: contactEmail || undefined,
    });

    // Update status to analyzing
    await updateAnalysisStatus(analysis.id, 'analyzing');

    try {
      // Parallel fetch of data
      const origin = new URL(url).origin;

      const [
        html,
        pageSpeedMetrics,
        securityData,
        hasSitemap,
        hasRobotsTxt,
      ] = await Promise.all([
        fetchHtml(url),
        getPageSpeedMetrics(url, 'mobile'),
        checkSecurityBasics(url),
        checkUrlExists(`${origin}/sitemap.xml`),
        checkUrlExists(`${origin}/robots.txt`),
      ]);

      // Parse HTML
      const parsedHtml = parseHtml(html, url);

      // Build analysis details
      const details = buildAnalysisDetails(
        parsedHtml,
        pageSpeedMetrics,
        securityData,
        hasSitemap,
        hasRobotsTxt
      );

      // Calculate scores
      const scores = calculateAllScores(details);

      // Generate findings (with language support)
      const findings = generateFindings(details, businessType, lang);

      // Determine recommended package
      const recommendedPackage = getRecommendedPackage(
        businessType,
        scores.total,
        details.hasBookingSystem
      );

      // Generate recommendation text (with language support)
      const recommendation = generateRecommendation(
        scores,
        businessType,
        recommendedPackage,
        lang
      );

      // Save results
      await saveAnalysisResults(analysis.id, {
        scores,
        details,
        findings,
        recommendation,
        recommendedPackage,
        screenshotUrl: null, // TODO: Add screenshot service
      });

      // Return updated analysis
      return NextResponse.json({
        success: true,
        analysisId: analysis.id,
        url,
        domain: analysis.domain,
        businessType,
        scores,
        findings: findings.slice(0, 10), // Return top 10 findings
        recommendation,
        recommendedPackage,
      });

    } catch (analysisError: any) {
      console.error('Analysis processing error:', analysisError);

      // Mark as failed
      await markAnalysisFailed(
        analysis.id,
        analysisError.message || 'Analysis processing failed'
      );

      return NextResponse.json(
        {
          error: 'Analýza selhala',
          details: analysisError.message,
          analysisId: analysis.id,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('EroWeb analyze error:', error);

    return NextResponse.json(
      { error: 'Nastala chyba při analýze', details: error.message },
      { status: 500 }
    );
  }
}
