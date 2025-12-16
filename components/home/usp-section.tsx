"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LeadButton } from "@/components/tracking/LeadButton";

export function USPSection() {
  const t = useTranslations("usp");

  const badPractices = [
    t("bad1"),
    t("bad2"),
    t("bad3"),
    t("bad4"),
  ];

  const goodPractices = [
    t("good1"),
    t("good2"),
    t("good3"),
    t("good4"),
    t("good5"),
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("title")}{" "}
            <span className="text-primary">{t("titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t("subtitle") }} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Co u nás nezažijete */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold mb-6">{t("badTitle")}</h3>
            <div className="space-y-3">
              {badPractices.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                  <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Co děláme jinak */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold mb-6">{t("goodTitle")}</h3>
            <div className="space-y-3">
              {goodPractices.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <LeadButton href="/poptavka" size="lg">
            Chci to vyzkoušet
          </LeadButton>
        </div>
      </div>
    </section>
  );
}
