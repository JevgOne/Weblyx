import { NextRequest, NextResponse } from 'next/server';
import { adminDbInstance } from '@/lib/firebase-admin';
import { WebAnalysisResult, PromoCode } from '@/types/cms';
import { generatePDFHTML } from '@/lib/pdf-template';
import puppeteer from 'puppeteer';

// Fix broken Czech characters caused by Firebase encoding issues
function fixCzechEncoding(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return obj
      .replace(/dorazem/g, 'důrazem')
      .replace(/Doporuený/g, 'Doporučený')
      .replace(/nkolik/g, 'několik')
      .replace(/tYeba/g, 'třeba')
      .replace(/vyYešit/g, 'vyřešit')
      .replace(/Xešení/g, 'Řešení')
      .replace(/PYidat/g, 'Přidat')
      .replace(/naítání/g, 'načítání')
      .replace(/natením/g, 'načtením')
      .replace(/naítá/g, 'načítá')
      .replace(/natení/g, 'načtení')
      .replace(/PYepsat/g, 'Přepsat')
      .replace(/XešeníO/g, 'Řešení:O')
      .replace(/XešeníI/g, 'Řešení:I')
      .replace(/XešeníP/g, 'Řešení:P')
      .replace(/PYídat/g, 'Přidat')
      .replace(/PYídat popisný/g, 'Přidat popisný')
      .replace(/PYepsat všechny/g, 'Přepsat všechny')
      .replace(/nemá ALT/g, 'nemá ALT')
      .replace(/obrázko/g, 'obrázků')
      .replace(/naítá HTTP/g, 'načítá HTTP')
      .replace(/voi/g, 'vůči')
      .replace(/bezpe/g, 'bezpe')
      .replace(/nostní/g, 'nostní');
  }
  if (Array.isArray(obj)) {
    return obj.map(item => fixCzechEncoding(item));
  }
  if (typeof obj === 'object') {
    const fixed: any = {};
    for (const key in obj) {
      fixed[key] = fixCzechEncoding(obj[key]);
    }
    return fixed;
  }
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Migrate web_analyses to Turso if PDF generation is needed
    // For now, this feature is disabled as web analyses are not stored
    return NextResponse.json(
      { success: false, error: 'PDF generation not available - web analyses database not configured' },
      { status: 501 }
    );
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
