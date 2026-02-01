import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getAllPortfolio } from "@/lib/turso/portfolio";
import { getPageContent } from "@/lib/firestore-pages";
import { PortfolioProject } from "@/types/homepage";

async function getPortfolioProjects(locale?: string): Promise<PortfolioProject[]> {
  try {
    const allProjects = await getAllPortfolio(locale);

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

  const heading = sectionContent?.content?.heading || t("fallbackHeading");
  const subheading = sectionContent?.content?.subheading || t("fallbackSubheading");

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.id}`}
              className="group"
            >
              <article className="h-full rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
                {/* Image */}
                <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-primary/40" />
                      </div>
                    </div>
                  )}

                  {/* Category badge overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-black/70 text-foreground backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>

                  {/* PageSpeed indicator — subtle, top-right */}
                  {project.pagespeedMobile && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-white">
                        ⚡ {project.pagespeedMobile}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech tags — max 3, minimal */}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[11px] text-muted-foreground/60 px-1 py-0.5">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        {projects.length > 0 && (
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="group">
              <Link href="/portfolio">
                {locale === 'de' ? 'Alle Projekte ansehen' : 'Zobrazit všechny projekty'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
