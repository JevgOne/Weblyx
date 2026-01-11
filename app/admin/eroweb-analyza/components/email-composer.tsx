'use client';

import { useState } from 'react';
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
import { Mail, Send, Copy, Check, RefreshCw, Eye } from 'lucide-react';
import type { EroWebAnalysis, ScoreCategory } from '@/types/eroweb';
import {
  getScoreCategory,
  SCORE_DESCRIPTIONS,
  BUSINESS_TYPE_LABELS,
  EROWEB_PACKAGES,
} from '@/types/eroweb';

interface EmailComposerProps {
  analysis: EroWebAnalysis;
  onSend?: (to: string, subject: string, body: string) => Promise<void>;
}

// Generate email subject based on analysis
function generateEmailSubject(analysis: EroWebAnalysis): string {
  const { domain, scores } = analysis;
  const category = getScoreCategory(scores.total);

  const subjects: Record<ScoreCategory, string[]> = {
    critical: [
      `Vas web ${domain} ma vazne problemy - bezplatna analyza`,
      `${domain}: ${scores.total}/100 bodu - zjistili jsme kriticke nedostatky`,
    ],
    poor: [
      `Bezplatna analyza webu ${domain} - nasli jsme prostor pro zlepseni`,
      `${domain}: Jak ziskat vice zakazniku z webu`,
    ],
    average: [
      `${domain}: Tipy jak predbehnout konkurenci`,
      `Bezplatna analyza webu ${domain} - ${scores.total}/100 bodu`,
    ],
    good: [
      `${domain}: Jak se dostat na spicku`,
      `Vas web je dobry - muze byt vyborny`,
    ],
    excellent: [
      `${domain}: Premium moznosti pro rust`,
      `Gratulujeme k skvelemu webu - nabizime pokrocile funkce`,
    ],
  };

  return subjects[category][0];
}

// Generate email body based on analysis
function generateEmailBody(analysis: EroWebAnalysis): string {
  const { domain, scores, findings, contactName, businessType, recommendedPackage } = analysis;
  const category = getScoreCategory(scores.total);
  const pkg = EROWEB_PACKAGES[recommendedPackage];

  const greeting = contactName ? `Dobry den, ${contactName},` : 'Dobry den,';
  const criticalFindings = findings.filter(f => f.type === 'critical');
  const warningFindings = findings.filter(f => f.type === 'warning');
  const businessLabel = BUSINESS_TYPE_LABELS[businessType];

  let body = `${greeting}

provedli jsme analyzu vaseho webu ${domain} a radi bychom se s vami podelili o vysledky.


CELKOVE SKORE: ${scores.total}/100 bodu
${'='.repeat(40)}

${SCORE_DESCRIPTIONS[category]}

`;

  if (criticalFindings.length > 0) {
    body += `
KRITICKE PROBLEMY:
${'='.repeat(40)}

${criticalFindings.slice(0, 3).map(f => `[!] ${f.title}
    ${f.impact}`).join('\n\n')}

`;
  }

  if (warningFindings.length > 0) {
    body += `
VAROVANI:
${'='.repeat(40)}

${warningFindings.slice(0, 2).map(f => `• ${f.title}`).join('\n')}

`;
  }

  body += `
PROC NA TOM ZALEZI:
${'='.repeat(40)}

V dnesni dobe vetsina lidi hleda ${businessLabel} na mobilu.
Pokud vas web neni rychly a prehledny, zakaznik jednoduse
odejde ke konkurenci.

${scores.total < 50 ? `Odhadujeme, ze soucasny stav webu vas muze stat
az 30-50% potencialnich zakazniku.

` : ''}

JAK VAM MUZEME POMOCT:
${'='.repeat(40)}

Jsme Weblyx.cz - specializujeme se na moderni weby.
Vytvarime rychle, bezpecne a profesionalni stranky:

- Web hotovy za 5-7 dni
- Nacteni pod 2 sekundy (garantujeme)
- 100% responzivni design
- Online rezervace
- SEO + optimalizace pro AI vyhledavace (GEO)


DOPORUCENY BALICEK: ${pkg.name}
${'='.repeat(40)}

Cena: ${pkg.priceMin.toLocaleString('cs-CZ')} - ${pkg.priceMax.toLocaleString('cs-CZ')} Kc
Dodani: ${pkg.deliveryTime}

Co ziskate:
${pkg.features.slice(0, 6).map(f => `- ${f}`).join('\n')}


DALSI KROK:
${'='.repeat(40)}

Pripravime vam ZDARMA navrh noveho webu.
Zadne zavazky - jen se podivejte, jak by mohl vypadat.

Staci odpovedět na tento email nebo zavolat
na +420 702 110 166.


S pozdravem,
Tym Weblyx.cz

info@weblyx.cz
+420 702 110 166
https://weblyx.cz

---
Kompletni report v priloze.
`;

  return body;
}

export function EmailComposer({ analysis, onSend }: EmailComposerProps) {
  const [recipientEmail, setRecipientEmail] = useState(analysis.contactEmail || '');
  const [subject, setSubject] = useState(() => generateEmailSubject(analysis));
  const [body, setBody] = useState(() => generateEmailBody(analysis));
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleRegenerate = () => {
    setSubject(generateEmailSubject(analysis));
    setBody(generateEmailBody(analysis));
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
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#7C3AED]" />
          Email pro klienta
        </CardTitle>
        <CardDescription className="text-[#A1A1AA]">
          Personalizovany email na zaklade analyzy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient email */}
        <div className="space-y-2">
          <Label htmlFor="recipientEmail" className="text-white">
            Email prijemce
          </Label>
          <Input
            id="recipientEmail"
            type="email"
            placeholder="kontakt@priklad.cz"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="bg-[#252525] border-[#2A2A2A] text-white placeholder:text-[#71717A]"
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="emailSubject" className="text-white">
            Predmet
          </Label>
          <Input
            id="emailSubject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-[#252525] border-[#2A2A2A] text-white"
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label htmlFor="emailBody" className="text-white">
            Text emailu
          </Label>
          <Textarea
            id="emailBody"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="bg-[#252525] border-[#2A2A2A] text-white font-mono text-sm"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={handleRegenerate}
          className="border-[#2A2A2A] text-[#A1A1AA] hover:bg-[#252525] hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerovat
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="border-[#2A2A2A] text-[#A1A1AA] hover:bg-[#252525] hover:text-white"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Zkopirovano
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Kopirovat
            </>
          )}
        </Button>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-[#2A2A2A] text-[#A1A1AA] hover:bg-[#252525] hover:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Nahled
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Nahled emailu</DialogTitle>
              <DialogDescription className="text-[#A1A1AA]">
                Tak bude email vypadat pro prijemce
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm">
                <span className="text-[#71717A]">Komu:</span>{' '}
                <span className="text-white">{recipientEmail || '(nezadan)'}</span>
              </div>
              <div className="text-sm">
                <span className="text-[#71717A]">Predmet:</span>{' '}
                <span className="text-white font-medium">{subject}</span>
              </div>
              <div className="border-t border-[#2A2A2A] pt-4">
                <pre className="text-[#A1A1AA] text-sm whitespace-pre-wrap font-sans">
                  {body}
                </pre>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewOpen(false)}
                className="border-[#2A2A2A] text-[#A1A1AA]"
              >
                Zavrit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {onSend && (
          <Button
            onClick={handleSend}
            disabled={!recipientEmail || isSending}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white ml-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Odesilam...' : 'Odeslat email'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
