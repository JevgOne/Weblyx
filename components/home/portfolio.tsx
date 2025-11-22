import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getAllPortfolio } from "@/lib/turso/portfolio";
import { getPageContent } from "@/lib/firestore-pages";
import { PortfolioProject } from "@/types/homepage";

async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  try {
    // Fetch from Turso
    const allProjects = await getAllPortfolio();

    // Filter for published and featured, then sort and limit
    const projects = allProjects
      .filter(p => p.published && p.featured)
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

export async function Portfolio() {
  const portfolioData = await getPortfolioProjects();
  const sectionContent = await getPageContent('homepage-portfolio');

  // Fallback data if fetch fails
  const projects = portfolioData.length > 0 ? portfolioData : [
    {
      id: 'fallback-1',
      title: 'E-shop s módou',
      category: 'E-commerce',
      description: 'Moderní e-shop s pokročilými filtry a platební bránou',
      technologies: ['Next.js', 'Stripe', 'Tailwind'],
      imageUrl: '/images/portfolio-1.jpg',
      published: true,
      featured: true,
      order: 1,
    },
    {
      id: 'fallback-2',
      title: 'Firemní prezentace',
      category: 'Web',
      description: 'Responzivní web pro konzultační společnost',
      technologies: ['React', 'SEO', 'Analytics'],
      imageUrl: '/images/portfolio-2.jpg',
      published: true,
      featured: true,
      order: 2,
    },
  ];

  // Use content from page_content collection or fallback
  const heading = sectionContent?.content?.heading || 'Naše projekty';
  const subheading = sectionContent?.content?.subheading || 'Ukázky naší práce a realizovaných projektů';
  const buttonText = sectionContent?.content?.buttonText || 'Zobrazit všechny projekty';

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
            <Card
              key={project.id}
              className="group overflow-hidden hover:shadow-elegant transition-all duration-300"
            >
              <div className="aspect-video bg-gradient-primary relative overflow-hidden">
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
                        Screenshot projektu
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Zobrazit detail
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <Badge variant="secondary">{project.category}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/portfolio">{buttonText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
