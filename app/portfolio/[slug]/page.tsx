import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, Gauge, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { getPortfolioById, getAllPortfolio } from "@/lib/turso/portfolio";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateCreativeWorkSchema } from "@/lib/schema-org";
import { getLocale } from "next-intl/server";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const locale = await getLocale();
    const isDE = locale === 'de';
    const project = await getPortfolioById(slug);

    if (!project || !project.published) {
      return {
        title: isDE ? "Projekt nicht gefunden | Seitelyx Portfolio" : "Projekt nenalezen | Weblyx Portfolio",
      };
    }

    const baseUrl = isDE ? 'https://seitelyx.de' : 'https://www.weblyx.cz';
    const brandName = isDE ? 'Seitelyx' : 'Weblyx';

    return {
      title: `${project.title} | ${brandName} Portfolio`,
      description: project.description || (isDE ? `Projektbeispiel: ${project.title}` : `Ukázka projektu: ${project.title}`),
      keywords: project.technologies || [],
      openGraph: {
        title: project.title,
        description: project.description || '',
        type: "website",
        images: project.imageUrl ? [{
          url: project.imageUrl,
          width: 1200,
          height: 630,
          alt: project.title
        }] : [],
        url: `${baseUrl}/portfolio/${slug}`,
        siteName: brandName,
        locale: isDE ? "de_DE" : "cs_CZ",
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description: project.description || '',
        images: project.imageUrl ? [project.imageUrl] : [],
        creator: "@weblyx",
      },
      alternates: {
        canonical: `${baseUrl}/portfolio/${slug}`,
        languages: getAlternateLanguages('/portfolio/' + slug),
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Portfolio",
    };
  }
}

