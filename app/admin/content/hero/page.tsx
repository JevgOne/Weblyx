"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import imageCompression from "browser-image-compression";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Eye, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { HeroSection } from "@/types/cms";

export default function HeroEditorPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<HeroSection>({
    headline: "",
    subheadline: "",
    ctaText: "",
    ctaLink: "",
    backgroundImage: "",
    enabled: true,
  });

  useEffect(() => {
    const loadData = async () => {
      await loadHeroData();
      setLoading(false);
    };

    loadData();
  }, []);

  const loadHeroData = async () => {
    try {
      const response = await fetch('/api/cms/hero');
      const result = await response.json();

      if (result.success && result.data) {
        setFormData(result.data);
        if (result.data.backgroundImage) {
          setImagePreview(result.data.backgroundImage);
        }
      }
    } catch (error) {
      console.error("Error loading hero data:", error);
      showNotification("error", "Chyba při načítání dat");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("error", "Prosím vyberte obrázek");
      return;
    }

    setUploading(true);

    try {
      // Try to compress image
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(fileToUpload);

      // Upload via API
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileToUpload, file.name);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setFormData((prev) => ({ ...prev, backgroundImage: uploadResult.url }));
      showNotification("success", "Obrázek byl úspěšně nahrán!");
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification("error", "Chyba při nahrávání obrázku: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/cms/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      showNotification("success", "Hero sekce byla úspěšně uložena!");
      await loadHeroData(); // Reload to get updated timestamp
    } catch (error) {
      console.error("Error saving hero section:", error);
      showNotification("error", "Chyba při ukládání. Zkuste to prosím znovu.");
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/content")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </Button>
            <div>
              <h1 className="text-xl font-bold">Editor Hero sekce</h1>
              <p className="text-sm text-muted-foreground">Úvodní banner</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Skrýt" : "Náhled"}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Ukládání..." : "Uložit změny"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Notification */}
        {notification && (
          <Alert
            variant={notification.type === "error" ? "destructive" : "default"}
            className="mb-6"
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {notification.type === "success" ? "Úspěch" : "Chyba"}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {showPreview && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>Náhled</CardTitle>
              <CardDescription>
                Ukázka, jak bude vypadat Hero sekce na webu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg p-12 text-center"
                style={{
                  backgroundImage: formData.backgroundImage
                    ? `url(${formData.backgroundImage})`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    {formData.headline || "Hlavní nadpis"}
                  </h1>
                  <p className="text-xl text-white/90 mb-6">
                    {formData.subheadline || "Podnadpis"}
                  </p>
                  <Button className="bg-white text-primary hover:bg-white/90">
                    {formData.ctaText || "CTA tlačítko"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upravit Hero sekci</CardTitle>
            <CardDescription>
              Upravte obsah úvodní sekce vaší domovské stránky
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              // Skeleton loading for form
              <>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </>
            ) : (
              <>
                {/* Headline */}
                <div className="space-y-2">
                  <Label htmlFor="headline">
                    Hlavní nadpis
                  </Label>
                  <Input
                    id="headline"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    placeholder="Např. Tvoříme moderní webové stránky"
                  />
                  <p className="text-xs text-muted-foreground">
                    Hlavní nadpis zobrazený ve velké velikosti
                  </p>
                </div>

                {/* Subheadline */}
                <div className="space-y-2">
                  <Label htmlFor="subheadline">
                    Podnadpis
                  </Label>
                  <Textarea
                    id="subheadline"
                    name="subheadline"
                    value={formData.subheadline}
                    onChange={handleInputChange}
                    placeholder="Např. Profesionální webdesign a vývoj pro váš byznys"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Krátký popis pod hlavním nadpisem
                  </p>
                </div>

                {/* CTA Text */}
                <div className="space-y-2">
                  <Label htmlFor="ctaText">
                    Text CTA tlačítka
                  </Label>
                  <Input
                    id="ctaText"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={handleInputChange}
                    placeholder="Např. Začít projekt"
                  />
                  <p className="text-xs text-muted-foreground">
                    Text zobrazený na hlavním tlačítku
                  </p>
                </div>

                {/* CTA Link */}
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">
                    Odkaz CTA tlačítka
                  </Label>
                  <Input
                    id="ctaLink"
                    name="ctaLink"
                    value={formData.ctaLink}
                    onChange={handleInputChange}
                    placeholder="Např. /kontakt nebo #kontakt-form"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL nebo kotvový odkaz pro CTA tlačítko
                  </p>
                </div>

                {/* Background Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Hero obrázek (volitelné)</Label>
                  <div className="flex items-center gap-4">
                    {imagePreview || formData.backgroundImage ? (
                      <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={imagePreview || formData.backgroundImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            setImagePreview("");
                            setFormData((prev) => ({ ...prev, backgroundImage: "" }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-48 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Input
                        id="backgroundImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Nahrávání...
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Doporučená velikost: 1920x1080px. Nechte prázdné pro gradient.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enabled Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="enabled" className="font-normal cursor-pointer">
                    Zobrazit Hero sekci na webu
                  </Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Save Button - Bottom */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/content")}
          >
            Zrušit
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Ukládání..." : "Uložit změny"}
          </Button>
        </div>
      </main>
    </div>
  );
}
