import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/web-analyzer';

// Rate limiting: simple in-memory store
const recentRequests = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 request per minute per IP

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, email, name } = body;

    if (!url || !email) {
      return NextResponse.json(
        { success: false, error: 'URL a email jsou povinné' },
        { status: 400 }
      );
    }

    // Basic rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const lastRequest = recentRequests.get(ip);
    if (lastRequest && Date.now() - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json(
        { success: false, error: 'Příliš mnoho požadavků. Zkuste to za minutu.' },
        { status: 429 }
      );
    }
    recentRequests.set(ip, Date.now());

    // Run the analysis
    const analysis = await analyzeWebsite(url);

    // Send results via contact API (reuse existing email infrastructure)
    const auditSummary = formatAuditSummary(analysis, url);

    await fetch(new URL('/api/contact', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || 'Audit request',
        email: email,
        phone: '',
        subject: `🔍 Audit webu: ${url}`,
        message: auditSummary,
        type: 'audit',
      }),
    });

    // Return simplified results to show on the page
    return NextResponse.json({
      success: true,
      data: {
        url: analysis.url,
        performance: analysis.performance,
        seo: analysis.seo,
        accessibility: analysis.accessibility,
        security: analysis.security,
        issues: analysis.issues?.slice(0, 10) || [],
        recommendations: analysis.recommendations?.slice(0, 5) || [],
      },
    });
  } catch (error: any) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { success: false, error: 'Analýza selhala. Zkontrolujte URL a zkuste to znovu.' },
      { status: 500 }
    );
  }
}

function formatAuditSummary(analysis: any, url: string): string {
  const perf = analysis.performance;
  const seo = analysis.seo;
  const sec = analysis.security;

  let summary = `=== AUDIT WEBU: ${url} ===\n\n`;

  if (perf) {
    summary += `📊 VÝKON\n`;
    summary += `  PageSpeed skóre: ${perf.score || 'N/A'}/100\n`;
    summary += `  Načítání: ${perf.loadTime ? perf.loadTime + 'ms' : 'N/A'}\n`;
    summary += `  Velikost stránky: ${perf.pageSize ? Math.round(perf.pageSize / 1024) + 'KB' : 'N/A'}\n\n`;
  }

  if (seo) {
    summary += `🔍 SEO\n`;
    summary += `  Skóre: ${seo.score || 'N/A'}/100\n`;
    summary += `  Title: ${seo.title ? '✅' : '❌'}\n`;
    summary += `  Meta description: ${seo.metaDescription ? '✅' : '❌'}\n`;
    summary += `  H1: ${seo.h1 ? '✅' : '❌'}\n\n`;
  }

  if (sec) {
    summary += `🔒 BEZPEČNOST\n`;
    summary += `  HTTPS: ${sec.https ? '✅' : '❌'}\n\n`;
  }

  if (analysis.issues?.length > 0) {
    summary += `⚠️ NALEZENÉ PROBLÉMY (${analysis.issues.length}):\n`;
    analysis.issues.slice(0, 10).forEach((issue: any, i: number) => {
      summary += `  ${i + 1}. [${issue.severity}] ${issue.title}: ${issue.description}\n`;
    });
  }

  return summary;
}
