"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TargetAudienceData } from "@/types/cms";

interface TargetAudienceProps {
  cmsData?: TargetAudienceData | null;
}

export function TargetAudience({ cmsData = null }: TargetAudienceProps) {
  const t = useTranslations("targetAudience");

  const icons = [Users, Briefcase, Rocket];

  const title = cmsData?.title || t("title");
  const subtitle = cmsData?.subtitle || t("subtitle");

  const audiences = cmsData?.audiences && cmsData.audiences.length > 0
    ? cmsData.audiences.map((a, i) => ({
        icon: icons[i % icons.length],
        title: a.title,
        description: a.description,
      }))
    : [
        { icon: Users, title: t("audience1Title"), description: t("audience1Desc") },
        { icon: Briefcase, title: t("audience2Title"), description: t("audience2Desc") },
        { icon: Rocket, title: t("audience3Title"), description: t("audience3Desc") },
      ];

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((audience, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <audience.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{audience.title}</h3>
                <p className="text-muted-foreground">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
