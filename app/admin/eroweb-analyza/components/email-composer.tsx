'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Send, Copy, Check, RefreshCw, Eye, Languages } from 'lucide-react';
import type { EroWebAnalysis, ScoreCategory } from '@/types/eroweb';
import { getScoreCategory, EROWEB_PACKAGES } from '@/types/eroweb';
import { useAdminTranslation } from '@/lib/admin-i18n';

type EmailLang = 'cs' | 'en' | 'de' | 'ru';

interface EmailComposerProps {
  analysis: EroWebAnalysis;
  onSend?: (to: string, subject: string, body: string) => Promise<void>;
}

// UI translations
const UI_TEXTS: Record<EmailLang, {
  title: string;
  description: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  subjectLabel: string;
  bodyLabel: string;
  regenerate: string;
  copy: string;
  copied: string;
  preview: string;
  previewTitle: string;
  previewDesc: string;
  to: string;
  subject: string;
  notSet: string;
  close: string;
  sending: string;
  sendEmail: string;
  languageLabel: string;
}> = {
  cs: {
    title: 'Email pro klienta',
    description: 'Personalizovaný email na základě analýzy',
    recipientLabel: 'Email příjemce',
    recipientPlaceholder: 'kontakt@priklad.cz',
    subjectLabel: 'Předmět',
    bodyLabel: 'Text emailu',
    regenerate: 'Regenerovat',
    copy: 'Kopírovat',
    copied: 'Zkopírováno',
    preview: 'Náhled',
    previewTitle: 'Náhled emailu',
    previewDesc: 'Tak bude email vypadat pro příjemce',
    to: 'Komu',
    subject: 'Předmět',
    notSet: '(nezadáno)',
    close: 'Zavřít',
    sending: 'Odesílám...',
    sendEmail: 'Odeslat email',
    languageLabel: 'Jazyk emailu',
  },
  en: {
    title: 'Email for Client',
    description: 'Personalized email based on analysis',
    recipientLabel: 'Recipient Email',
    recipientPlaceholder: 'contact@example.com',
    subjectLabel: 'Subject',
    bodyLabel: 'Email Body',
    regenerate: 'Regenerate',
    copy: 'Copy',
    copied: 'Copied',
    preview: 'Preview',
    previewTitle: 'Email Preview',
    previewDesc: 'This is how the email will appear to the recipient',
    to: 'To',
    subject: 'Subject',
    notSet: '(not set)',
    close: 'Close',
    sending: 'Sending...',
    sendEmail: 'Send Email',
    languageLabel: 'Email language',
  },
  de: {
    title: 'E-Mail für Kunden',
    description: 'Personalisierte E-Mail basierend auf der Analyse',
    recipientLabel: 'Empfänger-E-Mail',
    recipientPlaceholder: 'kontakt@beispiel.de',
    subjectLabel: 'Betreff',
    bodyLabel: 'E-Mail-Text',
    regenerate: 'Neu generieren',
    copy: 'Kopieren',
    copied: 'Kopiert',
    preview: 'Vorschau',
    previewTitle: 'E-Mail-Vorschau',
    previewDesc: 'So wird die E-Mail für den Empfänger aussehen',
    to: 'An',
    subject: 'Betreff',
    notSet: '(nicht angegeben)',
    close: 'Schließen',
    sending: 'Wird gesendet...',
    sendEmail: 'E-Mail senden',
    languageLabel: 'E-Mail-Sprache',
  },
  ru: {
    title: 'Письмо для клиента',
    description: 'Персонализированное письмо на основе анализа',
    recipientLabel: 'Email получателя',
    recipientPlaceholder: 'kontakt@example.com',
    subjectLabel: 'Тема',
    bodyLabel: 'Текст письма',
    regenerate: 'Пересоздать',
    copy: 'Копировать',
    copied: 'Скопировано',
    preview: 'Предпросмотр',
    previewTitle: 'Предпросмотр письма',
    previewDesc: 'Так письмо будет выглядеть для получателя',
    to: 'Кому',
    subject: 'Тема',
    notSet: '(не указано)',
    close: 'Закрыть',
    sending: 'Отправка...',
    sendEmail: 'Отправить письмо',
    languageLabel: 'Язык письма',
  },
};

