"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Zap, Award } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { SocialProofData, LocalizedSectionData } from "@/types/cms";

export function SocialProofStats() {
  const t = useTranslations("socialProof");
  const locale = useLocale() as "cs" | "de";
  const [cmsData, setCmsData] = useState<SocialProofData | null>(null);

  useEffect(() => {
    fetch("/api/cms/social-proof")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          const localized = (result.data as LocalizedSectionData<SocialProofData>)[locale];
          if (localized && localized.title) setCmsData(localized);
        }
      })
      .catch(() => {});
  }, [locale]);

  const icons = [TrendingUp, Users, Zap, Award];

  const title = cmsData?.title || t("title");
  const titleHighlight = cmsData?.titleHighlight || t("titleHighlight");
  const subtitle = cmsData?.subtitle || t("subtitle");

  const stats = cmsData?.stats && cmsData.stats.length > 0
    ? cmsData.stats.map((s, i) => ({
        icon: icons[i % icons.length],
        value: s.value,
        label: s.label,
        description: s.description,
      }))
    : [
        { icon: TrendingUp, value: t("stat1Value"), label: t("stat1Label"), description: t("stat1Desc") },
        { icon: Users, value: t("stat2Value"), label: t("stat2Label"), description: t("stat2Desc") },
        { icon: Zap, value: t("stat3Value"), label: t("stat3Label"), description: t("stat3Desc") },
        { icon: Award, value: t("stat4Value"), label: t("stat4Label"), description: t("stat4Desc") },
      ];

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title} <span className="text-primary">{titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-semibold">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </div>
                </div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
