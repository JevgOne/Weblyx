// EroWeb Analysis API - Single Analysis Operations
// GET /api/eroweb/[id] - Get analysis by ID
// PATCH /api/eroweb/[id] - Update analysis (notes, contact info)
// DELETE /api/eroweb/[id] - Delete analysis

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAnalysisById,
  updateContactInfo,
  updateNotes,
  updateContactStatus,
  deleteAnalysis,
  markEmailSent,
  markEmailOpened,
} from '@/lib/turso/eroweb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single analysis
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const analysis = await getAnalysisById(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analýza nenalezena' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });

  } catch (error: any) {
    console.error('EroWeb get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis', details: error.message },
      { status: 500 }
    );
  }
}

// Update schema
const UpdateSchema = z.object({
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  contactStatus: z.enum(['not_contacted', 'contacted', 'agreed', 'no_response']).optional(),
  markEmailSent: z.boolean().optional(),
  markEmailOpened: z.boolean().optional(),
});

// PATCH - Update analysis
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const validationResult = UpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if analysis exists
    const existing = await getAnalysisById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Analýza nenalezena' },
        { status: 404 }
      );
    }

    // Update contact info if provided
    if (data.contactName !== undefined || data.contactEmail !== undefined) {
      await updateContactInfo(
        id,
        data.contactName ?? existing.contactName,
        data.contactEmail ?? existing.contactEmail
      );
    }

    // Update notes if provided
    if (data.notes !== undefined) {
      await updateNotes(id, data.notes);
    }

    // Update contact status if provided
    if (data.contactStatus !== undefined) {
      await updateContactStatus(id, data.contactStatus);
    }

    // Mark email sent
    if (data.markEmailSent) {
      await markEmailSent(id);
    }

    // Mark email opened
    if (data.markEmailOpened) {
      await markEmailOpened(id);
    }

    // Return updated analysis
    const updated = await getAnalysisById(id);

    return NextResponse.json({
      success: true,
      analysis: updated,
    });

  } catch (error: any) {
    console.error('EroWeb update error:', error);
    return NextResponse.json(
      { error: 'Failed to update analysis', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete analysis
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if analysis exists
    const existing = await getAnalysisById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Analýza nenalezena' },
        { status: 404 }
      );
    }

    await deleteAnalysis(id);

    return NextResponse.json({
      success: true,
      message: 'Analýza smazána',
    });

  } catch (error: any) {
    console.error('EroWeb delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis', details: error.message },
      { status: 500 }
    );
  }
}
