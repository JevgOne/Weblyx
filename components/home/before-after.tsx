"use client";

import { ArrowRight, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { LeadButton } from "@/components/tracking/LeadButton";

export function BeforeAfter() {
  const t = useTranslations("beforeAfter");

  const comparison = {
    before: {
      title: t("beforeTitle"),
      subtitle: t("beforeSubtitle"),
      metrics: [
        { label: t("metricLoading"), value: t("beforeLoading"), icon: X, color: "text-red-600" },
        { label: t("metricPageSpeed"), value: t("beforePageSpeed"), icon: X, color: "text-red-600" },
        { label: t("metricMaintenance"), value: t("beforeMaintenance"), icon: X, color: "text-red-600" },
        { label: t("metricSecurity"), value: t("beforeSecurity"), icon: X, color: "text-red-600" },
        { label: t("metricPrice"), value: t("beforePrice"), icon: X, color: "text-red-600" },
      ],
    },
    after: {
      title: t("afterTitle"),
      subtitle: t("afterSubtitle"),
      metrics: [
        { label: t("metricLoading"), value: t("afterLoading"), icon: Check, color: "text-green-600" },
        { label: t("metricPageSpeed"), value: t("afterPageSpeed"), icon: Check, color: "text-green-600" },
        { label: t("metricMaintenance"), value: t("afterMaintenance"), icon: Check, color: "text-green-600" },
        { label: t("metricSecurity"), value: t("afterSecurity"), icon: Check, color: "text-green-600" },
        { label: t("metricPrice"), value: t("afterPrice"), icon: Check, color: "text-green-600" },
      ],
    }
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-muted-foreground">{t("title")}</span> {t("titleVs")}{" "}
            <span className="text-primary">{t("titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* BEFORE - WordPress */}
          <Card className="relative overflow-hidden border-2 border-red-200 dark:border-red-900/30">
            {/* Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold">
              {t("badgeeBefore")}
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold mb-1">{comparison.before.title}</h3>
                <p className="text-sm text-muted-foreground">{comparison.before.subtitle}</p>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {comparison.before.metrics.map((metric, i) => {
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

          {/* AFTER - Next.js */}
          <Card className="relative overflow-hidden border-2 border-primary shadow-lg shadow-primary/10">
            {/* Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {t("badgeAfter")}
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold mb-1">{comparison.after.title}</h3>
                <p className="text-sm text-muted-foreground">{comparison.after.subtitle}</p>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {comparison.after.metrics.map((metric, i) => {
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

            {/* Decorative gradient */}
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-lg font-semibold mb-2">
            {t("ctaTitle")} <span className="text-primary">{t("ctaHighlight")}</span> {t("ctaText")}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {t("ctaSubtitle")}
          </p>
          <LeadButton href={t("ctaLink")} size="lg">
            {t("ctaText")}
          </LeadButton>
        </div>
      </div>
    </section>
  );
}
