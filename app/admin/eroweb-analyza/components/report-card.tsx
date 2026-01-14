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
import { useState } from 'react';
import type { EroWebAnalysis, ContactStatus } from '@/types/eroweb';
import { SCORE_COLORS, getScoreCategory, CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS } from '@/types/eroweb';
import { getWhatsAppMessage } from './whatsapp-messages';

interface ReportCardProps {
  analysis: EroWebAnalysis;
  onSendEmail?: () => void;
  onDownloadPdf?: () => void;
  onStatusChange?: (status: ContactStatus) => void;
}

const BUSINESS_TYPE_LABELS = {
  massage: 'Erotické masáže',
  privat: 'Privát / Klub',
  escort: 'Escort',
};

const CATEGORY_ICONS = {
  speed: Zap,
  mobile: Smartphone,
  security: Shield,
  seo: Search,
  geo: Bot,
  design: Palette,
};

const CATEGORY_LABELS = {
  speed: 'Rychlost',
  mobile: 'Mobilní verze',
  security: 'Zabezpečení',
  seo: 'SEO',
  geo: 'GEO/AIEO',
  design: 'Design',
};

const CATEGORY_MAX_SCORES = {
  speed: 20,
  mobile: 15,
  security: 10,
  seo: 20,
  geo: 15,
  design: 20,
};

export function ReportCard({ analysis, onSendEmail, onDownloadPdf, onStatusChange }: ReportCardProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [language, setLanguage] = useState<'cs' | 'en'>('cs');

  const scoreCategory = getScoreCategory(analysis.scores.total);
  const scoreColor = SCORE_COLORS[scoreCategory];

  // Generate email template
  const emailSubject = language === 'cs'
    ? `Analýza webu ${analysis.domain} - ${analysis.scores.total}/100 bodů`
    : `Website Analysis ${analysis.domain} - ${analysis.scores.total}/100 points`;

  const emailBody = language === 'cs' ? `Dobrý den,

provedli jsme kompletní analýzu vašeho webu ${analysis.domain} a máme pro vás zajímavé výsledky.

📊 CELKOVÉ HODNOCENÍ: ${analysis.scores.total}/100 bodů

Váš web dosáhl následujících výsledků:
• Rychlost: ${analysis.scores.speed}/${CATEGORY_MAX_SCORES.speed} bodů
• Mobilní verze: ${analysis.scores.mobile}/${CATEGORY_MAX_SCORES.mobile} bodů
• Zabezpečení: ${analysis.scores.security}/${CATEGORY_MAX_SCORES.security} bodů
• SEO: ${analysis.scores.seo}/${CATEGORY_MAX_SCORES.seo} bodů
• GEO/AIEO: ${analysis.scores.geo}/${CATEGORY_MAX_SCORES.geo} bodů
• Design: ${analysis.scores.design}/${CATEGORY_MAX_SCORES.design} bodů

${analysis.recommendation}

💰 CENÍK
Ceník je individuální podle rozsahu prací a požadavků.
Orientační cenový rozsah: 30 000 - 149 990 Kč

Rádi bychom Vám pomohli vylepšit Váš web a přivést více zákazníků.

Máte zájem o nezávaznou konzultaci?

S pozdravem,
Tým Weblyx
https://weblyx.cz` : `Hello,

we have completed a comprehensive analysis of your website ${analysis.domain} and have interesting results for you.

📊 OVERALL RATING: ${analysis.scores.total}/100 points

Your website achieved the following results:
• Speed: ${analysis.scores.speed}/${CATEGORY_MAX_SCORES.speed} points
• Mobile version: ${analysis.scores.mobile}/${CATEGORY_MAX_SCORES.mobile} points
• Security: ${analysis.scores.security}/${CATEGORY_MAX_SCORES.security} points
• SEO: ${analysis.scores.seo}/${CATEGORY_MAX_SCORES.seo} points
• GEO/AIEO: ${analysis.scores.geo}/${CATEGORY_MAX_SCORES.geo} points
• Design: ${analysis.scores.design}/${CATEGORY_MAX_SCORES.design} points

${analysis.recommendation}

💰 PRICING
Pricing is individual based on the scope of work and requirements.
Indicative price range: €1,200 - €6,000

We would be happy to help you improve your website and bring more customers.

Would you be interested in a free consultation?

Best regards,
Weblyx Team
https://weblyx.cz`;

  // Generate WhatsApp message using imported function
  const businessType = BUSINESS_TYPE_LABELS[analysis.businessType];
  const businessTypeEn = analysis.businessType === 'massage' ? 'erotic massage' :
                         analysis.businessType === 'privat' ? 'private club' : 'escort services';

  const whatsAppMessage = getWhatsAppMessage({
    domain: analysis.domain,
    businessType,
    businessTypeEn,
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
      if (!res.ok) throw new Error('PDF generation failed');

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
      console.error('PDF download failed:', error.message);
    }
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
                  {BUSINESS_TYPE_LABELS[analysis.businessType]}
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
                            {CONTACT_STATUS_LABELS[status]}
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
                onClick={() => {
                  // Call with language parameter
                  if (typeof onDownloadPdf === 'function') {
                    handleDownloadPdfWithLang();
                  }
                }}
                variant="outline"
                className="flex-1 border-border hover:bg-muted min-w-0"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Stáhnout PDF ({language.toUpperCase()})</span>
              </Button>
            )}
            {onSendEmail && (
              <Button
                onClick={onSendEmail}
                className="flex-1 bg-primary hover:bg-primary/90 min-w-0"
              >
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Odeslat email</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category scores */}
      <Card className="border-border shadow-md w-full">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Hodnocení po kategoriích</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
            {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((key) => {
              const Icon = CATEGORY_ICONS[key];
              const score = analysis.scores[key];
              const maxScore = CATEGORY_MAX_SCORES[key];

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{CATEGORY_LABELS[key]}</span>
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
            <CardTitle className="text-foreground text-lg">Zjištěné problémy</CardTitle>
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
            <CardTitle className="text-foreground text-lg">Doporučení</CardTitle>
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
            💰 Ceník
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Ceník je <strong className="text-foreground">individuální</strong> podle rozsahu prací a vašich specifických požadavků.
            </p>
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Orientační cenový rozsah:</p>
              <p className="text-3xl font-bold text-primary">
                30 000 - 149 990 Kč
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Rádi vám připravíme nabídku přesně na míru vašim potřebám a rozpočtu.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language Toggle */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Button
          variant={language === 'cs' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('cs')}
          className="gap-2"
        >
          <Languages className="w-4 h-4" />
          Čeština
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="gap-2"
        >
          <Languages className="w-4 h-4" />
          English
        </Button>
      </div>

      {/* Email Template Preview */}
      <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-blue-50 to-background w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Návrh emailu
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(emailBody, 'email')}
              className="gap-2"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Zkopírováno!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Zkopírovat
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Předmět:</p>
              <p className="font-semibold text-foreground bg-background px-3 py-2 rounded border border-border">
                {emailSubject}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tělo emailu:</p>
              <div className="bg-background px-4 py-3 rounded border border-border">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                  {emailBody}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Template Preview */}
      <Card className="border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-background w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Návrh WhatsApp zprávy
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
                  Zkopírováno!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Zkopírovat
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
            💡 Zkopírujte zprávu a odešlete ji přímo přes WhatsApp Web nebo mobilní aplikaci.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
