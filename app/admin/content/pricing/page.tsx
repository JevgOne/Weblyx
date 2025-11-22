"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
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
  Star,
  DollarSign,
} from "lucide-react";
import { PricingTier } from "@/types/cms";

export default function PricingManagementPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<Omit<PricingTier, "id" | "createdAt" | "updatedAt">>({
    name: "",
    description: "",
    price: 0,
    currency: "CZK",
    interval: "month",
    features: [""],
    highlighted: false,
    ctaText: "",
    ctaLink: "",
    order: 0,
    enabled: true,
  });

  useEffect(() => {
    const loadData = async () => {
      await loadPricingTiers();
      setLoading(false);
    };

    loadData();
  }, []);

  const loadPricingTiers = async () => {
    try {
      const response = await fetch('/api/cms/pricing');
      const result = await response.json();

      if (result.success) {
        setTiers(result.data || []);
      }
    } catch (error) {
      console.error("Error loading pricing tiers:", error);
      showNotification("error", "Chyba při načítání ceníků");
    }
  };

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "order"
          ? parseFloat(value) || 0
          : value,
    }));
  }, []);

  const handleFeatureChange = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const newFeatures = [...prev.features];
      newFeatures[index] = value;
      return {
        ...prev,
        features: newFeatures,
      };
    });
  }, []);

  const addFeature = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  }, []);

  const removeFeature = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }, []);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }, []);

  const startCreating = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      currency: "CZK",
      interval: "month",
      features: [""],
      highlighted: false,
      ctaText: "Vybrat plán",
      ctaLink: "/kontakt",
      order: tiers.length,
      enabled: true,
    });
    setIsCreating(true);
    setEditingId(null);
  };

  const startEditing = (tier: PricingTier) => {
    setFormData({
      name: tier.name,
      description: tier.description,
      price: tier.price,
      currency: tier.currency,
      interval: tier.interval,
      features: tier.features.length > 0 ? tier.features : [""],
      highlighted: tier.highlighted,
      ctaText: tier.ctaText,
      ctaLink: tier.ctaLink,
      order: tier.order,
      enabled: tier.enabled,
    });
    setEditingId(tier.id || null);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: "",
      description: "",
      price: 0,
      currency: "CZK",
      interval: "month",
      features: [""],
      highlighted: false,
      ctaText: "",
      ctaLink: "",
      order: 0,
      enabled: true,
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showNotification("error", "Název plánu je povinný");
      return;
    }
    if (!formData.description.trim()) {
      showNotification("error", "Popis plánu je povinný");
      return;
    }
    if (formData.price < 0) {
      showNotification("error", "Cena musí být kladné číslo");
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

    // Filter out empty features
    const cleanedFeatures = formData.features.filter((f) => f.trim() !== "");
    if (cleanedFeatures.length === 0) {
      showNotification("error", "Přidejte alespoň jednu funkci");
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement API endpoint for Pricing tiers CRUD
      showNotification("error", "Pricing tiers API not yet implemented");
      /*
      const dataToSave = {
        ...formData,
        features: cleanedFeatures,
      };

      if (isCreating) {
        await createPricingTier(dataToSave);
        showNotification("success", "Ceník byl úspěšně vytvořen!");
      } else if (editingId) {
        await updatePricingTier(editingId, dataToSave);
        showNotification("success", "Ceník byl úspěšně aktualizován!");
      }

      await loadPricingTiers();
      cancelEditing();
      */
    } catch (error) {
      console.error("Error saving pricing tier:", error);
      showNotification("error", "Chyba při ukládání. Zkuste to prosím znovu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento ceník?")) {
      return;
    }

    try {
      // TODO: Implement API endpoint for Pricing tiers CRUD
      showNotification("error", "Pricing tiers API not yet implemented");
      /*
      await deletePricingTier(id);
      showNotification("success", "Ceník byl úspěšně smazán!");
      await loadPricingTiers();
      */
    } catch (error) {
      console.error("Error deleting pricing tier:", error);
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
              <h1 className="text-xl font-bold">Správa ceníků</h1>
              <p className="text-sm text-muted-foreground">
                {tiers.length} ceníků celkem
              </p>
            </div>
          </div>

          <Button onClick={startCreating} className="gap-2" disabled={isCreating || editingId !== null}>
            <Plus className="h-4 w-4" />
            Přidat ceník
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
                {isCreating ? "Vytvořit nový ceník" : "Upravit ceník"}
              </CardTitle>
              <CardDescription>
                Vyplňte všechny povinné údaje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Název plánu <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Např. Starter"
                    required
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Cena <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Měna</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="CZK">CZK</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                {/* Interval */}
                <div className="space-y-2">
                  <Label htmlFor="interval">Interval</Label>
                  <select
                    id="interval"
                    name="interval"
                    value={formData.interval}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="month">měsíc</option>
                    <option value="year">rok</option>
                    <option value="one-time">jednorázově</option>
                  </select>
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
                  placeholder="Krátký popis plánu..."
                  rows={2}
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
                      placeholder="Funkce plánu..."
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

              <div className="grid gap-4 md:grid-cols-2">
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
                    placeholder="Např. Vybrat plán"
                    required
                  />
                </div>

                {/* CTA Link */}
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">
                    Odkaz CTA <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ctaLink"
                    name="ctaLink"
                    value={formData.ctaLink}
                    onChange={handleInputChange}
                    placeholder="/kontakt"
                    required
                  />
                </div>
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

              {/* Checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="highlighted"
                    name="highlighted"
                    checked={formData.highlighted}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="highlighted" className="font-normal cursor-pointer">
                    Zvýraznit tento plán (doporučený)
                  </Label>
                </div>

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
                    Zobrazit ceník na webu
                  </Label>
                </div>
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

        {/* Pricing Tiers List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Všechny ceníky</h2>
          {tiers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Zatím nejsou žádné ceníky.</p>
                <Button onClick={startCreating} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat první ceník
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`${
                    !tier.enabled ? "opacity-50" : ""
                  } ${
                    tier.highlighted ? "border-primary shadow-lg" : ""
                  } hover:shadow-xl transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {tier.name}
                          {tier.highlighted && (
                            <Star className="h-4 w-4 text-primary fill-primary" />
                          )}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pořadí: {tier.order}
                        </p>
                      </div>
                      {!tier.enabled && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Skryto
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground">
                          {tier.currency}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {tier.interval === "month" ? "měsíc" : tier.interval === "year" ? "rok" : "jednorázově"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {tier.description}
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground mb-4">
                      <strong>Funkce:</strong> {tier.features.length}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => startEditing(tier)}
                      >
                        <Edit className="h-4 w-4" />
                        Upravit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => tier.id && handleDelete(tier.id)}
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
