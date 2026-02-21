"use client";

import { X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-muted-foreground">{sTitle}</span> {sTitleVs}{" "}
            <span className="text-primary">{sTitleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{sSubtitle}</p>
        </div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* BEFORE */}
          <Card className="relative overflow-hidden border-2 border-red-200 dark:border-red-900/30">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold">
              {sBadgeBefore}
            </div>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-1">{sBeforeTitle}</h3>
                <p className="text-sm text-muted-foreground">{sBeforeSubtitle}</p>
              </div>
              <div className="space-y-3">
                {beforeMetrics.map((metric, i) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{metric.value}</span>
                        <IconComponent className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AFTER */}
          <Card className="relative overflow-hidden border-2 border-primary shadow-lg shadow-primary/10">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {sBadgeAfter}
            </div>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-1">{sAfterTitle}</h3>
                <p className="text-sm text-muted-foreground">{sAfterSubtitle}</p>
              </div>
              <div className="space-y-3">
                {afterMetrics.map((metric, i) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{metric.value}</span>
                        <IconComponent className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-lg font-semibold mb-1">
            {sCtaTitle} <span className="text-primary">{sCtaHighlight}</span>
          </p>
          <p className="text-base font-bold mb-2">{sCtaStat}</p>
          <p className="text-sm text-muted-foreground mb-5">{sCtaSubtitle}</p>
          <LeadButton href={sCtaLink} size="lg">{sCtaText}</LeadButton>
        </div>
      </div>
    </section>
  );
}
