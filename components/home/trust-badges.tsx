"use client";

import { Shield, Award, Clock, Ban } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export function TrustBadges() {
  const t = useTranslations("trustBadges");
  const locale = useLocale();

  const badges = [
    {
      icon: Shield,
      title: t("badge1Title"),
      description: t("badge1Desc")
    },
    {
      icon: Award,
      title: t("badge2Title"),
      description: t("badge2Desc"),
      href: "/pagespeed-garance"
    },
    {
      icon: Clock,
      title: t("badge3Title"),
      description: t("badge3Desc")
    },
    {
      icon: Ban,
      title: t("badge4Title"),
      description: t("badge4Desc")
    }
  ];

  return (
    <section className="py-12 px-4 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const IconComponent = badge.icon;
            const content = (
              <>
                {/* Icon with border */}
                <div className="relative">
                  <div className="p-3 rounded-full bg-primary/10 border-2 border-primary/30">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  {/* Checkmark badge */}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold">
                    {badge.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {badge.description}
                  </div>
                </div>
              </>
            );

            if (badge.href) {
              return (
                <Link
                  key={index}
                  href={badge.href}
                  className="flex flex-col items-center text-center space-y-3 p-4 transition-all hover:bg-primary/5 rounded-lg group"
                >
                  {content}
                  <div className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {locale === 'de' ? 'Bedingungen anzeigen →' : 'Zobrazit podmínky →'}
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-3 p-4"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
