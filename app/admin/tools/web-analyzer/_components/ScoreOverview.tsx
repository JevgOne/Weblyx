"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebAnalysisResult } from "@/types/cms";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface ScoreOverviewProps {
  analysis: WebAnalysisResult;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-primary";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-teal-50 border-teal-200";
  if (score >= 60) return "bg-yellow-50 border-yellow-200";
  if (score >= 40) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
};

const getScoreBadge = (score: number) => {
  if (score >= 80) return { label: "Vyborne", className: "bg-primary" };
  if (score >= 60) return { label: "Dobre", className: "bg-yellow-600" };
  if (score >= 40) return { label: "Slabe", className: "bg-orange-600" };
  return { label: "Kriticke", className: "bg-red-600" };
};

export default function ScoreOverview({ analysis }: ScoreOverviewProps) {
  const scores = analysis.categoryScores;

  const radarData = scores
    ? [
        { subject: "SEO", value: scores.seo, fullMark: 100 },
        { subject: "Performance", value: scores.performance, fullMark: 100 },
        { subject: "Security", value: scores.security, fullMark: 100 },
        { subject: "Accessibility", value: scores.accessibility, fullMark: 100 },
        { subject: "Social", value: scores.social, fullMark: 100 },
        { subject: "GEO/AIEO", value: scores.geo, fullMark: 100 },
      ]
    : [];

  const categoryCards = scores
    ? [
        { label: "SEO", score: scores.seo, icon: "🔍" },
        { label: "Performance", score: scores.performance, icon: "⚡" },
        { label: "Security", score: scores.security, icon: "🔒" },
        { label: "Accessibility", score: scores.accessibility, icon: "♿" },
        { label: "Social", score: scores.social, icon: "📱" },
        { label: "GEO/AIEO", score: scores.geo, icon: "🌍" },
      ]
    : [];

  const badge = getScoreBadge(analysis.overallScore);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Celkove hodnoceni</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{analysis.url}</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}
            </div>
            <Badge className={`mt-2 ${badge.className} text-white`}>
              {badge.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#14B8A6"
                    fill="#14B8A6"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categoryCards.map((cat) => (
              <div
                key={cat.label}
                className={`rounded-lg border p-4 text-center ${getScoreBg(cat.score)}`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className={`text-2xl font-bold ${getScoreColor(cat.score)}`}>
                  {cat.score}
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1">
                  {cat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Kriticke problemy</p>
            <p className="text-2xl font-bold text-red-600">{analysis.issueCount.critical}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Varovani</p>
            <p className="text-2xl font-bold text-yellow-600">{analysis.issueCount.warning}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Informace</p>
            <p className="text-2xl font-bold text-blue-600">{analysis.issueCount.info}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cas nacteni</p>
            <p className="text-2xl font-bold">{analysis.technical.loadTime}ms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
