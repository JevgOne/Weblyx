"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { CTASection } from "@/types/cms";

export default function CTAEditorPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<CTASection>({
    heading: "",
    subheading: "",
    primaryButtonText: "",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    benefits: [
      { icon: "", title: "", description: "" },
      { icon: "", title: "", description: "" },
      { icon: "", title: "", description: "" },
    ],
    enabled: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
      setLoading(false);
    };

    fetchData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/cms/cta');
      const result = await response.json();

      if (result.success && result.data) {
        setFormData(result.data);
      }
    } catch (error) {
      console.error("Error loading CTA data:", error);
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

  const handleBenefitChange = (index: number, field: string, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      benefits: newBenefits,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }));
  };

  const handleSave = async () => {
    if (!formData.heading.trim()) {
      showNotification("error", "Nadpis je povinný");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/cms/cta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      showNotification("success", "CTA sekce byla úspěšně uložena!");
      await loadData();
    } catch (error) {
      console.error("Error saving CTA:", error);
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
              <h1 className="text-xl font-bold">Editor CTA sekce</h1>
              <p className="text-sm text-muted-foreground">Call-to-Action banner</p>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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

        {showPreview && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>Náhled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">{formData.heading || "Nadpis"}</h2>
                <p className="text-lg mb-8">{formData.subheading || "Podnadpis"}</p>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {formData.benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-4">
                      <div className="font-semibold">{benefit.title || `Benefit ${idx + 1}`}</div>
                      <div className="text-sm text-white/80">{benefit.description}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-white text-primary">{formData.primaryButtonText || "Primary"}</Button>
                  <Button variant="outline" className="border-white text-white">{formData.secondaryButtonText || "Secondary"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upravit CTA sekci</CardTitle>
            <CardDescription>
              Call-to-Action sekce na konci homepage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="heading">
                Hlavní nadpis <span className="text-destructive">*</span>
              </Label>
              <Input
                id="heading"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                placeholder="Připraveni na nový web?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheading">Podnadpis</Label>
              <Textarea
                id="subheading"
                name="subheading"
                value={formData.subheading}
                onChange={handleInputChange}
                placeholder="Stačí vyplnit formulář..."
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryButtonText">Text hlavního tlačítka</Label>
                <Input
                  id="primaryButtonText"
                  name="primaryButtonText"
                  value={formData.primaryButtonText}
                  onChange={handleInputChange}
                  placeholder="Začít projekt"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryButtonLink">Odkaz hlavního tlačítka</Label>
                <Input
                  id="primaryButtonLink"
                  name="primaryButtonLink"
                  value={formData.primaryButtonLink}
                  onChange={handleInputChange}
                  placeholder="/poptavka"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryButtonText">Text vedlejšího tlačítka</Label>
                <Input
                  id="secondaryButtonText"
                  name="secondaryButtonText"
                  value={formData.secondaryButtonText}
                  onChange={handleInputChange}
                  placeholder="Kontaktovat nás"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryButtonLink">Odkaz vedlejšího tlačítka</Label>
                <Input
                  id="secondaryButtonLink"
                  name="secondaryButtonLink"
                  value={formData.secondaryButtonLink}
                  onChange={handleInputChange}
                  placeholder="/kontakt"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Výhody (Benefits)</Label>
              {formData.benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <h4 className="font-semibold">Benefit {index + 1}</h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Ikona (Lucide název)</Label>
                        <Input
                          value={benefit.icon}
                          onChange={(e) => handleBenefitChange(index, "icon", e.target.value)}
                          placeholder="Clock, DollarSign, Shield..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Titulek</Label>
                        <Input
                          value={benefit.title}
                          onChange={(e) => handleBenefitChange(index, "title", e.target.value)}
                          placeholder="24h Odpověď"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Popis</Label>
                        <Input
                          value={benefit.description}
                          onChange={(e) => handleBenefitChange(index, "description", e.target.value)}
                          placeholder="na poptávku"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enabled" className="font-normal cursor-pointer">
                Zobrazit CTA sekci na webu
              </Label>
            </div>
          </CardContent>
        </Card>

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
