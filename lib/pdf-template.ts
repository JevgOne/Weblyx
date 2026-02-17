/**
 * @deprecated This file contains the old Puppeteer-based HTML template for PDF generation.
 * It has been replaced by lib/pdf-generator.tsx which uses @react-pdf/renderer.
 * Kept as reference only. Do not use in new code.
 */
import { WebAnalysisResult, PromoCode } from '@/types/cms';

const BRAND_COLOR = '#14B8A6';
const DARK_TEXT = '#0F172A';
const GRAY_TEXT = '#64748B';

function fixCzechChars(text: string): string {
  if (!text) return text;
  const fixes: Record<string, string> = {
    'dorazem': 'důrazem', 'Dorazem': 'Důrazem',
    'tYeba': 'třeba', 'TYeba': 'Třeba',
    'vyYešit': 'vyřešit', 'VyYešit': 'Vyřešit',
    'vyYeší': 'vyřeší', 'VyYeší': 'Vyřeší',
    'Xešení': 'Řešení', 'xešení': 'řešení',
    'PYidat': 'Přidat', 'pYidat': 'přidat',
    'PYepsat': 'Přepsat', 'pYepsat': 'přepsat',
    'naítá': 'načítá', 'Naítá': 'Načítá',
    'natení': 'načtení', 'Natení': 'Načtení',
    'natením': 'načtením', 'Natením': 'Načtením',
    'nkolik': 'několik', 'Nkolik': 'Několik',
    'pYed': 'před', 'PYed': 'Před',
    'Doporuený': 'Doporučený', 'doporuený': 'doporučený',
  };
  let fixed = text;
  for (const [broken, correct] of Object.entries(fixes)) {
    fixed = fixed.replace(new RegExp(broken, 'g'), correct);
  }
  return fixed;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Výborné';
  if (score >= 60) return 'Dobré';
  if (score >= 40) return 'Průměrné';
  return 'Špatné';
}

function checkIcon(ok: boolean): string {
  return ok
    ? '<span style="color: #10B981; font-weight: 800;">✓</span>'
    : '<span style="color: #EF4444; font-weight: 800;">✗</span>';
}

function generateRadarSVG(scores: { seo: number; performance: number; security: number; accessibility: number; social: number; geo: number }): string {
  const labels = ['SEO', 'Performance', 'Security', 'Accessibility', 'Social', 'GEO/AIEO'];
  const values = [scores.seo, scores.performance, scores.security, scores.accessibility, scores.social, scores.geo];
  const cx = 150, cy = 150, r = 120;
  const n = 6;

  // Grid lines
  let grid = '';
  for (let level = 1; level <= 4; level++) {
    const lr = (r * level) / 4;
    let points = '';
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + lr * Math.cos(angle);
      const y = cy + lr * Math.sin(angle);
      points += `${x},${y} `;
    }
    grid += `<polygon points="${points.trim()}" fill="none" stroke="#E2E8F0" stroke-width="1"/>`;
  }

  // Axes
  let axes = '';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E2E8F0" stroke-width="1"/>`;
  }

  // Data polygon
  let dataPoints = '';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const val = (values[i] / 100) * r;
    const x = cx + val * Math.cos(angle);
    const y = cy + val * Math.sin(angle);
    dataPoints += `${x},${y} `;
  }

  // Labels
  let labelElements = '';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const lx = cx + (r + 25) * Math.cos(angle);
    const ly = cy + (r + 25) * Math.sin(angle);
    const anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle';
    labelElements += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle" font-size="10" fill="${GRAY_TEXT}" font-weight="600">${labels[i]} (${values[i]})</text>`;
  }

  return `
    <svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      ${grid}
      ${axes}
      <polygon points="${dataPoints.trim()}" fill="rgba(20, 184, 166, 0.2)" stroke="${BRAND_COLOR}" stroke-width="2.5"/>
      ${labelElements}
    </svg>
  `;
}

