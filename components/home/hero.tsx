import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Clock, TrendingUp } from "lucide-react";
import { HeroSection } from "@/types/cms";
import { HeroData } from "@/types/homepage";
import { getHomepageSections } from "@/lib/turso/cms";

// Icon mapping
const iconMap: Record<string, any> = {
  Clock,
  TrendingUp,
  Zap,
};

async function getHeroData(): Promise<HeroData | null> {
  try {
    const sections = await getHomepageSections();

    if (!sections || !sections.hero) {
      console.error('Hero data not found');
      return null;
    }

    const heroSection: HeroSection = sections.hero;

    // Convert Turso HeroSection to legacy HeroData format
    return {
      badge: '🎉 AKČNÍ SLEVA: Web za 7 990 Kč místo 10 000 Kč',
      title: heroSection.headline,
      titleHighlight: '',
      subtitle: heroSection.subheadline,
      ctaPrimary: { text: heroSection.ctaText, href: heroSection.ctaLink },
      ctaSecondary: { text: 'Zobrazit projekty', href: '/portfolio' },
      stats: [
        { icon: 'Clock', value: '⚡ 5–7 dní', label: 'Web do týdne – zatímco konkurence pracuje 3–6 týdnů, my dodáme za týden.' },
        { icon: 'Zap', value: '🚀 Pod 2s', label: 'Nejrychlejší weby v ČR – Next.js místo WordPressu = načítání pod 2 sekundy.' },
        { icon: 'TrendingUp', value: '💰 Od 10 000 Kč', label: 'Webové stránky cena od 10 000 Kč. Akční sleva 7 990 Kč – férové ceny bez skrytých poplatků.' },
      ],
    } as HeroData;
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return null;
  }
}

export async function Hero() {
  const heroData = await getHeroData();

  // Fallback data if fetch fails
  const data: HeroData = heroData || {
    badge: '🎉 AKČNÍ SLEVA: Web za 7 990 Kč místo 10 000 Kč',
    title: 'Tvorba webových stránek za týden',
    titleHighlight: 'od 10 000 Kč',
    subtitle: 'Rychlá tvorba webových stránek na <strong>Next.js místo WordPressu</strong>. Web do týdne (<strong>5–7 dní</strong>), nejrychlejší načítání <strong>pod 2 sekundy</strong>. Levné webové stránky pro živnostníky a firmy.',
    ctaPrimary: { text: 'Nezávazná konzultace zdarma', href: '/poptavka' },
    ctaSecondary: { text: 'Zobrazit projekty', href: '/portfolio' },
    stats: [
      { icon: 'Clock', value: '⚡ 5–7 dní', label: 'Web do týdne – zatímco konkurence pracuje 3–6 týdnů, my dodáme za týden.' },
      { icon: 'Zap', value: '🚀 Pod 2s', label: 'Nejrychlejší weby v ČR – Next.js místo WordPressu = načítání pod 2 sekundy.' },
      { icon: 'TrendingUp', value: '💰 Od 10 000 Kč', label: 'Webové stránky cena od 10 000 Kč. Akční sleva 7 990 Kč – férové ceny bez skrytých poplatků.' },
    ],
  };

  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden gradient-hero grid-pattern">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>{data.badge}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {data.title}{" "}
              <span className="text-primary">{data.titleHighlight}</span>
            </h1>

            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl"
              dangerouslySetInnerHTML={{ __html: data.subtitle }}
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="shadow-elegant text-base">
                <Link href={data.ctaPrimary.href}>
                  {data.ctaPrimary.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href={data.ctaSecondary.href}>{data.ctaSecondary.text}</Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              {data.stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Zap;
                return (
                  <div key={index} className="space-y-1">
                    <IconComponent className="h-5 w-5 text-primary mb-2" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Placeholder for hero image/illustration */}
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative h-full w-full rounded-2xl border-2 border-primary/20 bg-background/50 backdrop-blur flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="text-6xl font-bold text-primary">W</div>
                  <p className="text-muted-foreground">Hero Visual Placeholder</p>
                  <p className="text-sm text-muted-foreground">
                    Sem přijde ilustrace nebo mockup webu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}
