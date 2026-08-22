import { getLocale } from "next-intl/server";
import { getHomepagePortfolio } from "@/lib/turso/portfolio";
import Image from "next/image";
import { TrendingUp, Users, Zap, Award, Shield, Clock, Ban } from "lucide-react";
import type { SocialProofData, TrustBadgesData } from "@/types/cms";

interface TrustBarProps {
  socialProofData?: SocialProofData | null;
  trustBadgesData?: TrustBadgesData | null;
}

const statIcons = [TrendingUp, Users, Zap, Award];
const badgeIcons = [Shield, Award, Clock, Ban];

export async function TrustBar({ socialProofData = null, trustBadgesData = null }: TrustBarProps) {
  const locale = await getLocale();
  const isDE = locale === "de";

  // Fetch client logos
  let clients: { name: string; logoUrl?: string }[] = [];
  try {
    const items = await getHomepagePortfolio(locale);
    clients = items.map((item) => ({
      name: item.clientName || item.title.split(" – ")[0].split(" - ")[0].trim(),
      logoUrl: item.clientLogoUrl,
    }));
  } catch {}

  // Stats from CMS or defaults
  const stats = socialProofData?.stats && socialProofData.stats.length > 0
    ? socialProofData.stats.map((s, i) => ({ value: s.value, label: s.label }))
    : isDE
      ? [
          { value: "15+", label: "Abgeschlossene Projekte" },
          { value: "5.0", label: "Google Bewertung" },
          { value: "< 2s", label: "Ladezeit" },
          { value: "5-7 Tage", label: "Lieferzeit" },
        ]
      : [
          { value: "15+", label: "Dokončených projektů" },
          { value: "5.0", label: "Google hodnocení" },
          { value: "< 2s", label: "Průměrná rychlost" },
          { value: "5-7 dní", label: "Průměrná doba dodání" },
        ];

  // Trust badges from CMS or defaults
  const badges = trustBadgesData?.badges && trustBadgesData.badges.length > 0
    ? trustBadgesData.badges.map((b, i) => ({ title: b.title, icon: badgeIcons[i % badgeIcons.length] }))
    : isDE
      ? [
          { title: "Sicheres HTTPS", icon: Shield },
          { title: "PageSpeed 90+ Garantie", icon: Award },
          { title: "Lieferung im Zeitplan", icon: Clock },
          { title: "Keine versteckten Gebühren", icon: Ban },
        ]
      : [
          { title: "Zabezpečený HTTPS", icon: Shield },
          { title: "PageSpeed 90+ garance", icon: Award },
          { title: "Dodání v termínu", icon: Clock },
          { title: "Bez skrytých poplatků", icon: Ban },
        ];

  return (
    <section className="section-tight surface-raised hairline-top hairline-bottom px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Stats row — figures in ink, teal reserved for the icon only.
            Four bold teal numbers in a row read as decoration, not as proof. */}
        <dl className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[hsl(var(--hairline))]">
          {stats.map((stat, i) => {
            const Icon = statIcons[i % statIcons.length];
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-1.5 px-4 py-5 md:py-2"
              >
                <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
                <dd className="numeral text-2xl sm:text-3xl font-bold text-foreground leading-none">
                  {stat.value}
                </dd>
                <dt className="text-xs sm:text-[13px] text-[hsl(var(--ink-faint))] leading-snug">
                  {stat.label}
                </dt>
              </div>
            );
          })}
        </dl>

        {/* Trust badges row */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 text-[13px] text-[hsl(var(--ink-soft))]"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
                {badge.title}
              </div>
            );
          })}
        </div>

        {/* Client logos */}
        {clients.length > 0 && (
          <div className="mt-9 pt-8 border-t border-[hsl(var(--hairline))] flex flex-wrap items-center justify-center gap-x-9 gap-y-5">
            <span className="text-[11px] text-[hsl(var(--ink-faint))] uppercase tracking-[0.14em] font-semibold">
              {isDE ? "Vertrauen uns" : "Důvěřují nám"}
            </span>
            {clients.map((client, i) => (
              <div key={i} title={client.name}>
                {client.logoUrl ? (
                  <Image
                    src={client.logoUrl}
                    alt={client.name}
                    width={100}
                    height={40}
                    className="h-7 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity duration-200 grayscale hover:grayscale-0"
                  />
                ) : (
                  <span className="text-sm font-semibold text-[hsl(var(--ink-faint))] hover:text-[hsl(var(--ink-soft))] transition-colors duration-200">
                    {client.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
