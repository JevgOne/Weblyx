import Link from "next/link";
import Image from "next/image";
import { LeadButton } from "@/components/tracking/LeadButton";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getAllPortfolio } from "@/lib/turso/portfolio";
import { getPageContent } from "@/lib/firestore-pages";
import { PortfolioProject } from "@/types/homepage";

async function getPortfolioProjects(locale?: string): Promise<PortfolioProject[]> {
  try {
    const allProjects = await getAllPortfolio(locale);

    const projects = allProjects
      .filter(p => p.published)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
import { safeRead } from '@/lib/safe-read';

export async function Portfolio() {
  const t = await getTranslations("portfolio");
  const locale = await getLocale();
  const projects = await getPortfolioProjects(locale);
  const sectionContent = await safeRead(
    () => getPageContent('homepage-portfolio'),
    null,
    'homepage-portfolio section'
  );

  const heading = sectionContent?.content?.heading || t("fallbackHeading");
  const subheading = sectionContent?.content?.subheading || t("fallbackSubheading");

  return (
    <section className="section px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="eyebrow">{locale === 'de' ? 'Referenzen' : 'Reference'}</p>
          <h2 className="display display-lg mt-5">{heading}</h2>
          <p className="lede mt-5">{subheading}</p>
        </div>

        {/* Grid — the work is the loudest thing here, so the frame around it
            stays silent: hairline, no lift, no scale on the image. */}
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.id}`}
              className="group block"
            >
              <article className="card-flat card-flat-accent h-full overflow-hidden">
                {/* Image */}
                <div className="aspect-[16/10] relative overflow-hidden bg-[hsl(var(--surface-sunken))] border-b border-[hsl(var(--hairline))]">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-[hsl(var(--ink-faint))]" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {project.category && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--ink-faint))]">
                      {project.category}
                    </p>
                  )}

                  <h3 className="mt-2.5 text-lg font-semibold tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--ink-soft))] line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech tags — max 3, minimal */}
                  {project.technologies.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium text-[hsl(var(--ink-faint))] border border-[hsl(var(--hairline))] rounded-md px-2 py-0.5"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[11px] text-[hsl(var(--ink-faint))]">
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
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4">
            <LeadButton
              href={locale === 'de' ? '/anfrage' : '/poptavka'}
              size="lg"
              className="h-12 px-7 text-base font-semibold rounded-xl"
            >
              {locale === 'de' ? 'Mein Projekt starten' : 'Chci svůj projekt'}
            </LeadButton>
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--ink-soft))] hover:text-primary transition-colors duration-200"
            >
              {locale === 'de' ? 'Alle Projekte ansehen' : 'Zobrazit všechny projekty'}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
