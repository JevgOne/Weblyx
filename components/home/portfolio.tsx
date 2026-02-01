import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllPortfolio } from "@/lib/turso/portfolio";
import { getPageContent } from "@/lib/firestore-pages";
import { PortfolioProject } from "@/types/homepage";

async function getPortfolioProjects(locale?: string): Promise<PortfolioProject[]> {
  try {
    // Fetch from Turso with locale support
    const allProjects = await getAllPortfolio(locale);

    // Filter for published only, then sort and limit
    const projects = allProjects
      .filter(p => p.published)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(0, 6)
      .map(data => ({
        id: data.id,
        title: data.title,
        category: data.category || '',
        description: data.description || '',
        technologies: data.technologies || [],
        imageUrl: data.imageUrl,
        projectUrl: data.projectUrl,
        pagespeedMobile: data.pagespeedMobile,
        pagespeedDesktop: data.pagespeedDesktop,
        loadTimeBefore: data.loadTimeBefore,
        loadTimeAfter: data.loadTimeAfter,
        published: data.published,
        featured: data.featured,
        order: data.order || 0,
      } as PortfolioProject));

    return projects;
  } catch (error) {
    console.error('Error fetching portfolio projects:', error);
    return [];
  }
}

import { getTranslations, getLocale } from "next-intl/server";

export async function Portfolio() {
  const t = await getTranslations("portfolio");
  const locale = await getLocale();
  const projects = await getPortfolioProjects(locale);
  const sectionContent = await getPageContent('homepage-portfolio');

  // Use content from page_content collection or fallback to translations
  const heading = sectionContent?.content?.heading || t("fallbackHeading");
  const subheading = sectionContent?.content?.subheading || t("fallbackSubheading");
  const buttonText = sectionContent?.content?.buttonText || t("fallbackButtonText");

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.id}`}
            >
              <Card className="group overflow-hidden hover:shadow-elegant transition-all duration-300 cursor-pointer h-full flex flex-col">

              <div className="aspect-video bg-gradient-primary relative overflow-hidden flex-shrink-0">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="text-center space-y-2 p-4">
                      <div className="text-4xl font-bold text-primary/30">📸</div>
                      <p className="text-sm text-muted-foreground">
                        {t("projectScreenshot")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    {t("viewWebsite")}
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {project.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                </div>

                {/* PageSpeed Scores */}
                {(project.pagespeedMobile || project.pagespeedDesktop) && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {project.pagespeedMobile && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-green-700">
                          {project.pagespeedMobile}/100
                        </span>
                      </div>
                    )}
                    {project.pagespeedDesktop && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-green-700">
                          {project.pagespeedDesktop}/100
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-muted-foreground text-sm line-clamp-3 flex-shrink-0">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.technologies.slice(0, 5).map((tech, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.technologies.length - 5}
                    </Badge>
                  )}
                </div>
              </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {projects.length > 0 && (
          <div className="text-center space-y-6 mt-8">
            <div className="max-w-2xl mx-auto p-6 rounded-lg bg-muted/50 border border-border">
              <p className="text-muted-foreground mb-2">
                💼 <strong>{locale === 'de' ? 'Über 15 Projekte realisiert' : 'Více než 15 projektů realizováno'}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                {locale === 'de'
                  ? 'Das Portfolio zeigt ausgewählte Projekte. Kontaktieren Sie uns für weitere Referenzen und Beispiele.'
                  : 'Portfolio obsahuje vybrané projekty. Pro kompletní reference a další ukázky nás kontaktujte.'}
              </p>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href={locale === 'de' ? '/anfrage' : '/kontakt'}>
                {locale === 'de' ? 'Kostenlose Beratung' : 'Konzultace zdarma'}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
