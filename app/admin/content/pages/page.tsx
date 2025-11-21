"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Search, Home, ShoppingCart, Mail, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface PageContentItem {
  pageId: string;
  pageName: string;
  category: 'homepage' | 'static-page' | 'section';
  content: Record<string, any>;
  updatedAt: string;
  updatedBy: string;
}

// Mock data - In production, this would be fetched from Firestore
const mockPages: PageContentItem[] = [
  {
    pageId: 'homepage-services',
    pageName: 'Homepage - Služby sekce',
    category: 'homepage',
    content: {
      heading: 'Naše služby',
      subheading: 'Komplexní řešení pro vaši online přítomnost',
      phone: '+420 123 456 789'
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  },
  {
    pageId: 'homepage-portfolio',
    pageName: 'Homepage - Portfolio sekce',
    category: 'homepage',
    content: {
      heading: 'Naše projekty',
      subheading: 'Ukázky naší práce a realizovaných projektů',
      buttonText: 'Zobrazit všechny projekty'
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  },
  {
    pageId: 'homepage-pricing',
    pageName: 'Homepage - Ceník sekce',
    category: 'homepage',
    content: {
      heading: 'Cenové balíčky',
      subheading: 'Transparentní ceny bez skrytých poplatků',
      footerNote: 'Ceny jsou orientační. Finální cena závisí na rozsahu a složitosti projektu.'
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  },
  {
    pageId: 'about-page',
    pageName: 'O nás - Statická stránka',
    category: 'static-page',
    content: {
      heading: 'O nás',
      subheading: 'Jsme tým, který miluje web development',
      description: 'Vytváříme moderní webové stránky s důrazem na rychlost, design a uživatelskou zkušenost.'
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  },
  {
    pageId: 'services-page',
    pageName: 'Služby - Statická stránka',
    category: 'static-page',
    content: {
      heading: 'Naše služby',
      subheading: 'Kompletní řešení pro váš online úspěch',
      description: 'Od návrhu přes vývoj až po údržbu - poskytujeme komplexní služby pro váš web.'
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  },
  {
    pageId: 'contact-info',
    pageName: 'Kontakt - Informace',
    category: 'section',
    content: {
      heading: 'Napište nám',
      subheading: 'Nezávazně nás kontaktujte a my vám do 24 hodin odpovíme',
      responseTime: '24 hodin',
      availability: 'Po - Pá: 9:00 - 18:00'
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  },
];

const categoryIcons = {
  homepage: Home,
  'static-page': FileText,
  section: ShoppingCart,
};

const categoryLabels = {
  homepage: 'Homepage sekce',
  'static-page': 'Statická stránka',
  section: 'Sekce',
};

const categoryColors = {
  homepage: 'bg-blue-500/10 text-blue-700 border-blue-200',
  'static-page': 'bg-primary/10 text-primary border-primary/20',
  section: 'bg-purple-500/10 text-purple-700 border-purple-200',
};

export default function PagesListPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pages, setPages] = useState<PageContentItem[]>(mockPages);

  // Filter pages based on search and category
  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.pageId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/content")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Zpět na Obsah
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold">Správa stránek a textů</h1>
                <p className="text-sm text-muted-foreground">Univerzální editor obsahu</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Editovat stránky</h2>
          <p className="text-muted-foreground">
            Upravte nadpisy, podnadpisy a texty na všech stránkách z jednoho místa
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat stránku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Vše ({mockPages.length})
              </Button>
              <Button
                variant={selectedCategory === "homepage" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("homepage")}
              >
                Homepage ({mockPages.filter(p => p.category === 'homepage').length})
              </Button>
              <Button
                variant={selectedCategory === "static-page" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("static-page")}
              >
                Stránky ({mockPages.filter(p => p.category === 'static-page').length})
              </Button>
              <Button
                variant={selectedCategory === "section" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("section")}
              >
                Sekce ({mockPages.filter(p => p.category === 'section').length})
              </Button>
            </div>
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => {
            const IconComponent = categoryIcons[page.category];
            return (
              <Card key={page.pageId} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className={categoryColors[page.category]}>
                      {categoryLabels[page.category]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{page.pageName}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {page.content.heading && (
                      <span className="font-medium">{page.content.heading}</span>
                    )}
                    {page.content.heading && page.content.subheading && ' • '}
                    {page.content.subheading}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content preview */}
                  <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
                    {Object.entries(page.content).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-medium capitalize">{key}:</span>
                        <span className="truncate">{String(value).substring(0, 40)}{String(value).length > 40 ? '...' : ''}</span>
                      </div>
                    ))}
                    {Object.keys(page.content).length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{Object.keys(page.content).length - 3} další pole
                      </div>
                    )}
                  </div>

                  {/* Last updated */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Upraveno: {formatDate(page.updatedAt)}</span>
                  </div>

                  {/* Edit button */}
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/admin/content/pages/${page.pageId}/edit`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upravit texty
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No results */}
        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Žádné výsledky</h3>
            <p className="text-muted-foreground">
              Zkuste změnit vyhledávací kritéria nebo filtr kategorie
            </p>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Jak to funguje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Homepage sekce:</strong> Nadpisy a podnadpisy pro jednotlivé sekce na úvodní stránce (Služby, Portfolio, Ceník)
            </p>
            <p>
              <strong>Statické stránky:</strong> Obsah samostatných stránek jako O nás, Služby, Kontakt
            </p>
            <p>
              <strong>Sekce:</strong> Texty pro opakující se komponenty na webu (kontaktní informace, CTA bannery)
            </p>
            <p className="pt-2 border-t">
              <strong>Tip:</strong> Všechny změny jsou automaticky uloženy a okamžitě viditelné na webu
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
