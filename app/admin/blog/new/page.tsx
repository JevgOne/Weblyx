"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, storage, ref, uploadBytes, getDownloadURL } from "@/lib/firebase";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import imageCompression from "browser-image-compression";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    author: "Admin",
    published: false,
    featured: false,
    category: "",
    tags: [] as string[],
    imageUrl: "",
    publishedAt: new Date().toISOString().slice(0, 16), // Default to current date/time
  });

  // Update author when user loads
  useEffect(() => {
    if (user?.email) {
      const email = user.email;
      setFormData((prev) => ({ ...prev, author: email.split("@")[0] }));
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Prosím vyberte obrázek");
      return;
    }

    setUploading(true);

    try {
      let fileToUpload = file;
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      } catch (compressionError) {
        console.warn("Image compression failed, using original:", compressionError);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(fileToUpload);

      const timestamp = Date.now();
      const fileName = `blog/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(storageRef);

      setFormData((prev) => ({ ...prev, imageUrl: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Chyba při nahrávání obrázku: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const generateMeta = async () => {
    if (!formData.title || !formData.content) {
      alert("Vyplňte název a obsah článku před generováním meta tagů");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/blog/generate-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          metaTitle: result.data.metaTitle,
          metaDescription: result.data.metaDescription,
        }));
        alert("✅ Meta tagy vygenerovány pomocí AI!");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error generating meta:", error);
      alert("Chyba při generování: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Prosím vyplňte název článku");
      return;
    }

    if (!formData.content.trim()) {
      alert("Prosím napište obsah článku");
      return;
    }

    setSaving(true);

    try {
      // Convert publishedAt string to Date object
      const blogData = {
        ...formData,
        publishedAt: new Date(formData.publishedAt),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (typeof db.collection === 'function') {
        // Mock Firebase
        await db.collection("blog").add(blogData);
      } else {
        // Real Firebase
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, "blog"), blogData);
      }

      router.push("/admin/blog");
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert("Chyba při vytváření článku");
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/blog")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nový článek</h1>
              <p className="text-sm text-muted-foreground">
                Vytvoření nového blog příspěvku
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informace o článku</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Hlavní obrázek</Label>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="w-full max-w-md relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, imageUrl: "" }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full max-w-md h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-12 w-12" />
                      <p className="text-sm">Nahrajte hlavní obrázek článku</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Nahrávám...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview ? "Změnit obrázek" : "Nahrát obrázek"}
                      </>
                    )}
                  </Button>

                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Název článku *</Label>
                <Input
                  id="title"
                  placeholder="např. 10 tipů pro rychlejší web"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              {/* Slug (auto-generated) */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL slug (vygenerováno automaticky)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="url-clanek"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /blog/{formData.slug || "url-clanek"}
                </p>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Krátký popis (excerpt)</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Stručný popis článku pro náhled..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* SEO Meta Tags Section */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">SEO Meta Tagy</h3>
                    <p className="text-sm text-muted-foreground">
                      Optimalizované pro vyhledávače
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateMeta}
                    disabled={generating || !formData.title || !formData.content}
                    className="gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generování...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✨</span>
                        Generovat AI
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Meta Title */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <span className="text-xs text-muted-foreground">
                        {formData.metaTitle.length}/60
                      </span>
                    </div>
                    <Input
                      id="metaTitle"
                      placeholder="SEO optimalizovaný titul (max 60 znaků)"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
                      }
                      maxLength={70}
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <span className="text-xs text-muted-foreground">
                        {formData.metaDescription.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="metaDescription"
                      placeholder="SEO popis pro vyhledávače (max 160 znaků)"
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      rows={3}
                      maxLength={165}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Obsah článku *</Label>
                <Textarea
                  id="content"
                  placeholder="Napište obsah článku (podporuje Markdown)..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={15}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Můžete používat Markdown formátování
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Input
                  id="category"
                  placeholder="např. Web Design, SEO, Průvodce"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tagy</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="např. wordpress, next.js, seo"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author: e.target.value }))
                  }
                />
              </div>

              {/* Published Date */}
              <div className="space-y-2">
                <Label htmlFor="publishedAt">Datum publikace</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Datum a čas kdy byl/bude článek publikován
                </p>
              </div>

              {/* Published */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, published: checked as boolean }))
                  }
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publikovat článek (zobrazit na webu)
                </Label>
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked as boolean }))
                  }
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Označit jako featured (zvýrazněný článek)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/blog")}
              disabled={saving}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                "Vytvořit článek"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