export default async function PortfolioDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  try {
    const locale = await getLocale();
    const isDE = locale === 'de';
    const project = await getPortfolioById(slug);

    if (!project || !project.published) {
      notFound();
    }

    const baseUrl = isDE ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

    // Related projects
    const allProjects = await getAllPortfolio(locale);
    const relatedProjects = allProjects
      .filter((p) => p.published && p.id !== slug)
      .slice(0, 3);

    // Schema
    const creativeWorkSchema = generateCreativeWorkSchema({
      id: project.id,
      title: project.title,
      description: project.description || '',
      imageUrl: project.imageUrl,
      url: project.projectUrl,
      tags: project.technologies,
      dateCreated: project.createdAt,
    });

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": isDE ? "Startseite" : "Domů",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Portfolio",
          "item": `${baseUrl}/portfolio`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": project.title,
          "item": `${baseUrl}/portfolio/${slug}`
        }
      ]
    };

    const perfStats = [
      project.pagespeedMobile ? { label: 'PageSpeed Mobile', value: project.pagespeedMobile, unit: '/ 100', highlight: true } : null,
      project.pagespeedDesktop ? { label: 'PageSpeed Desktop', value: project.pagespeedDesktop, unit: '/ 100', highlight: true } : null,
      project.loadTimeBefore ? { label: isDE ? 'Vorher' : 'Před redesignem', value: `${project.loadTimeBefore}s`, unit: isDE ? 'Ladezeit' : 'načítání', highlight: false } : null,
      project.loadTimeAfter ? { label: isDE ? 'Ladezeit' : 'Načítání', value: `${project.loadTimeAfter}s`, unit: isDE ? 'nach Optimierung' : 'po optimalizaci', highlight: true } : null,
    ].filter(Boolean) as { label: string; value: string | number; unit: string; highlight: boolean }[];

    const showPerformance = perfStats.length >= 2;

    // Adaptive grid class
    const perfGridClass = perfStats.length === 2
      ? 'grid grid-cols-2 max-w-lg mx-auto gap-4'
      : perfStats.length === 3
        ? 'grid grid-cols-3 max-w-2xl mx-auto gap-4'
        : 'grid grid-cols-2 md:grid-cols-4 gap-4';

    return (
      <>
        <JsonLd data={creativeWorkSchema} />
        <JsonLd data={breadcrumbSchema} />

        <main className="min-h-screen">
          <article className="py-12 md:py-20 px-4">
            <div className="container mx-auto max-w-5xl">
              {/* Back */}
              <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>{isDE ? 'Alle Projekte' : 'Všechny projekty'}</span>
              </Link>

              {/* Header — fixed structure for all projects */}
              <header className="mb-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {project.category && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {project.category}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  {project.title}
                </h1>

                {/* Short intro — first paragraph only */}
                {project.description && (
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                    {project.description.split('\n')[0].trim()}
                  </p>
                )}

                {/* Always show a button — live link or placeholder */}
                <div className="pt-2">
                  {project.projectUrl ? (
                    <Button asChild size="default" className="group">
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                        {isDE ? 'Website besuchen' : 'Navštívit web'}
                        <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="default" disabled className="opacity-60">
                      {isDE ? 'Internes Projekt' : 'Interní projekt'}
                    </Button>
                  )}
                </div>
              </header>

              {/* Project Image — slider for redesigns, static for others */}
              {project.imageUrl && project.beforeImageUrl ? (
                <div className="mb-12">
                  <BeforeAfterSlider
                    beforeImage={project.beforeImageUrl}
                    afterImage={project.imageUrl}
                    beforeLabel={isDE ? "Vorher" : "Před"}
                    afterLabel={isDE ? "Nachher" : "Po"}
                    alt={project.title}
                  />
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    {isDE
                      ? "← Ziehen Sie den Schieberegler, um den Vorher/Nachher-Vergleich zu sehen →"
                      : "← Přejeďte posuvníkem pro srovnání před a po →"}
                  </p>
                </div>
              ) : project.imageUrl ? (
                <div className="aspect-video relative rounded-2xl overflow-hidden mb-12 border border-border/60 shadow-lg">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1024px"
                    priority
                  />
                </div>
              ) : null}

              {/* Performance Stats — adaptive grid, shown when ≥2 stats */}
              {showPerformance && (
                <div className="mb-12">
                  <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    {isDE ? 'Performance' : 'Výkon'}
                  </h2>
                  <div className={perfGridClass}>
                    {perfStats.map((stat, i) => (
                      <div key={i} className="p-5 rounded-xl bg-muted/50 border border-border/60 text-center space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                        <div className={`text-3xl font-bold ${stat.highlight ? 'text-primary' : 'text-muted-foreground/60'}`}>
                          {stat.value}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{stat.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description — structured with bullet points */}
              {project.description && project.description.includes('\n') && (
                <div className="mb-12">
                  <h2 className="text-xl font-semibold mb-4">
                    {isDE ? 'Über das Projekt' : 'O projektu'}
                  </h2>
                  <div className="text-base text-muted-foreground leading-relaxed space-y-2">
                    {project.description.split('\n').slice(1).map((line: string, i: number) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      if (trimmed.startsWith('•')) {
                        return (
                          <div key={i} className="flex gap-2.5 pl-1 py-0.5">
                            <span className="text-primary shrink-0 mt-0.5">•</span>
                            <span>{trimmed.slice(1).trim()}</span>
                          </div>
                        );
                      }
                      if (trimmed.startsWith('Hlavní funkce') || trimmed.startsWith('Hauptfunktionen')) {
                        return <p key={i} className="font-semibold text-foreground pt-3 pb-1">{trimmed}</p>;
                      }
                      if (trimmed.startsWith('Výsledek:') || trimmed.startsWith('Ergebnis:')) {
                        return <p key={i} className="font-semibold text-foreground pt-3 border-t border-border/40 mt-3">{trimmed}</p>;
                      }
                      return <p key={i}>{trimmed}</p>;
                    })}
                  </div>
                </div>
              )}

              {/* Technologies — always shown */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-xl font-semibold mb-4">{isDE ? 'Technologien' : 'Technologie'}</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string, index: number) => (
                      <span key={index} className="px-3 py-1.5 text-sm bg-muted rounded-lg border border-border/60">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="py-16 px-4 bg-muted/30 border-t border-border/40">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                  {isDE ? 'Weitere Projekte' : 'Další projekty'}
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {relatedProjects.map((related) => (
                    <Link key={related.id} href={`/portfolio/${related.id}`} className="group">
                      <article className="h-full rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5">
                        <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                          {related.imageUrl ? (
                            <Image
                              src={related.imageUrl}
                              alt={related.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                              <ExternalLink className="w-5 h-5 text-primary/30" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          {related.category && (
                            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                              {related.category}
                            </span>
                          )}
                          <h3 className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {related.title}
                          </h3>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="py-14 px-4">
            <div className="container mx-auto max-w-3xl text-center space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold">
                {isDE ? 'Gefällt Ihnen dieses Projekt?' : 'Líbí se vám tento projekt?'}
              </h2>
              <p className="text-muted-foreground">
                {isDE
                  ? 'Wir erstellen eine ähnliche Website für Sie — schnell und zu fairen Preisen.'
                  : 'Vytvoříme podobný web i pro vás — rychle a za férovou cenu.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href={isDE ? '/anfrage' : '/poptavka'}>
                    {isDE ? 'Unverbindliche Anfrage' : 'Nezávazná poptávka'}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/portfolio">
                    {isDE ? 'Weitere Projekte' : 'Další projekty'}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  } catch (error) {
    console.error('Error loading portfolio project:', error);
    notFound();
  }
}
