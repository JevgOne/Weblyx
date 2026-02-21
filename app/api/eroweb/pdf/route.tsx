// EroWeb Analysis API - PDF Export
// GET /api/eroweb/pdf?id=xxx&lang=cs|en|de|ru - Generate PDF report

import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/turso/eroweb';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import type { EroWebAnalysis } from '@/types/eroweb';
import {
  PDFLocale,
  BUSINESS_TYPE_PDF_LABELS,
  CATEGORY_PDF_LABELS,
  BUSINESS_TYPE_TEXTS,
  PDF_TEXTS,
  PREMIUM_FEATURES_I18N,
  getScoreLabel as getScoreLabelI18n,
  formatText,
} from '@/lib/eroweb/pdf-translations';

// Register Roboto font with full Czech character support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get('id');
    const lang = (searchParams.get('lang') || 'cs') as PDFLocale; // Default to Czech

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

    // Generate PDF using React PDF
    const pdfDoc = <EroWebPDFDocument analysis={analysis} language={lang} />;
    const pdfBlob = await pdf(pdfDoc).toBlob();
    const pdfBuffer = await pdfBlob.arrayBuffer();

    // Return PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="eroweb-analysis-${analysis.domain}-${lang}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
  },
  // NEW: Top banner with gradient effect
  headerBanner: {
    backgroundColor: '#14B8A6',
    padding: 30,
    marginBottom: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoWeb: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoLyx: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FDB912', // Gold accent matching logo
  },
  subtitle: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: 500,
    opacity: 0.9,
  },
  date: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 500,
  },
  domainSection: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  domainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  domainUrl: {
    fontSize: 12,
    color: '#6B7280',
  },
  businessType: {
    fontSize: 10,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    padding: '4 8',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    width: 100,
    fontSize: 12,
    color: '#6B7280',
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryScore: {
    width: 50,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  finding: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  findingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  findingDescription: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  findingImpact: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  recommendation: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  recommendationText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 1.6,
  },
  pricing: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  pricingText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  pricingBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  pricingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  pricingNote: {
    fontSize: 10,
    color: '#6B7280',
  },
  introSection: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  introText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  highlight: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  highlightText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: 'bold',
  },
  nextSteps: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  footerBold: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  footerLink: {
    color: '#7C3AED',
  },
  footerSmall: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 8,
  },
  // Premium Features Styles
  roiBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  roiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  roiAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  roiLabel: {
    fontSize: 11,
    color: '#78350F',
    marginBottom: 4,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  featureName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  featureImpact: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  statsBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 11,
    color: '#166534',
  },
  statsValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803D',
  },
});

// Helper functions
const getScoreColor = (score: number): string => {
  if (score <= 30) return '#EF4444';
  if (score <= 50) return '#F97316';
  if (score <= 70) return '#F59E0B';
  if (score <= 85) return '#10B981';
  return '#22C55E';
};

// Removed - using getScoreLabelI18n from translations

// Premium Features Database
interface PremiumFeature {
  id: string;
  name: { cs: string; en: string };
  description: { cs: string; en: string };
  impact: string;
  conversionBoost: number; // percentage
  monthlyValue: number; // CZK
}

