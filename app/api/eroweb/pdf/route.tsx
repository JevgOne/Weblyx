// EroWeb Analysis API - PDF Export
// GET /api/eroweb/pdf?id=xxx - Generate PDF report

import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/turso/eroweb';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { EroWebAnalysis } from '@/types/eroweb';

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

    // Generate PDF using React PDF
    const pdfDoc = <EroWebPDFDocument analysis={analysis} />;
    const pdfBlob = await pdf(pdfDoc).toBlob();
    const pdfBuffer = await pdfBlob.arrayBuffer();

    // Return PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="eroweb-analyza-${analysis.domain}.pdf"`,
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
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  if (score <= 30) return 'Kriticky stav';
  if (score <= 50) return 'Podprumerny';
  if (score <= 70) return 'Prumerny';
  if (score <= 85) return 'Dobry';
  return 'Vyborny';
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

// PDF Document Component
function EroWebPDFDocument({ analysis }: { analysis: EroWebAnalysis }) {
  const scoreColor = getScoreColor(analysis.scores.total);
  const scoreLabel = getScoreLabel(analysis.scores.total);

  const criticalFindings = (analysis.findings || []).filter((f) => f.type === 'critical');
  const warningFindings = (analysis.findings || []).filter((f) => f.type === 'warning');
  const opportunityFindings = (analysis.findings || []).filter((f) => f.type === 'opportunity');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Weblyx.cz</Text>
            <Text style={styles.subtitle}>EroWeb Analyza</Text>
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
          <Text style={styles.sectionTitle}>Hodnoceni podle kategorii</Text>
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
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
              Kriticke problemy
            </Text>
            {criticalFindings.slice(0, 3).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#EF4444' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description}</Text>
                {f.impact && <Text style={styles.findingImpact}>Dopad: {f.impact}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Warning Findings */}
        {warningFindings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Varovani</Text>
            {warningFindings.slice(0, 2).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#F59E0B' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description}</Text>
                {f.impact && <Text style={styles.findingImpact}>Dopad: {f.impact}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Opportunities */}
        {opportunityFindings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>Prilezitosti</Text>
            {opportunityFindings.slice(0, 2).map((f, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: '#3B82F6' }]}>
                <Text style={styles.findingTitle}>{f.title}</Text>
                <Text style={styles.findingDescription}>{f.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendation */}
        {analysis.recommendation && (
          <View style={styles.recommendation}>
            <Text style={styles.sectionTitle}>Nase doporuceni</Text>
            <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.footerBold}>Weblyx.cz</Text> - Moderni weby pro moderni byznys
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerLink}>info@weblyx.cz</Text> |{' '}
            <Text style={styles.footerLink}>+420 702 110 166</Text> |{' '}
            <Text style={styles.footerLink}>weblyx.cz</Text>
          </Text>
          <Text style={styles.footerSmall}>Altro Servis Group s.r.o. | ICO: 23673389</Text>
        </View>
      </Page>
    </Document>
  );
}
