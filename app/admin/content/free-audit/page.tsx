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
import type { FreeAuditData, LocalizedSectionData } from "@/types/cms";

const emptyData: FreeAuditData = {
  badge: "",
  title: "",
  subtitle: "",
  urlPlaceholder: "",
  emailPlaceholder: "",
  buttonSubmit: "",
  buttonLoading: "",
  noSpam: "",
};

export default function FreeAuditEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeLocale, setActiveLocale] = useState<"cs" | "de">("cs");
  const [formData, setFormData] = useState<LocalizedSectionData<FreeAuditData>>({
    cs: { ...emptyData },
    de: { ...emptyData },
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/cms/free-audit");
      const result = await res.json();
      if (result.success && result.data) setFormData(result.data);
    } catch { showNotification("error", "Chyba při načítání dat"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/free-audit", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      showNotification("success", "Free Audit sekce uložena!");
    } catch { showNotification("error", "Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm("Opravdu chcete resetovat na výchozí hodnoty?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/free-audit", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFormData({ cs: { ...emptyData }, de: { ...emptyData } });
      showNotification("success", "Resetováno.");
    } catch { showNotification("error", "Chyba při resetování."); }
    finally { setSaving(false); }
  };

  const updateField = (locale: "cs" | "de", field: keyof FreeAuditData, value: string) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
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
              <h1 className="text-xl font-bold">Free Audit</h1>
              <p className="text-sm text-muted-foreground">Formulář bezplatného auditu</p>
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
                <CardHeader>
                  <CardTitle>Texty auditu ({locale.toUpperCase()})</CardTitle>
                  <CardDescription>Nadpisy, placeholdery a texty tlačítek</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? <><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></> : (
                    <>
                      <div className="space-y-2">
                        <Label>Badge text</Label>
                        <Input value={formData[locale].badge} onChange={(e) => updateField(locale, "badge", e.target.value)} placeholder="Zdarma, bez závazků" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nadpis</Label>
                        <Input value={formData[locale].title} onChange={(e) => updateField(locale, "title", e.target.value)} placeholder="Jak rychlý je váš web?" />
                      </div>
                      <div className="space-y-2">
                        <Label>Podnadpis</Label>
                        <Input value={formData[locale].subtitle} onChange={(e) => updateField(locale, "subtitle", e.target.value)} placeholder="Zadejte URL a..." />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">URL placeholder</Label>
                          <Input value={formData[locale].urlPlaceholder} onChange={(e) => updateField(locale, "urlPlaceholder", e.target.value)} placeholder="www.vas-web.cz" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Email placeholder</Label>
                          <Input value={formData[locale].emailPlaceholder} onChange={(e) => updateField(locale, "emailPlaceholder", e.target.value)} placeholder="vas@email.cz" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Text tlačítka</Label>
                          <Input value={formData[locale].buttonSubmit} onChange={(e) => updateField(locale, "buttonSubmit", e.target.value)} placeholder="Spustit audit zdarma" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Text při načítání</Label>
                          <Input value={formData[locale].buttonLoading} onChange={(e) => updateField(locale, "buttonLoading", e.target.value)} placeholder="Analyzuji web..." />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Text „Bez spamu"</Label>
                        <Input value={formData[locale].noSpam} onChange={(e) => updateField(locale, "noSpam", e.target.value)} placeholder="Žádný spam..." />
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
