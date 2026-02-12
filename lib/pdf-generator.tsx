import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { WebAnalysisResult, PromoCode } from '@/types/cms';

// Register fonts with UTF-8 support for Czech characters
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

// Weblyx Brand Colors
const BRAND = '#14B8A6';
const BRAND_DARK = '#0F172A';
const GRAY = '#6b7280';
const GREEN = '#10b981';
const RED = '#ef4444';
const YELLOW = '#f59e0b';
const BLUE = '#3b82f6';

const s = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff', fontFamily: 'Roboto', fontSize: 10 },
  // Header
  headerBanner: { backgroundColor: BRAND, padding: 20, marginBottom: 20, marginHorizontal: -30, marginTop: -30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'baseline' },
  logoWeb: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  logoLyx: { fontSize: 24, fontWeight: 'bold', color: '#FDB912' },
  headerSub: { fontSize: 9, color: '#ffffff', marginTop: 4, opacity: 0.9 },
  headerDate: { fontSize: 9, color: '#ffffff', fontWeight: 500 },
  headerRight: { fontSize: 11, color: '#ffffff', fontWeight: 'bold', letterSpacing: 1 },
  // Title
  title: { fontSize: 22, fontWeight: 'bold', color: BRAND_DARK, marginBottom: 6 },
  subtitle: { fontSize: 12, color: BRAND, fontWeight: 500, marginBottom: 4 },
  dateText: { fontSize: 9, color: GRAY, marginBottom: 20 },
  // Score
  scoreBox: { backgroundColor: '#f0fdfa', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: BRAND, borderStyle: 'solid' },
  scoreNumber: { fontSize: 52, fontWeight: 'bold', marginBottom: 4 },
  scoreLabel: { fontSize: 11, color: GRAY, fontWeight: 500 },
  scoreBadge: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 50, color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  // Stats row
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#f9fafb', padding: 14, marginHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 8, color: GRAY, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  // Section
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: BRAND_DARK, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  // Recommendation
  recBox: { backgroundColor: '#ecfdf5', padding: 16, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: GREEN, borderStyle: 'solid' },
  recTitle: { fontSize: 13, fontWeight: 'bold', color: '#059669', marginBottom: 6 },
  recText: { fontSize: 9, color: '#047857', marginBottom: 8, lineHeight: 1.5 },
  recBullet: { fontSize: 9, color: '#047857', marginBottom: 4, marginLeft: 12 },
  // Issue cards
  issueCard: { padding: 10, marginBottom: 8, borderRadius: 6, borderLeftWidth: 4 },
  issueTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 3 },
  issueDesc: { fontSize: 8, color: '#374151', marginBottom: 2, lineHeight: 1.4 },
  issueRec: { fontSize: 8, color: '#374151', marginTop: 2 },
  // Checklist
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  checkLabel: { fontSize: 9, color: BRAND_DARK },
  checkPass: { fontSize: 9, color: GREEN, fontWeight: 'bold' },
  checkFail: { fontSize: 9, color: RED, fontWeight: 'bold' },
  // Keywords table
  kwRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  kwWord: { fontSize: 9, color: BRAND_DARK, fontWeight: 500 },
  kwCount: { fontSize: 9, color: GRAY },
  kwHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 6, backgroundColor: '#f9fafb', borderRadius: 4, marginBottom: 2 },
  kwHeaderText: { fontSize: 8, color: GRAY, fontWeight: 'bold', textTransform: 'uppercase' },
  // Tech row
  techRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, fontSize: 9 },
  techLabel: { color: GRAY },
  techValue: { fontWeight: 'bold', color: BRAND_DARK },
  // Heading hierarchy
  headingTag: { fontSize: 8, backgroundColor: '#f3f4f6', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, marginRight: 3, marginBottom: 3, color: BRAND_DARK },
  // Performance bar
  perfRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  perfLabel: { width: 80, fontSize: 9, color: GRAY },
  perfBarBg: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  perfBarFill: { height: '100%', borderRadius: 4 },
  perfValue: { width: 40, fontSize: 9, fontWeight: 'bold', textAlign: 'right' },
  // Security checklist
  secRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  secIcon: { width: 14, fontSize: 9, marginRight: 4 },
  secLabel: { fontSize: 9, color: BRAND_DARK },
  // Promo
  promoBox: { backgroundColor: '#fef3c7', padding: 16, borderRadius: 8, borderWidth: 2, borderColor: YELLOW, borderStyle: 'dashed', alignItems: 'center', marginBottom: 16 },
  promoTitle: { fontSize: 12, fontWeight: 'bold', color: '#92400e', marginBottom: 6 },
  promoCode: { fontSize: 22, fontWeight: 'bold', color: YELLOW, letterSpacing: 3, marginVertical: 8 },
  promoDetails: { fontSize: 9, color: '#78350f' },
  // CTA
  ctaBox: { backgroundColor: BRAND, padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  ctaTitle: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  ctaSub: { fontSize: 10, color: '#f0fdfa', marginBottom: 10 },
  ctaContact: { fontSize: 8, color: '#ffffff', marginBottom: 2 },
  // Footer
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9ca3af', textAlign: 'center' },
  // Columns
  twoCol: { flexDirection: 'row', justifyContent: 'space-between' },
  col50: { width: '48%' },
});

