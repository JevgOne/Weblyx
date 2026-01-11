// EroWeb Analysis API - PDF Export
// GET /api/eroweb/pdf?id=xxx - Generate PDF report

import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/turso/eroweb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Missing analysis ID' },
        { status: 400 }
      );
    }

    const analysis = await getAnalysisById(analysisId);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // For now, generate a simple HTML-based PDF
    // In production, use @react-pdf/renderer or puppeteer
    const htmlContent = generatePdfHtml(analysis);

    // Return HTML for now - can be converted to PDF on client or with puppeteer
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="eroweb-analyza-${analysis.domain}.html"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}

function generatePdfHtml(analysis: any): string {
  const {
    domain,
    url,
    businessType,
    scores,
    findings,
    recommendation,
    recommendedPackage,
    createdAt,
  } = analysis;

  const getScoreColor = (score: number): string => {
    if (score <= 30) return '#EF4444';
    if (score <= 50) return '#F97316';
    if (score <= 70) return '#F59E0B';
    if (score <= 85) return '#10B981';
    return '#22C55E';
  };

  const businessTypeLabels: Record<string, string> = {
    massage: 'Eroticke masaze',
    privat: 'Privat / Klub',
    escort: 'Escort',
  };

  const categoryLabels: Record<string, { label: string; max: number }> = {
    speed: { label: 'Rychlost', max: 20 },
    mobile: { label: 'Mobilni verze', max: 15 },
    security: { label: 'Zabezpeceni', max: 10 },
    seo: { label: 'SEO', max: 20 },
    geo: { label: 'GEO/AIEO', max: 15 },
    design: { label: 'Design', max: 20 },
  };

  const criticalFindings = (findings || []).filter((f: any) => f.type === 'critical');
  const warningFindings = (findings || []).filter((f: any) => f.type === 'warning');
  const opportunityFindings = (findings || []).filter((f: any) => f.type === 'opportunity');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EroWeb Analyza - ${domain}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0F0F0F;
      color: #FFFFFF;
      line-height: 1.6;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 30px;
      border-bottom: 1px solid #2A2A2A;
      margin-bottom: 30px;
    }
    .logo { font-size: 24px; font-weight: bold; color: #7C3AED; }
    .date { color: #71717A; font-size: 14px; }
    .domain-section {
      background: #1A1A1A;
      border: 1px solid #2A2A2A;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .domain-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .domain-url { color: #A1A1AA; font-size: 14px; }
    .business-type {
      display: inline-block;
      background: #252525;
      border: 1px solid #2A2A2A;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      color: #A1A1AA;
      margin-top: 12px;
    }
    .score-section {
      text-align: center;
      padding: 40px 0;
    }
    .score-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      border: 8px solid;
    }
    .score-number {
      font-size: 48px;
      font-weight: bold;
    }
    .score-label {
      font-size: 18px;
      font-weight: 500;
    }
    .categories {
      background: #1A1A1A;
      border: 1px solid #2A2A2A;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .category-row {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    .category-label {
      width: 120px;
      color: #A1A1AA;
      font-size: 14px;
    }
    .category-bar {
      flex: 1;
      height: 8px;
      background: #252525;
      border-radius: 4px;
      overflow: hidden;
      margin: 0 12px;
    }
    .category-fill {
      height: 100%;
      border-radius: 4px;
    }
    .category-score {
      width: 60px;
      text-align: right;
      font-size: 14px;
      font-weight: 500;
    }
    .findings-section {
      background: #1A1A1A;
      border: 1px solid #2A2A2A;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .finding {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .finding-critical { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #EF4444; }
    .finding-warning { background: rgba(245, 158, 11, 0.1); border-left: 4px solid #F59E0B; }
    .finding-opportunity { background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3B82F6; }
    .finding-title { font-weight: 500; margin-bottom: 4px; }
    .finding-description { color: #A1A1AA; font-size: 14px; margin-bottom: 4px; }
    .finding-impact { color: #71717A; font-size: 13px; }
    .recommendation {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), #1A1A1A);
      border: 1px solid rgba(124, 58, 237, 0.5);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #2A2A2A;
      color: #71717A;
      font-size: 14px;
    }
    .footer a { color: #7C3AED; text-decoration: none; }
    .contact-info { margin-top: 16px; }
    @media print {
      body { background: white; color: black; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div>
        <div class="logo">Weblyx.cz</div>
        <div style="color: #A1A1AA; font-size: 14px;">EroWeb Analyza</div>
      </div>
      <div class="date">${new Date(createdAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}</div>
    </header>

    <div class="domain-section">
      <div class="domain-title">${domain}</div>
      <div class="domain-url">${url}</div>
      <div class="business-type">${businessTypeLabels[businessType] || businessType}</div>
    </div>

    <div class="score-section">
      <div class="score-circle" style="border-color: ${getScoreColor(scores.total)}">
        <span class="score-number" style="color: ${getScoreColor(scores.total)}">${scores.total}</span>
      </div>
      <div class="score-label" style="color: ${getScoreColor(scores.total)}">
        ${scores.total <= 30 ? 'Kriticky stav' : scores.total <= 50 ? 'Podprumerny' : scores.total <= 70 ? 'Prumerny' : scores.total <= 85 ? 'Dobry' : 'Vyborny'}
      </div>
    </div>

    <div class="categories">
      <div class="section-title">Hodnoceni podle kategorii</div>
      ${Object.entries(categoryLabels)
        .map(([key, { label, max }]) => {
          const score = scores[key] || 0;
          const percentage = (score / max) * 100;
          return `
          <div class="category-row">
            <div class="category-label">${label}</div>
            <div class="category-bar">
              <div class="category-fill" style="width: ${percentage}%; background: ${getScoreColor((score / max) * 100)}"></div>
            </div>
            <div class="category-score">${score}/${max}</div>
          </div>
          `;
        })
        .join('')}
    </div>

    ${
      criticalFindings.length > 0
        ? `
    <div class="findings-section">
      <div class="section-title" style="color: #EF4444;">Kriticke problemy</div>
      ${criticalFindings
        .map(
          (f: any) => `
        <div class="finding finding-critical">
          <div class="finding-title">${f.title}</div>
          <div class="finding-description">${f.description}</div>
          <div class="finding-impact">Dopad: ${f.impact}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }

    ${
      warningFindings.length > 0
        ? `
    <div class="findings-section">
      <div class="section-title" style="color: #F59E0B;">Varovani</div>
      ${warningFindings
        .map(
          (f: any) => `
        <div class="finding finding-warning">
          <div class="finding-title">${f.title}</div>
          <div class="finding-description">${f.description}</div>
          <div class="finding-impact">Dopad: ${f.impact}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }

    ${
      opportunityFindings.length > 0
        ? `
    <div class="findings-section">
      <div class="section-title" style="color: #3B82F6;">Prilezitosti</div>
      ${opportunityFindings
        .slice(0, 3)
        .map(
          (f: any) => `
        <div class="finding finding-opportunity">
          <div class="finding-title">${f.title}</div>
          <div class="finding-description">${f.description}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
        : ''
    }

    ${
      recommendation
        ? `
    <div class="recommendation">
      <div class="section-title">Nase doporuceni</div>
      <p style="color: #A1A1AA; white-space: pre-wrap;">${recommendation}</p>
    </div>
    `
        : ''
    }

    <footer class="footer">
      <div><strong>Weblyx.cz</strong> - Moderni weby pro moderni byznys</div>
      <div class="contact-info">
        <a href="mailto:info@weblyx.cz">info@weblyx.cz</a> |
        <a href="tel:+420702110166">+420 702 110 166</a> |
        <a href="https://weblyx.cz">weblyx.cz</a>
      </div>
      <div style="margin-top: 16px; font-size: 12px;">
        Altro Servis Group s.r.o. | ICO: 23673389
      </div>
    </footer>
  </div>
</body>
</html>`;
}
