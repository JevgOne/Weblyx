// EroWeb Analysis API - List and Create
// GET /api/eroweb - List all analyses with pagination
// POST /api/eroweb - Create new analysis (minimal, without running)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAllAnalyses,
  createAnalysis,
  getRecentAnalyses,
  searchAnalyses,
} from '@/lib/turso/eroweb';
import type { BusinessType, AnalysisStatus } from '@/types/eroweb';

// GET - List analyses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query params
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') as AnalysisStatus | null;
    const businessType = searchParams.get('businessType') as BusinessType | null;
    const search = searchParams.get('search');
    const recent = searchParams.get('recent') === 'true';

    // If search query provided
    if (search) {
      const results = await searchAnalyses(search);
      return NextResponse.json({
        success: true,
        analyses: results,
        total: results.length,
      });
    }

    // If recent flag set
    if (recent) {
      const results = await getRecentAnalyses(limit);
      return NextResponse.json({
        success: true,
        analyses: results,
        total: results.length,
      });
    }

    // Get paginated results
    const { analyses, total } = await getAllAnalyses({
      limit,
      offset,
      status: status || undefined,
      businessType: businessType || undefined,
      orderBy: 'created_at',
      orderDir: 'DESC',
    });

    return NextResponse.json({
      success: true,
      analyses,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + analyses.length < total,
      },
    });

  } catch (error: any) {
    console.error('EroWeb list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses', details: error.message },
      { status: 500 }
    );
  }
}

// Create schema for minimal creation
const CreateSchema = z.object({
  url: z.string().url('Invalid URL format'),
  businessType: z.enum(['massage', 'privat', 'escort']),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

// POST - Create new analysis record (pending state)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = CreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { url, businessType, contactName, contactEmail } = validationResult.data;

    const analysis = await createAnalysis({
      url,
      businessType,
      contactName: contactName || undefined,
      contactEmail: contactEmail || undefined,
    });

    return NextResponse.json({
      success: true,
      analysis,
    }, { status: 201 });

  } catch (error: any) {
    console.error('EroWeb create error:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis', details: error.message },
      { status: 500 }
    );
  }
}
