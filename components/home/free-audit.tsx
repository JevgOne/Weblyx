"use client";

import { useState } from "react";
import { Search, Mail, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import type { FreeAuditData } from "@/types/cms";

interface AuditMetric {
  label: string;
  value: string;
  score: number;
}

interface AuditResponse {
  success: boolean;
  url: string;
  score: number;
  metrics: AuditMetric[];
  issueCount: number;
  error?: string;
}

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-green-500 border-green-500" :
    score >= 50 ? "text-amber-500 border-amber-500" :
    "text-red-500 border-red-500";

  const bgColor =
    score >= 90 ? "bg-green-500/10" :
    score >= 50 ? "bg-amber-500/10" :
    "bg-red-500/10";

  return (
    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${color} ${bgColor}`}>
      <span className="text-3xl font-bold">{score}</span>
    </div>
  );
}

function MetricRow({ metric }: { metric: AuditMetric }) {
  const color =
    metric.score >= 0.9 ? "text-green-500" :
    metric.score >= 0.5 ? "text-amber-500" :
    "text-red-500";

  const emoji =
    metric.score >= 0.9 ? "🟢" :
    metric.score >= 0.5 ? "🟡" :
    "🔴";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{metric.label}</span>
      <span className={`text-sm font-semibold ${color}`}>
        {emoji} {metric.value}
      </span>
    </div>
  );
}

interface FreeAuditProps {
  cmsData?: FreeAuditData | null;
}

export function FreeAudit({ cmsData = null }: FreeAuditProps) {
  const t = useTranslations('freeAudit');
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState("");

  // Use CMS data or fall back to translations
  const sBadge = cmsData?.badge || t('badge');
  const sTitle = cmsData?.title || t('title');
  const sSubtitle = cmsData?.subtitle || t('subtitle');
  const sUrlPlaceholder = cmsData?.urlPlaceholder || t('urlPlaceholder');
  const sEmailPlaceholder = cmsData?.emailPlaceholder || t('emailPlaceholder');
  const sButtonSubmit = cmsData?.buttonSubmit || t('buttonSubmit');
  const sButtonLoading = cmsData?.buttonLoading || t('buttonLoading');
  const sNoSpam = cmsData?.noSpam || t('noSpam');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!url.trim()) {
      setError(t('errorUrl'));
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(t('errorEmail'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('errorGeneric'));
        return;
      }

      setResult(data);
    } catch {
      setError(t('errorConnection'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-500 text-xs font-medium mb-4">
            <Search className="w-3.5 h-3.5" />
            {sBadge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {sTitle}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {sSubtitle}
          </p>
        </div>

        {/* Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={sUrlPlaceholder}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  disabled={loading}
                />
              </div>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={sEmailPlaceholder}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {sButtonLoading}
                </>
              ) : (
                <>
                  {sButtonSubmit}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              {sNoSpam}
            </p>
          </form>
        )}

        {/* Results (partial) */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score */}
            <div className="text-center">
              <ScoreCircle score={result.score} />
              <p className="text-sm text-muted-foreground mt-3">
                {t('scoreLabel')} <strong>{result.url}</strong>
              </p>
            </div>

            {/* Metrics preview */}
            <div className="bg-card border border-border rounded-xl p-5">
              {result.metrics.map((m, i) => (
                <MetricRow key={i} metric={m} />
              ))}
            </div>

            {/* Issue count teaser */}
            {result.issueCount > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-red-500 mb-1">
                  {result.issueCount} {t('issuesCount')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('issuesFound')}
                </p>
              </div>
            )}

            {/* Email sent confirmation */}
            <div className="flex items-start gap-3 bg-teal-500/5 border border-teal-500/20 rounded-xl p-5">
              <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">
                  {t('reportSending')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('reportDetails', { count: result.issueCount })}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center space-y-3 pt-2">
              <p className="text-muted-foreground text-sm">
                {t('ctaQuestion')}
              </p>
              <a
                href={t('ctaLink')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              >
                {t('ctaButton')}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Reset */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setUrl("");
                  setEmail("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('resetButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
