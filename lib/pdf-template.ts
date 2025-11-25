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

    /* Header - Modern Minimal */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      margin-bottom: 48px;
      border-bottom: 1px solid #E2E8F0;
    }

    .logo {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .logo-text {
      font-size: 42px;
      font-weight: 900;
      letter-spacing: -1.5px;
      line-height: 1;
    }

    .logo-text .brand {
      color: ${DARK_TEXT};
    }

    .logo-text .accent {
      background: linear-gradient(135deg, #06B6D4 0%, #14B8A6 50%, #10B981 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-tagline {
      font-size: 10px;
      color: ${GRAY_TEXT};
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .header-info {
      text-align: right;
      background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
      padding: 12px 20px;
      border-radius: 12px;
    }

    .header-title {
      font-size: 13px;
      font-weight: 800;
      color: ${BRAND_COLOR};
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .header-date {
      font-size: 10px;
      color: ${GRAY_TEXT};
      margin-top: 4px;
      font-weight: 500;
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

    /* Score Card - Modern Glass Effect */
    .score-card {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(20, 184, 166, 0.08) 100%);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 56px 40px;
      text-align: center;
      margin: 48px 0;
      border: 2px solid rgba(20, 184, 166, 0.2);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9);
      position: relative;
      overflow: hidden;
    }

    .score-card:before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%);
      opacity: 0.5;
    }

    .score-number {
      font-size: 112px;
      font-weight: 900;
      line-height: 0.9;
      margin-bottom: 16px;
      letter-spacing: -3px;
      position: relative;
      z-index: 1;
    }

    .score-label {
      font-size: 13px;
      color: ${GRAY_TEXT};
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      position: relative;
      z-index: 1;
    }

    .score-badge {
      display: inline-block;
      padding: 10px 28px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 800;
      margin-top: 16px;
      color: white;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
    }

    /* Stats Grid - Modern Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 48px 0;
    }

    .stat-box {
      background: white;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 28px 20px;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-box:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: currentColor;
      opacity: 0.6;
    }

    .stat-number {
      font-size: 56px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 10px;
      letter-spacing: -1px;
    }

    .stat-label {
      font-size: 11px;
      color: ${GRAY_TEXT};
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Recommendation Box - Modern Premium */
    .recommendation-box {
      background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
      border: 2px solid #10B981;
      border-radius: 20px;
      padding: 36px 40px;
      margin: 48px 0;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
      position: relative;
      overflow: hidden;
    }

    .recommendation-box:before {
      content: '💡';
      position: absolute;
      top: -20px;
      right: -20px;
      font-size: 120px;
      opacity: 0.08;
      transform: rotate(15deg);
    }

    .recommendation-title {
      font-size: 22px;
      font-weight: 900;
      color: #065F46;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }

    .recommendation-text {
      font-size: 14px;
      color: #047857;
      margin-bottom: 24px;
      line-height: 1.8;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }

    .recommendation-list {
      list-style: none;
      padding: 0;
      position: relative;
      z-index: 1;
    }

    .recommendation-list li {
      font-size: 13px;
      color: #047857;
      padding: 10px 0;
      padding-left: 32px;
      position: relative;
      font-weight: 500;
    }

    .recommendation-list li:before {
      content: '✓';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      color: #10B981;
      font-weight: 900;
      font-size: 18px;
      background: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
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
      border-left: 5px solid;
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 20px;
      background: white;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      position: relative;
      overflow: hidden;
    }

    .issue-card:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.03;
      background: linear-gradient(135deg, currentColor 0%, transparent 100%);
      pointer-events: none;
    }

    .issue-card.critical {
      border-color: #EF4444;
      background: linear-gradient(135deg, #FFFAFA 0%, #FEF2F2 100%);
    }

    .issue-card.warning {
      border-color: #F59E0B;
      background: linear-gradient(135deg, #FFFEFA 0%, #FFFBEB 100%);
    }

    .issue-card.info {
      border-color: #3B82F6;
      background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
    }

    .issue-title {
      font-size: 16px;
      font-weight: 800;
      color: ${DARK_TEXT};
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }

    .issue-description {
      font-size: 13px;
      color: #475569;
      margin-bottom: 14px;
      line-height: 1.7;
      position: relative;
      z-index: 1;
      font-weight: 500;
    }

    .issue-detail {
      font-size: 12px;
      color: #64748B;
      margin: 8px 0;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    .issue-detail strong {
      color: ${DARK_TEXT};
      font-weight: 700;
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

    /* CTA Box - Modern Vibrant */
    .cta-box {
      background: linear-gradient(135deg, #06B6D4 0%, #14B8A6 50%, #10B981 100%);
      border-radius: 24px;
      padding: 48px 40px;
      text-align: center;
      color: white;
      margin: 48px 0;
      box-shadow: 0 12px 40px rgba(6, 182, 212, 0.3);
      position: relative;
      overflow: hidden;
    }

    .cta-box:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
      pointer-events: none;
    }

    .cta-title {
      font-size: 26px;
      font-weight: 900;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }

    .cta-text {
      font-size: 15px;
      margin-bottom: 28px;
      opacity: 0.98;
      font-weight: 500;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    .cta-contacts {
      display: flex;
      justify-content: center;
      gap: 28px;
      flex-wrap: wrap;
      font-size: 14px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .cta-contact {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.15);
      padding: 10px 18px;
      border-radius: 100px;
      backdrop-filter: blur(10px);
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
