import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { WebAnalysisResult, PromoCode } from '@/types/cms';

// Weblyx Brand Colors
const BRAND_COLOR = '#14B8A6'; // Teal primary
const BRAND_SECONDARY = '#06B6D4'; // Cyan secondary
const BRAND_DARK = '#0F172A'; // Dark text

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: `3px solid ${BRAND_COLOR}`,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BRAND_DARK,
  },
  logoAccent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BRAND_COLOR,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 8,
  },
  scoreContainer: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  issueCard: {
    backgroundColor: '#fef2f2',
    padding: 15,
    marginBottom: 12,
    borderRadius: 6,
    borderLeft: '4px solid #dc2626',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    padding: 15,
    marginBottom: 12,
    borderRadius: 6,
    borderLeft: '4px solid #f59e0b',
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    padding: 15,
    marginBottom: 12,
    borderRadius: 6,
    borderLeft: '4px solid #3b82f6',
  },
  issueTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  issueText: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3,
    lineHeight: 1.4,
  },
  recommendationBox: {
    backgroundColor: '#ede9fe',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5b21b6',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 11,
    color: '#4c1d95',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  bulletPoint: {
    fontSize: 10,
    color: '#4c1d95',
    marginBottom: 5,
    marginLeft: 15,
  },
  promoBox: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 8,
    border: '2px dashed #f59e0b',
    marginTop: 20,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  promoCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    letterSpacing: 3,
    marginVertical: 10,
    fontFamily: 'Courier',
  },
  promoDetails: {
    fontSize: 10,
    color: '#78350f',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  technicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 10,
  },
  technicalLabel: {
    color: '#6b7280',
  },
  technicalValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #e5e7eb',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 3,
  },
  ctaBox: {
    backgroundColor: BRAND_COLOR,
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  ctaSubtext: {
    fontSize: 10,
    color: '#f0fdfa',
  },
  contactInfo: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  contactItem: {
    fontSize: 9,
    color: '#ffffff',
  },
});

interface PDFReportProps {
  analysis: WebAnalysisResult;
  promoCode?: PromoCode;
  businessName?: string;
}

