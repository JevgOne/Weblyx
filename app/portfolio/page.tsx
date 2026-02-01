import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { Portfolio } from "@/components/home/portfolio";
import { JsonLd } from "@/components/seo/JsonLd";
import { generatePortfolioSchema, BreadcrumbItem, generateWebPageSchema, PortfolioItem } from "@/lib/schema-org";
import { getAllPortfolio } from "@/lib/turso/portfolio";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getLocale } from "next-intl/server";

// Revalidate every 60 seconds
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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Seitelyx - Portfolio" }],
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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Weblyx - Portfolio" }],
  },
  alternates: {
    canonical: "https://www.weblyx.cz/portfolio",
    languages: getAlternateLanguages('/portfolio')
  }
};

async function getPortfolioProjects(locale?: string) {
  try {
    // Fetch from Turso with locale
    const allProjects = await getAllPortfolio(locale);

    // Only include published projects, map to schema format
    const projects: PortfolioItem[] = allProjects
      .filter(project => project.published)
      .map(data => ({
        id: data.id,
        title: data.title,
        description: data.description || '',
        imageUrl: data.imageUrl,
        url: data.projectUrl || '',
        tags: data.technologies || [],
        dateCreated: data.createdAt,
      }));

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

  // Fetch portfolio projects for schema
  const portfolioProjects = await getPortfolioProjects(locale);

  // Generate breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [
    { name: isDE ? 'Startseite' : 'Domů', url: baseUrl },
    { name: isDE ? 'Referenzen' : 'Portfolio', url: `${baseUrl}/portfolio` },
  ];

  // Generate schemas
  const webpageSchema = generateWebPageSchema({
    name: 'Portfolio',
    description: isDE ? 'Unsere realisierten Projekte und Arbeitsbeispiele' : 'Naše realizované projekty a ukázky práce',
    url: `${baseUrl}/portfolio`,
    breadcrumbs,
  });

  const portfolioSchema = portfolioProjects.length > 0
    ? generatePortfolioSchema(portfolioProjects)
    : null;

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={webpageSchema} />
      {portfolioSchema && <JsonLd data={portfolioSchema} />}

      <main className="min-h-screen">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: isDE ? "Referenzen" : "Portfolio", href: "/portfolio" }
          ]}
        />
        <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              {isDE ? (
                <>Unsere <span className="text-primary">Projekte</span></>
              ) : (
                <>Naše <span className="text-primary">projekty</span></>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isDE
                ? 'Sehen Sie sich Beispiele unserer Arbeit und realisierten Projekte an'
                : 'Podívejte se na ukázky naší práce a realizovaných projektů'}
            </p>
            <div className="max-w-2xl mx-auto p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                {isDE
                  ? '💼 Hier zeigen wir ausgewählte Projekte. Über 15 Websites realisiert – kontaktieren Sie uns für alle Referenzen.'
                  : '💼 Zobrazujeme vybrané projekty. Více než 15 webů realizováno – pro kompletní reference kontaktujte nás.'}
              </p>
            </div>
          </div>
        </section>
        <div className="py-16">
          <Portfolio />
        </div>
      </main>
    </>
  );
}
