'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScoreGauge, CategoryScoreBar } from './score-gauge';
import { GroupedFindings } from './findings-list';
import {
  ExternalLink,
  Download,
  Mail,
  Globe,
  Zap,
  Smartphone,
  Shield,
  Search,
  Bot,
  Palette,
  MessageCircle,
  Copy,
  Check,
  Languages,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { EroWebAnalysis, ContactStatus } from '@/types/eroweb';
import { SCORE_COLORS, getScoreCategory, CONTACT_STATUS_COLORS } from '@/types/eroweb';
import { getWhatsAppMessage } from './whatsapp-messages';
import { useAdminTranslation } from '@/lib/admin-i18n';

interface ReportCardProps {
  analysis: EroWebAnalysis;
  onSendEmail?: () => void;
  onDownloadPdf?: () => void;
  onStatusChange?: (status: ContactStatus) => void;
}

const CATEGORY_ICONS = {
  speed: Zap,
  mobile: Smartphone,
  security: Shield,
  seo: Search,
  geo: Bot,
  design: Palette,
};

const CATEGORY_MAX_SCORES = {
  speed: 20,
  mobile: 15,
  security: 10,
  seo: 20,
  geo: 15,
  design: 20,
};

const CATEGORY_KEYS = ['speed', 'mobile', 'security', 'seo', 'geo', 'design'] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

export function ReportCard({ analysis, onSendEmail, onDownloadPdf, onStatusChange }: ReportCardProps) {
  const { t, locale } = useAdminTranslation();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [language, setLanguage] = useState<'cs' | 'en' | 'de' | 'ru'>('cs');

  // Sync language with locale on mount
  useEffect(() => {
    if (['cs', 'en', 'de', 'ru'].includes(locale)) {
      setLanguage(locale as 'cs' | 'en' | 'de' | 'ru');
    }
  }, [locale]);

  const scoreCategory = getScoreCategory(analysis.scores.total);
  const scoreColor = SCORE_COLORS[scoreCategory];

  // Get business type label from translations
  const businessTypeLabel = t.eroweb.businessTypes[analysis.businessType as keyof typeof t.eroweb.businessTypes];

  // Generate email template based on selected language
  const getEmailContent = () => {
    const scores = analysis.scores;

    if (language === 'cs') {
      return {
        subject: `Analýza webu ${analysis.domain} - ${scores.total}/100 bodů`,
        body: `Dobrý den,

provedli jsme kompletní analýzu vašeho webu ${analysis.domain} a máme pro vás zajímavé výsledky.

📊 CELKOVÉ HODNOCENÍ: ${scores.total}/100 bodů

Váš web dosáhl následujících výsledků:
• Rychlost: ${scores.speed}/${CATEGORY_MAX_SCORES.speed} bodů
• Mobilní verze: ${scores.mobile}/${CATEGORY_MAX_SCORES.mobile} bodů
• Zabezpečení: ${scores.security}/${CATEGORY_MAX_SCORES.security} bodů
• SEO: ${scores.seo}/${CATEGORY_MAX_SCORES.seo} bodů
• GEO/AIEO: ${scores.geo}/${CATEGORY_MAX_SCORES.geo} bodů
• Design: ${scores.design}/${CATEGORY_MAX_SCORES.design} bodů

${analysis.recommendation}

💰 CENÍK
Ceník je individuální podle rozsahu prací a požadavků.
Orientační cenový rozsah: 30 000 - 149 990 Kč

Rádi bychom Vám pomohli vylepšit Váš web a přivést více zákazníků.

Máte zájem o nezávaznou konzultaci?

S pozdravem,
Tým Weblyx
https://weblyx.cz`,
      };
    } else if (language === 'de') {
      return {
        subject: `Website-Analyse ${analysis.domain} - ${scores.total}/100 Punkte`,
        body: `Guten Tag,

wir haben eine vollständige Analyse Ihrer Website ${analysis.domain} durchgeführt und haben interessante Ergebnisse für Sie.

📊 GESAMTBEWERTUNG: ${scores.total}/100 Punkte

Ihre Website hat folgende Ergebnisse erzielt:
• Geschwindigkeit: ${scores.speed}/${CATEGORY_MAX_SCORES.speed} Punkte
• Mobil: ${scores.mobile}/${CATEGORY_MAX_SCORES.mobile} Punkte
• Sicherheit: ${scores.security}/${CATEGORY_MAX_SCORES.security} Punkte
• SEO: ${scores.seo}/${CATEGORY_MAX_SCORES.seo} Punkte
• GEO/AIEO: ${scores.geo}/${CATEGORY_MAX_SCORES.geo} Punkte
• Design: ${scores.design}/${CATEGORY_MAX_SCORES.design} Punkte

${analysis.recommendation}

💰 PREISE
Die Preise richten sich nach dem Arbeitsumfang und Ihren Anforderungen.
Geschätzte Preisspanne: €1.200 - €6.000

Wir würden Ihnen gerne helfen, Ihre Website zu verbessern und mehr Kunden zu gewinnen.

Haben Sie Interesse an einer kostenlosen Beratung?

Mit freundlichen Grüßen,
Weblyx Team
https://weblyx.cz`,
      };
    } else if (language === 'ru') {
      return {
        subject: `Анализ сайта ${analysis.domain} - ${scores.total}/100 баллов`,
        body: `Добрый день,

мы провели полный анализ вашего сайта ${analysis.domain} и получили интересные результаты для вас.

📊 ОБЩАЯ ОЦЕНКА: ${scores.total}/100 баллов

Ваш сайт достиг следующих результатов:
• Скорость: ${scores.speed}/${CATEGORY_MAX_SCORES.speed} баллов
• Мобильная версия: ${scores.mobile}/${CATEGORY_MAX_SCORES.mobile} баллов
• Безопасность: ${scores.security}/${CATEGORY_MAX_SCORES.security} баллов
• SEO: ${scores.seo}/${CATEGORY_MAX_SCORES.seo} баллов
• GEO/AIEO: ${scores.geo}/${CATEGORY_MAX_SCORES.geo} баллов
• Дизайн: ${scores.design}/${CATEGORY_MAX_SCORES.design} баллов

${analysis.recommendation}

💰 СТОИМОСТЬ
Стоимость рассчитывается индивидуально в зависимости от объема работ.
Ориентировочный диапазон: €1 200 - €6 000

Мы будем рады помочь вам улучшить ваш сайт и привлечь больше клиентов.

Заинтересованы в бесплатной консультации?

С уважением,
Команда Weblyx
https://weblyx.cz`,
      };
    } else {
      return {
        subject: `Website Analysis ${analysis.domain} - ${scores.total}/100 points`,
        body: `Hello,

we have completed a comprehensive analysis of your website ${analysis.domain} and have interesting results for you.

📊 OVERALL RATING: ${scores.total}/100 points

Your website achieved the following results:
• Speed: ${scores.speed}/${CATEGORY_MAX_SCORES.speed} points
• Mobile: ${scores.mobile}/${CATEGORY_MAX_SCORES.mobile} points
• Security: ${scores.security}/${CATEGORY_MAX_SCORES.security} points
• SEO: ${scores.seo}/${CATEGORY_MAX_SCORES.seo} points
• GEO/AIEO: ${scores.geo}/${CATEGORY_MAX_SCORES.geo} points
• Design: ${scores.design}/${CATEGORY_MAX_SCORES.design} points

${analysis.recommendation}

💰 PRICING
Pricing is individual based on the scope of work and requirements.
Indicative price range: €1,200 - €6,000

We would be happy to help you improve your website and bring more customers.

Would you be interested in a free consultation?

Best regards,
Weblyx Team
https://weblyx.cz`,
      };
    }
  };

  const emailContent = getEmailContent();

  // Generate WhatsApp message
  const whatsAppMessage = getWhatsAppMessage({
    domain: analysis.domain,
    businessType: businessTypeLabel,
    businessTypeEn: analysis.businessType === 'massage' ? 'erotic massage' :
                    analysis.businessType === 'privat' ? 'private club' : 'escort services',
    score: analysis.scores.total,
    analysisId: analysis.id,
    language,
  });

  const copyToClipboard = async (text: string, type: 'email' | 'whatsapp') => {
    await navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    }
  };

  const handleDownloadPdfWithLang = async () => {
    try {
      const res = await fetch(`/api/eroweb/pdf?id=${analysis.id}&lang=${language}`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eroweb-analysis-${analysis.domain}-${language}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('PDF download failed:', error);
      const errorMsg = locale === 'ru' ? 'Ошибка при загрузке PDF' :
                       locale === 'de' ? 'Fehler beim PDF-Download' :
                       locale === 'en' ? 'PDF download error' : 'Chyba při stahování PDF';
      alert(`❌ ${errorMsg}:\n\n${error.message}`);
    }
  };

  // Get price range based on language
  const getPriceRange = () => {
    if (language === 'cs') return '30 000 - 149 990 Kč';
    return '€1,200 - €6,000';
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Header with domain and overall score */}
      <Card className="border-border shadow-lg hover:shadow-xl transition-shadow w-full">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2 min-w-0">
                <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1 min-w-0 break-all"
                >
                  <span className="truncate">{analysis.domain}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground flex-shrink-0"
                >
                  {businessTypeLabel}
                </Badge>

                {/* Contact Status Dropdown */}
                {onStatusChange && (
                  <Select
                    value={analysis.contactStatus}
                    onValueChange={onStatusChange}
                  >
                    <SelectTrigger
                      className="w-full sm:w-[180px] h-7 text-xs"
                      style={{
                        borderColor: CONTACT_STATUS_COLORS[analysis.contactStatus],
                        color: CONTACT_STATUS_COLORS[analysis.contactStatus],
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['not_contacted', 'contacted', 'agreed', 'no_response'] as ContactStatus[]).map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: CONTACT_STATUS_COLORS[status] }}
                            />
                            {t.eroweb.contactStatus[status]}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <ScoreGauge score={analysis.scores.total} size="lg" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
            {onDownloadPdf && (
              <Button
                onClick={handleDownloadPdfWithLang}
                variant="outline"
                className="flex-1 border-border hover:bg-muted min-w-0"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{t.eroweb.downloadPdf} ({language.toUpperCase()})</span>
              </Button>
            )}
            {onSendEmail && (
              <Button
                onClick={onSendEmail}
                className="flex-1 bg-primary hover:bg-primary/90 min-w-0"
              >
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{t.eroweb.sendEmail}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category scores */}
      <Card className="border-border shadow-md w-full">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">{t.eroweb.categoryScores}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
            {CATEGORY_KEYS.map((key) => {
              const Icon = CATEGORY_ICONS[key];
              const score = analysis.scores[key];
              const maxScore = CATEGORY_MAX_SCORES[key];
              const categoryLabel = t.eroweb.categories[key as keyof typeof t.eroweb.categories];

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{categoryLabel}</span>
                  </div>
                  <CategoryScoreBar
                    label=""
                    score={score}
                    maxScore={maxScore}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      {analysis.findings && analysis.findings.length > 0 && (
        <Card className="border-border shadow-md w-full">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">{t.eroweb.findings}</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedFindings findings={analysis.findings} />
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      {analysis.recommendation && (
        <Card className="border-border shadow-md w-full">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">{t.eroweb.recommendation}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {analysis.recommendation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pricing Info */}
      <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30 shadow-lg w-full">
        <CardHeader>
          <CardTitle className="text-foreground text-lg flex items-center gap-2">
            💰 {t.eroweb.pricing}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t.eroweb.pricingIndividual}
            </p>
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2">{t.eroweb.pricingRange}</p>
              <p className="text-3xl font-bold text-primary">
                {getPriceRange()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.eroweb.pricingNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language Toggle */}
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-sm text-muted-foreground">{t.eroweb.languageLabel || 'Report language'}</span>
        <div className="flex flex-wrap justify-center gap-2">
          {(['cs', 'en', 'de', 'ru'] as const).map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage(lang)}
              className="gap-2"
            >
              <Languages className="w-4 h-4" />
              {t.eroweb.languages?.[lang] || lang.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Email Template Preview */}
      <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              {t.eroweb.emailTemplate}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(emailContent.body, 'email')}
              className="gap-2"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  {t.common.copied}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t.common.copy}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.eroweb.subject}</p>
              <p className="font-semibold text-foreground bg-background px-3 py-2 rounded border border-border">
                {emailContent.subject}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.eroweb.body}</p>
              <div className="bg-background px-4 py-3 rounded border border-border">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                  {emailContent.body}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Template Preview */}
      <Card className="border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-background dark:from-green-950/20 w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              {t.eroweb.whatsappTemplate}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(whatsAppMessage, 'whatsapp')}
              className="gap-2"
            >
              {copiedWhatsApp ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  {t.common.copied}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t.common.copy}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-background px-4 py-3 rounded-lg border border-border shadow-sm">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
              {whatsAppMessage}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 {t.eroweb.copyTip}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
