import { NextRequest, NextResponse } from 'next/server';
import { adminDbInstance } from '@/lib/firebase-admin';
import { WebAnalysisResult, PromoCode } from '@/types/cms';
import { generatePDFHTML } from '@/lib/pdf-template';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { analysisId, includePromo, businessName } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    if (!adminDbInstance) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    // Fetch analysis
    let analysis: WebAnalysisResult | null = null;

    if (typeof adminDbInstance.collection === 'function') {
      // Mock Firebase
      const doc = await adminDbInstance.collection('web_analyses').doc(analysisId).get();
      if (doc.exists) {
        analysis = { id: doc.id, ...doc.data() } as WebAnalysisResult;
      }
    } else {
      // Real Firebase
      const { doc, getDoc } = await import('firebase/firestore');
      const db = adminDbInstance as any;
      const docRef = doc(db, 'web_analyses', analysisId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        analysis = { id: docSnap.id, ...docSnap.data() } as WebAnalysisResult;
      }
    }

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Optionally fetch promo code
    let promoCode: PromoCode | undefined;
    if (includePromo && analysis.promoCodeId) {
      if (typeof adminDbInstance.collection === 'function') {
        const promoDoc = await adminDbInstance.collection('promo_codes').doc(analysis.promoCodeId).get();
        if (promoDoc.exists) {
          promoCode = { id: promoDoc.id, ...promoDoc.data() } as PromoCode;
        }
      } else {
        const { doc, getDoc } = await import('firebase/firestore');
        const db = adminDbInstance as any;
        const promoRef = doc(db, 'promo_codes', analysis.promoCodeId);
        const promoSnap = await getDoc(promoRef);
        if (promoSnap.exists()) {
          promoCode = { id: promoSnap.id, ...promoSnap.data() } as PromoCode;
        }
      }
    }

    // Generate HTML
    const html = generatePDFHTML(
      analysis,
      promoCode,
      businessName || analysis.businessName
    );

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    await browser.close();

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="web-analysis-${analysisId}.pdf"`,
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
