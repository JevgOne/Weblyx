"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Plus, Trash2, RotateCcw } from "lucide-react";
import type { BeforeAfterData, LocalizedSectionData, BeforeAfterMetric } from "@/types/cms";

const defaultMetrics: BeforeAfterMetric[] = [
  { label: "", beforeValue: "", afterValue: "" },
  { label: "", beforeValue: "", afterValue: "" },
  { label: "", beforeValue: "", afterValue: "" },
  { label: "", beforeValue: "", afterValue: "" },
  { label: "", beforeValue: "", afterValue: "" },
];

const emptyData: BeforeAfterData = {
  title: "", titleVs: "vs", titleHighlight: "", subtitle: "",
  badgeBefore: "", badgeAfter: "",
  beforeTitle: "", beforeSubtitle: "", afterTitle: "", afterSubtitle: "",
  metrics: defaultMetrics.map(m => ({ ...m })),
  ctaTitle: "", ctaHighlight: "", ctaStat: "", ctaSubtitle: "", ctaText: "", ctaLink: "",
};

export default function BeforeAfterEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeLocale, setActiveLocale] = useState<"cs" | "de">("cs");
  const [formData, setFormData] = useState<LocalizedSectionData<BeforeAfterData>>({
    cs: { ...emptyData, metrics: defaultMetrics.map(m => ({ ...m })) },
    de: { ...emptyData, metrics: defaultMetrics.map(m => ({ ...m })) },
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/cms/before-after");
      const result = await res.json();
      if (result.success && result.data) setFormData(result.data);
    } catch { showNotification("error", "Chyba při načítání dat"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/before-after", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      showNotification("success", "Before/After sekce uložena!");
    } catch { showNotification("error", "Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm("Opravdu chcete resetovat na výchozí hodnoty?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/before-after", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFormData({ cs: { ...emptyData, metrics: defaultMetrics.map(m => ({ ...m })) }, de: { ...emptyData, metrics: defaultMetrics.map(m => ({ ...m })) } });
      showNotification("success", "Resetováno.");
    } catch { showNotification("error", "Chyba při resetování."); }
    finally { setSaving(false); }
  };

  const updateField = (locale: "cs" | "de", field: keyof BeforeAfterData, value: any) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  };

  const updateMetric = (locale: "cs" | "de", index: number, field: keyof BeforeAfterMetric, value: string) => {
    setFormData(prev => {
      const metrics = [...prev[locale].metrics];
      metrics[index] = { ...metrics[index], [field]: value };
      return { ...prev, [locale]: { ...prev[locale], metrics } };
    });
  };

  const addMetric = (locale: "cs" | "de") => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], metrics: [...prev[locale].metrics, { label: "", beforeValue: "", afterValue: "" }] } }));
  };

  const removeMetric = (locale: "cs" | "de", index: number) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], metrics: prev[locale].metrics.filter((_, i) => i !== index) } }));
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/content")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Zpět
            </Button>
            <div>
              <h1 className="text-xl font-bold">Before / After</h1>
              <p className="text-sm text-muted-foreground">Porovnání pomalý vs rychlý web</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? "Ukládání..." : "Uložit"}</Button>
          </div>
        </div>
      </header>

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
                <CardHeader><CardTitle>Nadpisy ({locale.toUpperCase()})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {loading ? <><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></> : (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Nadpis (před)</Label><Input value={formData[locale].title} onChange={(e) => updateField(locale, "title", e.target.value)} placeholder="Pomalý web" /></div>
                        <div className="space-y-1"><Label className="text-xs">VS text</Label><Input value={formData[locale].titleVs} onChange={(e) => updateField(locale, "titleVs", e.target.value)} placeholder="vs" /></div>
                        <div className="space-y-1"><Label className="text-xs">Nadpis (po)</Label><Input value={formData[locale].titleHighlight} onChange={(e) => updateField(locale, "titleHighlight", e.target.value)} placeholder="Rychlý web" /></div>
                      </div>
                      <div className="space-y-2"><Label>Podnadpis</Label><Input value={formData[locale].subtitle} onChange={(e) => updateField(locale, "subtitle", e.target.value)} /></div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle>Karty porovnání ({locale.toUpperCase()})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {!loading && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="space-y-1"><Label className="text-xs">Badge „Před"</Label><Input value={formData[locale].badgeBefore} onChange={(e) => updateField(locale, "badgeBefore", e.target.value)} placeholder="PROBLÉM" /></div>
                          <div className="space-y-1"><Label className="text-xs">Nadpis „Před"</Label><Input value={formData[locale].beforeTitle} onChange={(e) => updateField(locale, "beforeTitle", e.target.value)} /></div>
                          <div className="space-y-1"><Label className="text-xs">Podnadpis „Před"</Label><Input value={formData[locale].beforeSubtitle} onChange={(e) => updateField(locale, "beforeSubtitle", e.target.value)} /></div>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1"><Label className="text-xs">Badge „Po"</Label><Input value={formData[locale].badgeAfter} onChange={(e) => updateField(locale, "badgeAfter", e.target.value)} placeholder="ŘEŠENÍ" /></div>
                          <div className="space-y-1"><Label className="text-xs">Nadpis „Po"</Label><Input value={formData[locale].afterTitle} onChange={(e) => updateField(locale, "afterTitle", e.target.value)} /></div>
                          <div className="space-y-1"><Label className="text-xs">Podnadpis „Po"</Label><Input value={formData[locale].afterSubtitle} onChange={(e) => updateField(locale, "afterSubtitle", e.target.value)} /></div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle>Metriky ({locale.toUpperCase()})</CardTitle><CardDescription>Řádky tabulky porovnání</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {!loading && formData[locale].metrics.map((metric, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-xs">Metrika {i + 1}</span>
                        {formData[locale].metrics.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeMetric(locale, i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-xs">Popis</Label><Input value={metric.label} onChange={(e) => updateMetric(locale, i, "label", e.target.value)} placeholder="Načítání" /></div>
                        <div className="space-y-1"><Label className="text-xs">Hodnota „Před"</Label><Input value={metric.beforeValue} onChange={(e) => updateMetric(locale, i, "beforeValue", e.target.value)} placeholder="4-8 sekund" /></div>
                        <div className="space-y-1"><Label className="text-xs">Hodnota „Po"</Label><Input value={metric.afterValue} onChange={(e) => updateMetric(locale, i, "afterValue", e.target.value)} placeholder="< 2 sekundy" /></div>
                      </div>
                    </div>
                  ))}
                  {!loading && (
                    <Button variant="outline" onClick={() => addMetric(locale)} className="gap-2 w-full"><Plus className="h-4 w-4" /> Přidat metriku</Button>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader><CardTitle>CTA sekce ({locale.toUpperCase()})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {!loading && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs">CTA nadpis</Label><Input value={formData[locale].ctaTitle} onChange={(e) => updateField(locale, "ctaTitle", e.target.value)} placeholder="💡" /></div>
                        <div className="space-y-1"><Label className="text-xs">CTA zvýraznění</Label><Input value={formData[locale].ctaHighlight} onChange={(e) => updateField(locale, "ctaHighlight", e.target.value)} /></div>
                      </div>
                      <div className="space-y-2"><Label>CTA statistika</Label><Input value={formData[locale].ctaStat} onChange={(e) => updateField(locale, "ctaStat", e.target.value)} /></div>
                      <div className="space-y-2"><Label>CTA podnadpis</Label><Input value={formData[locale].ctaSubtitle} onChange={(e) => updateField(locale, "ctaSubtitle", e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><Label className="text-xs">CTA text tlačítka</Label><Input value={formData[locale].ctaText} onChange={(e) => updateField(locale, "ctaText", e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs">CTA odkaz</Label><Input value={formData[locale].ctaLink} onChange={(e) => updateField(locale, "ctaLink", e.target.value)} placeholder="/poptavka" /></div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/content")}>Zrušit</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? "Ukládání..." : "Uložit změny"}</Button>
        </div>
      </main>
    </div>
  );
}
