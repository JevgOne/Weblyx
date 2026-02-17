import { NextRequest, NextResponse } from 'next/server';
import { WebAnalysisResult } from '@/types/cms';
import { generatePDFHTML } from '@/lib/pdf-template';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { analysis, businessName } = await request.json();

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Analysis data is required' },
        { status: 400 }
      );
    }

    // Generate HTML from analysis data (inline, no database needed)
    const html = generatePDFHTML(analysis as WebAnalysisResult, undefined, businessName);

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="web-analysis-${businessName || 'report'}.pdf"`,
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
