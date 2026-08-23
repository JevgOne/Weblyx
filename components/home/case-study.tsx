import { getPublishedPortfolio } from "@/lib/turso/portfolio";
import { getCaseStudyData } from "@/lib/turso/cms";
import { ArrowDown, Clock, Gauge, Zap } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LeadButton } from "@/components/tracking/LeadButton";
import type { CaseStudyData } from "@/types/cms";
import { safeRead } from '@/lib/safe-read';

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
  const tHero = await getTranslations('hero');

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
  const portfolio = await safeRead(() => getPublishedPortfolio(locale), [], 'case study portfolio');
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
    <section className="section surface-raised hairline-top hairline-bottom px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="eyebrow">{badgeText}</p>
          <h2 className="display display-lg mt-5">{titleText}</h2>
          <p className="lede mt-5 [&_strong]:text-foreground [&_strong]:font-semibold">
            {subtitleContent}
          </p>
        </div>

        {/* Metrics — the number is the hero of each tile, so it gets the size
            and full ink contrast; teal marks only the delta. */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {metrics.map((metric, i) => (
            <div key={i} className="card-flat p-7">
              <div className="flex items-center gap-3">
                <span className="text-primary [&>svg]:h-[18px] [&>svg]:w-[18px]">
                  {metric.icon}
                </span>
                <p className="text-[13px] font-medium text-[hsl(var(--ink-faint))]">
                  {metric.label}
                </p>
              </div>

              {metric.before ? (
                <div className="mt-5 flex items-baseline gap-2.5">
                  <span className="numeral text-base text-[hsl(var(--ink-faint))] line-through">
                    {metric.before}
                  </span>
                  <span className="numeral text-4xl font-bold text-foreground leading-none">
                    {metric.after}
                  </span>
                </div>
              ) : (
                <p className="numeral mt-5 text-4xl font-bold text-foreground leading-none">
                  {metric.after}
                </p>
              )}

              {metric.improvement && (
                <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                  <ArrowDown className="h-3.5 w-3.5 rotate-180" strokeWidth={2.5} />
                  {metric.improvement}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4">
          <LeadButton
            href={tHero('ctaPrimaryLink')}
            size="lg"
            className="h-12 px-7 text-base font-semibold rounded-xl"
          >
            {isDE ? 'Ähnliche Ergebnisse für mein Projekt' : 'Chci podobné výsledky pro svůj projekt'}
          </LeadButton>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--ink-soft))] underline underline-offset-4 decoration-[hsl(var(--hairline-strong))] hover:text-primary hover:decoration-primary transition-colors duration-200"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