// Email subject templates by language and score category
const EMAIL_SUBJECTS: Record<EmailLang, Record<ScoreCategory, string>> = {
  cs: {
    critical: 'Váš web {domain} má vážné problémy - bezplatná analýza',
    poor: 'Bezplatná analýza webu {domain} - našli jsme prostor pro zlepšení',
    average: '{domain}: Tipy jak předběhnout konkurenci',
    good: '{domain}: Jak se dostat na špičku',
    excellent: '{domain}: Premium možnosti pro růst',
  },
  en: {
    critical: 'Your website {domain} has serious issues - free analysis',
    poor: 'Free website analysis {domain} - we found room for improvement',
    average: '{domain}: Tips to outperform competition',
    good: '{domain}: How to reach the top',
    excellent: '{domain}: Premium growth opportunities',
  },
  de: {
    critical: 'Ihre Website {domain} hat ernste Probleme - kostenlose Analyse',
    poor: 'Kostenlose Website-Analyse {domain} - wir haben Verbesserungspotenzial gefunden',
    average: '{domain}: Tipps um die Konkurrenz zu übertreffen',
    good: '{domain}: Wie Sie an die Spitze kommen',
    excellent: '{domain}: Premium-Wachstumsmöglichkeiten',
  },
  ru: {
    critical: 'Ваш сайт {domain} имеет серьёзные проблемы - бесплатный анализ',
    poor: 'Бесплатный анализ сайта {domain} - мы нашли возможности для улучшения',
    average: '{domain}: Советы как опередить конкурентов',
    good: '{domain}: Как достичь вершины',
    excellent: '{domain}: Премиум возможности для роста',
  },
};

// Generate email subject
function generateEmailSubject(analysis: EroWebAnalysis, lang: EmailLang): string {
  const category = getScoreCategory(analysis.scores.total);
  const template = EMAIL_SUBJECTS[lang][category];
  return template.replace('{domain}', analysis.domain);
}

