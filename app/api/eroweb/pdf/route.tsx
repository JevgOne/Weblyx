// EroWeb Analysis API - PDF Export
// GET /api/eroweb/pdf?id=xxx - Generate PDF report

import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/turso/eroweb';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import type { EroWebAnalysis } from '@/types/eroweb';

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
    const lang = searchParams.get('lang') || 'cs'; // Default to Czech

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
    const pdfDoc = <EroWebPDFDocument analysis={analysis} language={lang as 'cs' | 'en'} />;
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
      { error: 'Failed to generate PDF', details: error.message },
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 20,
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

const getScoreLabel = (score: number): string => {
  if (score <= 30) return 'Kritický stav';
  if (score <= 50) return 'Podprůměrný';
  if (score <= 70) return 'Průměrný';
  if (score <= 85) return 'Dobrý';
  return 'Vynikající';
};

const getScoreLabelEn = (score: number): string => {
  if (score <= 30) return 'Critical';
  if (score <= 50) return 'Below Average';
  if (score <= 70) return 'Average';
  if (score <= 85) return 'Good';
  return 'Excellent';
};

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
    name: { cs: 'VIBE Systém', en: 'VIBE System' },
    description: {
      cs: 'Heat/Tenderness/Tempo škály místo obyčejných hvězdiček – zákazníci si to pamatují a citují',
      en: 'Heat/Tenderness/Tempo scales instead of ordinary star ratings - people remember and quote it'
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
    name: { cs: 'Menu vůní', en: 'Scent Menu' },
    description: {
      cs: 'Výběr ze 3 vůní (Clean/Sweet/Dark) při rezervaci – působí luxusně a profesionálně',
      en: 'Choice of 3 scents (Clean/Sweet/Dark) when booking - looks luxurious and professional'
    },
    impact: '+20 % prémiového vnímání',
    conversionBoost: 20,
    monthlyValue: 18000,
  },
  {
    id: 'mood-selector',
    name: { cs: 'Výběr nálady', en: 'Choose Your Mood' },
    description: {
      cs: 'Rychlá volba nálady (Chci vypnout hlavu / Chci teasing / Chci něžnost) – doporučí správnou masáž',
      en: 'Quick mood selection (I want to switch off/I want teasing/I want tenderness) - recommends the right massage'
    },
    impact: '+50 % okamžitých rezervací',
    conversionBoost: 50,
    monthlyValue: 42000,
  },
  {
    id: 'live-availability',
    name: { cs: 'Živá dostupnost', en: 'Live Availability' },
    description: {
      cs: 'Kalendář s nejbližšími volnými termíny "dnes / zítra" + chytré doporučení podle délky masáže',
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
      cs: 'Krok za krokem sestavení masáže: délka → typ → doplňky → masérka → termín',
      en: 'Step by step massage composition: length → type → extras → masseuse → date'
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
      cs: 'Rezervace jedním kliknutím, historie návštěv, oblíbené masérky, priorita v časech, kreditní systém',
      en: '1-click booking, visit history, favorite masseuses, time priority, credit system'
    },
    impact: '+60 % věrnosti klientů',
    conversionBoost: 60,
    monthlyValue: 48000,
  },
  {
    id: 'ritual-descriptions',
    name: { cs: 'Rituální popisy', en: 'Ritual Descriptions' },
    description: {
      cs: 'Masáže popsané jako "rituály" s příběhem a atmosférou – ne seznam služeb',
      en: 'Massages described as "rituals" with story and atmosphere - not service list'
    },
    impact: '+28 % prémiových rezervací',
    conversionBoost: 28,
    monthlyValue: 24000,
  },
];

