"use client";

import { X, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { LeadButton } from "@/components/tracking/LeadButton";
import type { BeforeAfterData } from "@/types/cms";

interface BeforeAfterProps {
  cmsData?: BeforeAfterData | null;
}

export function BeforeAfter({ cmsData = null }: BeforeAfterProps) {
  const t = useTranslations("beforeAfter");

  // Use CMS data or fall back to translations
  const sTitle = cmsData?.title || t("title");
  const sTitleVs = cmsData?.titleVs || t("titleVs");
  const sTitleHighlight = cmsData?.titleHighlight || t("titleHighlight");
  const sSubtitle = cmsData?.subtitle || t("subtitle");
  const sBadgeBefore = cmsData?.badgeBefore || t("badgeeBefore");
  const sBadgeAfter = cmsData?.badgeAfter || t("badgeAfter");
  const sBeforeTitle = cmsData?.beforeTitle || t("beforeTitle");
  const sBeforeSubtitle = cmsData?.beforeSubtitle || t("beforeSubtitle");
  const sAfterTitle = cmsData?.afterTitle || t("afterTitle");
  const sAfterSubtitle = cmsData?.afterSubtitle || t("afterSubtitle");
  const sCtaTitle = cmsData?.ctaTitle || t("ctaTitle");
  const sCtaHighlight = cmsData?.ctaHighlight || t("ctaHighlight");
  const sCtaStat = cmsData?.ctaStat || t("ctaStat");
  const sCtaSubtitle = cmsData?.ctaSubtitle || t("ctaSubtitle");
  const sCtaText = cmsData?.ctaText || t("ctaText");
  const sCtaLink = cmsData?.ctaLink || t("ctaLink");

  const hasMetrics = cmsData?.metrics && cmsData.metrics.length > 0;

  const beforeMetrics = hasMetrics
    ? cmsData!.metrics.map(m => ({ label: m.label, value: m.beforeValue, icon: X, color: "text-red-600" }))
    : [
        { label: t("metricLoading"), value: t("beforeLoading"), icon: X, color: "text-red-600" },
        { label: t("metricPageSpeed"), value: t("beforePageSpeed"), icon: X, color: "text-red-600" },
        { label: t("metricMaintenance"), value: t("beforeMaintenance"), icon: X, color: "text-red-600" },
        { label: t("metricSecurity"), value: t("beforeSecurity"), icon: X, color: "text-red-600" },
        { label: t("metricPrice"), value: t("beforePrice"), icon: X, color: "text-red-600" },
      ];

  const afterMetrics = hasMetrics
    ? cmsData!.metrics.map(m => ({ label: m.label, value: m.afterValue, icon: Check, color: "text-green-600" }))
    : [
        { label: t("metricLoading"), value: t("afterLoading"), icon: Check, color: "text-green-600" },
        { label: t("metricPageSpeed"), value: t("afterPageSpeed"), icon: Check, color: "text-green-600" },
        { label: t("metricMaintenance"), value: t("afterMaintenance"), icon: Check, color: "text-green-600" },
        { label: t("metricSecurity"), value: t("afterSecurity"), icon: Check, color: "text-green-600" },
        { label: t("metricPrice"), value: t("afterPrice"), icon: Check, color: "text-green-600" },
      ];

  return (
    <section className="section px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Heading */}
        <div className="max-w-2xl">
          <h2 className="display display-lg">
            <span className="text-[hsl(var(--ink-faint))]">{sTitle}</span> {sTitleVs}{" "}
            <span className="text-primary">{sTitleHighlight}</span>
          </h2>
          <p className="lede mt-5">{sSubtitle}</p>
        </div>

        {/* Comparison — the "after" column is the only one that carries weight;
            the "before" column is deliberately desaturated and recessed. */}
        <div className="mt-14 grid lg:grid-cols-2 gap-5 items-start">
          {/* BEFORE */}
          <div className="rounded-2xl border border-[hsl(var(--hairline))] bg-[hsl(var(--surface-sunken))] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-[hsl(var(--ink-soft))]">
                  {sBeforeTitle}
                </h3>
                <p className="mt-1 text-sm text-[hsl(var(--ink-faint))]">{sBeforeSubtitle}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--ink-faint))]">
                {sBadgeBefore}
              </span>
            </div>

            <dl className="mt-7 border-t border-[hsl(var(--hairline))]">
              {beforeMetrics.map((metric, i) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 py-3.5 border-b border-[hsl(var(--hairline))]"
                  >
                    <dt className="text-sm text-[hsl(var(--ink-faint))] shrink-0">
                      {metric.label}
                    </dt>
                    <dd className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-right text-[hsl(var(--ink-soft))] truncate">
                        {metric.value}
                      </span>
                      <IconComponent className="h-4 w-4 shrink-0 text-red-500/70" strokeWidth={2.5} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* AFTER */}
          <div className="rounded-2xl border border-primary/35 bg-card p-6 sm:p-8 shadow-[0_1px_2px_hsl(var(--ink)/0.04),0_18px_40px_-20px_hsl(var(--ink)/0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  {sAfterTitle}
                </h3>
                <p className="mt-1 text-sm text-[hsl(var(--ink-soft))]">{sAfterSubtitle}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                {sBadgeAfter}
              </span>
            </div>

            <dl className="mt-7 border-t border-[hsl(var(--hairline))]">
              {afterMetrics.map((metric, i) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 py-3.5 border-b border-[hsl(var(--hairline))]"
                  >
                    <dt className="text-sm text-[hsl(var(--ink-faint))] shrink-0">
                      {metric.label}
                    </dt>
                    <dd className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-right text-foreground truncate">
                        {metric.value}
                      </span>
                      <IconComponent className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 rounded-2xl border border-[hsl(var(--hairline))] bg-[hsl(var(--surface))] p-7 sm:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {sCtaTitle} <span className="text-primary">{sCtaHighlight}</span>
            </p>
            <p className="numeral mt-1 text-base font-semibold text-foreground">{sCtaStat}</p>
            <p className="mt-2 text-sm text-[hsl(var(--ink-faint))]">{sCtaSubtitle}</p>
          </div>
          <LeadButton
            href={sCtaLink}
            size="lg"
            className="h-12 px-7 text-base font-semibold rounded-xl shrink-0"
          >
            {sCtaText}
          </LeadButton>
        </div>
      </div>
    </section>
  );
}