// Generate email body
function generateEmailBody(analysis: EroWebAnalysis, lang: EmailLang): string {
  const { domain, scores, findings, contactName, recommendedPackage } = analysis;
  const category = getScoreCategory(scores.total);
  const pkg = EROWEB_PACKAGES[recommendedPackage];
  const criticalFindings = findings.filter(f => f.type === 'critical');
  const warningFindings = findings.filter(f => f.type === 'warning');

  if (lang === 'cs') {
    const greeting = contactName ? `Dobrý den, ${contactName},` : 'Dobrý den,';
    let body = `${greeting}

provedli jsme analýzu vašeho webu ${domain} a rádi bychom se s vámi podělili o výsledky.


CELKOVÉ SKÓRE: ${scores.total}/100 bodů
${'='.repeat(40)}

`;

    if (criticalFindings.length > 0) {
      body += `
KRITICKÉ PROBLÉMY:
${'='.repeat(40)}

${criticalFindings.slice(0, 3).map(f => `[!] ${f.title}
    ${f.impact}`).join('\n\n')}

`;
    }

    if (warningFindings.length > 0) {
      body += `
VAROVÁNÍ:
${'='.repeat(40)}

${warningFindings.slice(0, 2).map(f => `• ${f.title}`).join('\n')}

`;
    }

    body += `

JAK VÁM MŮŽEME POMOCI:
${'='.repeat(40)}

Jsme Weblyx.cz - specializujeme se na moderní weby.
Vytváříme rychlé, bezpečné a profesionální stránky:

- Web hotový za 5-7 dní
- Načtení pod 2 sekundy (garantujeme)
- 100% responzivní design
- Online rezervace
- SEO + optimalizace pro AI vyhledávače (GEO)


DOPORUČENÝ BALÍČEK: ${pkg.name}
${'='.repeat(40)}

Cena: ${pkg.priceMin.toLocaleString('cs-CZ')} - ${pkg.priceMax.toLocaleString('cs-CZ')} Kč


DALŠÍ KROK:
${'='.repeat(40)}

Připravíme vám ZDARMA návrh nového webu.
Žádné závazky - jen se podívejte, jak by mohl vypadat.

Stačí odpovědět na tento email nebo zavolat
na +420 702 110 166.


S pozdravem,
Tým Weblyx.cz

info@weblyx.cz
+420 702 110 166
https://weblyx.cz
`;
    return body;
  }

  if (lang === 'de') {
    const greeting = contactName ? `Guten Tag, ${contactName},` : 'Guten Tag,';
    let body = `${greeting}

wir haben eine Analyse Ihrer Website ${domain} durchgeführt und möchten die Ergebnisse mit Ihnen teilen.


GESAMTBEWERTUNG: ${scores.total}/100 Punkte
${'='.repeat(40)}

`;

    if (criticalFindings.length > 0) {
      body += `
KRITISCHE PROBLEME:
${'='.repeat(40)}

${criticalFindings.slice(0, 3).map(f => `[!] ${f.title}
    ${f.impact}`).join('\n\n')}

`;
    }

    if (warningFindings.length > 0) {
      body += `
WARNUNGEN:
${'='.repeat(40)}

${warningFindings.slice(0, 2).map(f => `• ${f.title}`).join('\n')}

`;
    }

    body += `

WIE WIR IHNEN HELFEN KÖNNEN:
${'='.repeat(40)}

Wir sind Weblyx.cz - spezialisiert auf moderne Websites.
Wir erstellen schnelle, sichere und professionelle Seiten:

- Website fertig in 5-7 Tagen
- Ladezeit unter 2 Sekunden (garantiert)
- 100% responsives Design
- Online-Buchungssystem
- SEO + Optimierung für KI-Suchmaschinen (GEO)


EMPFOHLENES PAKET: ${pkg.name}
${'='.repeat(40)}

Preis: €${Math.round(pkg.priceMin / 25)} - €${Math.round(pkg.priceMax / 25)}


NÄCHSTER SCHRITT:
${'='.repeat(40)}

Wir erstellen Ihnen KOSTENLOS einen Entwurf für eine neue Website.
Keine Verpflichtungen - schauen Sie einfach, wie sie aussehen könnte.

Antworten Sie einfach auf diese E-Mail oder rufen Sie an.


Mit freundlichen Grüßen,
Weblyx Team

info@weblyx.cz
https://weblyx.cz
`;
    return body;
  }

  if (lang === 'ru') {
    const greeting = contactName ? `Добрый день, ${contactName},` : 'Добрый день,';
    let body = `${greeting}

мы провели анализ вашего сайта ${domain} и хотели бы поделиться с вами результатами.


ОБЩАЯ ОЦЕНКА: ${scores.total}/100 баллов
${'='.repeat(40)}

`;

    if (criticalFindings.length > 0) {
      body += `
КРИТИЧЕСКИЕ ПРОБЛЕМЫ:
${'='.repeat(40)}

${criticalFindings.slice(0, 3).map(f => `[!] ${f.title}
    ${f.impact}`).join('\n\n')}

`;
    }

    if (warningFindings.length > 0) {
      body += `
ПРЕДУПРЕЖДЕНИЯ:
${'='.repeat(40)}

${warningFindings.slice(0, 2).map(f => `• ${f.title}`).join('\n')}

`;
    }

    body += `

КАК МЫ МОЖЕМ ВАМ ПОМОЧЬ:
${'='.repeat(40)}

Мы Weblyx.cz - специализируемся на современных сайтах.
Создаём быстрые, безопасные и профессиональные страницы:

- Сайт готов за 5-7 дней
- Загрузка менее 2 секунд (гарантируем)
- 100% адаптивный дизайн
- Онлайн бронирование
- SEO + оптимизация для AI поисковиков (GEO)


РЕКОМЕНДУЕМЫЙ ПАКЕТ: ${pkg.name}
${'='.repeat(40)}

Цена: €${Math.round(pkg.priceMin / 25)} - €${Math.round(pkg.priceMax / 25)}


СЛЕДУЮЩИЙ ШАГ:
${'='.repeat(40)}

Мы подготовим для вас БЕСПЛАТНО дизайн нового сайта.
Никаких обязательств - просто посмотрите, как он может выглядеть.

Просто ответьте на это письмо или позвоните.


С уважением,
Команда Weblyx

info@weblyx.cz
https://weblyx.cz
`;
    return body;
  }

  // English (default)
  const greeting = contactName ? `Hello ${contactName},` : 'Hello,';
  let body = `${greeting}

we have conducted an analysis of your website ${domain} and would like to share the results with you.


OVERALL SCORE: ${scores.total}/100 points
${'='.repeat(40)}

`;

  if (criticalFindings.length > 0) {
    body += `
CRITICAL ISSUES:
${'='.repeat(40)}

${criticalFindings.slice(0, 3).map(f => `[!] ${f.title}
    ${f.impact}`).join('\n\n')}

`;
  }

  if (warningFindings.length > 0) {
    body += `
WARNINGS:
${'='.repeat(40)}

${warningFindings.slice(0, 2).map(f => `• ${f.title}`).join('\n')}

`;
  }

  body += `

HOW WE CAN HELP:
${'='.repeat(40)}

We are Weblyx.cz - specializing in modern websites.
We create fast, secure, and professional pages:

- Website ready in 5-7 days
- Load time under 2 seconds (guaranteed)
- 100% responsive design
- Online booking system
- SEO + optimization for AI search engines (GEO)


RECOMMENDED PACKAGE: ${pkg.name}
${'='.repeat(40)}

Price: €${Math.round(pkg.priceMin / 25)} - €${Math.round(pkg.priceMax / 25)}


NEXT STEP:
${'='.repeat(40)}

We'll prepare a FREE design proposal for your new website.
No obligations - just see how it could look.

Simply reply to this email or give us a call.


Best regards,
Weblyx Team

info@weblyx.cz
https://weblyx.cz
`;
  return body;
}

