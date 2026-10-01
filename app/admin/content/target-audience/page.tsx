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
import type { TargetAudienceData, LocalizedSectionData, TargetAudienceItem } from "@/types/cms";

const emptyAudiences: TargetAudienceItem[] = [
  { title: "", description: "" },
  { title: "", description: "" },
  { title: "", description: "" },
];

const emptyData: TargetAudienceData = { title: "", subtitle: "", audiences: [...emptyAudiences] };

export default function TargetAudienceEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeLocale, setActiveLocale] = useState<"cs" | "de">("cs");
  const [formData, setFormData] = useState<LocalizedSectionData<TargetAudienceData>>({
    cs: { ...emptyData, audiences: emptyAudiences.map(a => ({ ...a })) },
    de: { ...emptyData, audiences: emptyAudiences.map(a => ({ ...a })) },
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/cms/target-audience");
      const result = await res.json();
      if (result.success && result.data) setFormData(result.data);
    } catch (error) {
      showNotification("error", "Chyba při načítání dat");
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/target-audience", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      showNotification("success", "Cílová skupina uložena!");
    } catch { showNotification("error", "Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm("Opravdu chcete resetovat na výchozí hodnoty?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/target-audience", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFormData({ cs: { ...emptyData, audiences: emptyAudiences.map(a => ({ ...a })) }, de: { ...emptyData, audiences: emptyAudiences.map(a => ({ ...a })) } });
      showNotification("success", "Resetováno na výchozí hodnoty.");
    } catch { showNotification("error", "Chyba při resetování."); }
    finally { setSaving(false); }
  };

  const updateField = (locale: "cs" | "de", field: keyof TargetAudienceData, value: any) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  };

  const updateAudience = (locale: "cs" | "de", index: number, field: keyof TargetAudienceItem, value: string) => {
    setFormData(prev => {
      const audiences = [...prev[locale].audiences];
      audiences[index] = { ...audiences[index], [field]: value };
      return { ...prev, [locale]: { ...prev[locale], audiences } };
    });
  };

  const addAudience = (locale: "cs" | "de") => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], audiences: [...prev[locale].audiences, { title: "", description: "" }] } }));
  };

  const removeAudience = (locale: "cs" | "de", index: number) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], audiences: prev[locale].audiences.filter((_, i) => i !== index) } }));
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

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
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? "Ukládání..." : "Uložit"}</Button>
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
                  <CardTitle>Nadpisy ({locale.toUpperCase()})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? <><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></> : (
                    <>
                      <div className="space-y-2">
                        <Label>Nadpis</Label>
                        <Input value={formData[locale].title} onChange={(e) => updateField(locale, "title", e.target.value)} placeholder="Pro koho tvoříme weby" />
                      </div>
                      <div className="space-y-2">
                        <Label>Podnadpis</Label>
                        <Input value={formData[locale].subtitle} onChange={(e) => updateField(locale, "subtitle", e.target.value)} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Cílové skupiny ({locale.toUpperCase()})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!loading && formData[locale].audiences.map((audience, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Skupina {i + 1}</span>
                        {formData[locale].audiences.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeAudience(locale, i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Název</Label>
                        <Input value={audience.title} onChange={(e) => updateAudience(locale, i, "title", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Popis</Label>
                        <Textarea value={audience.description} onChange={(e) => updateAudience(locale, i, "description", e.target.value)} rows={3} />
                      </div>
                    </div>
                  ))}
                  {!loading && (
                    <Button variant="outline" onClick={() => addAudience(locale)} className="gap-2 w-full"><Plus className="h-4 w-4" /> Přidat skupinu</Button>
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
