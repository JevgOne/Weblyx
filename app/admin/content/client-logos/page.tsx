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
import type { ClientLogosData, LocalizedSectionData, ClientLogoItem } from "@/types/cms";

const emptyData: ClientLogosData = { heading: "", clients: [] };

export default function ClientLogosEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeLocale, setActiveLocale] = useState<"cs" | "de">("cs");
  const [formData, setFormData] = useState<LocalizedSectionData<ClientLogosData>>({
    cs: { ...emptyData, clients: [] },
    de: { ...emptyData, clients: [] },
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/cms/client-logos");
      const result = await res.json();
      if (result.success && result.data) setFormData(result.data);
    } catch { showNotification("error", "Chyba při načítání dat"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/client-logos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      showNotification("success", "Client Logos uloženy!");
    } catch { showNotification("error", "Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm("Opravdu chcete resetovat na výchozí hodnoty?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/client-logos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFormData({ cs: { ...emptyData, clients: [] }, de: { ...emptyData, clients: [] } });
      showNotification("success", "Resetováno.");
    } catch { showNotification("error", "Chyba při resetování."); }
    finally { setSaving(false); }
  };

  const updateField = (locale: "cs" | "de", field: keyof ClientLogosData, value: any) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  };

  const updateClient = (locale: "cs" | "de", index: number, field: keyof ClientLogoItem, value: string) => {
    setFormData(prev => {
      const clients = [...prev[locale].clients];
      clients[index] = { ...clients[index], [field]: value };
      // Auto-generate slug from name
      if (field === "name") {
        clients[index].slug = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      }
      return { ...prev, [locale]: { ...prev[locale], clients } };
    });
  };

  const addClient = (locale: "cs" | "de") => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], clients: [...prev[locale].clients, { name: "", slug: "" }] } }));
  };

  const removeClient = (locale: "cs" | "de", index: number) => {
    setFormData(prev => ({ ...prev, [locale]: { ...prev[locale], clients: prev[locale].clients.filter((_, i) => i !== index) } }));
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
              <h1 className="text-xl font-bold">Klientská loga</h1>
              <p className="text-sm text-muted-foreground">Seznam klientů</p>
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

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Poznámka</AlertTitle>
          <AlertDescription>
            Klienti jsou sdíleni mezi oběma jazyky — nadpis sekce je ale lokalizovaný.
            Pokud potřebujete jiný seznam klientů pro DE, upravte záložku DE.
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
                  <CardTitle>Nadpis ({locale.toUpperCase()})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? <Skeleton className="h-10 w-full" /> : (
                    <div className="space-y-2">
                      <Label>Nadpis sekce</Label>
                      <Input value={formData[locale].heading} onChange={(e) => updateField(locale, "heading", e.target.value)} placeholder="Důvěřují nám" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Klienti ({locale.toUpperCase()})</CardTitle>
                  <CardDescription>Seznam klientů zobrazených na homepage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!loading && formData[locale].clients.map((client, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Název</Label>
                          <Input value={client.name} onChange={(e) => updateClient(locale, i, "name", e.target.value)} placeholder="Titan Gym" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Slug</Label>
                          <Input value={client.slug} onChange={(e) => updateClient(locale, i, "slug", e.target.value)} placeholder="titan-gym" className="text-muted-foreground" />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeClient(locale, i)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {!loading && (
                    <Button variant="outline" onClick={() => addClient(locale)} className="gap-2 w-full">
                      <Plus className="h-4 w-4" /> Přidat klienta
                    </Button>
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
