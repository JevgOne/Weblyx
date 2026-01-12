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
} from 'lucide-react';
import { useState } from 'react';
import type { EroWebAnalysis, ContactStatus } from '@/types/eroweb';
import { EROWEB_PACKAGES, SCORE_COLORS, getScoreCategory, CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS } from '@/types/eroweb';

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

  const recommendedPackage = analysis.recommendedPackage
    ? EROWEB_PACKAGES[analysis.recommendedPackage]
    : null;

  const scoreCategory = getScoreCategory(analysis.scores.total);
  const scoreColor = SCORE_COLORS[scoreCategory];

  // Generate email template
  const emailSubject = `Analýza webu ${analysis.domain} - ${analysis.scores.total}/100 bodů`;
  const emailBody = `Dobrý den,

provedli jsme kompletní analýzu vašeho webu ${analysis.domain} a máme pro vás zajímavé výsledky.

📊 CELKOVÉ HODNOCENÍ: ${analysis.scores.total}/100 bodů

Vaš web dosáhl následujících výsledků:
• Rychlost: ${analysis.scores.speed}/${CATEGORY_MAX_SCORES.speed} bodů
• Mobilní verze: ${analysis.scores.mobile}/${CATEGORY_MAX_SCORES.mobile} bodů
• Zabezpečení: ${analysis.scores.security}/${CATEGORY_MAX_SCORES.security} bodů
• SEO: ${analysis.scores.seo}/${CATEGORY_MAX_SCORES.seo} bodů
• GEO/AIEO: ${analysis.scores.geo}/${CATEGORY_MAX_SCORES.geo} bodů
• Design: ${analysis.scores.design}/${CATEGORY_MAX_SCORES.design} bodů

${analysis.recommendation}

💎 DOPORUČENÝ BALÍČEK: ${recommendedPackage?.name || 'N/A'}
${recommendedPackage ? `Cena: ${recommendedPackage.priceMin.toLocaleString('cs-CZ')} - ${recommendedPackage.priceMax.toLocaleString('cs-CZ')} Kč` : ''}
${recommendedPackage ? `Dodání: ${recommendedPackage.deliveryTime}` : ''}

Rádi bychom vám pomohli vylepšit váš web a přivést více zákazníků.

Máte zájem o nezávaznou konzultaci?

S pozdravem,
Tým Weblyx
https://weblyx.cz`;

  // Generate WhatsApp message (soft approach - no pricing, build interest first)
  const whatsAppMessage = `Dobrý den,

jsem z Weblyx a dělám analýzy webů v oboru ${BUSINESS_TYPE_LABELS[analysis.businessType]}.

Narazil jsem na váš web *${analysis.domain}* a zajímalo mě, jak si stojí po technické stránce.

${analysis.scores.total < 50
  ? `Zjistil jsem několik věcí, které by mohly aktivně odrazovat potenciální klienty. Třeba by vás zajímalo, co konkrétně by se dalo vylepšit?`
  : analysis.scores.total < 70
  ? `Web funguje, ale vidím tam pár příležitostí, jak přitáhnout víc zákazníků. Můžu vám poslat kompletní rozbor zdarma, kdybyste měli zájem.`
  : `Váš web je nad průměrem, ale i tak jsem našel pár drobností, které by mohly ještě zvýšit konverze. Kdyby vás to zajímalo, můžu poslat detaily.`}

Máte chvilku na nezávaznou konzultaci? 😊

S pozdravem,
Tým Weblyx
🌐 weblyx.cz`;

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

  return (
    <div className="space-y-6">
      {/* Header with domain and overall score */}
      <Card className="border-border shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  {analysis.domain}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground"
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
                      className="w-[180px] h-7 text-xs"
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
          <div className="flex gap-2 mt-4">
            {onDownloadPdf && (
              <Button
                onClick={onDownloadPdf}
                variant="outline"
                className="flex-1 border-border hover:bg-muted"
              >
                <Download className="w-4 h-4 mr-2" />
                Stáhnout PDF
              </Button>
            )}
            {onSendEmail && (
              <Button
                onClick={onSendEmail}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Mail className="w-4 h-4 mr-2" />
                Odeslat email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category scores */}
      <Card className="border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-foreground text-lg">Hodnocení po kategoriích</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <Card className="border-border shadow-md">
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
        <Card className="border-border shadow-md">
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

      {/* Recommended package */}
      {recommendedPackage && (
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground text-lg flex items-center gap-2">
              Doporučený balíček
              {recommendedPackage.highlight && (
                <Badge className="bg-primary text-white">
                  {recommendedPackage.highlight}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                {recommendedPackage.name}
              </h3>
              <p className="text-3xl font-bold text-primary">
                {recommendedPackage.priceMin.toLocaleString('cs-CZ')} - {recommendedPackage.priceMax.toLocaleString('cs-CZ')} Kč
              </p>
              <p className="text-muted-foreground">
                Dodání: {recommendedPackage.deliveryTime}
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Co obsahuje:</h4>
                <ul className="space-y-1">
                  {recommendedPackage.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-green-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Template Preview */}
      <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-blue-50 to-background">
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
      <Card className="border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-background">
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
