"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getHomepageSections, updateHeroSection } from "@/lib/firestore-cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { HeroSection } from "@/types/cms";

export default function HeroEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    const unsubscribe = auth.onAuthStateChanged(async (currentUser: any) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        await loadHeroData();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadHeroData = async () => {
    try {
      const data = await getHomepageSections();
      if (data?.hero) {
        setFormData(data.hero);
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

  const handleSave = async () => {
    // Validation
    if (!formData.headline.trim()) {
      showNotification("error", "Hlavní nadpis je povinný");
      return;
    }
    if (!formData.subheadline.trim()) {
      showNotification("error", "Podnadpis je povinný");
      return;
    }
    if (!formData.ctaText.trim()) {
      showNotification("error", "Text CTA tlačítka je povinný");
      return;
    }
    if (!formData.ctaLink.trim()) {
      showNotification("error", "Odkaz CTA tlačítka je povinný");
      return;
    }

    setSaving(true);
    try {
      await updateHeroSection(formData);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

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
            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline">
                Hlavní nadpis <span className="text-destructive">*</span>
              </Label>
              <Input
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                placeholder="Např. Tvoříme moderní webové stránky"
                required
              />
              <p className="text-xs text-muted-foreground">
                Hlavní nadpis zobrazený ve velké velikosti
              </p>
            </div>

            {/* Subheadline */}
            <div className="space-y-2">
              <Label htmlFor="subheadline">
                Podnadpis <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="subheadline"
                name="subheadline"
                value={formData.subheadline}
                onChange={handleInputChange}
                placeholder="Např. Profesionální webdesign a vývoj pro váš byznys"
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Krátký popis pod hlavním nadpisem
              </p>
            </div>

            {/* CTA Text */}
            <div className="space-y-2">
              <Label htmlFor="ctaText">
                Text CTA tlačítka <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ctaText"
                name="ctaText"
                value={formData.ctaText}
                onChange={handleInputChange}
                placeholder="Např. Začít projekt"
                required
              />
              <p className="text-xs text-muted-foreground">
                Text zobrazený na hlavním tlačítku
              </p>
            </div>

            {/* CTA Link */}
            <div className="space-y-2">
              <Label htmlFor="ctaLink">
                Odkaz CTA tlačítka <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ctaLink"
                name="ctaLink"
                value={formData.ctaLink}
                onChange={handleInputChange}
                placeholder="Např. /kontakt nebo #kontakt-form"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL nebo kotvový odkaz pro CTA tlačítko
              </p>
            </div>

            {/* Background Image */}
            <div className="space-y-2">
              <Label htmlFor="backgroundImage">URL pozadí (volitelné)</Label>
              <Input
                id="backgroundImage"
                name="backgroundImage"
                value={formData.backgroundImage}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Nechte prázdné pro použití výchozího gradientu
              </p>
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
