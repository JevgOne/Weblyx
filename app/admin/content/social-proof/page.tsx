"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Plus, Trash2, RotateCcw } from "lucide-react";
import type { SocialProofData, LocalizedSectionData, SocialProofStat } from "@/types/cms";

const emptyStats: SocialProofStat[] = [
  { value: "", label: "", description: "" },
  { value: "", label: "", description: "" },
  { value: "", label: "", description: "" },
  { value: "", label: "", description: "" },
];

const emptyData: SocialProofData = {
  title: "",
  titleHighlight: "",
  subtitle: "",
  stats: [...emptyStats],
};

export default function SocialProofEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeLocale, setActiveLocale] = useState<"cs" | "de">("cs");
  const [formData, setFormData] = useState<LocalizedSectionData<SocialProofData>>({
    cs: { ...emptyData, stats: emptyStats.map(s => ({ ...s })) },
    de: { ...emptyData, stats: emptyStats.map(s => ({ ...s })) },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/cms/social-proof");
      const result = await res.json();
      if (result.success && result.data) {
        setFormData(result.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showNotification("error", "Chyba při načítání dat");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/social-proof", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      showNotification("success", "Social Proof sekce byla uložena!");
    } catch (error) {
      showNotification("error", "Chyba při ukládání.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Opravdu chcete resetovat? Data se smažou a použijí se výchozí překlady.")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/social-proof", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(null),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFormData({
        cs: { ...emptyData, stats: emptyStats.map(s => ({ ...s })) },
        de: { ...emptyData, stats: emptyStats.map(s => ({ ...s })) },
      });
      showNotification("success", "Resetováno na výchozí hodnoty.");
    } catch (error) {
      showNotification("error", "Chyba při resetování.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (locale: "cs" | "de", field: keyof SocialProofData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  };

  const updateStat = (locale: "cs" | "de", index: number, field: keyof SocialProofStat, value: string) => {
    setFormData(prev => {
      const stats = [...prev[locale].stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, [locale]: { ...prev[locale], stats } };
    });
  };

  const addStat = (locale: "cs" | "de") => {
    setFormData(prev => ({
      ...prev,
      [locale]: { ...prev[locale], stats: [...prev[locale].stats, { value: "", label: "", description: "" }] },
    }));
  };

  const removeStat = (locale: "cs" | "de", index: number) => {
    setFormData(prev => ({
      ...prev,
      [locale]: { ...prev[locale], stats: prev[locale].stats.filter((_, i) => i !== index) },
    }));
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const current = formData[activeLocale];

  return (
    <div>
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/content")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Zpět
            </Button>
            <div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? "Ukládání..." : "Uložit"}
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {notification && (
          <Alert variant={notification.type === "error" ? "destructive" : "default"} className="mb-6">
            {notification.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{notification.type === "success" ? "Úspěch" : "Chyba"}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as "cs" | "de")}>
          <TabsList className="mb-6">
            <TabsTrigger value="cs">🇨🇿 Čeština</TabsTrigger>
            <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
          </TabsList>

          {(["cs", "de"] as const).map((locale) => (
            <TabsContent key={locale} value={locale}>
              <Card>
                <CardHeader>
                  <CardTitle>Nadpisy sekce ({locale.toUpperCase()})</CardTitle>
                  <CardDescription>Hlavní nadpis a podnadpis sekce statistik</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Nadpis</Label>
                        <Input value={formData[locale].title} onChange={(e) => updateField(locale, "title", e.target.value)} placeholder="Více než" />
                      </div>
                      <div className="space-y-2">
                        <Label>Zvýrazněná část nadpisu</Label>
                        <Input value={formData[locale].titleHighlight} onChange={(e) => updateField(locale, "titleHighlight", e.target.value)} placeholder="15 úspěšných projektů" />
                      </div>
                      <div className="space-y-2">
                        <Label>Podnadpis</Label>
                        <Input value={formData[locale].subtitle} onChange={(e) => updateField(locale, "subtitle", e.target.value)} placeholder="Od února 2024..." />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Statistiky ({locale.toUpperCase()})</CardTitle>
                  <CardDescription>Karty se statistikami</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!loading && formData[locale].stats.map((stat, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Statistika {i + 1}</span>
                        {formData[locale].stats.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeStat(locale, i)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Hodnota</Label>
                          <Input value={stat.value} onChange={(e) => updateStat(locale, i, "value", e.target.value)} placeholder="50+" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Popis</Label>
                          <Input value={stat.label} onChange={(e) => updateStat(locale, i, "label", e.target.value)} placeholder="Spokojených klientů" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Podpopis</Label>
                          <Input value={stat.description} onChange={(e) => updateStat(locale, i, "description", e.target.value)} placeholder="Detailní popis" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loading && (
                    <Button variant="outline" onClick={() => addStat(locale)} className="gap-2 w-full">
                      <Plus className="h-4 w-4" /> Přidat statistiku
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/content")}>Zrušit</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Ukládání..." : "Uložit změny"}
          </Button>
        </div>
      </main>
    </div>
  );
}