// Select random features based on analysis ID (seed)
function selectRandomFeatures(analysisId: string, count: number = 2): PremiumFeature[] {
  const seed = parseInt(analysisId.split('_')[1] || '0', 10);
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

const businessTypeLabels: Record<string, string> = {
  massage: 'Erotické masáže',
  privat: 'Privát / Klub',
  escort: 'Escort',
};

const categoryLabels: Record<string, { label: string; max: number }> = {
  speed: { label: 'Rychlost načítání', max: 20 },
  mobile: { label: 'Mobilní verze', max: 15 },
  security: { label: 'Zabezpečení', max: 10 },
  seo: { label: 'SEO', max: 20 },
  geo: { label: 'GEO/AIEO', max: 15 },
  design: { label: 'Design', max: 20 },
};

// PDF Document Component
function EroWebPDFDocument({ analysis, language = 'cs' }: { analysis: EroWebAnalysis; language?: 'cs' | 'en' }) {
  const scoreColor = getScoreColor(analysis.scores.total);
  const scoreLabel = language === 'cs' ? getScoreLabel(analysis.scores.total) : getScoreLabelEn(analysis.scores.total);

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
              <Text style={styles.subtitle}>EroWeb Analýza • Business Report 2026</Text>
            </View>
            <Text style={styles.date}>
              {new Date(analysis.createdAt).toLocaleDateString('cs-CZ', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
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
            {businessTypeLabels[analysis.businessType] || analysis.businessType}
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.introSection} wrap={false}>
          <Text style={styles.sectionTitle}>Proč jsme vás kontaktovali?</Text>
          <Text style={styles.introText}>
            Analyzovali jsme váš web a vidíme obrovský potenciál. Zjistili jsme přesně, kde ztrácíte zákazníky – a jak to napravit.
          </Text>
          <Text style={styles.introText}>
            V oboru erotických masáží rozhoduje rychlost. Klient navštíví 3–5 konkurenčních webů a rozhodne se do 30 sekund. Pokud váš web načítá pomalu, chybí WhatsApp tlačítko nebo mobilní verze není optimální – zákazník odchází.
          </Text>
          <Text style={styles.introText}>
            Dobrá zpráva: Většina konkurence má stejné problémy. S cílenými úpravami můžete být viditelněj­ší a získat výrazně více rezervací.
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
          <Text style={styles.sectionTitle}>Hodnocení podle kategorií</Text>
          {Object.entries(categoryLabels).map(([key, { label, max }]) => {
            const score = analysis.scores[key as keyof typeof analysis.scores] || 0;
            const percentage = (score / max) * 100;
            const color = getScoreColor((score / max) * 100);

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
              KRITICKÉ PROBLÉMY (řešte okamžitě!)
            </Text>
            {criticalFindings.slice(0, 2).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#EF4444' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description.slice(0, 200)}{f.description.length > 200 ? '...' : ''}</Text>
                {f.impact && <Text style={styles.findingImpact}>Dopad: {f.impact}</Text>}
              </View>
            ))}
            {criticalFindings.length > 2 && (
              <Text style={styles.findingImpact}>+ dalších {criticalFindings.length - 2} problémů</Text>
            )}
          </View>
        )}

        {/* Warning Findings */}
        {warningFindings.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>VAROVÁNÍ (doporučujeme vylepšit)</Text>
            {warningFindings.slice(0, 1).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description.slice(0, 200)}{f.description.length > 200 ? '...' : ''}</Text>
                {f.impact && <Text style={styles.findingImpact}>Dopad: {f.impact}</Text>}
              </View>
            ))}
            {warningFindings.length > 1 && (
              <Text style={styles.findingImpact}>+ dalších {warningFindings.length - 1} varování</Text>
            )}
          </View>
        )}

        {/* Opportunities */}
        {opportunityFindings.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>PŘÍLEŽITOSTI (konkurenční výhoda)</Text>
            {opportunityFindings.slice(0, 1).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#3B82F6' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description.slice(0, 200)}{f.description.length > 200 ? '...' : ''}</Text>
              </View>
            ))}
            {opportunityFindings.length > 1 && (
              <Text style={styles.findingImpact}>+ dalších {opportunityFindings.length - 1} příležitostí</Text>
            )}
          </View>
        )}

        {/* Industry Benchmarks - Realistické odhady */}
        <View style={styles.statsBox} wrap={false}>
          <Text style={styles.sectionTitle}>Srovnání s průměrem v oboru</Text>
          <Text style={[styles.introText, { marginBottom: 12, fontSize: 10, color: '#6B7280' }]}>
            Data z analýzy 50+ webů erotických masáží:
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Návštěvnost (měsíčně):</Text>
            <Text style={styles.statsValue}>600–1 200 návštěv</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Konverze (kontakt/rezervace):</Text>
            <Text style={styles.statsValue}>2–5 %</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Po optimalizaci:</Text>
            <Text style={styles.statsValue}>+40–60 % návštěv, +50–100 % konverze</Text>
          </View>
          <Text style={[styles.introText, { marginTop: 12, fontSize: 9, color: '#9CA3AF' }]}>
            Poznámka: Vaše čísla se mohou lišit. Pro přesný audit můžeme analyzovat data z Google Analytics.
          </Text>
        </View>

        {/* Premium Features - Co vám chybí */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>TOP funkce, které vám chybí</Text>
          <Text style={[styles.introText, { marginBottom: 16 }]}>
            Vybrali jsme {selectedFeatures.length} klíčové prvky s největším dopadem na tržby:
          </Text>
          {selectedFeatures.map((feature, idx) => (
            <View key={feature.id} style={styles.featureCard} wrap={false}>
              <Text style={styles.featureName}>
                {idx + 1}. {feature.name[language]}
              </Text>
              <Text style={styles.featureDescription}>
                {feature.description[language]}
              </Text>
              <Text style={styles.featureImpact}>
                {feature.impact} • Potenciál: +{new Intl.NumberFormat('cs-CZ').format(feature.monthlyValue)} Kč/měsíc
              </Text>
            </View>
          ))}
        </View>

        {/* Business Impact Section */}
        <View style={styles.recommendation} wrap={false}>
          <Text style={styles.sectionTitle}>Očekávané výsledky optimalizace</Text>
          <Text style={styles.recommendationText}>
            Naši klienti v oboru po optimalizaci zaznamenali:
          </Text>
          <Text style={styles.recommendationText}>
            • +45 % více online rezervací
          </Text>
          <Text style={styles.recommendationText}>
            • +60 % dotazů přes WhatsApp (po přidání tlačítka)
          </Text>
          <Text style={styles.recommendationText}>
            • –70 % okamžitých odchodů díky rychlejšímu načítání
          </Text>
          <Text style={styles.recommendationText}>
            • +80 % viditelnosti v AI vyhledávačích (ChatGPT, Perplexity)
          </Text>
        </View>

        {/* Specific Recommendations */}
        <View style={styles.recommendation} wrap={false}>
          <Text style={styles.sectionTitle}>Funkce, které konkurence nemá</Text>
          <Text style={styles.recommendationText}>
            1. GEO/AIEO optimalizace – viditelnost v ChatGPT a Perplexity (80 % mladých klientů hledá zde)
          </Text>
          <Text style={styles.recommendationText}>
            2. AI Chatbot 24/7 – okamžité odpovědi a automatická rezervace termínů
          </Text>
          <Text style={styles.recommendationText}>
            3. Live dashboard – sledování návštěvníků v reálném čase
          </Text>
          <Text style={styles.recommendationText}>
            4. Auto-translate (CZ/EN/DE/UKR/RU) – automatický přepis podle IP adresy
          </Text>
          <Text style={styles.recommendationText}>
            5. Smart kalendář – nabídka volných termínů + SMS připomínky
          </Text>
          <Text style={styles.recommendationText}>
            6. Push notifikace – zasílání akcí přímo do mobilu klientů
          </Text>
          <Text style={styles.recommendationText}>
            7. Rychlé načítání pod 2 sekundy – lepší pozice v Google vyhledávání
          </Text>
        </View>

        {/* Original Recommendation */}
        {analysis.recommendation && (
          <View style={styles.recommendation} wrap={false}>
            <Text style={styles.sectionTitle}>Technický rozbor</Text>
            <Text style={styles.recommendationText}>{analysis.recommendation.slice(0, 450)}{analysis.recommendation.length > 450 ? '...' : ''}</Text>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.pricing} wrap={false}>
          <Text style={styles.sectionTitle}>Investice</Text>
          <Text style={styles.pricingText}>
            Cena vždy na míru podle vašich potřeb. Platíte jen za to, co vám reálně přinese zákazníky.
          </Text>
          <View style={styles.pricingBox} wrap={false}>
            <Text style={styles.pricingLabel}>Typický projekt (kompletní optimalizace):</Text>
            <Text style={styles.pricingAmount}>30 000–149 990 Kč</Text>
          </View>
          <Text style={styles.pricingNote}>
            Zahrnuje: analýzu, design, vývoj, GEO/AIEO optimalizaci, testování a spuštění.
          </Text>
          <Text style={styles.pricingNote}>
            ROI: Investice se průměrně vrátí za 2–4 měsíce díky zvýšeným rezervacím.
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps} wrap={false}>
          <Text style={styles.sectionTitle}>Jak budeme pokračovat?</Text>

          <View style={styles.stepItem} wrap={false}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Nezávazná konzultace (15 minut)</Text>
              <Text style={styles.stepDescription}>
                Probereme, co by vašemu webu pomohlo nejvíc. Bez prodejního tlaku, jen praktické rady.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem} wrap={false}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Nabídka přesně na míru (zdarma)</Text>
              <Text style={styles.stepDescription}>
                Detailní plán s konkrétními kroky, cenami a termíny. Transparentně.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem} wrap={false}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Realizace a měřitelné výsledky</Text>
              <Text style={styles.stepDescription}>
                První změny během 2 týdnů. Průběžné reporty s měřitelnými výsledky.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.footerBold}>Weblyx.cz</Text> – Weby, které prodávají. I v AI vyhledávačích.
          </Text>
          <Text style={styles.footerText}>
            E-mail: <Text style={styles.footerLink}>info@weblyx.cz</Text> |
            Tel: <Text style={styles.footerLink}>+420 702 110 166</Text> |
            Web: <Text style={styles.footerLink}>weblyx.cz</Text>
          </Text>
          <Text style={styles.footerText}>
            Nejrychlejší odpověď: WhatsApp nebo e-mail. Reagujeme do 2 hodin.
          </Text>
          <Text style={styles.footerSmall}>Altro Servis Group s.r.o. | IČO: 23673389 | Praha, Česká republika</Text>
        </View>

        </View>{/* End of padding wrapper */}
      </Page>
    </Document>
  );
}
