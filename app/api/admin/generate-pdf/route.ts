import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { WebAnalysisReport } from '@/lib/pdf-generator';
import { adminDbInstance } from '@/lib/firebase-admin';
import { WebAnalysisResult, PromoCode } from '@/types/cms';

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
      const docRef = doc(adminDbInstance, 'web_analyses', analysisId);
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
        const promoRef = doc(adminDbInstance, 'promo_codes', analysis.promoCodeId);
        const promoSnap = await getDoc(promoRef);
        if (promoSnap.exists()) {
          promoCode = { id: promoSnap.id, ...promoSnap.data() } as PromoCode;
        }
      }
    }

    // Generate PDF
    const stream = await renderToStream(
      WebAnalysisReport({
        analysis,
        promoCode,
        businessName: businessName || analysis.businessName,
      })
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF
    return new NextResponse(buffer, {
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
