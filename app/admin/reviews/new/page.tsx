"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Star,
  Loader2,
  User,
  Link as LinkIcon,
} from "lucide-react";
import { ReviewFormData } from "@/types/review";

export default function NewReviewPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    authorName: "",
    authorImage: "",
    authorRole: "",
    rating: 5,
    text: "",
    date: new Date(),
    source: "manual",
    sourceUrl: "",
    published: false,
    featured: false,
    locale: "cs",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.authorName.trim()) {
      alert("Prosím vyplňte jméno autora");
      return;
    }

    if (!formData.text.trim()) {
      alert("Prosím vyplňte text recenze");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create review");
      }

      router.push("/admin/reviews");
    } catch (error: any) {
      console.error("Error creating review:", error);
      alert(`Chyba při vytváření recenze: ${error.message || error}`);
      setSaving(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= formData.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/reviews")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nová recenze</h1>
              <p className="text-sm text-muted-foreground">
                Přidání nové zákaznické recenze
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informace o recenzi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Author Name */}
              <div className="space-y-2">
                <Label htmlFor="authorName">
                  <User className="inline h-4 w-4 mr-1" />
                  Jméno autora *
                </Label>
                <Input
                  id="authorName"
                  placeholder="např. Jan Novák"
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, authorName: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Author Role */}
              <div className="space-y-2">
                <Label htmlFor="authorRole">Pozice/Firma (volitelné)</Label>
                <Input
                  id="authorRole"
                  placeholder="např. CEO, Firma XYZ"
                  value={formData.authorRole || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, authorRole: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Zobrazí se pod jménem autora
                </p>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Hodnocení *</Label>
                {renderStars()}
                <p className="text-xs text-muted-foreground">
                  Klikněte na hvězdičky pro nastavení hodnocení (1-5)
                </p>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <Label htmlFor="text">Text recenze *</Label>
                <Textarea
                  id="text"
                  placeholder="Napište text recenze..."
                  value={formData.text}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, text: e.target.value }))
                  }
                  rows={6}
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Datum recenze</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date.toISOString().split('T')[0]}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: new Date(e.target.value) }))
                  }
                />
              </div>

              {/* Source URL (optional) */}
              <div className="space-y-2">
                <Label htmlFor="sourceUrl">
                  <LinkIcon className="inline h-4 w-4 mr-1" />
                  URL zdroje (volitelné)
                </Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  placeholder="https://google.com/maps/..."
                  value={formData.sourceUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sourceUrl: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Odkaz na originální recenzi (např. z Google Maps)
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
                  Publikovat recenzi (zobrazit na webu)
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
                  Označit jako featured (zvýrazněná recenze)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/reviews")}
              disabled={saving}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                "Vytvořit recenzi"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
