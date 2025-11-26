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

async function getHeroData(): Promise<{ data: HeroData; heroSection: HeroSection | null }> {
  try {
    const sections = await getHomepageSections();

    const heroSection: HeroSection | null = sections?.hero || null;

    // Convert Turso HeroSection to legacy HeroData format
    const data: HeroData = {
      badge: '🎉 AKČNÍ SLEVA: Web za 7 990 Kč místo 10 000 Kč',
      title: heroSection?.headline || 'Tvorba webových stránek od 10 000 Kč | Web za týden',
      titleHighlight: '',
      subtitle: heroSection?.subheadline || 'Rychlá tvorba <strong>webových stránek a e-shopů</strong> na <strong>Next.js místo WordPressu</strong>. Web do týdne (<strong>5–7 dní</strong>), nejrychlejší načítání <strong>pod 2 sekundy</strong>, <strong>SEO optimalizace zdarma</strong>. Levné weby pro živnostníky a firmy.',
      ctaPrimary: {
        text: heroSection?.ctaText || 'Nezávazná konzultace zdarma',
        href: heroSection?.ctaLink || '/poptavka'
      },
      ctaSecondary: { text: 'Zobrazit projekty', href: '/portfolio' },
      stats: [
        { icon: 'Clock', value: '⚡ 5–7 dní', label: 'Web do týdne – zatímco konkurence pracuje 3–6 týdnů, my dodáme za týden.' },
        { icon: 'Zap', value: '🚀 Pod 2s', label: 'Nejrychlejší weby v ČR – Next.js místo WordPressu = načítání pod 2 sekundy.' },
        { icon: 'TrendingUp', value: '💰 Od 10 000 Kč', label: 'Férové ceny bez skrytých poplatků – levný web za týden bez kompromisů.' },
      ],
    };

    return { data, heroSection };
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return {
      data: {
        badge: '🎉 AKČNÍ SLEVA: Web za 7 990 Kč místo 10 000 Kč',
        title: 'Tvorba webových stránek od 10 000 Kč | Web za týden',
        titleHighlight: '',
        subtitle: 'Rychlá tvorba <strong>webových stránek a e-shopů</strong> na <strong>Next.js místo WordPressu</strong>. Web do týdne (<strong>5–7 dní</strong>), nejrychlejší načítání <strong>pod 2 sekundy</strong>, <strong>SEO optimalizace zdarma</strong>. Levné weby pro živnostníky a firmy.',
        ctaPrimary: { text: 'Nezávazná konzultace zdarma', href: '/poptavka' },
        ctaSecondary: { text: 'Zobrazit projekty', href: '/portfolio' },
        stats: [
          { icon: 'Clock', value: '⚡ 5–7 dní', label: 'Web do týdne – zatímco konkurence pracuje 3–6 týdnů, my dodáme za týden.' },
          { icon: 'Zap', value: '🚀 Pod 2s', label: 'Nejrychlejší weby v ČR – Next.js místo WordPressu = načítání pod 2 sekundy.' },
          { icon: 'TrendingUp', value: '💰 Od 10 000 Kč', label: 'Férové ceny bez skrytých poplatků – levný web za týden bez kompromisů.' },
        ],
      },
      heroSection: null,
    };
  }
}

export async function Hero() {
  const { data, heroSection } = await getHeroData();

  return (
    <section className="relative min-h-[90vh] flex items-center py-20 md:py-0 px-4 overflow-hidden bg-gradient-to-b from-background via-muted/5 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary text-sm font-medium border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-sm"
              style={{ animation: 'fadeInUp 0.6s ease-out' }}
            >
              <Zap className="h-4 w-4" />
              <span>{data.badge}</span>
            </div>

            {/* Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
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
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.subtitle }}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
              >
                <Link href={data.ctaPrimary.href} className="group">
                  {data.ctaPrimary.text}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 border-2 hover:bg-muted hover:border-primary/50 transition-all duration-300"
              >
                <Link href={data.ctaSecondary.href}>{data.ctaSecondary.text}</Link>
              </Button>
            </div>

            {/* Stats - Compact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              {data.stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Zap;
                return (
                  <div
                    key={index}
                    className="group relative p-6 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-foreground/70 leading-relaxed">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Visual/Image */}
          <div className="relative lg:h-[600px] h-[400px] flex items-center justify-center">
            <div className="relative w-full h-full max-w-lg mx-auto">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>

              {heroSection?.backgroundImage ? (
                // Hero image from database
                <div className="relative h-full w-full rounded-3xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10 bg-gradient-to-br from-background to-muted group">
                  <img
                    src={heroSection.backgroundImage}
                    alt="Weblyx - Moderní webové stránky"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent"></div>
                </div>
              ) : (
                // Modern placeholder
                <div className="relative h-full w-full rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-card via-background to-muted/50 backdrop-blur flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-all duration-300">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse"></div>

                  <div className="relative text-center space-y-6 p-8">
                    {/* Large W logo */}
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                      <div className="relative text-8xl font-bold bg-gradient-to-br from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                        W
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-foreground">Hero Obrázek</p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Nahrajte obrázek v <span className="text-primary font-medium">admin panelu</span> pro zobrazení zde
                      </p>
                    </div>

                    {/* Upload hint */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <span>Admin → Hero sekce</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
