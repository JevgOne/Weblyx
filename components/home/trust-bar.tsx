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
    <section className="py-10 md:py-14 px-4 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => {
            const Icon = statIcons[i % statIcons.length];
            return (
              <div key={i} className="flex flex-col items-center text-center gap-1">
                <Icon className="h-5 w-5 text-primary mb-1" />
                <div className="text-xl sm:text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Trust badges row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <div className="p-1.5 rounded-full bg-green-500/10">
                  <Icon className="h-3.5 w-3.5 text-green-600" />
                </div>
                {badge.title}
              </div>
            );
          })}
        </div>

        {/* Client logos */}
        {clients.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
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
                    className="h-8 w-auto object-contain opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0"
                  />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
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
