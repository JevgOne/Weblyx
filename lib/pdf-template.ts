import { WebAnalysisResult, PromoCode } from '@/types/cms';

// Weblyx Brand Colors
const BRAND_COLOR = '#14B8A6';
const BRAND_GRADIENT = 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)';
const DARK_TEXT = '#0F172A';
const GRAY_TEXT = '#64748B';

// Fix broken Czech characters from database encoding issues
function fixCzechChars(text: string): string {
  if (!text) return text;

  const fixes: Record<string, string> = {
    'dorazem': 'důrazem',
    'Dorazem': 'Důrazem',
    'tYeba': 'třeba',
    'TYeba': 'Třeba',
    'vyYešit': 'vyřešit',
    'VyYešit': 'Vyřešit',
    'vyYeší': 'vyřeší',
    'VyYeší': 'Vyřeší',
    'Xešení': 'Řešení',
    'xešení': 'řešení',
    'PYidat': 'Přidat',
    'pYidat': 'přidat',
    'PYepsat': 'Přepsat',
    'pYepsat': 'přepsat',
    'naítá': 'načítá',
    'Naítá': 'Načítá',
    'natení': 'načtení',
    'Natení': 'Načtení',
    'natením': 'načtením',
    'Natením': 'Načtením',
    'nkolik': 'několik',
    'Nkolik': 'Několik',
    'pYed': 'před',
    'PYed': 'Před',
    'Doporuený': 'Doporučený',
    'doporuený': 'doporučený',
  };

  let fixed = text;
  for (const [broken, correct] of Object.entries(fixes)) {
    fixed = fixed.replace(new RegExp(broken, 'g'), correct);
  }

  return fixed;
}