const premiumFeatures: PremiumFeature[] = [
  {
    id: 'vibe-system',
    name: { cs: 'Originální hodnocení', en: 'Custom Rating System' },
    description: {
      cs: 'Unikátní škály hodnocení místo obyčejných hvězdiček – zákazníci si to pamatují a citují',
      en: 'Unique rating scales instead of ordinary star ratings - people remember and quote it'
    },
    impact: '+35 % konverze',
    conversionBoost: 35,
    monthlyValue: 28000,
  },
  {
    id: 'quick-exit',
    name: { cs: 'Tlačítko pro rychlý odchod', en: 'Quick Exit Button' },
    description: {
      cs: 'Diskrétní tlačítko pro okamžité přepnutí na neutrální stránku – zvyšuje pocit bezpečí',
      en: 'Discreet button for instant switch to neutral page - increases feeling of safety'
    },
    impact: '+40 % mobilních rezervací',
    conversionBoost: 40,
    monthlyValue: 32000,
  },
  {
    id: 'scent-menu',
    name: { cs: 'Personalizace návštěvy', en: 'Visit Personalization' },
    description: {
      cs: 'Volba preferencí před návštěvou (atmosféra, hudba, detaily) – působí luxusně a profesionálně',
      en: 'Choice of preferences before visit (atmosphere, music, details) - looks luxurious and professional'
    },
    impact: '+20 % prémiového vnímání',
    conversionBoost: 20,
    monthlyValue: 18000,
  },
  {
    id: 'mood-selector',
    name: { cs: 'Výběr nálady', en: 'Choose Your Mood' },
    description: {
      cs: 'Rychlá volba nálady nebo typu služby – inteligentní doporučení podle preferencí klienta',
      en: 'Quick mood or service type selection - intelligent recommendations based on client preferences'
    },
    impact: '+50 % okamžitých rezervací',
    conversionBoost: 50,
    monthlyValue: 42000,
  },
  {
    id: 'live-availability',
    name: { cs: 'Živá dostupnost', en: 'Live Availability' },
    description: {
      cs: 'Kalendář s nejbližšími volnými termíny "dnes / zítra" + inteligentní doporučení podle délky návštěvy',
      en: 'Calendar with nearest available slots "today/tomorrow" + smart recommendations by session length'
    },
    impact: '+45 % rezervací',
    conversionBoost: 45,
    monthlyValue: 38000,
  },
  {
    id: 'verified-reviews',
    name: { cs: 'Ověřené VIBE recenze', en: 'Verified VIBE Reviews' },
    description: {
      cs: 'Recenze pouze od skutečných klientů s VIBE hodnocením – důvěryhodné a profesionální zároveň',
      en: 'Reviews only from real clients with VIBE ratings - trustworthy and sexy at the same time'
    },
    impact: '+30 % důvěry',
    conversionBoost: 30,
    monthlyValue: 25000,
  },
  {
    id: 'session-builder',
    name: { cs: 'Průvodce rezervací', en: 'Session Builder' },
    description: {
      cs: 'Krok za krokem sestavení rezervace: délka → typ služby → doplňky → osoba → termín',
      en: 'Step by step booking composition: length → service type → extras → person → date'
    },
    impact: '+35 % dokončených rezervací',
    conversionBoost: 35,
    monthlyValue: 29000,
  },
  {
    id: 'preference-card',
    name: { cs: 'Karta preferencí', en: 'Preference Card' },
    description: {
      cs: 'Před rezervací: preference komunikace, tempo, tlak, hranice – klient se cítí bezpečně',
      en: 'Before booking: communication preferences, tempo, pressure, boundaries - client feels safe'
    },
    impact: '+25 % vracejících se klientů',
    conversionBoost: 25,
    monthlyValue: 22000,
  },
  {
    id: 'vip-zone',
    name: { cs: 'VIP členská zóna', en: 'VIP/Membership Zone' },
    description: {
      cs: 'Rezervace jedním kliknutím, historie návštěv, oblíbení poskytovatelé, priorita v časech, kreditní systém',
      en: '1-click booking, visit history, favorite providers, time priority, credit system'
    },
    impact: '+60 % věrnosti klientů',
    conversionBoost: 60,
    monthlyValue: 48000,
  },
  {
    id: 'ritual-descriptions',
    name: { cs: 'Storytelling popisy', en: 'Storytelling Descriptions' },
    description: {
      cs: 'Služby popsané s příběhem a atmosférou – ne suchý seznam, ale zážitek',
      en: 'Services described with story and atmosphere - not dry list, but experience'
    },
    impact: '+28 % prémiových rezervací',
    conversionBoost: 28,
    monthlyValue: 24000,
  },
];

