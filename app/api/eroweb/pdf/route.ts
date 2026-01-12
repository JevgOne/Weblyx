// EroWeb Analysis API - PDF Export
// GET /api/eroweb/pdf?id=xxx - Generate premium PDF report

import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/turso/eroweb';
import { EROWEB_PACKAGES } from '@/types/eroweb';

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

    const htmlContent = generatePremiumPdfHtml(analysis);

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

function generatePremiumPdfHtml(analysis: any): string {
  const {
    domain,
    url,
    businessType,
    scores,
    details,
    findings,
    recommendation,
    recommendedPackage,
    createdAt,
  } = analysis;

  const pkg = EROWEB_PACKAGES[recommendedPackage as keyof typeof EROWEB_PACKAGES];

  const getScoreColor = (score: number): string => {
    if (score <= 30) return '#FF3B5C';
    if (score <= 50) return '#FF8C42';
    if (score <= 70) return '#FFD93D';
    if (score <= 85) return '#6BCB77';
    return '#4ADE80';
  };

  const getScoreEmoji = (score: number): string => {
    if (score <= 30) return '🔥';
    if (score <= 50) return '⚠️';
    if (score <= 70) return '📊';
    if (score <= 85) return '✨';
    return '🏆';
  };

  const getScoreLabel = (score: number): string => {
    if (score <= 30) return 'Kritický stav - Urgentní řešení!';
    if (score <= 50) return 'Podprůměrný - Konkurence vás předbíhá';
    if (score <= 70) return 'Průměrný - Je co zlepšovat';
    if (score <= 85) return 'Dobrý - Pár kroků ke špičce';
    return 'Výborný! 🎉';
  };

  const businessTypeLabels: Record<string, string> = {
    massage: '💆 Erotické masáže',
    privat: '🏠 Privát / Klub',
    escort: '🚗 Escort služby',
  };

  const criticalFindings = (findings || []).filter((f: any) => f.type === 'critical');
  const warningFindings = (findings || []).filter((f: any) => f.type === 'warning');
  const opportunityFindings = (findings || []).filter((f: any) => f.type === 'opportunity');

  const formatMs = (ms: number) => ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;

  // Calculate potential lost customers
  const lostCustomersPercent = scores.total < 30 ? 50 : scores.total < 50 ? 35 : scores.total < 70 ? 20 : 10;
  const avgSpend = businessType === 'escort' ? 3500 : businessType === 'privat' ? 2500 : 1800;
  const monthlyLoss = Math.round((lostCustomersPercent / 100) * 30 * avgSpend);

  // Personalized tips based on business type
  const businessTips: Record<string, {title: string, tips: string[], features: string[], competitors: string}> = {
    massage: {
      title: 'Masážní salóny',
      tips: [
        '🕯️ <strong>Atmosféra je klíč</strong> - Přidejte na web virtuální prohlídku vašeho salónu, zákazníci chtějí vědět, kam jdou',
        '📅 <strong>Online rezervace = více zákazníků</strong> - 67% mužů preferuje rezervaci online bez volání',
        '💆 <strong>Galerie masérek</strong> - Profesionální fotky masérek zvyšují konverze o 40%',
        '🎁 <strong>Věrnostní program</strong> - Kartička "5+1 zdarma" zvyšuje opakované návštěvy o 35%',
        '📱 <strong>WhatsApp quick booking</strong> - Diskrétní způsob rezervace, který zákazníci milují'
      ],
      features: ['Online rezervační systém', 'Galerie masérek s filtry', 'Ceník masáží s interaktivním výběrem', 'Virtuální prohlídka salónu', 'SMS/WhatsApp připomínky'],
      competitors: 'Konkurenční masážní salóny ve vašem městě již investují do moderních webů s online rezervací. Nečekejte, až vás předběhnou.'
    },
    privat: {
      title: 'Privátní kluby',
      tips: [
        '👩 <strong>Profily dívek jsou základ</strong> - Detailní profily s filtry (věk, vzhled, služby) zvyšují konverze o 60%',
        '📊 <strong>Dostupnost v reálném čase</strong> - Zákazníci chtějí vědět, kdo je právě k dispozici',
        '🔒 <strong>VIP sekce</strong> - Registrovaní zákazníci utrácejí 2x více než anonymní',
        '💬 <strong>Live chat</strong> - Okamžité odpovědi na dotazy zvyšují konverze o 25%',
        '📅 <strong>Centrální kalendář</strong> - Správa směn všech dívek na jednom místě'
      ],
      features: ['Profily dívek s neomezeným počtem', 'Filtry: věk, služby, jazyk, vzhled', 'Dostupnost v reálném čase', 'VIP klientská sekce', 'Interní správa personálu'],
      competitors: 'Největší privátní kluby v ČR už používají moderní rezervační systémy. Bez nich ztrácíte zákazníky, kteří preferují pohodlí.'
    },
    escort: {
      title: 'Escort agentury',
      tips: [
        '🚗 <strong>Mobilní aplikace pro dívky</strong> - Push notifikace o bookingu, vlastní kalendář, přehled výdělků',
        '📍 <strong>Pokrytí měst</strong> - Interaktivní mapa s dostupností v různých městech',
        '⭐ <strong>Hodnocení & recenze</strong> - Ověřené recenze od klientů budují důvěru',
        '💳 <strong>Online platby</strong> - Bezpečné zálohy předem snižují no-shows o 70%',
        '🎯 <strong>Premium booking</strong> - VIP klienti s prioritním výběrem a speciálními službami'
      ],
      features: ['Mobilní app pro dívky (iOS + Android)', 'Push notifikace o rezervacích', 'Finanční přehledy a provize', 'CRM - klientská databáze', 'Multi-city pokrytí'],
      competitors: 'Profesionální escort agentury v západní Evropě standardně nabízejí mobilní aplikace pro své pracovnice. Je čas se jim vyrovnat.'
    }
  };

  const currentBusinessTips = businessTips[businessType] || businessTips.massage;

  // Generate personalized recommendations based on what's missing
  const getPersonalizedFeatures = () => {
    const features: string[] = [];

    if (!details?.hasBookingSystem) {
      features.push('📅 <strong>Online rezervační systém</strong> - Až 67% zákazníků preferuje online booking');
    }
    if (!details?.hasFaqSection) {
      features.push('❓ <strong>FAQ sekce optimalizovaná pro AI</strong> - Váš web se objeví v odpovědích ChatGPT');
    }
    if (!details?.hasStructuredData) {
      features.push('🤖 <strong>Schema.org markup</strong> - Lepší zobrazení ve výsledcích vyhledávání');
    }
    if (!details?.hasPhone && !details?.hasWhatsApp) {
      features.push('📱 <strong>WhatsApp tlačítko</strong> - Diskrétní a rychlá komunikace se zákazníky');
    }
    if (scores.speed < 12) {
      features.push('⚡ <strong>Optimalizace rychlosti</strong> - Každá sekunda zdržení = -7% konverzí');
    }
    if (!details?.hasLocalBusinessSchema) {
      features.push('📍 <strong>Local SEO</strong> - Lepší viditelnost v Google Maps a lokálním vyhledávání');
    }

    return features.slice(0, 4);
  };

  const personalizedFeatures = getPersonalizedFeatures();

  // Generate unique selling points based on score
  const getUrgencyMessage = () => {
    if (scores.total < 30) {
      return {
        emoji: '🚨',
        title: 'URGENTNÍ: Váš web aktivně ztrácí zákazníky!',
        message: `Každý den s tímto webem vás stojí přibližně <strong>${Math.round(monthlyLoss / 30).toLocaleString('cs-CZ')} Kč</strong>. To je <strong>${monthlyLoss.toLocaleString('cs-CZ')} Kč měsíčně</strong> v ušlých příjmech. Modernizace se vrátí za pouhé 2-3 měsíce!`,
        cta: 'Nečekejte ani den déle'
      };
    } else if (scores.total < 50) {
      return {
        emoji: '⚠️',
        title: 'Pozor: Konkurence vás předbíhá',
        message: `Váš web funguje, ale zákazníci očekávají více. Salóny s moderními weby získávají o <strong>35% více rezervací</strong>. Investice do webu se vrátí za 4-5 měsíců.`,
        cta: 'Pojďme to změnit'
      };
    } else if (scores.total < 70) {
      return {
        emoji: '💡',
        title: 'Příležitost: Pár kroků ke špičce',
        message: `Máte solidní základ! S cílenou optimalizací můžete zvýšit konverze o <strong>20-30%</strong> a předstihnout většinu konkurence ve vašem městě.`,
        cta: 'Využijte svůj potenciál'
      };
    } else {
      return {
        emoji: '🏆',
        title: 'Výborně! Jste mezi nejlepšími',
        message: `Váš web je nadprůměrný. Nabízíme pokročilé funkce jako <strong>mobilní aplikaci pro personál</strong>, <strong>AI chatbot</strong> nebo <strong>VIP klientský program</strong> pro další růst.`,
        cta: 'Posuňte se na next level'
      };
    }
  };

  const urgencyMessage = getUrgencyMessage();

  // Industry insights
  const industryInsights = {
    massage: [
      '📊 <strong>73% zákazníků</strong> hledá masážní salóny na mobilu',
      '⏱️ <strong>Průměrná doba rozhodování:</strong> 3-5 minut na webu',
      '📅 <strong>Nejčastější čas rezervace:</strong> 20:00-23:00',
      '💰 <strong>Průměrná útrata:</strong> 1 500-2 500 Kč na návštěvu'
    ],
    privat: [
      '📊 <strong>85% návštěvníků</strong> přichází z mobilních zařízení',
      '👩 <strong>Profily dívek</strong> jsou nejnavštěvovanější stránky',
      '🔒 <strong>Diskrétnost</strong> je hlavní priorita zákazníků',
      '💰 <strong>VIP zákazníci</strong> utrácejí 2-3x více než běžní'
    ],
    escort: [
      '📊 <strong>Mobilní traffic:</strong> 90%+ všech návštěv',
      '🌍 <strong>Mezinárodní klientela:</strong> 30%+ zahraničních zákazníků',
      '💳 <strong>Online platby:</strong> Snižují no-shows o 70%',
      '⭐ <strong>Recenze:</strong> 89% zákazníků čte recenze před bookingem'
    ]
  };

  const currentIndustryInsights = industryInsights[businessType as keyof typeof industryInsights] || industryInsights.massage;

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔥 Prémiová analýza webu ${domain} | Weblyx</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #0A0A0F 0%, #13131A 100%);
      color: #FFFFFF;
      line-height: 1.7;
      font-size: 14px;
    }

    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }

    .page::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 40%);
      pointer-events: none;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Glowing effects */
    .glow-purple {
      box-shadow: 0 0 40px rgba(124, 58, 237, 0.4), 0 0 80px rgba(124, 58, 237, 0.2);
    }

    .glow-pink {
      box-shadow: 0 0 40px rgba(236, 72, 153, 0.4), 0 0 80px rgba(236, 72, 153, 0.2);
    }

    .glow-green {
      box-shadow: 0 0 30px rgba(74, 222, 128, 0.3);
    }

    .glow-red {
      box-shadow: 0 0 30px rgba(255, 59, 92, 0.3);
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, #7C3AED, #EC4899, #7C3AED) 1;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    .logo {
      font-size: 32px;
      font-weight: 900;
      background: linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #7C3AED 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-subtitle {
      font-size: 11px;
      color: #A1A1AA;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-top: 4px;
    }

    .report-badge {
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    /* Hero Section */
    .hero-section {
      text-align: center;
      padding: 48px 0;
      position: relative;
      z-index: 1;
    }

    .hero-emoji {
      font-size: 64px;
      margin-bottom: 16px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .hero-title {
      font-size: 42px;
      font-weight: 900;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 18px;
      color: #71717A;
      margin-bottom: 32px;
    }

    .domain-showcase {
      display: inline-block;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
      border: 2px solid rgba(124, 58, 237, 0.5);
      border-radius: 16px;
      padding: 20px 40px;
    }

    .domain-name {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .domain-type {
      font-size: 14px;
      color: #A1A1AA;
      margin-top: 8px;
    }

    /* Score Hero - The WOW moment */
    .score-hero {
      background: linear-gradient(135deg, #1A1A25 0%, #252535 100%);
      border: 2px solid rgba(124, 58, 237, 0.3);
      border-radius: 24px;
      padding: 48px;
      text-align: center;
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }

    .score-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .score-mega {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 32px;
    }

    .score-ring {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: conic-gradient(from 0deg, ${getScoreColor(scores.total)} 0%, ${getScoreColor(scores.total)} ${scores.total}%, #2A2A3A ${scores.total}%, #2A2A3A 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .score-ring::before {
      content: '';
      position: absolute;
      inset: 12px;
      background: #1A1A25;
      border-radius: 50%;
    }

    .score-inner {
      position: relative;
      z-index: 1;
      text-align: center;
    }

    .score-emoji {
      font-size: 32px;
      margin-bottom: 4px;
    }

    .score-number {
      font-size: 72px;
      font-weight: 900;
      line-height: 1;
      background: linear-gradient(135deg, ${getScoreColor(scores.total)}, #FFFFFF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .score-max {
      font-size: 18px;
      color: #71717A;
    }

    .score-label {
      font-size: 28px;
      font-weight: 800;
      margin-bottom: 16px;
      color: ${getScoreColor(scores.total)};
    }

    .score-verdict {
      color: #A1A1AA;
      max-width: 500px;
      margin: 0 auto;
      font-size: 16px;
      line-height: 1.8;
    }

    /* Alert Box - Urgency */
    .alert-box {
      background: linear-gradient(135deg, rgba(255, 59, 92, 0.15) 0%, rgba(255, 140, 66, 0.15) 100%);
      border: 2px solid rgba(255, 59, 92, 0.5);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .alert-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .alert-icon {
      font-size: 32px;
    }

    .alert-title {
      font-size: 20px;
      font-weight: 800;
      color: #FF3B5C;
    }

    .alert-text {
      font-size: 16px;
      color: #FFB4B4;
    }

    .alert-highlight {
      font-size: 28px;
      font-weight: 900;
      color: #FF3B5C;
    }

    /* Stats Cards */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }

    .stat-card {
      background: linear-gradient(135deg, #1E1E2E 0%, #252538 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }

    .stat-card.critical::before { background: linear-gradient(90deg, #FF3B5C, #FF8C42); }
    .stat-card.warning::before { background: linear-gradient(90deg, #FF8C42, #FFD93D); }
    .stat-card.opportunity::before { background: linear-gradient(90deg, #3B82F6, #7C3AED); }

    .stat-emoji {
      font-size: 36px;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 42px;
      font-weight: 900;
    }

    .stat-label {
      font-size: 13px;
      color: #71717A;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Section Styles */
    .section {
      background: linear-gradient(135deg, #1A1A25 0%, #1E1E2E 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 28px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .section-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2));
    }

    .section-title-group {
      flex: 1;
    }

    .section-title {
      font-size: 22px;
      font-weight: 800;
    }

    .section-subtitle {
      font-size: 13px;
      color: #71717A;
      margin-top: 4px;
    }

    .section-score-badge {
      background: linear-gradient(135deg, #252538, #2D2D42);
      border-radius: 12px;
      padding: 12px 20px;
      text-align: center;
    }

    .score-badge-value {
      font-size: 24px;
      font-weight: 900;
    }

    .score-badge-max {
      font-size: 11px;
      color: #71717A;
      text-transform: uppercase;
    }

    /* Metrics Table Premium */
    .metrics-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 8px;
    }

    .metrics-table th {
      padding: 8px 16px;
      text-align: left;
      font-size: 11px;
      color: #71717A;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .metrics-table td {
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      font-size: 14px;
    }

    .metrics-table tr td:first-child {
      border-radius: 12px 0 0 12px;
    }

    .metrics-table tr td:last-child {
      border-radius: 0 12px 12px 0;
    }

    .metric-name {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .metric-icon {
      font-size: 18px;
    }

    .metric-value {
      font-weight: 700;
      font-size: 16px;
    }

    .metric-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-good { background: rgba(74, 222, 128, 0.2); color: #4ADE80; }
    .status-warning { background: rgba(255, 217, 61, 0.2); color: #FFD93D; }
    .status-bad { background: rgba(255, 59, 92, 0.2); color: #FF3B5C; }

    /* Category Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .category-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .category-emoji {
      font-size: 18px;
    }

    .category-name {
      font-size: 12px;
      color: #71717A;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .category-value {
      font-size: 18px;
      font-weight: 700;
    }

    .category-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      margin-top: 12px;
      overflow: hidden;
    }

    .category-fill {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, #7C3AED, #EC4899);
    }

    /* Findings Premium */
    .finding {
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 16px;
      border-left: 4px solid;
      position: relative;
      overflow: hidden;
    }

    .finding::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.05;
      pointer-events: none;
    }

    .finding-critical {
      background: linear-gradient(135deg, rgba(255, 59, 92, 0.1), rgba(255, 59, 92, 0.05));
      border-color: #FF3B5C;
    }

    .finding-warning {
      background: linear-gradient(135deg, rgba(255, 140, 66, 0.1), rgba(255, 140, 66, 0.05));
      border-color: #FF8C42;
    }

    .finding-opportunity {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.05));
      border-color: #7C3AED;
    }

    .finding-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .finding-emoji {
      font-size: 24px;
    }

    .finding-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .badge-critical { background: #FF3B5C; color: white; }
    .badge-warning { background: #FF8C42; color: white; }
    .badge-opportunity { background: linear-gradient(135deg, #3B82F6, #7C3AED); color: white; }

    .finding-category {
      font-size: 11px;
      color: #71717A;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .finding-title {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .finding-description {
      color: #A1A1AA;
      font-size: 14px;
      margin-bottom: 12px;
      line-height: 1.7;
    }

    .finding-impact {
      font-size: 13px;
      color: #71717A;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .finding-impact strong {
      color: #EC4899;
    }

    /* Package Section - The Big Sell */
    .package-hero {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(124, 58, 237, 0.1) 100%);
      border: 2px solid rgba(124, 58, 237, 0.5);
      border-radius: 24px;
      padding: 40px;
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }

    .package-hero::before {
      content: '✨';
      position: absolute;
      font-size: 200px;
      top: -50px;
      right: -50px;
      opacity: 0.1;
    }

    .package-tag {
      display: inline-block;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 8px 20px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 16px;
    }

    .package-name {
      font-size: 36px;
      font-weight: 900;
      margin-bottom: 8px;
    }

    .package-ideal {
      color: #A1A1AA;
      font-size: 15px;
      margin-bottom: 24px;
    }

    .package-price-box {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-main {
      font-size: 42px;
      font-weight: 900;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .price-info {
      text-align: right;
    }

    .price-delivery {
      font-size: 14px;
      color: #A1A1AA;
    }

    .price-delivery strong {
      color: #4ADE80;
    }

    .package-features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      padding: 8px 0;
    }

    .feature-check {
      color: #4ADE80;
      font-size: 18px;
      flex-shrink: 0;
    }

    /* Why Weblyx Section */
    .why-section {
      background: linear-gradient(135deg, #1A1A25 0%, #1E1E2E 100%);
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .why-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .why-title {
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 8px;
    }

    .why-subtitle {
      color: #71717A;
      font-size: 15px;
    }

    .why-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .why-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .why-emoji {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .why-value {
      font-size: 32px;
      font-weight: 900;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .why-label {
      font-size: 13px;
      color: #A1A1AA;
    }

    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2));
      border: 2px solid rgba(124, 58, 237, 0.4);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .cta-emoji {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .cta-title {
      font-size: 28px;
      font-weight: 900;
      margin-bottom: 12px;
    }

    .cta-subtitle {
      font-size: 18px;
      color: #A1A1AA;
      margin-bottom: 24px;
    }

    .cta-highlight {
      display: inline-block;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      color: white;
      font-size: 18px;
      font-weight: 700;
      padding: 16px 40px;
      border-radius: 30px;
      margin-bottom: 16px;
    }

    .cta-note {
      font-size: 14px;
      color: #71717A;
    }

    /* Showcase Section */
    .showcase-section {
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .showcase-title {
      text-align: center;
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 24px;
    }

    .showcase-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .showcase-item {
      background: linear-gradient(135deg, #1E1E2E 0%, #252538 100%);
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .showcase-emoji {
      font-size: 40px;
      margin-bottom: 12px;
    }

    .showcase-label {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .showcase-desc {
      font-size: 12px;
      color: #71717A;
    }

    /* Before/After comparison */
    .comparison-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }

    .comparison-card {
      border-radius: 16px;
      padding: 24px;
      text-align: center;
    }

    .comparison-before {
      background: linear-gradient(135deg, rgba(255, 59, 92, 0.1), rgba(255, 59, 92, 0.05));
      border: 2px solid rgba(255, 59, 92, 0.3);
    }

    .comparison-after {
      background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.05));
      border: 2px solid rgba(74, 222, 128, 0.3);
    }

    .comparison-emoji {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .comparison-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .comparison-before .comparison-label { color: #FF3B5C; }
    .comparison-after .comparison-label { color: #4ADE80; }

    .comparison-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .comparison-list {
      text-align: left;
      font-size: 13px;
      color: #A1A1AA;
    }

    .comparison-list li {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }

    .comparison-before .comparison-list li::before {
      content: '✗';
      position: absolute;
      left: 0;
      color: #FF3B5C;
    }

    .comparison-after .comparison-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #4ADE80;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 40px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 32px;
      position: relative;
      z-index: 1;
    }

    .footer-logo {
      font-size: 28px;
      font-weight: 900;
      background: linear-gradient(135deg, #7C3AED, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
    }

    .footer-contact {
      color: #A1A1AA;
      font-size: 16px;
      margin-bottom: 12px;
    }

    .footer-contact a {
      color: #EC4899;
      text-decoration: none;
      font-weight: 600;
    }

    .footer-cta {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(236, 72, 153, 0.2));
      border-radius: 12px;
      padding: 20px;
      margin: 24px auto;
      max-width: 400px;
    }

    .footer-cta-text {
      font-size: 18px;
      font-weight: 700;
    }

    .footer-cta-text span {
      color: #4ADE80;
    }

    .footer-legal {
      font-size: 12px;
      color: #52525B;
      margin-top: 24px;
    }

    /* Print styles */
    @media print {
      body { background: #0A0A0F; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>

<!-- PAGE 1: Epic Cover -->
<div class="page">
  <header class="header">
    <div>
      <div class="logo">Weblyx.cz</div>
      <div class="logo-subtitle">Prémiové weby pro dospělý průmysl</div>
    </div>
    <div class="report-badge">🔥 Exkluzivní analýza</div>
  </header>

  <div class="hero-section">
    <div class="hero-emoji">${getScoreEmoji(scores.total)}</div>
    <h1 class="hero-title">Kompletní audit vašeho webu</h1>
    <p class="hero-subtitle">Zjistěte, jak váš web skutečně funguje a co vás stojí zákazníky</p>
    <div class="domain-showcase">
      <div class="domain-name">${domain}</div>
      <div class="domain-type">${businessTypeLabels[businessType] || businessType}</div>
    </div>
  </div>

  <div class="score-hero glow-purple">
    <div class="score-mega">
      <div class="score-ring">
        <div class="score-inner">
          <div class="score-emoji">${getScoreEmoji(scores.total)}</div>
          <div class="score-number">${scores.total}</div>
          <div class="score-max">/ 100 bodů</div>
        </div>
      </div>
    </div>
    <div class="score-label">${getScoreLabel(scores.total)}</div>
    <p class="score-verdict">
      ${scores.total <= 30
        ? '🚨 <strong>Váš web aktivně odrazuje zákazníky!</strong> Každý den bez opravy znamená reálné finanční ztráty. Konkurence s moderními weby vás snadno předbíhá.'
        : scores.total <= 50
        ? '⚠️ <strong>Web funguje, ale výrazně zaostává.</strong> Moderní zákazníci očekávají rychlost pod 2 sekundy a profesionální design. Bez modernizace ztrácíte tržní podíl.'
        : scores.total <= 70
        ? '📊 <strong>Solidní základ s prostorem pro růst.</strong> Několik cílených úprav může výrazně zvýšit konverze a přivést více zákazníků.'
        : scores.total <= 85
        ? '✨ <strong>Nadprůměrný web!</strong> S drobnými optimalizacemi můžete patřit mezi absolutní špičku ve vašem městě.'
        : '🏆 <strong>Gratulujeme!</strong> Váš web patří mezi nejlepší v oboru. Nabízíme pokročilé funkce pro další růst.'}
    </p>
  </div>

  ${scores.total < 60 ? `
  <div class="alert-box glow-red">
    <div class="alert-header">
      <span class="alert-icon">💸</span>
      <span class="alert-title">Odhadované měsíční ztráty</span>
    </div>
    <div class="alert-text">
      Na základě analýzy odhadujeme, že současný stav webu vás může stát až
      <span class="alert-highlight">${monthlyLoss.toLocaleString('cs-CZ')} Kč měsíčně</span>
      v ušlých zákaznících!
    </div>
  </div>
  ` : ''}

  <div class="stats-row">
    <div class="stat-card critical">
      <div class="stat-emoji">🚨</div>
      <div class="stat-value" style="color: #FF3B5C">${criticalFindings.length}</div>
      <div class="stat-label">Kritických problémů</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-emoji">⚠️</div>
      <div class="stat-value" style="color: #FF8C42">${warningFindings.length}</div>
      <div class="stat-label">Varování</div>
    </div>
    <div class="stat-card opportunity">
      <div class="stat-emoji">💡</div>
      <div class="stat-value" style="color: #7C3AED">${opportunityFindings.length}</div>
      <div class="stat-label">Příležitostí</div>
    </div>
  </div>

  <!-- Personalized Urgency Box -->
  <div style="background: linear-gradient(135deg, rgba(${scores.total < 50 ? '255, 59, 92' : scores.total < 70 ? '255, 140, 66' : '124, 58, 237'}, 0.15) 0%, rgba(${scores.total < 50 ? '255, 140, 66' : scores.total < 70 ? '255, 217, 61' : '236, 72, 153'}, 0.1) 100%); border: 2px solid rgba(${scores.total < 50 ? '255, 59, 92' : scores.total < 70 ? '255, 140, 66' : '124, 58, 237'}, 0.4); border-radius: 16px; padding: 24px; margin-bottom: 24px; position: relative; z-index: 1;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <span style="font-size: 36px;">${urgencyMessage.emoji}</span>
      <span style="font-size: 20px; font-weight: 800; color: ${scores.total < 50 ? '#FF3B5C' : scores.total < 70 ? '#FF8C42' : '#7C3AED'};">${urgencyMessage.title}</span>
    </div>
    <p style="color: #A1A1AA; font-size: 15px; line-height: 1.8;">${urgencyMessage.message}</p>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-icon">📊</div>
      <div class="section-title-group">
        <h2 class="section-title">Shrnutí analýzy pro ${domain}</h2>
        <div class="section-subtitle">Personalizované zjištění pro vaše ${businessTypeLabels[businessType] || 'podnikání'}</div>
      </div>
    </div>

    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span style="font-size: 24px;">💡</span>
        <span style="font-size: 16px; font-weight: 700;">Hlavní zjištění</span>
      </div>
      <p style="color: #A1A1AA; font-size: 14px; line-height: 1.8;">
        Analýza identifikovala <strong style="color: #FF3B5C;">${criticalFindings.length + warningFindings.length} problémů</strong> vyžadujících pozornost
        a <strong style="color: #7C3AED;">${opportunityFindings.length} příležitostí</strong> pro zlepšení.
        ${scores.total < 50
          ? '<br><br>🔥 <strong>Doporučujeme okamžitou modernizaci</strong> pro zastavení ztrát a získání konkurenční výhody.'
          : '<br><br>✨ S cílenou optimalizací lze dosáhnout <strong>výrazného zlepšení konverzí</strong>.'}
      </p>
    </div>

    <!-- Industry Insights -->
    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(124, 58, 237, 0.1)); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
        <span style="font-size: 24px;">📈</span>
        <span style="font-size: 16px; font-weight: 700;">Statistiky vašeho oboru</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        ${currentIndustryInsights.map((insight: string) => `
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.6;">
          ${insight}
        </div>
        `).join('')}
      </div>
    </div>

    <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1)); border-radius: 12px; padding: 20px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span style="font-size: 24px;">🎯</span>
        <span style="font-size: 16px; font-weight: 700;">Naše doporučení</span>
      </div>
      <p style="color: #A1A1AA; font-size: 14px; line-height: 1.8;">
        ${recommendation || 'Na základě analýzy doporučujeme komplexní modernizaci webu včetně optimalizace rychlosti, SEO a uživatelského rozhraní pro maximální konverze.'}
      </p>
      <p style="color: #71717A; font-size: 13px; margin-top: 12px; font-style: italic;">
        💬 ${currentBusinessTips.competitors}
      </p>
    </div>
  </div>
</div>

<!-- PAGE 2: Detailed Scores -->
<div class="page">
  <header class="header">
    <div>
      <div class="logo">Weblyx.cz</div>
      <div class="logo-subtitle">Detailní hodnocení</div>
    </div>
    <div style="color: #71717A; font-size: 13px;">${domain}</div>
  </header>

  <!-- Speed Section -->
  <div class="section">
    <div class="section-header">
      <div class="section-icon">⚡</div>
      <div class="section-title-group">
        <h2 class="section-title">Rychlost & Výkon</h2>
        <div class="section-subtitle">Jak rychle se váš web načítá</div>
      </div>
      <div class="section-score-badge">
        <div class="score-badge-value" style="color: ${getScoreColor((scores.speed / 20) * 100)}">${scores.speed}</div>
        <div class="score-badge-max">z 20 bodů</div>
      </div>
    </div>

    <table class="metrics-table">
      <thead>
        <tr>
          <th>Metrika</th>
          <th>Vaše hodnota</th>
          <th>Ideál</th>
          <th>Hodnocení</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><div class="metric-name"><span class="metric-icon">🎨</span> LCP (největší obsah)</div></td>
          <td class="metric-value">${formatMs(details?.lcp || 0)}</td>
          <td>&lt; 2.5s</td>
          <td><span class="metric-status ${(details?.lcp || 0) < 2500 ? 'status-good' : (details?.lcp || 0) < 4000 ? 'status-warning' : 'status-bad'}">${(details?.lcp || 0) < 2500 ? '✓ Výborně' : (details?.lcp || 0) < 4000 ? '⚠ Průměr' : '✗ Pomalé'}</span></td>
        </tr>
        <tr>
          <td><div class="metric-name"><span class="metric-icon">🚀</span> FCP (první obsah)</div></td>
          <td class="metric-value">${formatMs(details?.fcp || 0)}</td>
          <td>&lt; 1.8s</td>
          <td><span class="metric-status ${(details?.fcp || 0) < 1800 ? 'status-good' : (details?.fcp || 0) < 3000 ? 'status-warning' : 'status-bad'}">${(details?.fcp || 0) < 1800 ? '✓ Výborně' : (details?.fcp || 0) < 3000 ? '⚠ Průměr' : '✗ Pomalé'}</span></td>
        </tr>
        <tr>
          <td><div class="metric-name"><span class="metric-icon">⏱️</span> TTFB (odezva serveru)</div></td>
          <td class="metric-value">${formatMs(details?.ttfb || 0)}</td>
          <td>&lt; 800ms</td>
          <td><span class="metric-status ${(details?.ttfb || 0) < 800 ? 'status-good' : (details?.ttfb || 0) < 1800 ? 'status-warning' : 'status-bad'}">${(details?.ttfb || 0) < 800 ? '✓ Výborně' : (details?.ttfb || 0) < 1800 ? '⚠ Průměr' : '✗ Pomalé'}</span></td>
        </tr>
        <tr>
          <td><div class="metric-name"><span class="metric-icon">📐</span> CLS (stabilita)</div></td>
          <td class="metric-value">${(details?.cls || 0).toFixed(3)}</td>
          <td>&lt; 0.1</td>
          <td><span class="metric-status ${(details?.cls || 0) < 0.1 ? 'status-good' : (details?.cls || 0) < 0.25 ? 'status-warning' : 'status-bad'}">${(details?.cls || 0) < 0.1 ? '✓ Stabilní' : (details?.cls || 0) < 0.25 ? '⚠ Mírné' : '✗ Nestabilní'}</span></td>
        </tr>
        <tr>
          <td><div class="metric-name"><span class="metric-icon">🏆</span> PageSpeed Score</div></td>
          <td class="metric-value">${details?.pageSpeedScore || 0}/100</td>
          <td>&gt; 90</td>
          <td><span class="metric-status ${(details?.pageSpeedScore || 0) >= 90 ? 'status-good' : (details?.pageSpeedScore || 0) >= 50 ? 'status-warning' : 'status-bad'}">${(details?.pageSpeedScore || 0) >= 90 ? '✓ Výborně' : (details?.pageSpeedScore || 0) >= 50 ? '⚠ Průměr' : '✗ Kritické'}</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- SEO & GEO Section -->
  <div class="section">
    <div class="section-header">
      <div class="section-icon">🔍</div>
      <div class="section-title-group">
        <h2 class="section-title">SEO & GEO Optimalizace</h2>
        <div class="section-subtitle">Jak vás najdou zákazníci</div>
      </div>
      <div class="section-score-badge">
        <div class="score-badge-value" style="color: ${getScoreColor(((scores.seo + scores.geo) / 35) * 100)}">${scores.seo + scores.geo}</div>
        <div class="score-badge-max">z 35 bodů</div>
      </div>
    </div>

    <div class="category-grid">
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">📝</span>
          <span class="category-name">Title tag</span>
        </div>
        <div class="category-value" style="color: ${details?.title ? '#4ADE80' : '#FF3B5C'}">${details?.title ? '✓ Přítomen' : '✗ Chybí!'}</div>
        ${details?.title ? `<div style="font-size: 12px; color: #71717A; margin-top: 4px;">${details.titleLength} znaků</div>` : ''}
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">📄</span>
          <span class="category-name">Meta description</span>
        </div>
        <div class="category-value" style="color: ${details?.metaDescription ? '#4ADE80' : '#FF3B5C'}">${details?.metaDescription ? '✓ Přítomen' : '✗ Chybí!'}</div>
        ${details?.metaDescription ? `<div style="font-size: 12px; color: #71717A; margin-top: 4px;">${details.descriptionLength} znaků</div>` : ''}
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">🏷️</span>
          <span class="category-name">H1 nadpis</span>
        </div>
        <div class="category-value" style="color: ${details?.h1Count === 1 ? '#4ADE80' : details?.h1Count > 1 ? '#FFD93D' : '#FF3B5C'}">${details?.h1Count === 1 ? '✓ Správně' : details?.h1Count > 1 ? `⚠ ${details?.h1Count}x` : '✗ Chybí!'}</div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">🗺️</span>
          <span class="category-name">Sitemap.xml</span>
        </div>
        <div class="category-value" style="color: ${details?.hasSitemap ? '#4ADE80' : '#FF3B5C'}">${details?.hasSitemap ? '✓ Přítomen' : '✗ Chybí!'}</div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">🤖</span>
          <span class="category-name">Schema.org data</span>
        </div>
        <div class="category-value" style="color: ${details?.hasStructuredData ? '#4ADE80' : '#FF3B5C'}">${details?.hasStructuredData ? '✓ Přítomna' : '✗ Chybí!'}</div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">❓</span>
          <span class="category-name">FAQ sekce (AI/GEO)</span>
        </div>
        <div class="category-value" style="color: ${details?.hasFaqSection ? '#4ADE80' : '#FFD93D'}">${details?.hasFaqSection ? '✓ Přítomna' : '✗ Chybí'}</div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">🖼️</span>
          <span class="category-name">Alt texty obrázků</span>
        </div>
        <div class="category-value">${details?.imagesWithAlt || 0}/${details?.totalImages || 0}</div>
        <div class="category-bar"><div class="category-fill" style="width: ${details?.totalImages ? (details.imagesWithAlt / details.totalImages) * 100 : 0}%;"></div></div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">📍</span>
          <span class="category-name">LocalBusiness Schema</span>
        </div>
        <div class="category-value" style="color: ${details?.hasLocalBusinessSchema ? '#4ADE80' : '#FF3B5C'}">${details?.hasLocalBusinessSchema ? '✓ Přítomno' : '✗ Chybí!'}</div>
      </div>
    </div>
  </div>

  <!-- Mobile & Security -->
  <div class="section">
    <div class="section-header">
      <div class="section-icon">📱</div>
      <div class="section-title-group">
        <h2 class="section-title">Mobilní verze & Bezpečnost</h2>
        <div class="section-subtitle">80% návštěvníků přichází z mobilu</div>
      </div>
      <div class="section-score-badge">
        <div class="score-badge-value" style="color: ${getScoreColor(((scores.mobile + scores.security) / 25) * 100)}">${scores.mobile + scores.security}</div>
        <div class="score-badge-max">z 25 bodů</div>
      </div>
    </div>

    <div class="category-grid">
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">📏</span>
          <span class="category-name">Viewport meta</span>
        </div>
        <div class="category-value" style="color: ${details?.hasViewportMeta ? '#4ADE80' : '#FF3B5C'}">${details?.hasViewportMeta ? '✓ OK' : '✗ Chybí!'}</div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">🔒</span>
          <span class="category-name">HTTPS zabezpečení</span>
        </div>
        <div class="category-value" style="color: ${details?.hasHttps ? '#4ADE80' : '#FF3B5C'}">${details?.hasHttps ? '✓ Zabezpečeno' : '✗ Nezabezpečeno!'}</div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">🛡️</span>
          <span class="category-name">Security headers</span>
        </div>
        <div class="category-value" style="color: ${details?.hasSecurityHeaders ? '#4ADE80' : '#FFD93D'}">${details?.hasSecurityHeaders ? '✓ Přítomny' : '✗ Chybí'}</div>
      </div>
      <div class="category-card">
        <div class="category-header">
          <span class="category-emoji">⚠️</span>
          <span class="category-name">Mixed content</span>
        </div>
        <div class="category-value" style="color: ${!details?.hasMixedContent ? '#4ADE80' : '#FF3B5C'}">${!details?.hasMixedContent ? '✓ Čistý' : '✗ Detekován!'}</div>
      </div>
    </div>
  </div>
</div>

<!-- PAGE 3: Findings -->
<div class="page">
  <header class="header">
    <div>
      <div class="logo">Weblyx.cz</div>
      <div class="logo-subtitle">Zjištěné problémy</div>
    </div>
    <div style="color: #71717A; font-size: 13px;">${domain}</div>
  </header>

  ${criticalFindings.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-icon" style="background: rgba(255, 59, 92, 0.2);">🚨</div>
      <div class="section-title-group">
        <h2 class="section-title" style="color: #FF3B5C">Kritické problémy (${criticalFindings.length})</h2>
        <div class="section-subtitle">Tyto problémy aktivně odrazují zákazníky!</div>
      </div>
    </div>

    ${criticalFindings.slice(0, 4).map((f: any) => `
    <div class="finding finding-critical">
      <div class="finding-header">
        <span class="finding-emoji">🔥</span>
        <span class="finding-badge badge-critical">Kritické</span>
        <span class="finding-category">${f.category.toUpperCase()}</span>
      </div>
      <div class="finding-title">${f.title}</div>
      <div class="finding-description">${f.description}</div>
      <div class="finding-impact"><strong>💰 Dopad:</strong> ${f.impact}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${warningFindings.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-icon" style="background: rgba(255, 140, 66, 0.2);">⚠️</div>
      <div class="section-title-group">
        <h2 class="section-title" style="color: #FF8C42">Varování (${warningFindings.length})</h2>
        <div class="section-subtitle">Doporučujeme opravit pro lepší výsledky</div>
      </div>
    </div>

    ${warningFindings.slice(0, 4).map((f: any) => `
    <div class="finding finding-warning">
      <div class="finding-header">
        <span class="finding-emoji">⚠️</span>
        <span class="finding-badge badge-warning">Varování</span>
        <span class="finding-category">${f.category.toUpperCase()}</span>
      </div>
      <div class="finding-title">${f.title}</div>
      <div class="finding-description">${f.description}</div>
      <div class="finding-impact"><strong>📊 Dopad:</strong> ${f.impact}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${opportunityFindings.length > 0 ? `
  <div class="section">
    <div class="section-header">
      <div class="section-icon" style="background: rgba(124, 58, 237, 0.2);">💡</div>
      <div class="section-title-group">
        <h2 class="section-title" style="color: #7C3AED">Příležitosti ke zlepšení (${opportunityFindings.length})</h2>
        <div class="section-subtitle">Extra funkce pro více zákazníků</div>
      </div>
    </div>

    ${opportunityFindings.slice(0, 3).map((f: any) => `
    <div class="finding finding-opportunity">
      <div class="finding-header">
        <span class="finding-emoji">💡</span>
        <span class="finding-badge badge-opportunity">Příležitost</span>
        <span class="finding-category">${f.category.toUpperCase()}</span>
      </div>
      <div class="finding-title">${f.title}</div>
      <div class="finding-description">${f.description}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Before/After comparison -->
  <div class="comparison-section">
    <div class="comparison-card comparison-before">
      <div class="comparison-emoji">😟</div>
      <div class="comparison-label">Aktuální stav</div>
      <div class="comparison-title">Bez modernizace</div>
      <ul class="comparison-list" style="list-style: none;">
        <li>Pomalé načítání odrazuje zákazníky</li>
        <li>Špatné zobrazení na mobilech</li>
        <li>Konkurence vás předbíhá</li>
        <li>Ztráty až ${monthlyLoss.toLocaleString('cs-CZ')} Kč/měsíc</li>
      </ul>
    </div>
    <div class="comparison-card comparison-after">
      <div class="comparison-emoji">🤩</div>
      <div class="comparison-label">S Weblyx</div>
      <div class="comparison-title">Po modernizaci</div>
      <ul class="comparison-list" style="list-style: none;">
        <li>Načítání pod 2 sekundy</li>
        <li>Perfektní na všech zařízeních</li>
        <li>SEO/GEO optimalizace pro AI</li>
        <li>Více zákazníků a rezervací</li>
      </ul>
    </div>
  </div>
</div>

<!-- PAGE 4: Package Recommendation -->
<div class="page">
  <header class="header">
    <div>
      <div class="logo">Weblyx.cz</div>
      <div class="logo-subtitle">Naše doporučení</div>
    </div>
    <div style="color: #71717A; font-size: 13px;">${domain}</div>
  </header>

  ${pkg ? `
  <div class="package-hero glow-purple">
    <span class="package-tag">🎯 Doporučený balíček</span>
    <h2 class="package-name">${pkg.name}</h2>
    <p class="package-ideal">✨ ${pkg.idealFor}</p>

    <div class="package-price-box">
      <div class="price-main">${pkg.priceMin.toLocaleString('cs-CZ')} - ${pkg.priceMax.toLocaleString('cs-CZ')} Kč</div>
      <div class="price-info">
        <div class="price-delivery">🚀 Dodání: <strong>${pkg.deliveryTime}</strong></div>
      </div>
    </div>

    <div class="package-features-grid">
      ${pkg.features.slice(0, 12).map((f: string) => `
      <div class="feature-item">
        <span class="feature-check">✓</span>
        <span>${f}</span>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- PERSONALIZED: Tips for their specific business type -->
  <div class="section" style="border: 2px solid rgba(236, 72, 153, 0.3);">
    <div class="section-header">
      <div class="section-icon" style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(124, 58, 237, 0.3));">💎</div>
      <div class="section-title-group">
        <h2 class="section-title">Exkluzivní tipy pro ${currentBusinessTips.title}</h2>
        <div class="section-subtitle">Nápady speciálně pro váš typ podnikání</div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${currentBusinessTips.tips.map((tip: string, index: number) => `
      <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border-radius: 12px; padding: 16px; border-left: 3px solid rgba(236, 72, 153, ${0.8 - index * 0.15});">
        <p style="font-size: 14px; line-height: 1.7; color: #D4D4D8;">${tip}</p>
      </div>
      `).join('')}
    </div>
  </div>

  ${personalizedFeatures.length > 0 ? `
  <!-- PERSONALIZED: What they specifically need -->
  <div class="section" style="border: 2px solid rgba(74, 222, 128, 0.3);">
    <div class="section-header">
      <div class="section-icon" style="background: linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(59, 130, 246, 0.3));">🎯</div>
      <div class="section-title-group">
        <h2 class="section-title">Co konkrétně vám chybí</h2>
        <div class="section-subtitle">Personalizované doporučení na základě analýzy ${domain}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      ${personalizedFeatures.map((feature: string) => `
      <div style="background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(59, 130, 246, 0.05)); border-radius: 12px; padding: 16px; border: 1px solid rgba(74, 222, 128, 0.2);">
        <p style="font-size: 14px; line-height: 1.7; color: #D4D4D8;">${feature}</p>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- What we offer showcase -->
  <div class="showcase-section">
    <h3 class="showcase-title">✨ Co od nás dostanete</h3>
    <div class="showcase-grid">
      <div class="showcase-item">
        <div class="showcase-emoji">⚡</div>
        <div class="showcase-label">Rychlost pod 2s</div>
        <div class="showcase-desc">Garantujeme</div>
      </div>
      <div class="showcase-item">
        <div class="showcase-emoji">📱</div>
        <div class="showcase-label">Mobilní first</div>
        <div class="showcase-desc">100% responzivní</div>
      </div>
      <div class="showcase-item">
        <div class="showcase-emoji">🎨</div>
        <div class="showcase-label">Moderní design</div>
        <div class="showcase-desc">Na míru vám</div>
      </div>
      <div class="showcase-item">
        <div class="showcase-emoji">🔒</div>
        <div class="showcase-label">18+ vstup</div>
        <div class="showcase-desc">Právně v pořádku</div>
      </div>
      <div class="showcase-item">
        <div class="showcase-emoji">📅</div>
        <div class="showcase-label">Rezervace</div>
        <div class="showcase-desc">Online systém</div>
      </div>
      <div class="showcase-item">
        <div class="showcase-emoji">🤖</div>
        <div class="showcase-label">AI/GEO SEO</div>
        <div class="showcase-desc">Pro ChatGPT & AI</div>
      </div>
    </div>
  </div>

  <!-- Why Weblyx -->
  <div class="why-section">
    <div class="why-header">
      <h3 class="why-title">🏆 Proč Weblyx?</h3>
      <p class="why-subtitle">Specializujeme se na weby pro dospělý průmysl</p>
    </div>
    <div class="why-grid">
      <div class="why-card">
        <div class="why-emoji">⚡</div>
        <div class="why-value">5-7 dní</div>
        <div class="why-label">Rychlé dodání</div>
      </div>
      <div class="why-card">
        <div class="why-emoji">🏆</div>
        <div class="why-value">90+</div>
        <div class="why-label">PageSpeed garance</div>
      </div>
      <div class="why-card">
        <div class="why-emoji">💰</div>
        <div class="why-value">0 Kč</div>
        <div class="why-label">Měsíční poplatky</div>
      </div>
      <div class="why-card">
        <div class="why-emoji">🛡️</div>
        <div class="why-value">100%</div>
        <div class="why-label">Diskrétnost</div>
      </div>
    </div>
  </div>

  <!-- ROI Calculator -->
  <div class="section" style="border: 2px solid rgba(74, 222, 128, 0.3); background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(16, 185, 129, 0.05));">
    <div class="section-header">
      <div class="section-icon" style="background: linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(16, 185, 129, 0.3));">💰</div>
      <div class="section-title-group">
        <h2 class="section-title">Kalkulace návratnosti investice</h2>
        <div class="section-subtitle">Kolik vám nový web může vydělat</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 13px; color: #71717A; text-transform: uppercase; margin-bottom: 12px;">📉 Současné ztráty</div>
        <div style="font-size: 36px; font-weight: 900; color: #FF3B5C; margin-bottom: 8px;">-${monthlyLoss.toLocaleString('cs-CZ')} Kč</div>
        <div style="font-size: 13px; color: #A1A1AA;">odhadovaně měsíčně</div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 24px; font-weight: 700; color: #FF8C42;">-${(monthlyLoss * 12).toLocaleString('cs-CZ')} Kč</div>
          <div style="font-size: 12px; color: #71717A;">ročně v ušlých příjmech</div>
        </div>
      </div>
      <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 20px;">
        <div style="font-size: 13px; color: #71717A; text-transform: uppercase; margin-bottom: 12px;">📈 Po modernizaci</div>
        <div style="font-size: 36px; font-weight: 900; color: #4ADE80; margin-bottom: 8px;">+${Math.round(monthlyLoss * 0.7).toLocaleString('cs-CZ')} Kč</div>
        <div style="font-size: 13px; color: #A1A1AA;">odhadovaný nárůst měsíčně</div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 24px; font-weight: 700; color: #10B981;">+${Math.round(monthlyLoss * 0.7 * 12).toLocaleString('cs-CZ')} Kč</div>
          <div style="font-size: 12px; color: #71717A;">ročně navíc</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px; background: rgba(74, 222, 128, 0.1); border-radius: 12px; padding: 16px; text-align: center;">
      <div style="font-size: 14px; color: #A1A1AA; margin-bottom: 8px;">Odhadovaná návratnost investice</div>
      <div style="font-size: 28px; font-weight: 900; color: #4ADE80;">${Math.ceil((pkg?.priceMin || 25000) / (monthlyLoss * 0.7))} měsíců</div>
      <div style="font-size: 12px; color: #71717A; margin-top: 4px;">pak už jen čistý zisk 💸</div>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-section">
    <div class="cta-emoji">🚀</div>
    <h3 class="cta-title">${urgencyMessage.cta}</h3>
    <p class="cta-subtitle">Připravíme vám ZDARMA návrh nového webu pro ${domain}</p>
    <div class="cta-highlight">📞 +420 702 110 166</div>
    <p class="cta-note">Žádné závazky, jen nezávazná konzultace</p>
  </div>

  <div class="footer">
    <div class="footer-logo">Weblyx.cz</div>
    <div class="footer-contact">
      📧 <a href="mailto:info@weblyx.cz">info@weblyx.cz</a> &nbsp;|&nbsp;
      📞 <a href="tel:+420702110166">+420 702 110 166</a>
    </div>
    <div class="footer-cta">
      <div class="footer-cta-text">
        🎁 Návrh nového webu <span>ZDARMA</span>
      </div>
    </div>
    <div class="footer-legal">
      Altro Servis Group s.r.o. | IČO: 23673389 | © ${new Date().getFullYear()}<br>
      Vygenerováno: ${new Date(createdAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </div>
  </div>
</div>

</body>
</html>`;
}
