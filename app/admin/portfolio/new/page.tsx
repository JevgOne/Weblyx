"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage, ref, uploadBytes, getDownloadURL } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
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
import { PortfolioFormData } from "@/types/portfolio";

export default function NewPortfolioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [techInput, setTechInput] = useState("");
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    category: "",
    description: "",
    technologies: [],
    imageUrl: "",
    published: false,
    featured: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Prosím vyberte obrázek");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Soubor je příliš velký. Maximum je 10MB.");
      return;
    }

    setUploading(true);
    console.log("🔵 Starting upload for:", file.name, "Size:", (file.size / 1024).toFixed(2), "KB");

    try {
      // Try to compress image, fallback to original if compression fails
      let fileToUpload = file;
      try {
        console.log("🔵 Compressing image...");
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
        console.log("✅ Compressed to:", (fileToUpload.size / 1024).toFixed(2), "KB");
      } catch (compressionError) {
        console.warn("⚠️ Image compression failed, using original:", compressionError);
      }

      // Create preview
      console.log("🔵 Creating preview...");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        console.log("✅ Preview created");
      };
      reader.readAsDataURL(fileToUpload);

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `portfolio/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      console.log("🔵 Uploading to Firebase Storage:", fileName);

      // Add timeout to detect stuck uploads
      const uploadPromise = uploadBytes(storageRef, fileToUpload);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout - Storage Rules možná nejsou nasazené")), 30000)
      );

      await Promise.race([uploadPromise, timeoutPromise]);
      console.log("✅ Upload complete");

      console.log("🔵 Getting download URL...");
      const downloadURL = await getDownloadURL(storageRef);
      console.log("✅ Download URL:", downloadURL);

      setFormData((prev) => ({ ...prev, imageUrl: downloadURL }));
      alert("✅ Obrázek byl úspěšně nahrán!");
    } catch (error: any) {
      console.error("❌ Error uploading image:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      let errorMessage = "Chyba při nahrávání obrázku: " + error.message;

      if (error.code === 'storage/unauthorized') {
        errorMessage = "❌ Chyba: Storage Rules nejsou nasazené nebo nemáte oprávnění.\n\nNasaďte storage.rules v Firebase Console:\nStorage → Rules → Zkopírujte obsah z /storage.rules";
      } else if (error.message.includes("timeout")) {
        errorMessage = "❌ Upload se zasekl (timeout).\n\nPravděpodobná příčina: Storage Rules nejsou nasazené v Firebase Console.";
      }

      alert(errorMessage);
      setImagePreview("");
    } finally {
      setUploading(false);
    }
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
      // Get the highest order number to add new project at the end
      const q = query(collection(db, "portfolio"), orderBy("order", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      let maxOrder = 0;

      if (!querySnapshot.empty) {
        maxOrder = querySnapshot.docs[0].data().order || 0;
      }

      await addDoc(collection(db, "portfolio"), {
        ...formData,
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      router.push("/admin/portfolio");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Chyba při vytváření projektu");
      setSaving(false);
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/portfolio")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nový projekt</h1>
              <p className="text-sm text-muted-foreground">
                Přidání nového projektu do portfolia
              </p>
            </div>
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
                "Vytvořit projekt"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
