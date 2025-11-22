"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import imageCompression from "browser-image-compression";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader2,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  FolderOpen,
} from "lucide-react";
import { PortfolioFormData } from "@/types/portfolio";

export default function EditPortfolioPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [techInput, setTechInput] = useState("");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    category: "",
    description: "",
    technologies: [],
    imageUrl: "",
    projectUrl: "",
    published: false,
    featured: false,
  });

  useEffect(() => {
    if (user) {
      loadProject();
    }
  }, [user, projectId]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/portfolio?id=${projectId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        const projectData: PortfolioFormData = {
          title: data.title || "",
          category: data.category || "",
          description: data.description || "",
          technologies: data.technologies || [],
          imageUrl: data.imageUrl || "",
          projectUrl: data.projectUrl || "",
          published: data.published || false,
          featured: data.featured || false,
        };

        setFormData(projectData);
        if (projectData.imageUrl) {
          setImagePreview(projectData.imageUrl);
        }
      } else {
        alert("Projekt nenalezen");
        router.push("/admin/portfolio");
      }
    } catch (error) {
      console.error("Error loading project:", error);
      alert("Chyba při načítání projektu");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Prosím vyberte obrázek");
      return;
    }

    setUploading(true);

    try {
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Upload to Vercel Blob via API
      const formData = new FormData();
      formData.append("file", compressedFile, file.name);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      setFormData((prev) => ({ ...prev, imageUrl: result.url }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Chyba při nahrávání obrázku");
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    setImagePreview(url);
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert("Prosím vyplňte název projektu");
      return;
    }

    if (!formData.category.trim()) {
      alert("Prosím vyplňte kategorii");
      return;
    }

    if (!formData.description.trim()) {
      alert("Prosím vyplňte popis");
      return;
    }

    if (!formData.imageUrl) {
      alert("Prosím nahrajte obrázek");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update project');
      }

      router.push("/admin/portfolio");
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Chyba při ukládání projektu");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Opravdu chcete smazat tento projekt? Tato akce je nevratná.")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/portfolio?id=${projectId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete project');
      }

      router.push("/admin/portfolio");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Chyba při mazání projektu");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/portfolio")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Upravit projekt</h1>
                <p className="text-sm text-muted-foreground">
                  {formData.title || "Načítání..."}
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mažu...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Smazat projekt
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informace o projektu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Obrázek projektu *</Label>
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
                      <p className="text-sm">Nahrajte obrázek projektu</p>
                    </div>
                  )}

                  <div className="flex gap-2">
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
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={uploading}
                      onClick={() => setMediaPickerOpen(true)}
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Vybrat z knihovny
                    </Button>
                  </div>

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
                <Label htmlFor="title">Název projektu *</Label>
                <Input
                  id="title"
                  placeholder="např. E-shop pro outdoor vybavení"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Input
                  id="category"
                  placeholder="např. E-commerce, Web, Landing page"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Popis *</Label>
                <Textarea
                  id="description"
                  placeholder="Popište projekt, jeho cíle a hlavní funkce..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={5}
                  required
                />
              </div>

              {/* Project URL */}
              <div className="space-y-2">
                <Label htmlFor="projectUrl">
                  <LinkIcon className="inline h-4 w-4 mr-1" />
                  URL projektu (živá stránka)
                </Label>
                <Input
                  id="projectUrl"
                  type="text"
                  placeholder="www.priklad-webu.cz"
                  value={formData.projectUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Zadejte URL projektu (např. www.weblyx.cz nebo weblyx.cz). Zobrazí se jako odkaz "Navštívit web".
                </p>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <Label htmlFor="technologies">Použité technologie</Label>
                <div className="flex gap-2">
                  <Input
                    id="technologies"
                    placeholder="např. React, Next.js, Firebase"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTechnology();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTechnology} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
                  Publikovat projekt (zobrazit na webu)
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
                  Označit jako featured (zvýrazněný projekt)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/portfolio")}
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
                "Uložit změny"
              )}
            </Button>
          </div>
        </form>
      </main>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
