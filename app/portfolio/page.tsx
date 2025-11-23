import type { Metadata } from "next";
import { Portfolio } from "@/components/home/portfolio";
import { JsonLd } from "@/components/seo/JsonLd";
import { generatePortfolioSchema, BreadcrumbItem, generateWebPageSchema, PortfolioItem } from "@/lib/schema-org";
import { getAllPortfolio } from "@/lib/turso/portfolio";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

// Revalidate every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Naše projekty – weby a e-shopy, které přináší výsledky",
  description: "Podívejte se na ukázky webů a e-shopů, které jsme vytvořili. Každý projekt je rychlý, responzivní a přizpůsobený konkrétnímu byznysu – od malých webů pro živnostníky až po komplexnější firemní řešení.",
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
    url: "https://weblyx.cz/portfolio",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Weblyx - Portfolio"
      }
    ],
  },
  alternates: {
    canonical: "https://weblyx.cz/portfolio"
  }
};

async function getPortfolioProjects() {
  try {
    // Fetch from Turso
    const allProjects = await getAllPortfolio();

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
  // Fetch portfolio projects for schema
  const portfolioProjects = await getPortfolioProjects();

  // Generate breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Domů', url: 'https://weblyx.cz' },
    { name: 'Portfolio', url: 'https://weblyx.cz/portfolio' },
  ];

  // Generate schemas
  const webpageSchema = generateWebPageSchema({
    name: 'Portfolio',
    description: 'Naše realizované projekty a ukázky práce',
    url: 'https://weblyx.cz/portfolio',
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
            { label: "Portfolio", href: "/portfolio" }
          ]}
        />
        <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Naše <span className="text-primary">projekty</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Podívejte se na ukázky naší práce a realizovaných projektů
            </p>
          </div>
        </section>
        <div className="py-16">
          <Portfolio />
        </div>
      </main>
    </>
  );
}