interface PDFReportProps {
  analysis: WebAnalysisResult;
  promoCode?: PromoCode;
  businessName?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return GREEN;
  if (score >= 60) return YELLOW;
  if (score >= 40) return '#f97316';
  return RED;
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Vyborne';
  if (score >= 60) return 'Dobre';
  if (score >= 40) return 'Prumerne';
  return 'Spatne';
};

const Check = ({ ok }: { ok: boolean }) => (
  <Text style={ok ? s.checkPass : s.checkFail}>{ok ? 'ANO' : 'NE'}</Text>
);

const IssueCard = ({ issue }: { issue: { category: string; title: string; description: string; recommendation?: string } }) => {
  const colors: Record<string, { bg: string; border: string; title: string }> = {
    critical: { bg: '#fef2f2', border: RED, title: '#991b1b' },
    warning: { bg: '#fffbeb', border: YELLOW, title: '#92400e' },
    info: { bg: '#eff6ff', border: BLUE, title: '#1e40af' },
  };
  const c = colors[issue.category] || colors.info;
  return (
    <View style={[s.issueCard, { backgroundColor: c.bg, borderLeftColor: c.border }]} wrap={false}>
      <Text style={[s.issueTitle, { color: c.title }]}>{issue.title}</Text>
      <Text style={s.issueDesc}>{issue.description}</Text>
      {issue.recommendation && (
        <Text style={s.issueRec}>
          <Text style={{ fontWeight: 'bold' }}>Reseni: </Text>
          {issue.recommendation}
        </Text>
      )}
    </View>
  );
};

const Header = ({ date }: { date: string }) => (
  <View style={s.headerBanner}>
    <View style={s.headerRow}>
      <View>
        <View style={s.logoRow}>
          <Text style={s.logoWeb}>Web</Text>
          <Text style={s.logoLyx}>lyx</Text>
        </View>
        <Text style={s.headerSub}>Moderni weby s durazem na SEO</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={s.headerRight}>ANALYZA WEBU</Text>
        <Text style={s.headerDate}>{date}</Text>
      </View>
    </View>
  </View>
);

const Footer = () => (
  <View style={s.footer} fixed>
    <Text style={s.footerText}>Weblyx | info@weblyx.cz | +420 702 110 166 | www.weblyx.cz</Text>
  </View>
);