export function EmailComposer({ analysis, onSend }: EmailComposerProps) {
  const { locale } = useAdminTranslation();
  const [emailLang, setEmailLang] = useState<EmailLang>('cs');
  const [recipientEmail, setRecipientEmail] = useState(analysis.contactEmail || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Get UI text based on admin locale
  const uiLang = (['cs', 'en', 'de', 'ru'].includes(locale) ? locale : 'en') as EmailLang;
  const ui = UI_TEXTS[uiLang];

  // Initialize email content
  useEffect(() => {
    setSubject(generateEmailSubject(analysis, emailLang));
    setBody(generateEmailBody(analysis, emailLang));
  }, [analysis, emailLang]);

  const handleRegenerate = () => {
    setSubject(generateEmailSubject(analysis, emailLang));
    setBody(generateEmailBody(analysis, emailLang));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!onSend || !recipientEmail) return;
    setIsSending(true);
    try {
      await onSend(recipientEmail, subject, body);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          {ui.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {ui.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language selector */}
        <div className="space-y-2">
          <Label className="text-foreground">{ui.languageLabel}</Label>
          <div className="flex gap-2">
            {(['cs', 'en', 'de', 'ru'] as const).map((lang) => (
              <Button
                key={lang}
                variant={emailLang === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmailLang(lang)}
                className="gap-1"
              >
                <Languages className="w-3 h-3" />
                {lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Recipient email */}
        <div className="space-y-2">
          <Label htmlFor="recipientEmail" className="text-foreground">
            {ui.recipientLabel}
          </Label>
          <Input
            id="recipientEmail"
            type="email"
            placeholder={ui.recipientPlaceholder}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="emailSubject" className="text-foreground">
            {ui.subjectLabel}
          </Label>
          <Input
            id="emailSubject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background border-border text-foreground"
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label htmlFor="emailBody" className="text-foreground">
            {ui.bodyLabel}
          </Label>
          <Textarea
            id="emailBody"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="bg-background border-border text-foreground font-mono text-sm"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={handleRegenerate}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {ui.regenerate}
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              {ui.copied}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              {ui.copy}
            </>
          )}
        </Button>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Eye className="w-4 h-4 mr-2" />
              {ui.preview}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">{ui.previewTitle}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {ui.previewDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="text-muted-foreground">{ui.to}:</span>{' '}
                <span className="text-foreground">{recipientEmail || ui.notSet}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">{ui.subject}:</span>{' '}
                <span className="text-foreground font-medium">{subject}</span>
              </div>
              <div className="border-t border-border pt-4">
                <pre className="text-muted-foreground text-sm whitespace-pre-wrap font-sans">
                  {body}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewOpen(false)}
                className="border-border text-muted-foreground"
              >
                {ui.close}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {onSend && (
          <Button
            onClick={handleSend}
            disabled={!recipientEmail || isSending}
            className="bg-primary hover:bg-primary/90 text-white ml-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? ui.sending : ui.sendEmail}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
