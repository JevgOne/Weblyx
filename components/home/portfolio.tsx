import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function Portfolio() {
  const projects = [
    {
      title: "E-shop s módou",
      category: "E-commerce",
      description: "Moderní e-shop s pokročilými filtry a platební bránou",
      technologies: ["Next.js", "Stripe", "Tailwind"],
      image: "/images/portfolio-1.jpg",
    },
    {
      title: "Firemní prezentace",
      category: "Web",
      description: "Responzivní web pro konzultační společnost",
      technologies: ["React", "SEO", "Analytics"],
      image: "/images/portfolio-2.jpg",
    },
    {
      title: "Restaurace & Menu",
      category: "Web",
      description: "Web s online rezervačním systémem a menu",
      technologies: ["Next.js", "Booking", "Maps"],
      image: "/images/portfolio-3.jpg",
    },
    {
      title: "Portfolio fotografa",
      category: "Portfolio",
      description: "Galerie s optimalizací obrázků a lazy loading",
      technologies: ["Next.js", "Image Opt", "Lightbox"],
      image: "/images/portfolio-4.jpg",
    },
    {
      title: "SaaS Landing Page",
      category: "Landing",
      description: "Konverzní landing page s A/B testingem",
      technologies: ["React", "Analytics", "CRO"],
      image: "/images/portfolio-5.jpg",
    },
    {
      title: "Blog & Magazín",
      category: "Blog",
      description: "Content-focused web s CMS a vyhledáváním",
      technologies: ["Next.js", "CMS", "Search"],
      image: "/images/portfolio-6.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Naše projekty
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ukázky naší práce a realizovaných projektů
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-elegant transition-all duration-300"
            >
              <div className="aspect-video bg-gradient-primary relative overflow-hidden">
                {/* Placeholder for project image */}
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="text-center space-y-2 p-4">
                    <div className="text-4xl font-bold text-primary/30">📸</div>
                    <p className="text-sm text-muted-foreground">
                      Screenshot projektu
                    </p>
                  </div>
                </div>
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
            <Link href="/portfolio">Zobrazit všechny projekty</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