export function generatePDFHTML(
  analysis: WebAnalysisResult,
  promoCode?: PromoCode,
  businessName?: string
): string {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#F97316';
    return '#EF4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Výborné';
    if (score >= 60) return 'Dobré';
    if (score >= 40) return 'Průměrné';
    return 'Špatné';
  };

  const criticalIssues = analysis.issues?.filter(i => i.category === 'critical') || [];
  const warningIssues = analysis.issues?.filter(i => i.category === 'warning') || [];
  const infoIssues = analysis.issues?.filter(i => i.category === 'info') || [];

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analýza webu - ${businessName || analysis.url}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
      color: ${DARK_TEXT};
      background: white;
      line-height: 1.6;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
      position: relative;
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 4px solid ${BRAND_COLOR};
      margin-bottom: 40px;
    }

    .logo {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .logo-text {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .logo-text .brand {
      color: ${DARK_TEXT};
    }

    .logo-text .accent {
      background: ${BRAND_GRADIENT};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-tagline {
      font-size: 11px;
      color: ${GRAY_TEXT};
      font-weight: 500;
    }

    .header-info {
      text-align: right;
    }

    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: ${BRAND_COLOR};
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .header-date {
      font-size: 11px;
      color: ${GRAY_TEXT};
      margin-top: 4px;
    }

    /* Cover Page */
    .cover-title {
      font-size: 32px;
      font-weight: 800;
      color: ${DARK_TEXT};
      margin: 60px 0 10px 0;
      line-height: 1.2;
    }

    .cover-url {
      font-size: 16px;
      color: ${BRAND_COLOR};
      font-weight: 600;
      margin-bottom: 8px;
    }

    .cover-date {
      font-size: 13px;
      color: ${GRAY_TEXT};
    }

    /* Score Card */
    .score-card {
      background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      margin: 40px 0;
      border: 2px solid #E2E8F0;
    }

    .score-number {
      font-size: 96px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 12px;
    }

    .score-label {
      font-size: 14px;
      color: ${GRAY_TEXT};
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .score-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 12px;
      color: white;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 40px 0;
    }

    .stat-box {
      background: white;
      border: 2px solid #E2E8F0;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }

    .stat-number {
      font-size: 48px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 12px;
      color: ${GRAY_TEXT};
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Recommendation Box */
    .recommendation-box {
      background: linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%);
      border: 2px solid ${BRAND_COLOR};
      border-radius: 16px;
      padding: 32px;
      margin: 40px 0;
    }

    .recommendation-title {
      font-size: 24px;
      font-weight: 800;
      color: ${DARK_TEXT};
      margin-bottom: 16px;
    }

    .recommendation-text {
      font-size: 14px;
      color: #0F766E;
      margin-bottom: 20px;
      line-height: 1.7;
    }

    .recommendation-list {
      list-style: none;
      padding: 0;
    }

    .recommendation-list li {
      font-size: 13px;
      color: #0F766E;
      padding: 8px 0;
      padding-left: 28px;
      position: relative;
    }

    .recommendation-list li:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${BRAND_COLOR};
      font-weight: 700;
      font-size: 16px;
    }

    /* Issue Cards */
    .issues-section {
      margin: 40px 0;
    }

    .section-title {
      font-size: 22px;
      font-weight: 800;
      color: ${DARK_TEXT};
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #E2E8F0;
    }

    .issue-card {
      border-left: 4px solid;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      background: white;
    }

    .issue-card.critical {
      border-color: #EF4444;
      background: #FEF2F2;
    }

    .issue-card.warning {
      border-color: #F59E0B;
      background: #FFFBEB;
    }

    .issue-card.info {
      border-color: #3B82F6;
      background: #EFF6FF;
    }

    .issue-title {
      font-size: 15px;
      font-weight: 700;
      color: ${DARK_TEXT};
      margin-bottom: 8px;
    }

    .issue-description {
      font-size: 13px;
      color: #475569;
      margin-bottom: 12px;
      line-height: 1.6;
    }

    .issue-detail {
      font-size: 12px;
      color: #64748B;
      margin: 6px 0;
      line-height: 1.5;
    }

    .issue-detail strong {
      color: ${DARK_TEXT};
      font-weight: 600;
    }

    /* Promo Box */
    .promo-box {
      background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
      border: 3px dashed #F59E0B;
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      margin: 40px 0;
    }

    .promo-title {
      font-size: 18px;
      font-weight: 700;
      color: #92400E;
      margin-bottom: 12px;
    }

    .promo-description {
      font-size: 13px;
      color: #78350F;
      margin-bottom: 20px;
    }

    .promo-code {
      font-size: 36px;
      font-weight: 800;
      color: #F59E0B;
      letter-spacing: 4px;
      font-family: 'Courier New', monospace;
      padding: 16px 32px;
      background: white;
      border-radius: 8px;
      display: inline-block;
      margin: 12px 0;
    }

    .promo-details {
      font-size: 12px;
      color: #78350F;
      margin-top: 16px;
    }

    /* CTA Box */
    .cta-box {
      background: ${BRAND_GRADIENT};
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      color: white;
      margin: 40px 0;
    }

    .cta-title {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 12px;
    }

    .cta-text {
      font-size: 14px;
      margin-bottom: 24px;
      opacity: 0.95;
    }

    .cta-contacts {
      display: flex;
      justify-content: center;
      gap: 32px;
      flex-wrap: wrap;
      font-size: 13px;
      font-weight: 600;
    }

    .cta-contact {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding-top: 20px;
      margin-top: 40px;
      border-top: 1px solid #E2E8F0;
    }

    .footer-text {
      font-size: 10px;
      color: ${GRAY_TEXT};
    }

    /* Technical Details */
    .technical-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 20px 0;
    }

    .technical-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #F1F5F9;
      font-size: 12px;
    }

    .technical-label {
      color: ${GRAY_TEXT};
      font-weight: 500;
    }

    .technical-value {
      color: ${DARK_TEXT};
      font-weight: 600;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .page {
        margin: 0;
        border: initial;
        border-radius: initial;
        width: initial;
        min-height: initial;
        box-shadow: initial;
        background: initial;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Page 1: Cover & Summary -->
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-text">
          <span class="brand">Web</span><span class="accent">lyx</span>
        </div>
        <div class="logo-tagline">Moderní weby s důrazem na SEO</div>
      </div>
      <div class="header-info">
        <div class="header-title">Analýza Webu</div>
        <div class="header-date">${new Date(analysis.analyzedAt).toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}</div>
      </div>
    </div>

    <div class="cover-title">${businessName ? `Analýza webu<br>${businessName}` : 'Analýza webu'}</div>
    <div class="cover-url">${analysis.url}</div>
    <div class="cover-date">Datum analýzy: ${new Date(analysis.analyzedAt).toLocaleDateString('cs-CZ')}</div>

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
      <div class="recommendation-title">💡 Doporučený balíček: ${fixCzechChars(analysis.recommendation.packageName)}</div>
      <div class="recommendation-text">${fixCzechChars(analysis.recommendation.reasoning)}</div>
      <ul class="recommendation-list">
        ${analysis.recommendation.matchedNeeds?.map(need => `<li>${fixCzechChars(need)}</li>`).join('') || ''}
      </ul>
    </div>
    ` : ''}

    ${promoCode ? `
    <div class="promo-box">
      <div class="promo-title">🎁 Speciální nabídka pro vás</div>
      <div class="promo-description">${promoCode.description || 'Využijte našeho speciálního promo kódu'}</div>
      <div class="promo-code">${promoCode.code}</div>
      <div class="promo-details">
        ${promoCode.discountType === 'percentage' ? `Sleva ${promoCode.discountValue}%` : `Sleva ${promoCode.discountValue} Kč`}
        · Platnost do ${new Date(promoCode.validUntil).toLocaleDateString('cs-CZ')}
      </div>
    </div>
    ` : ''}

    <div class="cta-box">
      <div class="cta-title">📞 Ozvěte se nám!</div>
      <div class="cta-text">Rádi s vámi probereme výsledky analýzy a navrhneme řešení na míru</div>
      <div class="cta-contacts">
        <div class="cta-contact">📧 info@weblyx.cz</div>
        <div class="cta-contact">📞 +420 702 110 166</div>
        <div class="cta-contact">🌐 www.weblyx.cz</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">Weblyx © ${new Date().getFullYear()} | Moderní weby s důrazem na SEO a výkon</div>
    </div>
  </div>

  <!-- Page 2: Critical Issues -->
  ${criticalIssues.length > 0 ? `
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-text">
          <span class="brand">Web</span><span class="accent">lyx</span>
        </div>
      </div>
      <div class="header-info">
        <div class="header-title">Analýza Webu</div>
      </div>
    </div>

    <div class="issues-section">
      <div class="section-title">🚨 Kritické problémy</div>
      ${criticalIssues.map(issue => `
        <div class="issue-card critical">
          <div class="issue-title">${fixCzechChars(issue.title)}</div>
          <div class="issue-description">${fixCzechChars(issue.description)}</div>
          ${issue.impact ? `<div class="issue-detail"><strong>Dopad:</strong> ${fixCzechChars(issue.impact)}</div>` : ''}
          ${issue.recommendation ? `<div class="issue-detail"><strong>Řešení:</strong> ${fixCzechChars(issue.recommendation)}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <div class="footer-text">Weblyx © ${new Date().getFullYear()} | www.weblyx.cz | info@weblyx.cz</div>
    </div>
  </div>
  ` : ''}

  <!-- Page 3: Warnings & Info -->
  ${warningIssues.length > 0 || infoIssues.length > 0 ? `
  <div class="page">
    <div class="header">
      <div class="logo">
        <div class="logo-text">
          <span class="brand">Web</span><span class="accent">lyx</span>
        </div>
      </div>
      <div class="header-info">
        <div class="header-title">Analýza Webu</div>
      </div>
    </div>

    ${warningIssues.length > 0 ? `
    <div class="issues-section">
      <div class="section-title">⚠️ Varování</div>
      ${warningIssues.slice(0, 5).map(issue => `
        <div class="issue-card warning">
          <div class="issue-title">${fixCzechChars(issue.title)}</div>
          <div class="issue-description">${fixCzechChars(issue.description)}</div>
          ${issue.recommendation ? `<div class="issue-detail"><strong>Řešení:</strong> ${fixCzechChars(issue.recommendation)}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${infoIssues.length > 0 ? `
    <div class="issues-section">
      <div class="section-title">ℹ️ Informace & Tipy</div>
      ${infoIssues.slice(0, 5).map(issue => `
        <div class="issue-card info">
          <div class="issue-title">${fixCzechChars(issue.title)}</div>
          <div class="issue-description">${fixCzechChars(issue.description)}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="issues-section">
      <div class="section-title">📊 Technické detaily</div>
      <div class="technical-grid">
        <div class="technical-row">
          <span class="technical-label">SSL/HTTPS:</span>
          <span class="technical-value">${analysis.technical?.hasSSL ? '✓ Ano' : '✗ Ne'}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Mobilní optimalizace:</span>
          <span class="technical-value">${analysis.technical?.mobileResponsive ? '✓ Ano' : '✗ Ne'}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Title tag:</span>
          <span class="technical-value">${analysis.technical?.title ? '✓ Ano' : '✗ Ne'}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Meta description:</span>
          <span class="technical-value">${analysis.technical?.description ? '✓ Ano' : '✗ Ne'}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">H1 nadpis:</span>
          <span class="technical-value">${analysis.technical?.h1Count || 0} ks</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Celkem obrázků:</span>
          <span class="technical-value">${analysis.technical?.totalImages || 0} (${analysis.technical?.imagesWithoutAlt || 0} bez ALT)</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Interní odkazy:</span>
          <span class="technical-value">${analysis.technical?.internalLinks || 0}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Externí odkazy:</span>
          <span class="technical-value">${analysis.technical?.externalLinks || 0}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Sitemap.xml:</span>
          <span class="technical-value">${analysis.technical?.hasSitemap ? '✓ Ano' : '✗ Ne'}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Robots.txt:</span>
          <span class="technical-value">${analysis.technical?.hasRobotsTxt ? '✓ Ano' : '✗ Ne'}</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Čas načtení:</span>
          <span class="technical-value">${analysis.technical?.loadTime || 0}ms</span>
        </div>
        <div class="technical-row">
          <span class="technical-label">Schema markup:</span>
          <span class="technical-value">${analysis.technical?.schemaMarkup ? '✓ Ano' : '✗ Ne'}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">Weblyx © ${new Date().getFullYear()} | www.weblyx.cz | info@weblyx.cz</div>
    </div>
  </div>
  ` : ''}
</body>
</html>
  `.trim();
}
