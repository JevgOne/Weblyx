"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Sparkles, RefreshCw, Save, Eye, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  keywords: string[];
}

export default function GenerateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);

  // Form state
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [articleType, setArticleType] = useState<string>("tutorial");
  const [targetAudience, setTargetAudience] = useState("");
  const [length, setLength] = useState<string>("medium");
  const [language, setLanguage] = useState<string>("cs");
  const [tone, setTone] = useState<string>("professional");

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Vyplňte téma článku");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords,
          articleType,
          targetAudience: targetAudience.trim() || undefined,
          length,
          language,
          tone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedArticle(result.article);
        console.log('✅ Article generated', result.usage);
      } else {
        alert(result.error || 'Chyba při generování článku');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba při generování článku');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!generatedArticle) return;

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedArticle.title,
          slug: generatedArticle.slug,
          excerpt: generatedArticle.excerpt,
          content: generatedArticle.content,
          metaDescription: generatedArticle.metaDescription,
          tags: generatedArticle.keywords,
          published: false,
          author: 'AI Generator',
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Článek uložen jako koncept');
        router.push(`/admin/blog`);
      } else {
        alert('Chyba při ukládání');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba při ukládání');
    }
  };

  const handlePublish = async () => {
    if (!generatedArticle) return;

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedArticle.title,
          slug: generatedArticle.slug,
          excerpt: generatedArticle.excerpt,
          content: generatedArticle.content,
          metaDescription: generatedArticle.metaDescription,
          tags: generatedArticle.keywords,
          published: true,
          publishedAt: new Date().toISOString(),
          author: 'AI Generator',
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Článek publikován');
        router.push(`/admin/blog`);
      } else {
        alert('Chyba při publikování');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba při publikování');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Parametry článku</CardTitle>
              <CardDescription>
                Vyplňte informace pro generování článku pomocí AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Téma článku *</Label>
                <Input
                  id="topic"
                  placeholder="např. Jak vytvořit responzivní web v roce 2025"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label htmlFor="keywords">Klíčová slova (SEO)</Label>
                <div className="flex gap-2">
                  <Input
                    id="keywords"
                    placeholder="Přidat klíčové slovo"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddKeyword}>
                    +
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Article Type */}
              <div className="space-y-2">
                <Label htmlFor="articleType">Typ článku *</Label>
                <Select value={articleType} onValueChange={setArticleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutorial">📚 Návod/Tutorial</SelectItem>
                    <SelectItem value="guide">🗺️ Průvodce</SelectItem>
                    <SelectItem value="review">⭐ Recenze</SelectItem>
                    <SelectItem value="case-study">💼 Case Study</SelectItem>
                    <SelectItem value="listicle">📋 Seznam/List</SelectItem>
                    <SelectItem value="news">📰 Novinky</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Cílová skupina</Label>
                <Input
                  id="targetAudience"
                  placeholder="např. Začínající webdesignéři"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              {/* Length */}
              <div className="space-y-2">
                <Label htmlFor="length">Délka článku *</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Krátký (500-800 slov)</SelectItem>
                    <SelectItem value="medium">Střední (1000-1500 slov)</SelectItem>
                    <SelectItem value="long">Dlouhý (2000-3000 slov)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Jazyk *</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs">🇨🇿 Čeština</SelectItem>
                    <SelectItem value="de">🇩🇪 Němčina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label htmlFor="tone">Tón článku</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesionální</SelectItem>
                    <SelectItem value="casual">Neformální</SelectItem>
                    <SelectItem value="technical">Technický</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generuji článek...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Vygenerovat článek
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Náhled</CardTitle>
              <CardDescription>
                {generatedArticle ? 'Vygenerovaný článek - můžete upravit a publikovat' : 'Zde se zobrazí vygenerovaný článek'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedArticle ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Vyplňte formulář a klikněte na "Vygenerovat článek"</p>
                </div>
              ) : (
                <Tabs defaultValue="preview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="preview">Náhled</TabsTrigger>
                    <TabsTrigger value="edit">Upravit</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="prose prose-sm max-w-none"><p className="text-muted-foreground italic">{generatedArticle.excerpt}</p>
                      <ReactMarkdown>{generatedArticle.content}</ReactMarkdown>
                    </div>
                  </TabsContent>

                  <TabsContent value="edit" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Nadpis</Label>
                        <Input
                          value={generatedArticle.title}
                          onChange={(e) => setGeneratedArticle({...generatedArticle, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>URL slug</Label>
                        <Input
                          value={generatedArticle.slug}
                          onChange={(e) => setGeneratedArticle({...generatedArticle, slug: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Perex</Label>
                        <Textarea
                          value={generatedArticle.excerpt}
                          onChange={(e) => setGeneratedArticle({...generatedArticle, excerpt: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Obsah (Markdown)</Label>
                        <Textarea
                          value={generatedArticle.content}
                          onChange={(e) => setGeneratedArticle({...generatedArticle, content: e.target.value})}
                          rows={15}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Meta Description</Label>
                        <Textarea
                          value={generatedArticle.metaDescription}
                          onChange={(e) => setGeneratedArticle({...generatedArticle, metaDescription: e.target.value})}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {generatedArticle.metaDescription.length}/160 znaků
                        </p>
                      </div>
                      <div>
                        <Label>Klíčová slova</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {generatedArticle.keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {generatedArticle && (
                <div className="flex gap-2 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerovat
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveAsDraft}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Uložit koncept
                  </Button>
                  <Button
                    onClick={handlePublish}
                    className="ml-auto"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Publikovat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
