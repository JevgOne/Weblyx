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
