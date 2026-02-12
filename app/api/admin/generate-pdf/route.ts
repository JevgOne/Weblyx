import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { WebAnalysisReport } from '@/lib/pdf-generator';
import { WebAnalysisResult, PromoCode } from '@/types/cms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis, promoCode, businessName } = body as {
      analysis: WebAnalysisResult;
      promoCode?: PromoCode;
      businessName?: string;
    };

    if (!analysis || !analysis.url) {
      return NextResponse.json(
        { success: false, error: 'Missing analysis data' },
        { status: 400 }
      );
    }

    // Generate PDF using @react-pdf/renderer (same pattern as EroWeb)
    const pdfDoc = React.createElement(WebAnalysisReport, {
      analysis,
      promoCode,
      businessName,
    });
    const pdfBlob = await pdf(pdfDoc as any).toBlob();
    const pdfBuffer = await pdfBlob.arrayBuffer();

    const filename = `web-analysis-${new URL(analysis.url).hostname}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate PDF'
      },
      { status: 500 }
    );
  }
}
