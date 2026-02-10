import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { generatePortfolioSchema, BreadcrumbItem, generateWebPageSchema, PortfolioItem } from "@/lib/schema-org";
import { getAllPortfolio } from "@/lib/turso/portfolio";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getLocale } from "next-intl/server";

export const revalidate = 60;

const isSeitelyx = process.env.NEXT_PUBLIC_DOMAIN?.includes('seitelyx.de');

export const metadata: Metadata = isSeitelyx ? {
  title: "Unsere Projekte – Websites und Online-Shops, die Ergebnisse liefern",
  description: "Sehen Sie sich Beispiele von Websites und Online-Shops an, die wir erstellt haben. Schnelle, responsive Projekte nach Maß.",
  keywords: [
    "Website-Portfolio",
    "Referenzen",
    "Realisierte Projekte",
    "Websites nach Maß",
    "Online-Shops nach Maß",
  ],
  openGraph: {
    title: "Portfolio | Unsere Projekte – Websites und Online-Shops",
    description: "Sehen Sie sich Beispiele von Websites und Online-Shops an, die wir für unsere Kunden erstellt haben.",
    url: "https://www.seitelyx.de/portfolio",
    type: "website",
    images: [{ url: "/images/og/og-portfolio.png", width: 1200, height: 630, alt: "Seitelyx - Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Unsere Projekte – Websites und Online-Shops",
    description: "Sehen Sie sich Beispiele von Websites und Online-Shops an, die wir für unsere Kunden erstellt haben.",
  },
  alternates: {
    canonical: "https://www.seitelyx.de/portfolio",
    languages: getAlternateLanguages('/portfolio'),
  },
} : {
  title: "Naše projekty – weby a e-shopy, které přináší výsledky",
  description: "Podívejte se na ukázky webů a e-shopů, které jsme vytvořili. Rychlé, responzivní projekty na míru – od webů pro živnostníky po firemní řešení.",
  keywords: [
    "portfolio webů",
    "ukázky webů",
    "reference",
    "realizované projekty",
    "weby na míru",
    "e-shopy na míru"
  ],
  openGraph: {
    title: "Portfolio | Naše projekty – weby a e-shopy",
    description: "Podívejte se na ukázky webů a e-shopů, které jsme vytvořili pro naše klienty.",
    url: "https://www.weblyx.cz/portfolio",
    type: "website",
    images: [{ url: "/images/og/og-portfolio.png", width: 1200, height: 630, alt: "Weblyx - Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Naše projekty – weby a e-shopy",
    description: "Podívejte se na ukázky webů a e-shopů, které jsme vytvořili pro naše klienty.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/portfolio",
    languages: getAlternateLanguages('/portfolio')
  }
};

async function getPortfolioProjects(locale?: string) {
  try {
    const allProjects = await getAllPortfolio(locale);

    const projects = allProjects
      .filter(project => project.published)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return projects;
  } catch (error) {
    console.error('Error fetching portfolio projects:', error);
    return [];
  }
}

export default async function PortfolioPage() {
  const locale = await getLocale();
  const isDE = locale === 'de';
  const baseUrl = isDE ? 'https://www.seitelyx.de' : 'https://www.weblyx.cz';

  const projects = await getPortfolioProjects(locale);

  // Schema data
  const schemaProjects: PortfolioItem[] = projects.map(data => ({
    id: data.id,
    title: data.title,
    description: data.description || '',
    imageUrl: data.imageUrl,
    url: data.projectUrl || '',
    tags: data.technologies || [],
    dateCreated: data.createdAt,
  }));

  const breadcrumbs: BreadcrumbItem[] = [
    { name: isDE ? 'Startseite' : 'Domů', url: baseUrl },
    { name: isDE ? 'Referenzen' : 'Portfolio', url: `${baseUrl}/portfolio` },
  ];

  const webpageSchema = generateWebPageSchema({
    name: 'Portfolio',
    description: isDE ? 'Unsere realisierten Projekte und Arbeitsbeispiele' : 'Naše realizované projekty a ukázky práce',
    url: `${baseUrl}/portfolio`,
    breadcrumbs,
  });

  const portfolioSchema = schemaProjects.length > 0
    ? generatePortfolioSchema(schemaProjects)
    : null;

  return (
    <>
      <JsonLd data={webpageSchema} />
      {portfolioSchema && <JsonLd data={portfolioSchema} />}

      <main className="min-h-screen">
        <Breadcrumbs
          items={[
            { label: isDE ? "Referenzen" : "Portfolio", href: "/portfolio" }
          ]}
        />

        {/* Hero — clean & compact */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              {isDE ? (
                <>Unsere <span className="text-primary">Projekte</span></>
              ) : (
                <>Naše <span className="text-primary">projekty</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isDE
                ? 'Schnelle, moderne Websites – von Fitness-Studios bis E-Commerce'
                : 'Rychlé, moderní weby — od fitness studií po e-shopy'}
            </p>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="pb-20 md:pb-28 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                      {/* Category */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-black/70 text-foreground backdrop-blur-sm">
                          {project.category}
                        </span>
                      </div>

                      {/* No individual badges — consistent card look */}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h2 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {project.title}
                      </h2>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Tech tags — max 3 */}
                      {project.technologies && project.technologies.length > 0 && (
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
            <div className="mt-16 text-center space-y-4">
              <p className="text-muted-foreground">
                {isDE
                  ? 'Über 15 realisierte Projekte. Möchten Sie das nächste sein?'
                  : 'Více než 15 realizovaných projektů. Budete další?'}
              </p>
              <Button asChild size="lg" className="group">
                <Link href={isDE ? '/anfrage' : '/poptavka'}>
                  {isDE ? 'Unverbindliche Anfrage' : 'Nezávazná poptávka'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
