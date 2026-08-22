import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LeadButton } from "@/components/tracking/LeadButton";
import { Zap, Clock, TrendingUp, Check } from "lucide-react";
import { HeroSection } from "@/types/cms";
import { HeroData } from "@/types/homepage";
import { getHomepageSections } from "@/lib/turso/cms";
import { getTranslations } from 'next-intl/server';

// Icon mapping
const iconMap: Record<string, any> = {
  Clock,
  TrendingUp,
  Zap,
};

async function getHeroData(): Promise<{ data: HeroData; heroSection: HeroSection | null }> {
  // Get translations for fallback
  const t = await getTranslations('hero');

  try {
    const sections = await getHomepageSections();
    const heroSection: HeroSection | null = sections?.hero || null;

    // ALWAYS use translations (DB doesn't have locale support)
    const data: HeroData = {
      badge: t('badge'),
      title: t('title'),
      titleHighlight: '',
      subtitle: t.raw('subtitle'),
      ctaPrimary: {
        text: t('cta'),
        href: t('ctaPrimaryLink')
      },
      ctaSecondary: { text: t('ctaSecondary'), href: t('ctaSecondaryLink') },
      stats: [
        { icon: 'Clock', value: t('stat1Value'), label: t('stat1Label') },
        { icon: 'Zap', value: t('stat2Value'), label: t('stat2Label') },
        { icon: 'TrendingUp', value: t('stat3Value'), label: t('stat3Label') },
      ],
    };

    return { data, heroSection };
  } catch (error) {
    console.error('Error fetching hero data:', error);

    // Fallback to translations only
    return {
      data: {
        badge: t('badge'),
        title: t('title'),
        titleHighlight: '',
        subtitle: t.raw('subtitle'),
        ctaPrimary: { text: t('cta'), href: t('ctaPrimaryLink') },
        ctaSecondary: { text: t('ctaSecondary'), href: t('ctaSecondaryLink') },
        stats: [
          { icon: 'Clock', value: t('stat1Value'), label: t('stat1Label') },
          { icon: 'Zap', value: t('stat2Value'), label: t('stat2Label') },
          { icon: 'TrendingUp', value: t('stat3Value'), label: t('stat3Label') },
        ],
      },
      heroSection: null,
    };
  }
}

export async function Hero() {
  const { data, heroSection } = await getHeroData();
  const t = await getTranslations('hero');

  return (
    <section className="relative overflow-hidden px-4 pt-14 pb-16 md:pt-20 md:pb-24 lg:pt-24 lg:pb-28">
      {/* Single soft wash instead of two pulsing orbs — depth without the noise */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(70% 55% at 78% 12%, hsl(var(--primary) / 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 xl:gap-24 items-center">
          {/* Left Column - Content */}
          <div className="max-w-2xl">
            {/* Eyebrow — replaces the filled pill badge */}
            <p className="eyebrow">{data.badge}</p>

            {/* Heading — solid ink, no gradient clip (kept full contrast) */}
            <h1 className="display display-xl mt-6">
              {data.title}
              {data.titleHighlight && (
                <>
                  {" "}
                  <span className="text-primary">{data.titleHighlight}</span>
                </>
              )}
            </h1>

            <p
              className="lede mt-6 max-w-xl [&_strong]:text-foreground [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />

            {/* CTA Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row flex-wrap gap-3">
              {/* Primary CTA with Facebook Pixel Lead tracking */}
              <LeadButton
                href={data.ctaPrimary.href}
                size="lg"
                className="w-full sm:w-auto h-12 px-7 text-base font-semibold rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {data.ctaPrimary.text}
              </LeadButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-7 text-base font-medium rounded-xl border-[hsl(var(--hairline-strong))] bg-background hover:bg-[hsl(var(--surface-sunken))] hover:text-foreground transition-colors duration-200"
              >
                <Link href={data.ctaSecondary.href}>{data.ctaSecondary.text}</Link>
              </Button>
            </div>

            {/* Trust micro-signals row */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-[hsl(var(--ink-soft))]">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />
                <span>{t('trustNoCommitment')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />
                <span>{t('trustFastResponse')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />
                <span>{t('trustSatisfaction')}</span>
              </div>
            </div>

            {/* Stats — hairline-divided row, not three competing cards */}
            <dl className="mt-10 grid grid-cols-3 border-t border-[hsl(var(--hairline))] pt-7">
              {data.stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Zap;
                return (
                  <div
                    key={index}
                    className={
                      index > 0
                        ? "pl-4 sm:pl-6 border-l border-[hsl(var(--hairline))]"
                        : "pr-4 sm:pr-6"
                    }
                  >
                    <IconComponent className="h-4 w-4 text-primary mb-2.5" strokeWidth={2} />
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <div className="numeral text-2xl sm:text-3xl font-bold text-foreground leading-none">
                        {stat.value}
                      </div>
                      <div className="mt-1.5 text-xs sm:text-sm text-[hsl(var(--ink-faint))] leading-snug">
                        {stat.label}
                      </div>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* Right Column - Visual/Image */}
          <div className="relative lg:h-[580px] h-[380px] sm:h-[460px]">
            <div className="relative h-full w-full max-w-md mx-auto lg:max-w-none">
              <div className="relative h-full w-full rounded-2xl overflow-hidden border border-[hsl(var(--hairline))] bg-[hsl(var(--surface-sunken))] shadow-[0_24px_60px_-24px_hsl(var(--ink)/0.28)]">
                <Image
                  src={heroSection?.backgroundImage || "/images/hero/hero-mascot.jpg"}
                  alt={t('heroImageAlt')}
                  width={600}
                  height={800}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
