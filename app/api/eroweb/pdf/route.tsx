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
    padding: 40,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#14B8A6',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginRight: 4,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  logoHighlight: {
    color: '#14B8A6',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoContainer}>
              <Text style={styles.logoMark}>W</Text>
              <Text style={styles.logo}>
                Web<Text style={styles.logoHighlight}>lyx</Text>
              </Text>
            </View>
            <Text style={styles.subtitle}>✨ EroWeb Analýza • Business Report 2026</Text>
          </View>
          <Text style={styles.date}>
            {new Date(analysis.createdAt).toLocaleDateString('cs-CZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Domain Section */}
        <View style={styles.domainSection}>
          <Text style={styles.domainTitle}>{analysis.domain}</Text>
          <Text style={styles.domainUrl}>{analysis.url}</Text>
          <Text style={styles.businessType}>
            {businessTypeLabels[analysis.businessType] || analysis.businessType}
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>✨ Proč jsme vás kontaktovali?</Text>
          <Text style={styles.introText}>
            Protože vidíme obrovský potenciál! 🚀 Analyzovali jsme váš web a zjistili jsme, kde přesně ztrácíte zákazníky. A hlavně - jak to napravit.
          </Text>
          <Text style={styles.introText}>
            💡 V oboru erotických masáží dneska rozhoduje rychlost. Klient otevře 3-5 webů konkurence a vybere si do 30 sekund. Pokud váš web načítá pomalu, nemá WhatsApp button nebo vypadá zastarale na mobilu - jste ven.
          </Text>
          <Text style={styles.introText}>
            🎯 A tady je klíč: Většina vaší konkurence to dělá špatně. To je vaše šance! S pár konkrétními úpravami můžete být výrazně vidět, získat více dotazů a rezervací.
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Hodnocení podle kategorií</Text>
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
              🚨 Kritické problémy (řešte ASAP!)
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
            <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>⚠️ Varování (vylepšit brzy)</Text>
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
            <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>🎯 Příležitosti (konkurenční výhoda!)</Text>
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

        {/* Business Impact Section */}
        <View style={styles.recommendation} wrap={false}>
          <Text style={styles.sectionTitle}>💰 Co vám to přinese?</Text>
          <Text style={styles.recommendationText}>
            Naši klienti v oboru erotických masáží po optimalizaci webu zaznamenali:
          </Text>
          <Text style={styles.recommendationText}>
            🔥 +45% více rezervací online
          </Text>
          <Text style={styles.recommendationText}>
            📱 +60% dotazů přes WhatsApp (pokud přidají button)
          </Text>
          <Text style={styles.recommendationText}>
            ⚡ -70% okamžitých odchodů díky rychlejšímu načítání
          </Text>
          <Text style={styles.recommendationText}>
            🎯 +80% viditelnosti v AI vyhledávačích (ChatGPT, Perplexity)
          </Text>
        </View>

        {/* Specific Recommendations */}
        <View style={styles.recommendation} wrap={false}>
          <Text style={styles.sectionTitle}>🔥 Features, které konkurence NEMÁ (váš klíč k úspěchu!)</Text>
          <Text style={styles.recommendationText}>
            1. 🤖 GEO/AIEO optimalizace - buďte VIDITELNÍ v ChatGPT a Perplexity! 80% mladých klientů tam hledá
          </Text>
          <Text style={styles.recommendationText}>
            2. 💬 AI Chatbot 24/7 - odpovídá okamžitě i v noci, rezervuje termíny, neztrácíte jediného klienta
          </Text>
          <Text style={styles.recommendationText}>
            3. 📊 Live dashboard - vidíte v reálném čase, kdo je na webu, odkud přišel, co ho zajímá
          </Text>
          <Text style={styles.recommendationText}>
            4. 🌍 Auto-translate (CZ/EN/DE/UKR/RU) - stránka se přepne podle IP adresy návštěvníka
          </Text>
          <Text style={styles.recommendationText}>
            5. 📅 Smart kalendář - automaticky nabízí nejbližší volné termíny, posílá SMS připomínky
          </Text>
          <Text style={styles.recommendationText}>
            6. 🔔 Push notifikace - pošlete speciální akce přímo do mobilu klientů (i když nejsou na webu!)
          </Text>
          <Text style={styles.recommendationText}>
            7. ⚡ Sub-2s loading - váš web načte rychleji než konkurence zmáčkne enter (Google vás odměňuje)
          </Text>
        </View>

        {/* Original Recommendation */}
        {analysis.recommendation && (
          <View style={styles.recommendation} wrap={false}>
            <Text style={styles.sectionTitle}>📊 Technický rozbor</Text>
            <Text style={styles.recommendationText}>{analysis.recommendation.slice(0, 600)}{analysis.recommendation.length > 600 ? '...' : ''}</Text>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.pricing}>
          <Text style={styles.sectionTitle}>💰 Kolik to stojí?</Text>
          <Text style={styles.pricingText}>
            Cena je VŽDY na míru podle toho, co potřebujete. Žádné drahé balíčky, které nevyužijete. Platíte jen za to, co vám reálně přinese klienty.
          </Text>
          <View style={styles.pricingBox}>
            <Text style={styles.pricingLabel}>📊 Typický projekt (kompletní optimalizace):</Text>
            <Text style={styles.pricingAmount}>30 000 - 149 990 Kč</Text>
          </View>
          <Text style={styles.pricingNote}>
            ✨ Zahrnuje: Analýzu, design, vývoj, GEO/AIEO optimalizaci, testování a spuštění.
          </Text>
          <Text style={styles.pricingNote}>
            🚀 ROI: Průměrně se investice vrátí za 2-4 měsíce díky zvýšenému počtu rezervací.
          </Text>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps} wrap={false}>
          <Text style={styles.sectionTitle}>🚀 Co teď?</Text>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>📞 Zavolejte nebo napište (15 minut, nezávazně)</Text>
              <Text style={styles.stepDescription}>
                Probereme s vámi konkrétně, co by vašemu webu pomohlo nejvíc. Žádný sales pitch, jen praktické rady. I když se nakonec nerozhodnete pro spolupráci, budete mít jasno.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>💰 Dostanete nabídku přesně na míru (0 Kč)</Text>
              <Text style={styles.stepDescription}>
                Připravíme detailní plán s konkrétními kroky, cenami a termíny. Transparentně. Budete přesně vědět, co dostanete a za kolik.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>🎯 Začneme a uvidíte výsledky</Text>
              <Text style={styles.stepDescription}>
                Žádné dlouhé čekání. První změny uvidíte během 2 týdnů. Průběžně vás budeme informovat a ukážeme měřitelné výsledky - více dotazů, rezervací, tržeb.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.footerBold}>⚡ Weblyx.cz</Text> - Weby, které prodávají. I v AI vyhledávačích.
          </Text>
          <Text style={styles.footerText}>
            📧 <Text style={styles.footerLink}>info@weblyx.cz</Text> |
            📱 <Text style={styles.footerLink}>+420 702 110 166</Text> |
            🌐 <Text style={styles.footerLink}>weblyx.cz</Text>
          </Text>
          <Text style={styles.footerText}>
            💬 Nejrychlejší odpověď: WhatsApp nebo email. Reagujeme do 2 hodin.
          </Text>
          <Text style={styles.footerSmall}>Altro Servis Group s.r.o. | IČO: 23673389 | Praha, Česká republika</Text>
        </View>
      </Page>
    </Document>
  );
}
