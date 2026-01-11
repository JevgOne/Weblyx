'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import type { EroWebAnalysis } from '@/types/eroweb';
import { EROWEB_PACKAGES, SCORE_COLORS, getScoreCategory } from '@/types/eroweb';

interface ReportCardProps {
  analysis: EroWebAnalysis;
  onSendEmail?: () => void;
  onDownloadPdf?: () => void;
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

export function ReportCard({ analysis, onSendEmail, onDownloadPdf }: ReportCardProps) {
  const recommendedPackage = analysis.recommendedPackage
    ? EROWEB_PACKAGES[analysis.recommendedPackage]
    : null;

  const scoreCategory = getScoreCategory(analysis.scores.total);
  const scoreColor = SCORE_COLORS[scoreCategory];

  return (
    <div className="space-y-6">
      {/* Header with domain and overall score */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-[#7C3AED]" />
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-white hover:text-[#7C3AED] transition-colors flex items-center gap-1"
                >
                  {analysis.domain}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <Badge
                variant="outline"
                className="border-[#2A2A2A] text-[#A1A1AA]"
              >
                {BUSINESS_TYPE_LABELS[analysis.businessType]}
              </Badge>
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
                className="border-[#2A2A2A] text-white hover:bg-[#252525]"
              >
                <Download className="w-4 h-4 mr-2" />
                Stáhnout PDF
              </Button>
            )}
            {onSendEmail && (
              <Button
                onClick={onSendEmail}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Odeslat email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category scores */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Hodnocení po kategoriích</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((key) => {
              const Icon = CATEGORY_ICONS[key];
              const score = analysis.scores[key];
              const maxScore = CATEGORY_MAX_SCORES[key];

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{CATEGORY_LABELS[key]}</span>
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
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Zjištěné problémy</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedFindings findings={analysis.findings} />
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      {analysis.recommendation && (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Doporučení</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#A1A1AA] whitespace-pre-wrap">
              {analysis.recommendation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommended package */}
      {recommendedPackage && (
        <Card className="bg-gradient-to-br from-[#7C3AED]/20 to-[#1A1A1A] border-[#7C3AED]/50">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              Doporučený balíček
              {recommendedPackage.highlight && (
                <Badge className="bg-[#7C3AED] text-white">
                  {recommendedPackage.highlight}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {recommendedPackage.name}
              </h3>
              <p className="text-3xl font-bold text-[#7C3AED]">
                {recommendedPackage.priceMin.toLocaleString('cs-CZ')} - {recommendedPackage.priceMax.toLocaleString('cs-CZ')} Kč
              </p>
              <p className="text-[#A1A1AA]">
                Dodání: {recommendedPackage.deliveryTime}
              </p>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Co obsahuje:</h4>
                <ul className="space-y-1">
                  {recommendedPackage.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#A1A1AA]">
                      <span className="text-[#10B981]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