export const WebAnalysisReport: React.FC<PDFReportProps> = ({ analysis, promoCode, businessName }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <Document>
      {/* Page 1 - Cover & Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.logo}>Web</Text>
                <Text style={styles.logoAccent}>lyx</Text>
              </View>
              <Text style={styles.headerSubtitle}>Moderní weby s důrazem na SEO</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: BRAND_COLOR, fontWeight: 'bold' }}>
              ANALÝZA WEBU
            </Text>
            <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>
              {new Date(analysis.analyzedAt).toLocaleDateString('cs-CZ')}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={styles.title}>
            {businessName ? `Analýza webu ${businessName}` : 'Analýza webu'}
          </Text>
          <Text style={styles.subtitle}>{analysis.url}</Text>
          <Text style={[styles.subtitle, { fontSize: 10 }]}>
            Datum analýzy: {new Date(analysis.analyzedAt).toLocaleDateString('cs-CZ')}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreNumber, { color: getScoreColor(analysis.overallScore) }]}>
            {analysis.overallScore}
          </Text>
          <Text style={styles.scoreLabel}>Celkové skóre webu (0-100)</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#dc2626' }]}>
              {analysis.issueCount.critical}
            </Text>
            <Text style={styles.statLabel}>Kritické problémy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
              {analysis.issueCount.warning}
            </Text>
            <Text style={styles.statLabel}>Varování</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
              {analysis.issueCount.info}
            </Text>
            <Text style={styles.statLabel}>Informace</Text>
          </View>
        </View>

        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationTitle}>
            Doporučený balíček: {analysis.recommendation.packageName}
          </Text>
          <Text style={styles.recommendationText}>
            {analysis.recommendation.reasoning}
          </Text>
          <Text style={[styles.issueTitle, { color: '#5b21b6', marginBottom: 8 }]}>
            Co tento balíček vyřeší:
          </Text>
          {analysis.recommendation.matchedNeeds.map((need, idx) => (
            <Text key={idx} style={styles.bulletPoint}>
              • {need}
            </Text>
          ))}
        </View>

        {promoCode && (
          <View style={styles.promoBox}>
            <Text style={styles.promoTitle}>Speciální nabídka pro vás</Text>
            <Text style={{ fontSize: 10, color: '#78350f', marginBottom: 10 }}>
              {promoCode.description}
            </Text>
            <Text style={styles.promoCode}>{promoCode.code}</Text>
            <Text style={styles.promoDetails}>
              {promoCode.discountType === 'percentage'
                ? `Sleva ${promoCode.discountValue}%`
                : `Sleva ${promoCode.discountValue} Kč`}
              {' · '}
              Platnost do {new Date(promoCode.validUntil).toLocaleDateString('cs-CZ')}
            </Text>
          </View>
        )}

        {/* CTA Box */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>Ozvěte se nám!</Text>
          <Text style={styles.ctaSubtext}>
            Rádi s vámi probereme výsledky analýzy a navrhneme řešení na míru
          </Text>
          <View style={{ marginTop: 15, alignItems: 'center' }}>
            <Text style={[styles.contactItem, { marginBottom: 5 }]}>
              info@weblyx.cz  |  +420 702 110 166
            </Text>
            <Text style={styles.contactItem}>
              www.weblyx.cz
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Weblyx © {new Date().getFullYear()} | Moderní weby s důrazem na SEO a výkon</Text>
        </View>
      </Page>

      {/* Page 2 - Critical Issues */}
      {analysis.issues.filter(i => i.category === 'critical').length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.logo}>Web</Text>
                <Text style={styles.logoAccent}>lyx</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: BRAND_COLOR }}>Analýza webu</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kritické problémy</Text>
            {analysis.issues
              .filter(i => i.category === 'critical')
              .map((issue, idx) => (
                <View key={idx} style={styles.issueCard}>
                  <Text style={[styles.issueTitle, { color: '#991b1b' }]}>
                    {issue.title}
                  </Text>
                  <Text style={styles.issueText}>
                    {issue.description}
                  </Text>
                  <Text style={[styles.issueText, { marginTop: 5 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Dopad: </Text>
                    {issue.impact}
                  </Text>
                  <Text style={[styles.issueText, { marginTop: 3 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Řešení: </Text>
                    {issue.recommendation}
                  </Text>
                </View>
              ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Strana 2</Text>
          </View>
        </Page>
      )}

      {/* Page 3 - Warnings & Technical Details */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>WEBLYX</Text>
          <Text style={styles.headerSubtitle}>Analýza webu</Text>
        </View>

        {analysis.issues.filter(i => i.category === 'warning').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Varování</Text>
            {analysis.issues
              .filter(i => i.category === 'warning')
              .slice(0, 5)
              .map((issue, idx) => (
                <View key={idx} style={styles.warningCard}>
                  <Text style={[styles.issueTitle, { color: '#92400e' }]}>
                    {issue.title}
                  </Text>
                  <Text style={styles.issueText}>
                    {issue.description}
                  </Text>
                  <Text style={[styles.issueText, { marginTop: 3 }]}>
                    <Text style={{ fontWeight: 'bold' }}>Řešení: </Text>
                    {issue.recommendation}
                  </Text>
                </View>
              ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technické detaily</Text>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>SSL/HTTPS:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.hasSSL ? 'Ano' : 'Ne'}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Mobilní optimalizace:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.mobileResponsive ? 'Ano' : 'Ne'}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Title tag:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.title ? 'Ano' : 'Ne'}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Meta description:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.description ? 'Ano' : 'Ne'}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>H1 nadpis:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.h1Count} ks
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Celkem obrázků:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.totalImages} ({analysis.technical.imagesWithoutAlt} bez ALT)
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Interní odkazy:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.internalLinks}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Externí odkazy:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.externalLinks}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Sitemap.xml:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.hasSitemap ? 'Ano' : 'Ne'}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Robots.txt:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.hasRobotsTxt ? 'Ano' : 'Ne'}
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Čas načtení:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.loadTime}ms
            </Text>
          </View>
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Schema markup:</Text>
            <Text style={styles.technicalValue}>
              {analysis.technical.schemaMarkup ? 'Ano' : 'Ne'}
            </Text>
          </View>
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>Nezávazná konzultace zdarma</Text>
          <Text style={styles.ctaSubtext}>weblyx.cz/kontakt</Text>
          <Text style={[styles.ctaSubtext, { marginTop: 5 }]}>+420 702 110 166</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Strana 3</Text>
        </View>
      </Page>
    </Document>
  );
};

export default WebAnalysisReport;
