import { getPublishedPortfolio } from "@/lib/turso/portfolio";
import { getPublishedReviews } from "@/lib/turso/reviews";
import { ArrowDown, Clock, Gauge, TrendingUp, Quote, Zap } from "lucide-react";
import Link from "next/link";

interface CaseMetric {
  label: string;
  before?: string;
  after: string;
  improvement?: string;
  icon: React.ReactNode;
}

export async function CaseStudy() {
  // Find portfolio item with best data (has loadTimeBefore + loadTimeAfter + pagespeed)
  const portfolio = await getPublishedPortfolio();
  const caseProject = portfolio.find(
    (p) => p.pagespeedMobile && p.pagespeedMobile >= 90 && p.loadTimeBefore && p.loadTimeAfter
  );

  if (!caseProject) return null;

  // Find matching review for this project (by author matching or just pick featured)
  const reviews = await getPublishedReviews("cs");
  const bestReview = reviews.find((r) => r.featured) || reviews[0];

  const speedImprovement = caseProject.loadTimeBefore && caseProject.loadTimeAfter
    ? Math.round(((caseProject.loadTimeBefore - caseProject.loadTimeAfter) / caseProject.loadTimeBefore) * 100)
    : null;

  const metrics: CaseMetric[] = [];

  if (caseProject.loadTimeBefore && caseProject.loadTimeAfter) {
    metrics.push({
      label: "Rychlost načítání",
      before: `${caseProject.loadTimeBefore}s`,
      after: `${caseProject.loadTimeAfter}s`,
      improvement: speedImprovement ? `${speedImprovement}% rychlejší` : undefined,
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

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-muted/40 to-background">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-500 text-xs font-medium mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            Case Study
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Reálné výsledky, ne sliby
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Čísla z projektu <strong>{projectName}</strong>, ne stock fotky a vymyšlené statistiky.
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

        {/* Client quote */}
        {bestReview && (
          <div className="relative bg-card border border-border/60 rounded-2xl p-8 md:p-10">
            <Quote className="absolute top-6 left-6 w-10 h-10 text-teal-500/10" />
            <blockquote className="relative z-10 space-y-4">
              <p className="text-base md:text-lg leading-relaxed italic text-foreground/80 pl-6 border-l-2 border-teal-500/30">
                {bestReview.text.length > 250
                  ? bestReview.text.slice(0, 250).trim() + "…"
                  : bestReview.text}
              </p>
              <footer className="flex items-center gap-3 pl-6">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <span className="text-teal-500 font-semibold text-xs">
                    {bestReview.authorName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{bestReview.authorName}</p>
                  {bestReview.authorRole && (
                    <p className="text-xs text-muted-foreground">
                      {bestReview.authorRole}
                    </p>
                  )}
                </div>
              </footer>
            </blockquote>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 font-medium transition-colors"
          >
            Zobrazit všechny projekty →
          </Link>
        </div>
      </div>
    </section>
  );
}
