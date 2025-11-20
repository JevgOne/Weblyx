"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "@/lib/firestore-cms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import { Service } from "@/types/cms";

export default function ServicesManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<Omit<Service, "id" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    icon: "",
    features: [""],
    order: 0,
    enabled: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser: any) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        await loadServices();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadServices = async () => {
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
      showNotification("error", "Chyba při načítání služeb");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const startCreating = () => {
    setFormData({
      title: "",
      description: "",
      icon: "",
      features: [""],
      order: services.length,
      enabled: true,
    });
    setIsCreating(true);
    setEditingId(null);
  };

  const startEditing = (service: Service) => {
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      features: service.features.length > 0 ? service.features : [""],
      order: service.order,
      enabled: service.enabled,
    });
    setEditingId(service.id || null);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      title: "",
      description: "",
      icon: "",
      features: [""],
      order: 0,
      enabled: true,
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      showNotification("error", "Název služby je povinný");
      return;
    }
    if (!formData.description.trim()) {
      showNotification("error", "Popis služby je povinný");
      return;
    }
    if (!formData.icon.trim()) {
      showNotification("error", "Ikona služby je povinná");
      return;
    }

    // Filter out empty features
    const cleanedFeatures = formData.features.filter((f) => f.trim() !== "");
    if (cleanedFeatures.length === 0) {
      showNotification("error", "Přidejte alespoň jednu funkci");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        features: cleanedFeatures,
      };

      if (isCreating) {
        await createService(dataToSave);
        showNotification("success", "Služba byla úspěšně vytvořena!");
      } else if (editingId) {
        await updateService(editingId, dataToSave);
        showNotification("success", "Služba byla úspěšně aktualizována!");
      }

      await loadServices();
      cancelEditing();
    } catch (error) {
      console.error("Error saving service:", error);
      showNotification("error", "Chyba při ukládání. Zkuste to prosím znovu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto službu?")) {
      return;
    }

    try {
      await deleteService(id);
      showNotification("success", "Služba byla úspěšně smazána!");
      await loadServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      showNotification("error", "Chyba při mazání. Zkuste to prosím znovu.");
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
              <h1 className="text-xl font-bold">Správa služeb</h1>
              <p className="text-sm text-muted-foreground">
                {services.length} služeb celkem
              </p>
            </div>
          </div>

          <Button onClick={startCreating} className="gap-2" disabled={isCreating || editingId !== null}>
            <Plus className="h-4 w-4" />
            Přidat službu
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>
                {isCreating ? "Vytvořit novou službu" : "Upravit službu"}
              </CardTitle>
              <CardDescription>
                Vyplňte všechny povinné údaje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Název služby <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Např. Web Design"
                    required
                  />
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <Label htmlFor="icon">
                    Ikona (Lucide název) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="Např. Palette, Code, Rocket"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Viz lucide.dev/icons
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Popis <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Krátký popis služby..."
                  rows={3}
                  required
                />
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>
                  Funkce <span className="text-destructive">*</span>
                </Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder="Funkce služby..."
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Přidat funkci
                </Button>
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Pořadí</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Určuje pořadí zobrazení (0 = první)
                </p>
              </div>

              {/* Enabled */}
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
                  Zobrazit službu na webu
                </Label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Zrušit
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Ukládání..." : "Uložit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Všechny služby</h2>
          {services.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Zatím nejsou žádné služby.</p>
                <Button onClick={startCreating} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat první službu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`${
                    !service.enabled ? "opacity-50" : ""
                  } hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <GripVertical className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Pořadí: {service.order}
                          </p>
                        </div>
                      </div>
                      {!service.enabled && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Skryto
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      <strong>Ikona:</strong> {service.icon}
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                      <strong>Funkce:</strong> {service.features.length}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => startEditing(service)}
                      >
                        <Edit className="h-4 w-4" />
                        Upravit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => service.id && handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
