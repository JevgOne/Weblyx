import type { Metadata } from "next";
import { Portfolio } from "@/components/home/portfolio";
import { JsonLd } from "@/components/seo/JsonLd";
import { generatePortfolioSchema, BreadcrumbItem, generateWebPageSchema, PortfolioItem } from "@/lib/schema-org";
import { adminDbInstance } from "@/lib/firebase-admin";

export const metadata: Metadata = {
  title: "Portfolio | Weblyx - Naše projekty",
  description: "Podívejte se na naše realizované projekty a ukázky naší práce. Webové stránky, e-shopy a další řešení.",
};

async function getPortfolioProjects() {
  try {
    if (!adminDbInstance) {
      return [];
    }

    const snapshot = await adminDbInstance
      .collection('portfolio')
      .orderBy('order')
      .get();

    if (snapshot.empty) {
      return [];
    }

    const projects: PortfolioItem[] = [];
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      // Only include published projects
      if (data.published) {
        projects.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          url: data.liveUrl,
          tags: data.technologies || [],
          dateCreated: data.createdAt?.toDate(),
        });
      }
    });

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
