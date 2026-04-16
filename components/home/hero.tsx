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
    <section className="relative flex items-center py-16 md:py-20 lg:py-24 px-4 overflow-hidden bg-gradient-to-b from-background via-muted/5 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 xl:gap-24 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 lg:space-y-8 max-w-2xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mt-6 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary text-sm font-medium border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-sm"
              style={{ animation: 'fadeInUp 0.6s ease-out' }}
            >
              <Zap className="h-4 w-4" />
              <span>{data.badge}</span>
            </div>

            {/* Heading */}
            <div className="space-y-5">
              <h1 className="text-[2.25rem] leading-[1.1] sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  {data.title}
                </span>
                {data.titleHighlight && (
                  <>
                    {" "}
                    <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                      {data.titleHighlight}
                    </span>
                  </>
                )}
              </h1>

              <p
                className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.subtitle }}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
              {/* Primary CTA with Facebook Pixel Lead tracking */}
              <LeadButton
                href={data.ctaPrimary.href}
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base px-6 py-5 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
              >
                {data.ctaPrimary.text}
              </LeadButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base px-6 py-5 border-2 hover:bg-muted hover:border-primary/50 transition-all duration-300"
              >
                <Link href={data.ctaSecondary.href}>{data.ctaSecondary.text}</Link>
              </Button>
            </div>

            {/* Trust micro-signals row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                <span>{t('trustNoCommitment')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                <span>{t('trustFastResponse')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                <span>{t('trustSatisfaction')}</span>
              </div>
            </div>

            {/* Stats - Compact Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
              {data.stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Zap;
                return (
                  <div
                    key={index}
                    className="group relative p-3 sm:p-4 rounded-xl bg-gradient-to-br from-card to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col items-center justify-center text-center space-y-1.5">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-sm sm:text-base lg:text-lg font-bold leading-none">{stat.value}</div>
                      <div className="text-[11px] sm:text-xs text-foreground/70 leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Visual/Image */}
          <div className="relative lg:h-[560px] h-[360px] sm:h-[440px] flex items-center justify-center lg:justify-end">
            <div className="relative w-full h-full max-w-md lg:max-w-none lg:ml-auto">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>

              <div className="relative h-full w-full rounded-3xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10 bg-gradient-to-br from-background to-muted group">
                <Image
                  src={heroSection?.backgroundImage || "/images/hero/hero-mascot.jpg"}
                  alt={t('heroImageAlt')}
                  width={600}
                  height={800}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