// Select random features based on analysis ID (seed)
function selectRandomFeatures(analysisId: string, count: number = 2): PremiumFeature[] {
  // Safe parsing - handle undefined/empty analysisId
  const seed = analysisId ? parseInt(analysisId.split('_')[1] || '0', 10) : 0;
  const shuffled = [...premiumFeatures].sort((a, b) => {
    const aHash = seed + a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bHash = seed + b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return aHash - bHash;
  });
  return shuffled.slice(0, count);
}

// Calculate ROI based on score
function calculateROI(score: number, selectedFeatures: PremiumFeature[]) {
  // Base monthly loss calculation (lower score = higher loss)
  const baseLoss = Math.round((100 - score) * 500); // 0-50k range

  // Potential gain from features
  const featureGain = selectedFeatures.reduce((sum, f) => sum + f.monthlyValue, 0);
  const averageGain = Math.round(featureGain / selectedFeatures.length);

  return {
    currentLoss: baseLoss,
    potentialGain: averageGain,
    totalImpact: baseLoss + averageGain,
  };
}

// Using BUSINESS_TYPE_PDF_LABELS, BUSINESS_TYPE_TEXTS, CATEGORY_PDF_LABELS from translations

const categoryMaxScores: Record<string, number> = {
  speed: 20,
  mobile: 15,
  security: 10,
  seo: 20,
  geo: 15,
  design: 20,
};