export function generatePDFHTML(
  analysis: WebAnalysisResult,
  promoCode?: PromoCode,
  businessName?: string
): string {
  const scores = analysis.categoryScores || { seo: 0, performance: 0, security: 0, accessibility: 0, social: 0, geo: 0 };
  const criticalIssues = analysis.issues?.filter(i => i.category === 'critical') || [];
  const warningIssues = analysis.issues?.filter(i => i.category === 'warning') || [];
  const infoIssues = analysis.issues?.filter(i => i.category === 'info') || [];
  const allIssues = analysis.issues || [];
  const t = analysis.technical;
  const og = analysis.openGraph;
  const acc = analysis.accessibility;
  const geo = analysis.geo;
  const perf = analysis.performance;
  const sec = analysis.security;
  const content = analysis.content;

  const dateStr = new Date(analysis.analyzedAt).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const headerHTML = `
    <div class="header">
      <div class="logo">
        <div class="logo-text"><span class="brand">Web</span><span class="accent">lyx</span></div>
        <div class="logo-tagline">Moderní weby s důrazem na SEO</div>
      </div>
      <div class="header-info">
        <div class="header-title">Analýza Webu</div>
        <div class="header-date">${dateStr}</div>
      </div>
    </div>
  `;

  const footerHTML = `
    <div class="footer">
      <div class="footer-text">Weblyx © ${new Date().getFullYear()} | Moderní weby s důrazem na SEO a výkon | www.weblyx.cz</div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Analýza webu - ${businessName || analysis.url}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: ${DARK_TEXT}; background: white; line-height: 1.6; }
    .page { width: 210mm; min-height: 297mm; padding: 18mm 20mm; margin: 0 auto; background: white; position: relative; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; margin-bottom: 24px; border-bottom: 1px solid #E2E8F0; }
    .logo-text { font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
    .logo-text .brand { color: ${DARK_TEXT}; }
    .logo-text .accent { background: linear-gradient(135deg, #06B6D4, #14B8A6, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .logo-tagline { font-size: 9px; color: ${GRAY_TEXT}; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    .header-info { text-align: right; background: #F8FAFC; padding: 10px 16px; border-radius: 10px; }
    .header-title { font-size: 11px; font-weight: 800; color: ${BRAND_COLOR}; text-transform: uppercase; letter-spacing: 1.5px; }
    .header-date { font-size: 9px; color: ${GRAY_TEXT}; margin-top: 2px; }
    .section-title { font-size: 18px; font-weight: 800; color: ${DARK_TEXT}; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #E2E8F0; }
    .footer { text-align: center; padding-top: 12px; margin-top: auto; border-top: 1px solid #E2E8F0; position: absolute; bottom: 18mm; left: 20mm; right: 20mm; }
    .footer-text { font-size: 9px; color: ${GRAY_TEXT}; }
    .score-card { background: linear-gradient(135deg, rgba(6,182,212,0.05), rgba(20,184,166,0.08)); border-radius: 20px; padding: 40px 32px; text-align: center; margin: 24px 0; border: 2px solid rgba(20,184,166,0.2); }
    .score-number { font-size: 96px; font-weight: 900; line-height: 0.9; margin-bottom: 8px; letter-spacing: -3px; }
    .score-label { font-size: 11px; color: ${GRAY_TEXT}; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .score-badge { display: inline-block; padding: 8px 24px; border-radius: 100px; font-size: 13px; font-weight: 800; margin-top: 12px; color: white; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
    .stat-box { background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px 16px; text-align: center; }
    .stat-number { font-size: 40px; font-weight: 900; line-height: 1; margin-bottom: 6px; }
    .stat-label { font-size: 10px; color: ${GRAY_TEXT}; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0; }
    .category-box { border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; }
    .category-score { font-size: 28px; font-weight: 900; line-height: 1; }
    .category-label { font-size: 10px; color: ${GRAY_TEXT}; font-weight: 600; margin-top: 4px; }
    .radar-container { display: flex; justify-content: center; margin: 16px 0; }
    .issue-card { border-left: 4px solid; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
    .issue-card.critical { border-color: #EF4444; background: #FEF2F2; }
    .issue-card.warning { border-color: #F59E0B; background: #FFFBEB; }
    .issue-card.info { border-color: #3B82F6; background: #EFF6FF; }
    .issue-title { font-size: 13px; font-weight: 800; color: ${DARK_TEXT}; margin-bottom: 4px; }
    .issue-description { font-size: 11px; color: #475569; margin-bottom: 6px; }
    .issue-detail { font-size: 10px; color: #64748B; margin: 4px 0; }
    .issue-detail strong { color: ${DARK_TEXT}; }
    .check-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; font-size: 11px; }
    .check-label { color: ${GRAY_TEXT}; }
    .check-value { font-weight: 600; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .detail-card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .detail-card-title { font-size: 14px; font-weight: 800; margin-bottom: 12px; color: ${DARK_TEXT}; }
    .progress-bar { height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden; margin: 4px 0; }
    .progress-fill { height: 100%; border-radius: 4px; }
    .recommendation-box { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border: 2px solid #10B981; border-radius: 16px; padding: 24px; margin: 16px 0; }
    .recommendation-title { font-size: 16px; font-weight: 900; color: #065F46; margin-bottom: 8px; }
    .recommendation-text { font-size: 12px; color: #047857; margin-bottom: 12px; line-height: 1.6; }
    .recommendation-list { list-style: none; padding: 0; }
    .recommendation-list li { font-size: 11px; color: #047857; padding: 4px 0 4px 20px; position: relative; }
    .recommendation-list li:before { content: '✓'; position: absolute; left: 0; color: #10B981; font-weight: 900; }
    .cta-box { background: linear-gradient(135deg, #06B6D4, #14B8A6, #10B981); border-radius: 20px; padding: 36px 32px; text-align: center; color: white; margin: 24px 0; }
    .cta-title { font-size: 22px; font-weight: 900; margin-bottom: 8px; }
    .cta-text { font-size: 13px; margin-bottom: 20px; opacity: 0.95; }
    .cta-contacts { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 12px; font-weight: 700; }
    .cta-contact { background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 100px; }
    .cover-title { font-size: 28px; font-weight: 800; color: ${DARK_TEXT}; margin: 40px 0 8px; line-height: 1.2; }
    .cover-url { font-size: 14px; color: ${BRAND_COLOR}; font-weight: 600; margin-bottom: 4px; }
    .cover-date { font-size: 11px; color: ${GRAY_TEXT}; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { margin: 0; border: initial; width: initial; min-height: initial; page-break-after: always; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: Cover & Score -->
  <div class="page">
    ${headerHTML}
    <div class="cover-title">${businessName ? `Analýza webu<br>${fixCzechChars(businessName)}` : 'Komplexní analýza webu'}</div>
    <div class="cover-url">${analysis.url}</div>
    <div class="cover-date">Datum analýzy: ${dateStr}</div>

    <div class="score-card">
      <div class="score-number" style="color: ${getScoreColor(analysis.overallScore)}">${analysis.overallScore}</div>
      <div class="score-label">Celkové skóre webu</div>
      <div class="score-badge" style="background-color: ${getScoreColor(analysis.overallScore)}">${getScoreLabel(analysis.overallScore)}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-number" style="color: #EF4444">${criticalIssues.length}</div>
        <div class="stat-label">Kritické problémy</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="color: #F59E0B">${warningIssues.length}</div>
        <div class="stat-label">Varování</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="color: #3B82F6">${infoIssues.length}</div>
        <div class="stat-label">Informace</div>
      </div>
    </div>

    ${analysis.recommendation ? `
    <div class="recommendation-box">
      <div class="recommendation-title">Doporučený balíček: ${fixCzechChars(analysis.recommendation.packageName)}</div>
      <div class="recommendation-text">${fixCzechChars(analysis.recommendation.reasoning)}</div>
      <ul class="recommendation-list">
        ${analysis.recommendation.matchedNeeds?.map(n => `<li>${fixCzechChars(n)}</li>`).join('') || ''}
      </ul>
    </div>
    ` : ''}
    ${footerHTML}
  </div>

  <!-- PAGE 2: Executive Summary - Radar Chart + Category Scores + Top Issues -->
  <div class="page">
    ${headerHTML}
    <div class="section-title">Executive Summary</div>

    <div class="radar-container">
      ${generateRadarSVG(scores)}
    </div>

    <div class="category-grid">
      ${[
        { label: 'SEO', score: scores.seo, icon: '🔍' },
        { label: 'Performance', score: scores.performance, icon: '⚡' },
        { label: 'Security', score: scores.security, icon: '🔒' },
        { label: 'Accessibility', score: scores.accessibility, icon: '♿' },
        { label: 'Social', score: scores.social, icon: '📱' },
        { label: 'GEO/AIEO', score: scores.geo, icon: '🌍' },
      ].map(c => `
        <div class="category-box" style="border-color: ${getScoreColor(c.score)}20; background: ${getScoreColor(c.score)}08;">
          <div style="font-size: 18px; margin-bottom: 4px;">${c.icon}</div>
          <div class="category-score" style="color: ${getScoreColor(c.score)}">${c.score}</div>
          <div class="category-label">${c.label}</div>
        </div>
      `).join('')}
    </div>

    ${criticalIssues.length > 0 ? `
    <div style="margin-top: 20px;">
      <div class="section-title" style="font-size: 15px;">Top kritické problémy</div>
      ${criticalIssues.slice(0, 3).map(issue => `
        <div class="issue-card critical">
          <div class="issue-title">${fixCzechChars(issue.title)}</div>
          <div class="issue-description">${fixCzechChars(issue.description)}</div>
          ${issue.recommendation ? `<div class="issue-detail"><strong>Řešení:</strong> ${fixCzechChars(issue.recommendation)}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    ${footerHTML}
  </div>

  <!-- PAGE 3: SEO Details -->
  <div class="page">
    ${headerHTML}
    <div class="section-title">🔍 SEO Detaily (${scores.seo}/100)</div>

    <div class="two-col">
      <div class="detail-card">
        <div class="detail-card-title">SEO Checklist</div>
        <div class="check-row"><span class="check-label">Title tag</span><span class="check-value">${checkIcon(!!t.title)} ${t.title ? `${t.titleLength || 0} znaků` : 'Chybí'}</span></div>
        <div class="check-row"><span class="check-label">Meta description</span><span class="check-value">${checkIcon(!!t.description)} ${t.description ? `${t.descriptionLength || 0} znaků` : 'Chybí'}</span></div>
        <div class="check-row"><span class="check-label">H1 nadpis</span><span class="check-value">${checkIcon(t.hasH1 && t.h1Count === 1)} ${t.h1Count} ks</span></div>
        <div class="check-row"><span class="check-label">Canonical</span><span class="check-value">${checkIcon(!!t.hasCanonical)}</span></div>
        <div class="check-row"><span class="check-label">Sitemap.xml</span><span class="check-value">${checkIcon(t.hasSitemap)}</span></div>
        <div class="check-row"><span class="check-label">Robots.txt</span><span class="check-value">${checkIcon(t.hasRobotsTxt)}</span></div>
        <div class="check-row"><span class="check-label">SSL/HTTPS</span><span class="check-value">${checkIcon(t.hasSSL)}</span></div>
        <div class="check-row"><span class="check-label">Viewport meta</span><span class="check-value">${checkIcon(t.mobileResponsive)}</span></div>
        <div class="check-row"><span class="check-label">Schema markup</span><span class="check-value">${checkIcon(t.schemaMarkup)}</span></div>
        <div class="check-row"><span class="check-label">Heading hierarchie</span><span class="check-value">${checkIcon(!!t.headingHierarchyValid)}</span></div>
        <div class="check-row"><span class="check-label">Alt texty</span><span class="check-value">${checkIcon(t.imagesWithoutAlt === 0)} ${t.imagesWithoutAlt}/${t.totalImages}</span></div>
      </div>
      <div>
        <div class="detail-card">
          <div class="detail-card-title">Title (${t.titleLength || 0} znaků)</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(100, ((t.titleLength || 0) / 70) * 100)}%; background: ${(t.titleLength || 0) >= 50 && (t.titleLength || 0) <= 60 ? '#10B981' : '#F59E0B'}"></div>
          </div>
          <div style="font-size: 10px; color: ${GRAY_TEXT}; margin-top: 4px;">Ideální: 50-60 znaků</div>
        </div>
        <div class="detail-card">
          <div class="detail-card-title">Description (${t.descriptionLength || 0} znaků)</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(100, ((t.descriptionLength || 0) / 200) * 100)}%; background: ${(t.descriptionLength || 0) >= 150 && (t.descriptionLength || 0) <= 160 ? '#10B981' : '#F59E0B'}"></div>
          </div>
          <div style="font-size: 10px; color: ${GRAY_TEXT}; margin-top: 4px;">Ideální: 150-160 znaků</div>
        </div>
        ${t.keywordDensity && t.keywordDensity.length > 0 ? `
        <div class="detail-card">
          <div class="detail-card-title">Top klíčová slova</div>
          ${t.keywordDensity.slice(0, 5).map(kw => `
            <div class="check-row"><span class="check-label">${kw.word}</span><span class="check-value">${kw.count}× (${kw.percentage}%)</span></div>
          `).join('')}
        </div>
        ` : ''}
        <div class="detail-card">
          <div class="detail-card-title">Technické</div>
          <div class="check-row"><span class="check-label">Text/HTML poměr</span><span class="check-value">${t.textHtmlRatio || 0}%</span></div>
          <div class="check-row"><span class="check-label">Interní odkazy</span><span class="check-value">${t.internalLinks}</span></div>
          <div class="check-row"><span class="check-label">Externí odkazy</span><span class="check-value">${t.externalLinks}</span></div>
          ${t.structuredDataTypes && t.structuredDataTypes.length > 0 ? `
          <div class="check-row"><span class="check-label">Schema types</span><span class="check-value">${t.structuredDataTypes.join(', ')}</span></div>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-card-title">Struktura nadpisů</div>
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; text-align: center;">
        ${(['h1','h2','h3','h4','h5','h6'] as const).map(h => `
          <div style="background: #F8FAFC; border-radius: 8px; padding: 8px;">
            <div style="font-size: 10px; color: ${GRAY_TEXT}; text-transform: uppercase;">${h}</div>
            <div style="font-size: 20px; font-weight: 900;">${t.headingsStructure[h]}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ${footerHTML}
  </div>

  <!-- PAGE 4: Performance & Security -->
  <div class="page">
    ${headerHTML}
    <div class="section-title">⚡ Performance & 🔒 Security</div>

    <div class="two-col">
      ${perf ? `
      <div class="detail-card">
        <div class="detail-card-title">Performance (${perf.estimatedScore}/100)</div>
        <div style="text-align: center; margin: 12px 0;">
          <div style="font-size: 48px; font-weight: 900; color: ${getScoreColor(perf.estimatedScore)}">${perf.estimatedScore}</div>
        </div>
        <div class="check-row"><span class="check-label">Celkem zdrojů</span><span class="check-value">${perf.totalResources}</span></div>
        <div class="check-row"><span class="check-label">Odhadovaná velikost</span><span class="check-value">${perf.totalResourcesSize > 1024 ? `${(perf.totalResourcesSize / 1024).toFixed(1)} MB` : `${perf.totalResourcesSize} KB`}</span></div>
        <div class="check-row"><span class="check-label">Komprese</span><span class="check-value">${checkIcon(perf.hasCompression)}</span></div>
        <div class="check-row"><span class="check-label">Cache headers</span><span class="check-value">${checkIcon(perf.hasCaching)}</span></div>
        <div class="check-row"><span class="check-label">Velké obrázky</span><span class="check-value">${perf.largeImages}</span></div>
        <div class="check-row"><span class="check-label">Čas načtení</span><span class="check-value">${t.loadTime}ms</span></div>
      </div>
      ` : ''}

      ${sec ? `
      <div class="detail-card">
        <div class="detail-card-title">Security (${sec.securityScore}/100)</div>
        <div style="text-align: center; margin: 12px 0;">
          <div style="font-size: 48px; font-weight: 900; color: ${getScoreColor(sec.securityScore)}">${sec.securityScore}</div>
        </div>
        <div class="check-row"><span class="check-label">HSTS</span><span class="check-value">${checkIcon(sec.headers.strictTransportSecurity)}</span></div>
        <div class="check-row"><span class="check-label">CSP</span><span class="check-value">${checkIcon(sec.headers.contentSecurityPolicy)}</span></div>
        <div class="check-row"><span class="check-label">X-Frame-Options</span><span class="check-value">${checkIcon(sec.headers.xFrameOptions)}</span></div>
        <div class="check-row"><span class="check-label">X-Content-Type</span><span class="check-value">${checkIcon(sec.headers.xContentTypeOptions)}</span></div>
        <div class="check-row"><span class="check-label">Referrer-Policy</span><span class="check-value">${checkIcon(sec.headers.referrerPolicy)}</span></div>
        <div class="check-row"><span class="check-label">HTTPS redirect</span><span class="check-value">${checkIcon(sec.httpsRedirect)}</span></div>
        <div class="check-row"><span class="check-label">Mixed content</span><span class="check-value">${checkIcon(!sec.mixedContent)} ${sec.mixedContent ? 'Ano (problém)' : 'Ne'}</span></div>
      </div>
      ` : ''}
    </div>
    ${footerHTML}
  </div>

  <!-- PAGE 5: Content & Accessibility -->
  <div class="page">
    ${headerHTML}
    <div class="section-title">📝 Content & ♿ Accessibility</div>

    ${content ? `
    <div class="detail-card">
      <div class="detail-card-title">Analýza obsahu</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; margin-bottom: 12px;">
        <div>
          <div style="font-size: 24px; font-weight: 900;">${content.wordCount}</div>
          <div style="font-size: 10px; color: ${GRAY_TEXT};">Slov</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 900; color: ${getScoreColor(content.readabilityScore)}">${content.readabilityScore}</div>
          <div style="font-size: 10px; color: ${GRAY_TEXT};">Readability</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 900;">${content.sentenceCount}</div>
          <div style="font-size: 10px; color: ${GRAY_TEXT};">Vět</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 900;">${content.paragraphCount}</div>
          <div style="font-size: 10px; color: ${GRAY_TEXT};">Odstavců</div>
        </div>
      </div>
      <div class="check-row"><span class="check-label">Úroveň čitelnosti</span><span class="check-value">${content.readabilityLevel}</span></div>
      <div class="check-row"><span class="check-label">Průměr slov/věta</span><span class="check-value">${content.averageWordsPerSentence}</span></div>
    </div>
    ` : ''}

    ${acc ? `
    <div class="detail-card">
      <div class="detail-card-title">Accessibility (${acc.accessibilityScore}/100)</div>
      <div style="text-align: center; margin: 8px 0;">
        <span style="font-size: 36px; font-weight: 900; color: ${getScoreColor(acc.accessibilityScore)}">${acc.accessibilityScore}</span>
        <span style="font-size: 14px; color: ${GRAY_TEXT};"> / 100</span>
      </div>
      <div class="two-col">
        <div>
          <div class="check-row"><span class="check-label">Lang atribut</span><span class="check-value">${checkIcon(!!acc.htmlLangAttribute)} ${acc.htmlLangAttribute || 'Chybí'}</span></div>
          <div class="check-row"><span class="check-label">Skip navigace</span><span class="check-value">${checkIcon(acc.hasSkipNavigation)}</span></div>
          <div class="check-row"><span class="check-label">Hierarchie nadpisů</span><span class="check-value">${checkIcon(acc.headingHierarchyValid)}</span></div>
          <div class="check-row"><span class="check-label">Prázdné odkazy</span><span class="check-value">${checkIcon(acc.emptyLinksCount === 0)} ${acc.emptyLinksCount}</span></div>
          <div class="check-row"><span class="check-label">Prázdná tlačítka</span><span class="check-value">${checkIcon(acc.emptyButtonsCount === 0)} ${acc.emptyButtonsCount}</span></div>
        </div>
        <div>
          <div class="check-row"><span class="check-label">ARIA labels</span><span class="check-value">${acc.ariaLabelsCount}</span></div>
          <div class="check-row"><span class="check-label">ARIA landmarks</span><span class="check-value">${acc.ariaLandmarksCount}</span></div>
          <div class="check-row"><span class="check-label">Form inputs</span><span class="check-value">${acc.formInputsTotal}</span></div>
          <div class="check-row"><span class="check-label">Labels přiřazené</span><span class="check-value">${acc.formLabelsAssociated}/${acc.formInputsTotal}</span></div>
          <div class="check-row"><span class="check-label">Tabindex</span><span class="check-value">${acc.tabindexUsage}</span></div>
        </div>
      </div>
      ${acc.issues.length > 0 ? `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E2E8F0;">
        <div style="font-size: 11px; font-weight: 700; margin-bottom: 6px;">Zjištěné problémy:</div>
        ${acc.issues.map(i => `<div style="font-size: 10px; color: #EF4444; margin: 2px 0;">✗ ${i}</div>`).join('')}
      </div>
      ` : ''}
    </div>
    ` : ''}
    ${footerHTML}
  </div>

  <!-- PAGE 6: Social & GEO/AIEO -->
  <div class="page">
    ${headerHTML}
    <div class="section-title">📱 Social & 🌍 GEO/AIEO</div>

    ${og ? `
    <div class="detail-card">
      <div class="detail-card-title">Open Graph & Social (${og.socialScore}/100)</div>
      <div class="two-col">
        <div>
          <div style="font-size: 11px; font-weight: 700; margin-bottom: 8px;">OG tagy:</div>
          <div class="check-row"><span class="check-label">og:title</span><span class="check-value">${checkIcon(!!og.ogTitle)}</span></div>
          <div class="check-row"><span class="check-label">og:description</span><span class="check-value">${checkIcon(!!og.ogDescription)}</span></div>
          <div class="check-row"><span class="check-label">og:image</span><span class="check-value">${checkIcon(!!og.ogImage)}</span></div>
          <div class="check-row"><span class="check-label">og:type</span><span class="check-value">${checkIcon(!!og.ogType)}</span></div>
          <div class="check-row"><span class="check-label">og:url</span><span class="check-value">${checkIcon(!!og.ogUrl)}</span></div>
          <div class="check-row"><span class="check-label">og:site_name</span><span class="check-value">${checkIcon(!!og.ogSiteName)}</span></div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; margin-bottom: 8px;">Twitter Card:</div>
          <div class="check-row"><span class="check-label">twitter:card</span><span class="check-value">${checkIcon(!!og.twitterCard)}</span></div>
          <div class="check-row"><span class="check-label">twitter:title</span><span class="check-value">${checkIcon(!!og.twitterTitle)}</span></div>
          <div class="check-row"><span class="check-label">twitter:description</span><span class="check-value">${checkIcon(!!og.twitterDescription)}</span></div>
          <div class="check-row"><span class="check-label">twitter:image</span><span class="check-value">${checkIcon(!!og.twitterImage)}</span></div>
          <div style="font-size: 11px; font-weight: 700; margin: 12px 0 8px;">Sociální sítě:</div>
          ${Object.entries(og.socialLinks).map(([platform, url]) => `
            <div class="check-row"><span class="check-label" style="text-transform: capitalize;">${platform}</span><span class="check-value">${checkIcon(!!url)}</span></div>
          `).join('')}
        </div>
      </div>
    </div>
    ` : ''}

    ${geo ? `
    <div class="detail-card">
      <div class="detail-card-title">GEO / AIEO (${geo.geoScore}/100)</div>
      <div class="two-col">
        <div>
          <div style="font-size: 11px; font-weight: 700; margin-bottom: 8px;">Strukturovaná data:</div>
          <div class="check-row"><span class="check-label">LocalBusiness</span><span class="check-value">${checkIcon(geo.hasLocalBusinessSchema)}</span></div>
          <div class="check-row"><span class="check-label">Organization</span><span class="check-value">${checkIcon(geo.hasOrganizationSchema)}</span></div>
          <div class="check-row"><span class="check-label">Product</span><span class="check-value">${checkIcon(geo.hasProductSchema)}</span></div>
          <div class="check-row"><span class="check-label">BreadcrumbList</span><span class="check-value">${checkIcon(geo.hasBreadcrumbSchema)}</span></div>
          <div style="font-size: 11px; font-weight: 700; margin: 12px 0 8px;">Obsah pro AI:</div>
          <div class="check-row"><span class="check-label">FAQ sekce</span><span class="check-value">${checkIcon(geo.hasFaqSection)}</span></div>
          <div class="check-row"><span class="check-label">Q&A formát</span><span class="check-value">${checkIcon(geo.hasQaFormat)}</span></div>
          <div class="check-row"><span class="check-label">O nás stránka</span><span class="check-value">${checkIcon(geo.hasAboutPage)}</span></div>
          <div class="check-row"><span class="check-label">Kontakt stránka</span><span class="check-value">${checkIcon(geo.hasContactPage)}</span></div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; margin-bottom: 8px;">Firemní informace:</div>
          <div class="check-row"><span class="check-label">Adresa</span><span class="check-value">${checkIcon(geo.businessInfo.hasAddress)}</span></div>
          <div class="check-row"><span class="check-label">Telefon</span><span class="check-value">${checkIcon(geo.businessInfo.hasPhone)}</span></div>
          <div class="check-row"><span class="check-label">Email</span><span class="check-value">${checkIcon(geo.businessInfo.hasEmail)}</span></div>
          <div class="check-row"><span class="check-label">Otevírací doba</span><span class="check-value">${checkIcon(geo.businessInfo.hasOpeningHours)}</span></div>
          <div class="check-row"><span class="check-label">Ceník/Ceny</span><span class="check-value">${checkIcon(geo.businessInfo.hasPricing)}</span></div>
          <div style="font-size: 11px; font-weight: 700; margin: 12px 0 8px;">Aktuálnost:</div>
          <div class="check-row"><span class="check-label">Copyright rok</span><span class="check-value">${geo.contentFreshness.copyrightYear || 'N/A'}</span></div>
          <div class="check-row"><span class="check-label">datePublished</span><span class="check-value">${checkIcon(geo.contentFreshness.hasDatePublished)}</span></div>
          ${geo.schemaTypes.length > 0 ? `
          <div style="margin-top: 8px; font-size: 10px; color: ${GRAY_TEXT};">Schema: ${geo.schemaTypes.join(', ')}</div>
          ` : ''}
        </div>
      </div>
    </div>
    ` : ''}
    ${footerHTML}
  </div>

  <!-- PAGE 7: All Issues & Recommendations -->
  <div class="page">
    ${headerHTML}
    <div class="section-title">Všechny problémy & doporučení (${allIssues.length})</div>

    ${allIssues.slice(0, 12).map(issue => `
      <div class="issue-card ${issue.category}">
        <div class="issue-title">${fixCzechChars(issue.title)}</div>
        <div class="issue-description">${fixCzechChars(issue.description)}</div>
        ${issue.recommendation ? `<div class="issue-detail"><strong>Řešení:</strong> ${fixCzechChars(issue.recommendation)}</div>` : ''}
      </div>
    `).join('')}

    ${allIssues.length > 12 ? `
    <div style="text-align: center; padding: 12px; color: ${GRAY_TEXT}; font-size: 11px;">
      ... a dalších ${allIssues.length - 12} problémů
    </div>
    ` : ''}
    ${footerHTML}
  </div>

  <!-- PAGE 8: About Weblyx + CTA -->
  <div class="page">
    ${headerHTML}
    <div class="section-title">Proč Weblyx?</div>

    <div style="margin: 20px 0;">
      <div class="detail-card" style="background: linear-gradient(135deg, #F0FDFA, #CCFBF1);">
        <div class="detail-card-title" style="font-size: 18px;">Moderní weby s důrazem na SEO a výkon</div>
        <div style="font-size: 12px; color: #047857; line-height: 1.8; margin-bottom: 16px;">
          Weblyx vytváří webové stránky na míru s využitím nejmodernějších technologií.
          Naše weby jsou rychlé, bezpečné a optimalizované pro vyhledávače.
        </div>
        <div class="two-col">
          <div>
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px;">Co nabízíme:</div>
            <ul class="recommendation-list">
              <li>Next.js pro maximální rychlost</li>
              <li>Kompletní SEO optimalizace</li>
              <li>Responzivní design pro všechna zařízení</li>
              <li>Bezpečnostní standardy</li>
              <li>CMS pro snadnou správu obsahu</li>
              <li>Technická podpora</li>
            </ul>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 8px;">Výhody:</div>
            <ul class="recommendation-list">
              <li>Načítání pod 2 sekundy</li>
              <li>SEO optimalizace zdarma</li>
              <li>Férové ceny bez skrytých poplatků</li>
              <li>Dodání do týdne</li>
              <li>Moderní technologie (2025)</li>
              <li>Osobní přístup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    ${promoCode ? `
    <div style="background: #FFFBEB; border: 3px dashed #F59E0B; border-radius: 16px; padding: 24px; text-align: center; margin: 20px 0;">
      <div style="font-size: 16px; font-weight: 700; color: #92400E; margin-bottom: 8px;">Speciální nabídka pro vás</div>
      <div style="font-size: 11px; color: #78350F; margin-bottom: 12px;">${promoCode.description || 'Využijte našeho speciálního promo kódu'}</div>
      <div style="font-size: 32px; font-weight: 800; color: #F59E0B; letter-spacing: 4px; font-family: monospace; padding: 12px 24px; background: white; border-radius: 8px; display: inline-block; margin: 8px 0;">${promoCode.code}</div>
      <div style="font-size: 10px; color: #78350F; margin-top: 12px;">
        ${promoCode.discountType === 'percentage' ? `Sleva ${promoCode.discountValue}%` : `Sleva ${promoCode.discountValue} Kč`}
        · Platnost do ${new Date(promoCode.validUntil).toLocaleDateString('cs-CZ')}
      </div>
    </div>
    ` : ''}

    <div class="cta-box">
      <div class="cta-title">Nezávazná konzultace zdarma</div>
      <div class="cta-text">Rádi s vámi probereme výsledky analýzy a navrhneme řešení na míru vašemu podnikání.</div>
      <div class="cta-contacts">
        <div class="cta-contact">info@weblyx.cz</div>
        <div class="cta-contact">+420 702 110 166</div>
        <div class="cta-contact">www.weblyx.cz</div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <div style="font-size: 11px; color: ${GRAY_TEXT}; margin-bottom: 4px;">Tento report byl vygenerován automaticky nástrojem Weblyx Web Analyzer.</div>
      <div style="font-size: 11px; color: ${GRAY_TEXT};">Data odrážejí stav webu k datu analýzy a mohou se měnit.</div>
    </div>
    ${footerHTML}
  </div>

</body>
</html>
  `;
}
