import { NextRequest, NextResponse } from 'next/server';
import { importLeadsFromCSV, generateCSVTemplate } from '@/lib/csv-import';

/**
 * POST /api/lead-generation/import
 * Import leads from CSV content
 *
 * Body: { csvContent: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid CSV content',
        },
        { status: 400 }
      );
    }

    // Import leads from CSV
    const result = await importLeadsFromCSV(csvContent);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('POST /api/lead-generation/import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import leads from CSV',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lead-generation/import?template=true
 * Get CSV template
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isTemplate = searchParams.get('template') === 'true';

    if (!isTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Use template=true query parameter to get CSV template',
        },
        { status: 400 }
      );
    }

    const template = generateCSVTemplate();

    return new NextResponse(template, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leads-template.csv"',
      },
    });
  } catch (error: any) {
    console.error('GET /api/lead-generation/import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CSV template',
      },
      { status: 500 }
    );
  }
}