// PDF Document Component
function EroWebPDFDocument({ analysis, language = 'cs' }: { analysis: EroWebAnalysis; language?: PDFLocale }) {
  const scoreColor = getScoreColor(analysis.scores.total);
  const scoreLabel = getScoreLabelI18n(analysis.scores.total, language);
  const t = PDF_TEXTS[language];

  // Get business type specific texts
  const btTexts = BUSINESS_TYPE_TEXTS[analysis.businessType]?.[language] || BUSINESS_TYPE_TEXTS['massage'][language];
  const businessTypeLabel = BUSINESS_TYPE_PDF_LABELS[language][analysis.businessType] || analysis.businessType;

  const criticalFindings = (analysis.findings || []).filter((f) => f.type === 'critical');
  const warningFindings = (analysis.findings || []).filter((f) => f.type === 'warning');
  const opportunityFindings = (analysis.findings || []).filter((f) => f.type === 'opportunity');

  // Select random premium features for this analysis
  const selectedFeatures = selectRandomFeatures(analysis.id, 2);
  const roi = calculateROI(analysis.scores.total, selectedFeatures);

  // Mock visitor stats (based on score for consistency)
  const avgMonthlyVisitors = 850;
  const estimatedVisitors = Math.round(avgMonthlyVisitors * (1 + (selectedFeatures[0]?.conversionBoost || 30) / 100));
  const currentConversion = Math.max(2, Math.round(analysis.scores.total / 20)); // 2-5%
  const potentialConversion = currentConversion + 2;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.header}>
            <View>
              <View style={styles.logoContainer}>
                <Text style={styles.logoWeb}>Web</Text>
                <Text style={styles.logoLyx}>lyx</Text>
              </View>
              <Text style={styles.subtitle}>
                {t.reportTitle}
              </Text>
            </View>
            <Text style={styles.date}>
              {new Date(analysis.createdAt).toLocaleDateString(
                language === 'cs' ? 'cs-CZ' : language === 'de' ? 'de-DE' : language === 'ru' ? 'ru-RU' : 'en-US',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </Text>
          </View>
        </View>

        {/* Content padding wrapper */}
        <View style={{ paddingHorizontal: 40 }}>

        {/* Domain Section */}
        <View style={styles.domainSection} wrap={false}>
          <Text style={styles.domainTitle}>{analysis.domain}</Text>
          <Text style={styles.domainUrl}>{analysis.url}</Text>
          <Text style={styles.businessType}>
            {businessTypeLabel}
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.introSection} wrap={false}>
          <Text style={styles.sectionTitle}>
            {t.whyContact}
          </Text>
          <Text style={styles.introText}>
            {t.whyContactText1}
          </Text>
          <Text style={styles.introText}>
            {formatText(t.whyContactText2, { industry: btTexts.industry, clientAction: btTexts.clientAction })}
          </Text>
          <Text style={styles.introText}>
            {t.whyContactText3}
          </Text>
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {analysis.scores.total}
            </Text>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
        </View>

        {/* Categories */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            {t.categoryRatings}
          </Text>
          {Object.entries(categoryMaxScores).map(([key, max]) => {
            const score = analysis.scores[key as keyof typeof analysis.scores] || 0;
            const percentage = (score / max) * 100;
            const color = getScoreColor((score / max) * 100);
            const label = CATEGORY_PDF_LABELS[language][key] || key;

            return (
              <View key={key} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>{label}</Text>
                <View style={styles.categoryBarContainer}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      { width: `${percentage}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                <Text style={styles.categoryScore}>
                  {score}/{max}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Critical Findings */}
        {criticalFindings.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
              {t.criticalIssues}
            </Text>
            {criticalFindings.slice(0, 2).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#EF4444' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description.slice(0, 200)}{f.description.length > 200 ? '...' : ''}</Text>
                {f.impact && (
                  <Text style={styles.findingImpact}>
                    {t.impact}: {f.impact}
                  </Text>
                )}
              </View>
            ))}
            {criticalFindings.length > 2 && (
              <Text style={styles.findingImpact}>
                {formatText(t.moreIssues, { count: criticalFindings.length - 2 })}
              </Text>
            )}
          </View>
        )}

        {/* Warning Findings */}
        {warningFindings.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
              {t.warnings}
            </Text>
            {warningFindings.slice(0, 1).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description.slice(0, 200)}{f.description.length > 200 ? '...' : ''}</Text>
                {f.impact && (
                  <Text style={styles.findingImpact}>
                    {t.impact}: {f.impact}
                  </Text>
                )}
              </View>
            ))}
            {warningFindings.length > 1 && (
              <Text style={styles.findingImpact}>
                {formatText(t.moreWarnings, { count: warningFindings.length - 1 })}
              </Text>
            )}
          </View>
        )}

        {/* Opportunities */}
        {opportunityFindings.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
              {t.opportunities}
            </Text>
            {opportunityFindings.slice(0, 1).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#3B82F6' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description.slice(0, 200)}{f.description.length > 200 ? '...' : ''}</Text>
              </View>
            ))}
            {opportunityFindings.length > 1 && (
              <Text style={styles.findingImpact}>
                {formatText(t.moreOpportunities, { count: opportunityFindings.length - 1 })}
              </Text>
            )}
          </View>
        )}

        {/* Industry Benchmarks */}
        <View style={styles.statsBox} wrap={false}>
          <Text style={styles.sectionTitle}>
            {t.industryBenchmark}
          </Text>
          <Text style={[styles.introText, { marginBottom: 12, fontSize: 10, color: '#6B7280' }]}>
            {formatText(t.dataFrom, { dataSource: btTexts.dataSource })}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>
              {t.monthlyTraffic}
            </Text>
            <Text style={styles.statsValue}>
              {t.visits}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>
              {t.conversionRate}
            </Text>
            <Text style={styles.statsValue}>2–5 %</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>
              {t.afterOptimization}
            </Text>
            <Text style={styles.statsValue}>
              {t.optimizationResult}
            </Text>
          </View>
          <Text style={[styles.introText, { marginTop: 12, fontSize: 9, color: '#9CA3AF' }]}>
            {t.dataNote}
          </Text>
        </View>

        {/* Premium Features - Top Missing */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            {t.topMissingFeatures}
          </Text>
          <Text style={[styles.introText, { marginBottom: 16 }]}>
            {formatText(t.selectedFeatures, { count: selectedFeatures.length })}
          </Text>
          {selectedFeatures.map((feature, idx) => {
            const featureI18n = PREMIUM_FEATURES_I18N[feature.id]?.[language] || { name: feature.name.cs, description: feature.description.cs };
            return (
              <View key={feature.id} style={styles.featureCard} wrap={false}>
                <Text style={styles.featureName}>
                  {idx + 1}. {featureI18n.name}
                </Text>
                <Text style={styles.featureDescription}>
                  {featureI18n.description}
                </Text>
                <Text style={styles.featureImpact}>
                  {feature.impact} • {t.potential}: +{language === 'cs' || language === 'ru'
                    ? `${new Intl.NumberFormat('cs-CZ').format(feature.monthlyValue)} ${t.perMonth}`
                    : `€${Math.round(feature.monthlyValue / 25)}${t.perMonth}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Business Impact Section */}
        <View style={styles.recommendation} wrap={false}>
          <Text style={styles.sectionTitle}>
            {t.expectedResults}
          </Text>
          <Text style={styles.recommendationText}>
            {formatText(t.clientsReported, { industry: btTexts.industry })}
          </Text>
          <Text style={styles.recommendationText}>{t.result1}</Text>
          <Text style={styles.recommendationText}>{t.result2}</Text>
          <Text style={styles.recommendationText}>{t.result3}</Text>
          <Text style={styles.recommendationText}>{t.result4}</Text>
        </View>

        {/* Specific Recommendations */}
        <View style={styles.recommendation} wrap={false}>
          <Text style={styles.sectionTitle}>
            {t.competitorFeatures}
          </Text>
          <Text style={styles.recommendationText}>{t.feature1}</Text>
          <Text style={styles.recommendationText}>{t.feature2}</Text>
          <Text style={styles.recommendationText}>{t.feature3}</Text>
          <Text style={styles.recommendationText}>{t.feature4}</Text>
          <Text style={styles.recommendationText}>{t.feature5}</Text>
          <Text style={styles.recommendationText}>{t.feature6}</Text>
          <Text style={styles.recommendationText}>{t.feature7}</Text>
        </View>

        {/* Original Recommendation - Show for all languages if available */}
        {analysis.recommendation && (
          <View style={styles.recommendation} wrap={false}>
            <Text style={styles.sectionTitle}>
              {t.technicalAnalysis}
            </Text>
            <Text style={styles.recommendationText}>{analysis.recommendation.slice(0, 450)}{analysis.recommendation.length > 450 ? '...' : ''}</Text>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.pricing} wrap={false}>
          <Text style={styles.sectionTitle}>{t.investment}</Text>
          <Text style={styles.pricingText}>
            {t.investmentText}
          </Text>
          <View style={styles.pricingBox} wrap={false}>
            <Text style={styles.pricingLabel}>
              {t.typicalProject}
            </Text>
            <Text style={styles.pricingAmount}>
              {t.priceRange}
            </Text>
          </View>
          <Text style={styles.pricingNote}>
            {t.includes}
          </Text>
          <Text style={styles.pricingNote}>
            {t.roi}
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps} wrap={false}>
          <Text style={styles.sectionTitle}>
            {t.nextSteps}
          </Text>

          <View style={styles.stepItem} wrap={false}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t.step1Title}</Text>
              <Text style={styles.stepDescription}>{t.step1Text}</Text>
            </View>
          </View>

          <View style={styles.stepItem} wrap={false}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t.step2Title}</Text>
              <Text style={styles.stepDescription}>{t.step2Text}</Text>
            </View>
          </View>

          <View style={styles.stepItem} wrap={false}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t.step3Title}</Text>
              <Text style={styles.stepDescription}>{t.step3Text}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.footerBold}>Weblyx.cz</Text>
            {' – '}
            {t.footerSlogan}
          </Text>
          <Text style={styles.footerText}>
            E-mail: <Text style={styles.footerLink}>info@weblyx.cz</Text> |
            Tel: <Text style={styles.footerLink}>+420 702 110 166</Text> |
            Web: <Text style={styles.footerLink}>weblyx.cz</Text>
          </Text>
          <Text style={styles.footerText}>
            {t.footerResponse}
          </Text>
          <Text style={styles.footerSmall}>
            Altro Servis Group s.r.o. | IČO: 23673389 |{' '}
            {t.footerLocation}
          </Text>
        </View>

        </View>{/* End of padding wrapper */}
      </Page>
    </Document>
  );
}
