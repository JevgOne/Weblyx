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
import { SCORE_COLORS, getScoreCategory, CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS } from '@/types/eroweb';

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

💰 CENÍK
Ceník je individuální podle rozsahu prací a požadavků.
Orientační cenový rozsah: 30 000 - 149 990 Kč

Rádi bychom vám pomohli vylepšit váš web a přivést více zákazníků.

Máte zájem o nezávaznou konzultaci?

S pozdravem,
Tým Weblyx
https://weblyx.cz`;

  // Generate WhatsApp message with GEO/AIEO expertise (randomized variations)
  const getWhatsAppMessage = () => {
    const domain = analysis.domain;
    const businessType = BUSINESS_TYPE_LABELS[analysis.businessType];
    const score = analysis.scores.total;

    // Different message variations based on score (randomized)
    const lowScoreMessages = [
      // Variation 1: AI search focus
      `Dobrý den,

jsem z Weblyx a specializujeme se na weby v oboru ${businessType}.

Při průzkumu trhu jsem narazil na váš web *${domain}* a udělal jsem rychlou analýzu z pohledu moderních AI vyhledávačů.

V poslední době se hodně mění, jak klienti hledají služby - ChatGPT, Perplexity a další AI nástroje začínají nahrazovat klasický Google. Většina konkurence na to ale vůbec není připravená.

U vašeho webu jsem našel několik věcí, které by mohly aktivně odrazovat potenciální klienty - hlavně z pohledu těch nových AI vyhledávačů. Kdybyste měli zájem, můžu vám ukázat konkrétně co a proč to zákazníky odráží.

Máte chvilku na nezávaznou konzultaci?

S pozdravem,
Tým Weblyx
🌐 weblyx.cz`,

      // Variation 2: GEO/AIEO expertise focus
      `Dobrý den,

jsem z Weblyx a dělám analýzy webů pro ${businessType.toLowerCase()}.

Narazil jsem na váš web *${domain}* a zajímalo mě, jak je připravený na nové AI vyhledávače.

Možná jste si všimli, že stále méně lidí používá klasický Google - místo toho se ptají ChatGPT nebo Perplexity. To vyžaduje úplně jinou optimalizaci než tradiční SEO. Říká se tomu GEO/AIEO a většina webů v tomto oboru to nemá vůbec nastavené.

Ve vašem případě jsem našel pár kritických míst, která by stála o dost klientů. Můžu vám poslat kompletní rozbor zdarma, kdyby vás to zajímalo.

Máte chvilku si popovídat? 😊

S pozdravem,
Weblyx Team
🌐 weblyx.cz`,

      // Variation 3: Competitor angle
      `Ahoj,

jsem z Weblyx a dělám audity webů v oboru ${businessType.toLowerCase()}.

Při analýze konkurence jsem narazil na *${domain}* a všiml si pár věcí, které by mohly výrazně snižovat počet klientů z vyhledávání.

Dneska už nestačí jen klasické SEO - AI vyhledávače jako ChatGPT nebo Perplexity mění celou hru. Weby, které nejsou optimalizované pro tyto nástroje, prostě mizí z výsledků. A bohužel většina konkurence v tomto oboru na tom není o moc lépe.

Mám pro vás konkrétní návrhy, co by se dalo vylepšit. Mohl bych vám poslat detailní rozbor?

Dáte vědět, jestli by vás to zajímalo?

Díky!
Tým Weblyx
🌐 weblyx.cz`
    ];

    const mediumScoreMessages = [
      // Variation 1: Opportunity focus
      `Dobrý den,

jsem z Weblyx a specializujeme se na online marketing pro ${businessType.toLowerCase()}.

Při průzkumu trhu jsem narazil na váš web *${domain}* a zaujal mě.

Web funguje, ale není připravený na nové AI vyhledávače (ChatGPT, Perplexy atd.). Což je vlastně dobrá zpráva - konkurence taky spí, takže teď je ideální moment se před ní dostat s GEO/AIEO optimalizací.

Vidím tam pár konkrétních příležitostí, jak přitáhnout víc zákazníků. Můžu vám poslat kompletní rozbor zdarma.

Zajímalo by vás to?

S pozdravem,
Tým Weblyx
🌐 weblyx.cz`,

      // Variation 2: Modernization angle
      `Dobrý den,

jsem z Weblyx a dělám analýzy webů v oboru ${businessType}.

Narazil jsem na *${domain}* a udělal jsem si na něm technickou analýzu.

Váš web je celkem slušný, ale chybí mu optimalizace pro AI nástroje - ChatGPT Search, Perplexity a podobně. To je dneska klíčové, protože stále víc lidí hledá služby přes tyto platformy místo Google.

Většina konkurence to taky nemá, takže kdo to udělá první, získá velkou výhodu. Mám pro vás pár konkrétních nápadů.

Mohl bych vám poslat detailní rozbor?

S pozdravem,
Weblyx
🌐 weblyx.cz`,

      // Variation 3: Direct value
      `Ahoj,

jsem z Weblyx a analyzuji weby v oboru ${businessType.toLowerCase()}.

Koukal jsem na *${domain}* a myslím, že bych vám mohl pomoct získat víc klientů z vyhledávání.

S nástupem AI vyhledávačů (ChatGPT, Perplexity atd.) se hodně mění pravidla hry. Tradiční SEO už nestačí - potřebujete GEO/AIEO optimalizaci, kterou má zatím jen málokdo.

Udělal jsem vám kompletní analýzu a mám tam pár dobrých nápadů. Můžu vám to poslat?

Dáte vědět? 😊

Díky,
Tým Weblyx
🌐 weblyx.cz`
    ];

    const highScoreMessages = [
      // Variation 1: Refinement focus
      `Dobrý den,

jsem z Weblyx a dělám pokročilé analýzy webů pro ${businessType.toLowerCase()}.

Narazil jsem na váš web *${domain}* a musím říct, že je nad průměrem.

I přesto jsem našel pár míst, kde by lepší GEO optimalizace pro AI vyhledávače mohla výrazně zvýšit konverze. S nástupem ChatGPT Search a Perplexity se pravidla mění a málokt o to zatím stojí.

Kdyby vás zajímaly detaily, můžu vám poslat kompletní rozbor.

Máte zájem?

S pozdravem,
Tým Weblyx
🌐 weblyx.cz`,

      // Variation 2: Competitive edge
      `Dobrý den,

jsem z Weblyx a specializujeme se na optimalizaci webů v oboru ${businessType}.

Při analýze trhu jsem narazil na *${domain}* - váš web je určitě mezi lepšími.

Přesto jsem identifikoval několik drobností, které by mohly posunout vaši viditelnost v AI vyhledávačích (ChatGPT, Perplexity) ještě výš. Většina konkurence tyto nástroje ignoruje, což je pro vás příležitost.

Mohl bych vám poslat detailní analýzu s konkrétními doporučeními?

Dáte vědět? 😊

S pozdravem,
Weblyx Team
🌐 weblyx.cz`,

      // Variation 3: Future-proofing
      `Ahoj,

jsem z Weblyx a dělám audity webů pro ${businessType.toLowerCase()}.

Koukal jsem na *${domain}* a líbí se mi, jak je web udělán.

I tak jsem našel pár věcí, které by ho mohly ještě vyladit pro budoucnost - hlavně kvůli AI vyhledávačům jako ChatGPT nebo Perplexity, které postupně nahrazují klasický Google. GEO/AIEO optimalizace je dneska klíč.

Mám pro vás pár konkrétních návrhů. Zajímal by vás detailní rozbor?

Díky!
Tým Weblyx
🌐 weblyx.cz`
    ];

    // Select random variation based on score
    let variations;
    if (score < 50) {
      variations = lowScoreMessages;
    } else if (score < 70) {
      variations = mediumScoreMessages;
    } else {
      variations = highScoreMessages;
    }

    // Use analysis ID as seed for consistent randomization per analysis
    const seed = parseInt(analysis.id.split('_')[1] || '0', 10);
    const index = seed % variations.length;

    return variations[index];
  };

  const whatsAppMessage = getWhatsAppMessage();

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
                onClick={onDownloadPdf}
                variant="outline"
                className="flex-1 border-border hover:bg-muted min-w-0"
              >
                <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Stáhnout PDF</span>
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
