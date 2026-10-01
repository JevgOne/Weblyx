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
import { ArrowLeft, Save, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import type { CaseStudyData, LocalizedSectionData } from "@/types/cms";

const emptyData: CaseStudyData = {
  badgeText: "",
  title: "",
  subtitleTemplate: "",
  ctaText: "",
};

export default function CaseStudyEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeLocale, setActiveLocale] = useState<"cs" | "de">("cs");
  const [formData, setFormData] = useState<LocalizedSectionData<CaseStudyData>>({
    cs: { ...emptyData },
    de: { ...emptyData },
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/cms/case-study");
      const result = await res.json();
      if (result.success && result.data) setFormData(result.data);
    } catch { showNotification("error", "Chyba při načítání dat"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/case-study", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      showNotification("success", "Case Study texty uloženy!");
    } catch { showNotification("error", "Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm("Opravdu chcete resetovat na výchozí hodnoty?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/case-study", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFormData({ cs: { ...emptyData }, de: { ...emptyData } });
      showNotification("success", "Resetováno.");
    } catch { showNotification("error", "Chyba při resetování."); }
    finally { setSaving(false); }
  };

  const updateField = (locale: "cs" | "de", field: keyof CaseStudyData, value: string) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
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

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Poznámka</AlertTitle>
          <AlertDescription>
            Metriky a data se automaticky generují z portfolia. Zde můžete upravit pouze texty (nadpis, podnadpis, badge, CTA).
            V podnadpisu použijte <code className="bg-muted px-1 rounded">{"{projectName}"}</code> jako placeholder pro název projektu.
          </AlertDescription>
        </Alert>

        <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as "cs" | "de")}>
          <TabsList className="mb-6">
            <TabsTrigger value="cs">🇨🇿 Čeština</TabsTrigger>
            <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
          </TabsList>

          {(["cs", "de"] as const).map((locale) => (
            <TabsContent key={locale} value={locale}>
              <Card>
                <CardHeader>
                  <CardTitle>Texty Case Study ({locale.toUpperCase()})</CardTitle>
                  <CardDescription>Nadpisy a texty kolem automaticky generované sekce</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? <><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></> : (
                    <>
                      <div className="space-y-2">
                        <Label>Badge text</Label>
                        <Input value={formData[locale].badgeText} onChange={(e) => updateField(locale, "badgeText", e.target.value)} placeholder="Case Study" />
                        <p className="text-xs text-muted-foreground">Malý text badge nad nadpisem</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Nadpis</Label>
                        <Input value={formData[locale].title} onChange={(e) => updateField(locale, "title", e.target.value)} placeholder="Reálné výsledky, ne sliby" />
                      </div>
                      <div className="space-y-2">
                        <Label>Podnadpis (šablona)</Label>
                        <Input value={formData[locale].subtitleTemplate} onChange={(e) => updateField(locale, "subtitleTemplate", e.target.value)} placeholder="Čísla z projektu {projectName}, ne stock fotky..." />
                        <p className="text-xs text-muted-foreground">Použijte {"{projectName}"} pro automatické vložení názvu projektu</p>
                      </div>
                      <div className="space-y-2">
                        <Label>CTA text</Label>
                        <Input value={formData[locale].ctaText} onChange={(e) => updateField(locale, "ctaText", e.target.value)} placeholder="Zobrazit všechny projekty →" />
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