export const WebAnalysisReport: React.FC<PDFReportProps> = ({ analysis, promoCode, businessName }) => {
  const scoreColor = getScoreColor(analysis.overallScore);
  const date = new Date(analysis.analyzedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const tech = analysis.technical;
  const perf = analysis.performance;
  const sec = analysis.security;
  const content = analysis.content;

  const criticalIssues = analysis.issues.filter(i => i.category === 'critical');
  const warningIssues = analysis.issues.filter(i => i.category === 'warning');
  const infoIssues = analysis.issues.filter(i => i.category === 'info');

  return (
    <Document>
      {/* PAGE 1 - Cover & Executive Summary */}
      <Page size="A4" style={s.page}>
        <Header date={date} />

        <Text style={s.title}>{businessName ? `Analyza webu ${businessName}` : 'Analyza webu'}</Text>
        <Text style={s.subtitle}>{analysis.url}</Text>
        <Text style={s.dateText}>Datum analyzy: {date}</Text>

        <View style={s.scoreBox}>
          <Text style={[s.scoreNumber, { color: scoreColor }]}>{analysis.overallScore}</Text>
          <Text style={s.scoreLabel}>Celkove skore webu (0-100)</Text>
          <Text style={[s.scoreBadge, { backgroundColor: scoreColor }]}>{getScoreLabel(analysis.overallScore)}</Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: RED }]}>{analysis.issueCount.critical}</Text>
            <Text style={s.statLabel}>Kriticke problemy</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: YELLOW }]}>{analysis.issueCount.warning}</Text>
            <Text style={s.statLabel}>Varovani</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: BLUE }]}>{analysis.issueCount.info}</Text>
            <Text style={s.statLabel}>Informace</Text>
          </View>
        </View>

        <View style={s.recBox}>
          <Text style={s.recTitle}>Doporuceny balicek: {analysis.recommendation.packageName}</Text>
          <Text style={s.recText}>{analysis.recommendation.reasoning}</Text>
          {analysis.recommendation.matchedNeeds.map((need, idx) => (
            <Text key={idx} style={s.recBullet}>• {need}</Text>
          ))}
        </View>

        {/* Top 2 critical issues inline */}
        {criticalIssues.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { fontSize: 12 }]}>Hlavni problemy k reseni</Text>
            {criticalIssues.slice(0, 2).map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </View>
        )}

        <Footer />
      </Page>

      {/* PAGE 2 - SEO Audit */}
      <Page size="A4" style={s.page}>
        <Header date={date} />

        <Text style={s.sectionTitle}>SEO Audit</Text>

        <View style={s.twoCol}>
          <View style={s.col50}>
            <Text style={[s.sectionTitle, { fontSize: 11, marginBottom: 6 }]}>Zakladni SEO</Text>
            <View style={s.checkRow}><Text style={s.checkLabel}>Title tag</Text><Check ok={!!tech.title} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Meta description</Text><Check ok={!!tech.description} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>H1 nadpis</Text><Check ok={tech.hasH1} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Canonical URL</Text><Check ok={tech.hasCanonical} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Open Graph tagy</Text><Check ok={tech.hasOgTags} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Twitter Card</Text><Check ok={tech.hasTwitterCard} /></View>
          </View>
          <View style={s.col50}>
            <Text style={[s.sectionTitle, { fontSize: 11, marginBottom: 6 }]}>Technicke SEO</Text>
            <View style={s.checkRow}><Text style={s.checkLabel}>Sitemap.xml</Text><Check ok={tech.hasSitemap} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Robots.txt</Text><Check ok={tech.hasRobotsTxt} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Schema markup</Text><Check ok={tech.schemaMarkup} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Favicon</Text><Check ok={tech.hasFavicon} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>Lang atribut</Text><Check ok={tech.hasLangAttribute} /></View>
            <View style={s.checkRow}><Text style={s.checkLabel}>SSL/HTTPS</Text><Check ok={tech.hasSSL} /></View>
          </View>
        </View>

        {/* Hreflang */}
        {tech.hreflangTags.length > 0 && (
          <View style={[s.section, { marginTop: 10 }]}>
            <Text style={[s.sectionTitle, { fontSize: 11 }]}>Hreflang jazyky</Text>
            <Text style={{ fontSize: 9, color: BRAND_DARK }}>{tech.hreflangTags.join(', ')}</Text>
          </View>
        )}

        {/* Top Keywords */}
        {content?.topKeywords && content.topKeywords.length > 0 && (
          <View style={[s.section, { marginTop: 12 }]}>
            <Text style={[s.sectionTitle, { fontSize: 11 }]}>Top klicova slova</Text>
            <View style={s.kwHeader}>
              <Text style={s.kwHeaderText}>Slovo</Text>
              <Text style={s.kwHeaderText}>Pocet</Text>
            </View>
            {content.topKeywords.slice(0, 10).map((kw, idx) => (
              <View key={idx} style={s.kwRow}>
                <Text style={s.kwWord}>{kw.word}</Text>
                <Text style={s.kwCount}>{kw.count}x</Text>
              </View>
            ))}
          </View>
        )}

        {/* Heading Hierarchy */}
        {tech.headingOrder.length > 0 && (
          <View style={[s.section, { marginTop: 12 }]}>
            <Text style={[s.sectionTitle, { fontSize: 11 }]}>Hierarchie nadpisu</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {tech.headingOrder.slice(0, 20).map((h, idx) => (
                <Text key={idx} style={s.headingTag}>{h.toUpperCase()}</Text>
              ))}
              {tech.headingOrder.length > 20 && (
                <Text style={[s.headingTag, { color: GRAY }]}>+{tech.headingOrder.length - 20} dalsich</Text>
              )}
            </View>
          </View>
        )}

        {/* Content metrics */}
        {content && (
          <View style={[s.section, { marginTop: 12 }]}>
            <Text style={[s.sectionTitle, { fontSize: 11 }]}>Analyza obsahu</Text>
            <View style={s.twoCol}>
              <View style={s.col50}>
                <View style={s.techRow}><Text style={s.techLabel}>Pocet slov:</Text><Text style={s.techValue}>{content.wordCount}</Text></View>
                <View style={s.techRow}><Text style={s.techLabel}>Pocet vet:</Text><Text style={s.techValue}>{content.sentenceCount}</Text></View>
                <View style={s.techRow}><Text style={s.techLabel}>Odstavce:</Text><Text style={s.techValue}>{content.paragraphCount}</Text></View>
              </View>
              <View style={s.col50}>
                <View style={s.techRow}><Text style={s.techLabel}>Citelnost:</Text><Text style={[s.techValue, { color: content.readabilityScore >= 60 ? GREEN : content.readabilityScore >= 40 ? YELLOW : RED }]}>{content.readabilityScore}/100</Text></View>
                <View style={s.techRow}><Text style={s.techLabel}>Slov/veta:</Text><Text style={s.techValue}>{content.averageWordsPerSentence}</Text></View>
              </View>
            </View>
          </View>
        )}

        <Footer />
      </Page>

      {/* PAGE 3 - Technical Details & Performance */}
      <Page size="A4" style={s.page}>
        <Header date={date} />

        {/* Performance */}
        {perf && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Performance</Text>
            <View style={[s.scoreBox, { padding: 14, marginBottom: 12 }]}>
              <Text style={[s.scoreNumber, { fontSize: 36, color: getScoreColor(perf.estimatedScore) }]}>{perf.estimatedScore}</Text>
              <Text style={[s.scoreLabel, { fontSize: 9 }]}>Performance skore</Text>
            </View>

            <View style={s.perfRow}>
              <Text style={s.perfLabel}>Skripty</Text>
              <View style={s.perfBarBg}>
                <View style={[s.perfBarFill, { width: `${Math.min(100, perf.scriptCount * 5)}%`, backgroundColor: perf.scriptCount > 15 ? RED : perf.scriptCount > 8 ? YELLOW : GREEN }]} />
              </View>
              <Text style={s.perfValue}>{perf.scriptCount}</Text>
            </View>
            <View style={s.perfRow}>
              <Text style={s.perfLabel}>Styly</Text>
              <View style={s.perfBarBg}>
                <View style={[s.perfBarFill, { width: `${Math.min(100, perf.stylesheetCount * 10)}%`, backgroundColor: perf.stylesheetCount > 8 ? RED : perf.stylesheetCount > 4 ? YELLOW : GREEN }]} />
              </View>
              <Text style={s.perfValue}>{perf.stylesheetCount}</Text>
            </View>
            <View style={s.perfRow}>
              <Text style={s.perfLabel}>Obrazky</Text>
              <View style={s.perfBarBg}>
                <View style={[s.perfBarFill, { width: `${Math.min(100, perf.imageCount * 3)}%`, backgroundColor: perf.imageCount > 30 ? RED : perf.imageCount > 15 ? YELLOW : GREEN }]} />
              </View>
              <Text style={s.perfValue}>{perf.imageCount}</Text>
            </View>
            <View style={s.perfRow}>
              <Text style={s.perfLabel}>3rd party</Text>
              <View style={s.perfBarBg}>
                <View style={[s.perfBarFill, { width: `${Math.min(100, perf.thirdPartyRequests * 5)}%`, backgroundColor: perf.thirdPartyRequests > 15 ? RED : perf.thirdPartyRequests > 8 ? YELLOW : GREEN }]} />
              </View>
              <Text style={s.perfValue}>{perf.thirdPartyRequests}</Text>
            </View>

            <View style={[s.twoCol, { marginTop: 8 }]}>
              <View style={s.col50}>
                <View style={s.techRow}><Text style={s.techLabel}>Komprese:</Text><Check ok={perf.hasCompression} /></View>
                <View style={s.techRow}><Text style={s.techLabel}>Cache:</Text><Check ok={perf.hasCaching} /></View>
              </View>
              <View style={s.col50}>
                <View style={s.techRow}><Text style={s.techLabel}>Lazy loading:</Text><Check ok={perf.hasLazyLoading} /></View>
                <View style={s.techRow}><Text style={s.techLabel}>Est. velikost:</Text><Text style={s.techValue}>{Math.round(perf.totalResourcesSize / 1024)} MB</Text></View>
              </View>
            </View>
          </View>
        )}

        {/* Security */}
        {sec && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Bezpecnost (Skore: {sec.securityScore}/100)</Text>
            <View style={s.secRow}><Text style={s.secIcon}>{sec.headers.strictTransportSecurity ? '+' : '-'}</Text><Text style={s.secLabel}>HSTS (Strict-Transport-Security)</Text></View>
            <View style={s.secRow}><Text style={s.secIcon}>{sec.headers.contentSecurityPolicy ? '+' : '-'}</Text><Text style={s.secLabel}>Content-Security-Policy</Text></View>
            <View style={s.secRow}><Text style={s.secIcon}>{sec.headers.xFrameOptions ? '+' : '-'}</Text><Text style={s.secLabel}>X-Frame-Options</Text></View>
            <View style={s.secRow}><Text style={s.secIcon}>{sec.headers.xContentTypeOptions ? '+' : '-'}</Text><Text style={s.secLabel}>X-Content-Type-Options</Text></View>
            <View style={s.secRow}><Text style={s.secIcon}>{sec.headers.referrerPolicy ? '+' : '-'}</Text><Text style={s.secLabel}>Referrer-Policy</Text></View>
            {sec.mixedContent && (
              <Text style={{ fontSize: 9, color: RED, marginTop: 6 }}>Mixed content detekovan!</Text>
            )}
          </View>
        )}

        {/* DOM & Image metrics */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>DOM a obrazky</Text>
          <View style={s.twoCol}>
            <View style={s.col50}>
              <View style={s.techRow}><Text style={s.techLabel}>DOM elementy:</Text><Text style={s.techValue}>{tech.domElementCount}</Text></View>
              <View style={s.techRow}><Text style={s.techLabel}>Inline styly:</Text><Text style={s.techValue}>{tech.inlineStyleCount}</Text></View>
              <View style={s.techRow}><Text style={s.techLabel}>Velikost HTML:</Text><Text style={s.techValue}>{tech.pageSize} KB</Text></View>
              <View style={s.techRow}><Text style={s.techLabel}>Cas nacteni:</Text><Text style={s.techValue}>{tech.loadTime}ms</Text></View>
            </View>
            <View style={s.col50}>
              <View style={s.techRow}><Text style={s.techLabel}>Celkem obrazku:</Text><Text style={s.techValue}>{tech.totalImages}</Text></View>
              <View style={s.techRow}><Text style={s.techLabel}>Bez ALT:</Text><Text style={[s.techValue, { color: tech.imagesWithoutAlt > 0 ? RED : GREEN }]}>{tech.imagesWithoutAlt}</Text></View>
              <View style={s.techRow}><Text style={s.techLabel}>Lazy loading:</Text><Text style={s.techValue}>{tech.imagesWithLazyLoading}</Text></View>
              <View style={s.techRow}><Text style={s.techLabel}>WebP/AVIF:</Text><Text style={s.techValue}>{tech.imagesWithModernFormat}</Text></View>
            </View>
          </View>
        </View>

        {/* Technologies */}
        {analysis.technology && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { fontSize: 11 }]}>Detekovane technologie</Text>
            <View style={s.twoCol}>
              <View style={s.col50}>
                {analysis.technology.platform && <View style={s.techRow}><Text style={s.techLabel}>Platforma:</Text><Text style={s.techValue}>{analysis.technology.platform}</Text></View>}
                {analysis.technology.framework && <View style={s.techRow}><Text style={s.techLabel}>Framework:</Text><Text style={s.techValue}>{analysis.technology.framework}</Text></View>}
                {analysis.technology.server && <View style={s.techRow}><Text style={s.techLabel}>Server:</Text><Text style={s.techValue}>{analysis.technology.server}</Text></View>}
              </View>
              <View style={s.col50}>
                {analysis.technology.libraries.length > 0 && <View style={s.techRow}><Text style={s.techLabel}>Knihovny:</Text><Text style={s.techValue}>{analysis.technology.libraries.join(', ')}</Text></View>}
                {analysis.technology.analytics.length > 0 && <View style={s.techRow}><Text style={s.techLabel}>Analytics:</Text><Text style={s.techValue}>{analysis.technology.analytics.join(', ')}</Text></View>}
              </View>
            </View>
          </View>
        )}

        <Footer />
      </Page>

      {/* PAGE 4 - Recommendations & CTA */}
      <Page size="A4" style={s.page}>
        <Header date={date} />

        <Text style={s.sectionTitle}>Vsechna doporuceni</Text>

        {/* Critical */}
        {criticalIssues.length > 0 && (
          <View style={s.section}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: RED, marginBottom: 6 }}>Kriticke problemy ({criticalIssues.length})</Text>
            {criticalIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </View>
        )}

        {/* Warnings */}
        {warningIssues.length > 0 && (
          <View style={s.section}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: YELLOW, marginBottom: 6 }}>Varovani ({warningIssues.length})</Text>
            {warningIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </View>
        )}

        {/* Info */}
        {infoIssues.length > 0 && (
          <View style={s.section}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: BLUE, marginBottom: 6 }}>Informace ({infoIssues.length})</Text>
            {infoIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </View>
        )}

        {/* Promo code */}
        {promoCode && (
          <View style={s.promoBox}>
            <Text style={s.promoTitle}>Specialni nabidka pro vas</Text>
            <Text style={{ fontSize: 9, color: '#78350f', marginBottom: 6 }}>{promoCode.description}</Text>
            <Text style={s.promoCode}>{promoCode.code}</Text>
            <Text style={s.promoDetails}>
              {promoCode.discountType === 'percentage'
                ? `Sleva ${promoCode.discountValue}%`
                : `Sleva ${promoCode.discountValue} Kc`}
              {' | '}
              Platnost do {new Date(promoCode.validUntil).toLocaleDateString('cs-CZ')}
            </Text>
          </View>
        )}

        {/* CTA */}
        <View style={s.ctaBox}>
          <Text style={s.ctaTitle}>Nezavazna konzultace zdarma</Text>
          <Text style={s.ctaSub}>Radi s vami probereme vysledky analyzy a navrhneme reseni na miru</Text>
          <Text style={s.ctaContact}>info@weblyx.cz | +420 702 110 166</Text>
          <Text style={s.ctaContact}>www.weblyx.cz</Text>
        </View>

        <Footer />
      </Page>
    </Document>
  );
};

export default WebAnalysisReport;
