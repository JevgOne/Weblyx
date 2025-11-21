"use client";

import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PageContentItem {
  pageId: string;
  pageName: string;
  category: 'homepage' | 'static-page' | 'section';
  content: Record<string, any>;
  updatedAt: string;
  updatedBy: string;
}

// Mock data - same as in the list page
const mockPagesData: Record<string, PageContentItem> = {
  'homepage-services': {
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
  'homepage-portfolio': {
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
  'homepage-pricing': {
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
  'about-page': {
    pageId: 'about-page',
    pageName: 'O nás - Statická stránka',
    category: 'static-page',
    content: {
      heading: 'O nás',
      subheading: 'Jsme tým, který miluje web development',
      description: 'Vytváříme moderní webové stránky s důrazem na rychlost, design a uživatelskou zkušenost. Naše mise je pomoci malým a středním firmám získat profesionální online přítomnost za dostupné ceny.'
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  },
  'services-page': {
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
  'contact-info': {
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
};

const categoryColors = {
  homepage: 'bg-blue-500/10 text-blue-700 border-blue-200',
  'static-page': 'bg-primary/10 text-primary border-primary/20',
  section: 'bg-purple-500/10 text-purple-700 border-purple-200',
};

const categoryLabels = {
  homepage: 'Homepage sekce',
  'static-page': 'Statická stránka',
  section: 'Sekce',
};

// Field labels and descriptions
const fieldMetadata: Record<string, { label: string; description: string; type: 'input' | 'textarea' }> = {
  heading: { label: 'Nadpis', description: 'Hlavní nadpis sekce', type: 'input' },
  subheading: { label: 'Podnadpis', description: 'Doplňující text pod nadpisem', type: 'input' },
  description: { label: 'Popis', description: 'Delší textový popis', type: 'textarea' },
  buttonText: { label: 'Text tlačítka', description: 'Text na CTA tlačítku', type: 'input' },
  footerNote: { label: 'Poznámka v patičce', description: 'Doplňující informace pod obsahem', type: 'textarea' },
  responseTime: { label: 'Doba odezvy', description: 'Jak rychle odpovídáte', type: 'input' },
  availability: { label: 'Dostupnost', description: 'Otevírací doba nebo dostupnost', type: 'input' },
  phone: { label: 'Telefonní číslo', description: 'Kontaktní telefon pro zákazníky', type: 'input' },
};

export default function PageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAdminAuth();
  const pageId = params?.pageId as string;

  const [pageData, setPageData] = useState<PageContentItem | null>(null);
  const [content, setContent] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load page data
  useEffect(() => {
    if (pageId && mockPagesData[pageId]) {
      const data = mockPagesData[pageId];
      setPageData(data);
      setContent(data.content);
    }
  }, [pageId]);

  // Track unsaved changes
  useEffect(() => {
    if (pageData) {
      const hasChanges = JSON.stringify(content) !== JSON.stringify(pageData.content);
      setHasUnsavedChanges(hasChanges);
    }
  }, [content, pageData]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, this would be:
      // await updatePageContent(pageId, content, user?.email || 'admin');

      console.log('Saving page content:', { pageId, content });

      setSaveStatus('success');
      setHasUnsavedChanges(false);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving page content:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle content change
  const handleContentChange = (key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!pageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Stránka nenalezena</h2>
          <p className="text-muted-foreground mb-4">
            Požadovaná stránka neexistuje nebo není dostupná
          </p>
          <Button onClick={() => router.push('/admin/content/pages')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na seznam
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={() => {
                  if (hasUnsavedChanges) {
                    const confirmed = window.confirm(
                      'Máte neuložené změny. Opravdu chcete opustit stránku?'
                    );
                    if (!confirmed) return;
                  }
                  router.push("/admin/content/pages");
                }}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Zpět
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{pageData.pageName}</h1>
                  <Badge variant="outline" className={categoryColors[pageData.category]}>
                    {categoryLabels[pageData.category]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Editace textu stránky</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-500">
                  Neuložené změny
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Ukládání...' : 'Uložit změny'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Messages */}
        {saveStatus === 'success' && (
          <Alert className="mb-6 border-primary/20 bg-primary/10 dark:bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary dark:text-primary">
              Změny byly úspěšně uloženy
            </AlertDescription>
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/30" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Chyba při ukládání změn. Zkuste to prosím znovu.
            </AlertDescription>
          </Alert>
        )}

        {/* Editor Form */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Upravit obsah</CardTitle>
                <CardDescription>
                  Změňte texty níže. Změny se projeví okamžitě po uložení.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(content).map(([key, value]) => {
              const metadata = fieldMetadata[key] || {
                label: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Hodnota pro pole ${key}`,
                type: typeof value === 'string' && value.length > 100 ? 'textarea' : 'input'
              };

              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-base">
                    {metadata.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {metadata.description}
                  </p>
                  {metadata.type === 'textarea' ? (
                    <Textarea
                      id={key}
                      value={String(value)}
                      onChange={(e) => handleContentChange(key, e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <Input
                      id={key}
                      value={String(value)}
                      onChange={(e) => handleContentChange(key, e.target.value)}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {String(value).length} znaků
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Náhled</CardTitle>
            <CardDescription>
              Jak bude obsah vypadat na webu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.heading && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nadpis:</p>
                <h2 className="text-3xl font-bold">{content.heading}</h2>
              </div>
            )}
            {content.subheading && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Podnadpis:</p>
                <p className="text-lg text-muted-foreground">{content.subheading}</p>
              </div>
            )}
            {content.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Popis:</p>
                <p className="text-sm">{content.description}</p>
              </div>
            )}
            {content.buttonText && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tlačítko:</p>
                <Button variant="outline">{content.buttonText}</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Nápověda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Tipy pro editaci:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Nadpisy by měly být stručné a výstižné (max 60 znaků)</li>
              <li>Podnadpisy doplňují hlavní nadpis (max 120 znaků)</li>
              <li>Používejte jasný a srozumitelný jazyk</li>
              <li>Pravidelně ukládejte změny pomocí tlačítka "Uložit změny"</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
