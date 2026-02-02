import { getPublishedPortfolio } from "@/lib/turso/portfolio";
import { getCaseStudyData } from "@/lib/turso/cms";
import { ArrowDown, Clock, Gauge, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import type { CaseStudyData } from "@/types/cms";

interface CaseMetric {
  label: string;
  before?: string;
  after: string;
  improvement?: string;
  icon: React.ReactNode;
}

export async function CaseStudy() {
  const locale = await getLocale();
  const isDE = locale === 'de';

  // Load CMS data
  let cmsTexts: CaseStudyData | null = null;
  try {
    const cmsData = await getCaseStudyData();
    if (cmsData) {
      const localized = cmsData[locale as 'cs' | 'de'];
      if (localized && localized.title) cmsTexts = localized;
    }
  } catch {}

  // Find portfolio item with best data (has loadTimeBefore + loadTimeAfter + pagespeed)
  const portfolio = await getPublishedPortfolio(locale);
  const caseProject = portfolio.find(
    (p) => p.pagespeedMobile && p.pagespeedMobile >= 90 && p.loadTimeBefore && p.loadTimeAfter
  );

  if (!caseProject) return null;

  const speedImprovement = caseProject.loadTimeBefore && caseProject.loadTimeAfter
    ? Math.round(((caseProject.loadTimeBefore - caseProject.loadTimeAfter) / caseProject.loadTimeBefore) * 100)
    : null;

  const metrics: CaseMetric[] = [];

  if (caseProject.loadTimeBefore && caseProject.loadTimeAfter) {
    metrics.push({
      label: isDE ? "Ladezeit" : "Rychlost načítání",
      before: `${caseProject.loadTimeBefore}s`,
      after: `${caseProject.loadTimeAfter}s`,
      improvement: speedImprovement ? `${speedImprovement}% ${isDE ? 'schneller' : 'rychlejší'}` : undefined,
      icon: <Clock className="w-5 h-5" />,
    });
  }

  if (caseProject.pagespeedMobile) {
    metrics.push({
      label: "PageSpeed (mobil)",
      after: `${caseProject.pagespeedMobile}/100`,
      icon: <Gauge className="w-5 h-5" />,
    });
  }

  if (caseProject.pagespeedDesktop) {
    metrics.push({
      label: "PageSpeed (desktop)",
      after: `${caseProject.pagespeedDesktop}/100`,
      icon: <Zap className="w-5 h-5" />,
    });
  }

  // Extract project name (before the dash)
  const projectName = caseProject.title.split("–")[0]?.trim() || caseProject.title;

  // Use CMS texts or defaults
  const badgeText = cmsTexts?.badgeText || "Case Study";
  const titleText = cmsTexts?.title || (isDE ? 'Echte Ergebnisse, keine Versprechen' : 'Reálné výsledky, ne sliby');

  let subtitleContent: React.ReactNode;
  if (cmsTexts?.subtitleTemplate) {
    const parts = cmsTexts.subtitleTemplate.split('{projectName}');
    subtitleContent = (
      <>
        {parts[0]}<strong>{projectName}</strong>{parts[1] || ''}
      </>
    );
  } else {
    subtitleContent = isDE
      ? <>Zahlen aus dem Projekt <strong>{projectName}</strong>, keine Stockfotos und erfundene Statistiken.</>
      : <>Čísla z projektu <strong>{projectName}</strong>, ne stock fotky a vymyšlené statistiky.</>;
  }

  const ctaText = cmsTexts?.ctaText || (isDE ? 'Alle Projekte anzeigen →' : 'Zobrazit všechny projekty →');

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-muted/40 to-background">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-500 text-xs font-medium mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            {badgeText}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {titleText}
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            {subtitleContent}
          </p>
        </div>

        {/* Metrics cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-6 text-center space-y-3"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                {metric.icon}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {metric.label}
              </p>

              {metric.before ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg text-red-400 line-through font-medium">
                    {metric.before}
                  </span>
                  <ArrowDown className="w-4 h-4 text-teal-500 rotate-[-90deg]" />
                  <span className="text-2xl font-bold text-teal-500">
                    {metric.after}
                  </span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-teal-500">
                  {metric.after}
                </p>
              )}

              {metric.improvement && (
                <p className="text-xs text-teal-500 font-medium">
                  ↑ {metric.improvement}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 font-medium transition-colors"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
