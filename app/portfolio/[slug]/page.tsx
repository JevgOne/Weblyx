import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Gauge, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPortfolioById, getAllPortfolio } from "@/lib/turso/portfolio";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateCreativeWorkSchema } from "@/lib/schema-org";

// Use ISR: Render on-demand and cache for 60 seconds
export const revalidate = 60;

// Allow all portfolio items to be rendered dynamically
export const dynamicParams = true;

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const project = await getPortfolioById(slug);

    if (!project || !project.published) {
      return {
        title: "Projekt nenalezen | Weblyx Portfolio",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

    return {
      title: `${project.title} | Weblyx Portfolio`,
      description: project.description || `Ukázka projektu: ${project.title}`,
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
        siteName: "Weblyx",
        locale: "cs_CZ",
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
      title: "Projekt nenalezen | Weblyx Portfolio",
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
    const project = await getPortfolioById(slug);

    if (!project || !project.published) {
      notFound();
    }

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

    // Fetch related projects (other published projects, excluding current one)
    const allProjects = await getAllPortfolio();
    const relatedProjects = allProjects
      .filter((p) => p.published && p.id !== slug)
      .slice(0, 3);

    // Generate CreativeWork schema
    const creativeWorkSchema = generateCreativeWorkSchema({
      id: project.id,
      title: project.title,
      description: project.description || '',
      imageUrl: project.imageUrl,
      url: project.projectUrl,
      tags: project.technologies,
      dateCreated: project.createdAt,
    });

    // Generate Breadcrumbs schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Domů",
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

    return (
      <>
        {/* Schema.org JSON-LD */}
        <JsonLd data={creativeWorkSchema} />
        <JsonLd data={breadcrumbSchema} />

        <main className="min-h-screen relative">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 -z-10"></div>

          <article className="py-12 md:py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              {/* Back button */}
              <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
                <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span>Zpět na portfolio</span>
              </Link>

              {/* Project Image */}
              {project.imageUrl ? (
                <div className="aspect-video bg-cover bg-center rounded-2xl mb-12 overflow-hidden shadow-2xl border-2 border-primary/10">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video relative overflow-hidden rounded-2xl mb-12 bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/10 shadow-2xl">
                  <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-primary/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary/40 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <header className="mb-12 space-y-6">
                {/* Category & Client */}
                <div className="flex flex-wrap items-center gap-3">
                  {project.category && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {project.category}
                    </Badge>
                  )}
                  {project.clientName && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border">
                      <span className="text-sm font-medium">Klient: {project.clientName}</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full"></div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    {project.title}
                  </h1>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed border-l-4 border-primary/20 pl-6 py-2">
                    {project.description}
                  </p>
                )}

                {/* Project URL */}
                {project.projectUrl && (
                  <div className="pt-4">
                    <Button asChild size="lg" className="group">
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                        <span>Navštívit web</span>
                        <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                )}
              </header>

              {/* Performance Stats */}
              {(project.pagespeedMobile || project.pagespeedDesktop || project.loadTimeBefore || project.loadTimeAfter) && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Gauge className="h-6 w-6 text-primary" />
                    Výkonnostní metriky
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {project.pagespeedMobile && (
                      <Card>
                        <CardContent className="p-6 text-center space-y-2">
                          <div className="text-sm text-muted-foreground">PageSpeed Mobile</div>
                          <div className="text-4xl font-bold text-primary">{project.pagespeedMobile}</div>
                          <div className="text-xs text-muted-foreground">/ 100</div>
                        </CardContent>
                      </Card>
                    )}
                    {project.pagespeedDesktop && (
                      <Card>
                        <CardContent className="p-6 text-center space-y-2">
                          <div className="text-sm text-muted-foreground">PageSpeed Desktop</div>
                          <div className="text-4xl font-bold text-primary">{project.pagespeedDesktop}</div>
                          <div className="text-xs text-muted-foreground">/ 100</div>
                        </CardContent>
                      </Card>
                    )}
                    {project.loadTimeBefore && (
                      <Card>
                        <CardContent className="p-6 text-center space-y-2">
                          <div className="text-sm text-muted-foreground">Původní načítání</div>
                          <div className="text-4xl font-bold text-muted-foreground">{project.loadTimeBefore}s</div>
                          <div className="text-xs text-muted-foreground">před optimalizací</div>
                        </CardContent>
                      </Card>
                    )}
                    {project.loadTimeAfter && (
                      <Card>
                        <CardContent className="p-6 text-center space-y-2">
                          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Nové načítání
                          </div>
                          <div className="text-4xl font-bold text-primary">{project.loadTimeAfter}s</div>
                          <div className="text-xs text-muted-foreground">po optimalizaci</div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mb-12 pt-8 border-t border-primary/10">
                  <h2 className="text-2xl font-bold mb-6">Použité technologie</h2>
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map((tech: string, index: number) => (
                      <Badge key={index} variant="outline" className="px-4 py-2 text-sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="py-16 md:py-20 px-4 bg-muted/30">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Další projekty
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Podívejte se na další ukázky naší práce
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {relatedProjects.map((related) => (
                    <Link key={related.id} href={`/portfolio/${related.id}`} className="group">
                      <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20">
                        {related.imageUrl ? (
                          <div
                            className="aspect-video bg-cover bg-center relative overflow-hidden"
                            style={{ backgroundImage: `url(${related.imageUrl})` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/8 to-background">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-6 space-y-3">
                          {related.category && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              {related.category}
                            </Badge>
                          )}
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {related.title}
                          </h3>
                          {related.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {related.description}
                            </p>
                          )}
                          <div className="flex items-center justify-end pt-3 border-t">
                            <div className="text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                Líbí se vám tento projekt?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Vytvoříme podobný web i pro vás. Rychle, kvalitně a za férovou cenu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/poptavka">
                  <Button size="lg">
                    Nezávazná poptávka
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button size="lg" variant="outline">
                    Další projekty
                  </Button>
                </Link>
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
