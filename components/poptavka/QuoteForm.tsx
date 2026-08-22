"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";
import { HoneypotInput } from "@/components/security/HoneypotInput";
import { buildConfiguration, formatCzk, type PricingData } from "@/lib/pricing/types";

export function QuoteForm({ pricing }: { pricing: PricingData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("contactForm");
  const tRoutes = useTranslations("routes");

  /**
   * The configurator passes IDs only (`?balicek=tier-2&doplnky=addon-blog,...`);
   * prices are recomputed here for display and again on the server on submit.
   */
  const configuration = useMemo(() => {
    const tierId = searchParams.get("balicek");
    if (!tierId) return null;

    const addonIds = (searchParams.get("doplnky") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    return buildConfiguration(pricing, tierId, addonIds);
  }, [searchParams, pricing]);

  const projectTypes = [
    { id: "new-web", label: t("form.projectType.newWebsite") },
    { id: "redesign", label: t("form.projectType.redesign") },
    { id: "web-app", label: t("form.projectType.webApp") },
    { id: "landing", label: t("form.projectType.landingPage") },
    { id: "other", label: t("form.projectType.other") },
  ];

  const budgetOptions = [
    { id: "landing", label: t("form.budgetOptions.landing"), value: t("form.budgetOptions.landing") },
    { id: "basic", label: t("form.budgetOptions.basic"), value: t("form.budgetOptions.basic") },
    { id: "standard", label: t("form.budgetOptions.standard"), value: t("form.budgetOptions.standard") },
    { id: "premium", label: t("form.budgetOptions.premium"), value: t("form.budgetOptions.premium") },
    { id: "custom", label: t("form.budgetOptions.custom"), value: "custom" },
  ];
  const [formData, setFormData] = useState({
    projectType: "",
    companyName: "",
    description: "",
    budget: "",
    name: "",
    email: "",
    phone: "",
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = t("errors.invalidEmail");
        } else {
          delete newErrors.email;
        }
        break;
      case "phone":
        if (value && !/^(\+420|\+49)?[0-9\s]{9,}$/.test(value.replace(/\s/g, ""))) {
          newErrors.phone = t("errors.invalidPhone");
        } else {
          delete newErrors.phone;
        }
        break;
      case "companyName":
        if (!value.trim()) {
          newErrors.companyName = t("errors.companyNameRequired");
        } else {
          delete newErrors.companyName;
        }
        break;
      case "description":
        if (!value.trim()) {
          newErrors.description = t("errors.descriptionRequired");
        } else if (value.trim().length < 10) {
          newErrors.description = t("errors.descriptionTooShort");
        } else {
          delete newErrors.description;
        }
        break;
      case "name":
        if (!value.trim()) {
          newErrors.name = t("errors.nameRequired");
        } else {
          delete newErrors.name;
        }
        break;
      case "projectType":
        if (!value) {
          newErrors.projectType = t("errors.projectTypeRequired");
        } else {
          delete newErrors.projectType;
        }
        break;
      case "budget":
        if (!value) {
          newErrors.budget = t("errors.budgetRequired");
        } else {
          delete newErrors.budget;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // 🎉 Confetti animation
  const celebrateSuccess = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final validation
    const finalErrors: Record<string, string> = {};
    if (!formData.projectType) finalErrors.projectType = t("errors.projectTypeRequired");
    if (!formData.companyName.trim())
      finalErrors.companyName = t("errors.companyNameRequired");
    if (!formData.description.trim()) finalErrors.description = t("errors.descriptionRequired");
    // With a configuration attached the budget field is hidden — the price is known.
    if (!configuration && !formData.budget) finalErrors.budget = t("errors.budgetRequired");
    if (!formData.name.trim()) finalErrors.name = t("errors.nameRequired");
    if (!formData.email.trim()) finalErrors.email = t("errors.emailRequired");
    if (!gdprConsent) finalErrors.gdprConsent = t("errors.gdprRequired");

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const form = e.target as HTMLFormElement;
      const domData = new FormData(form);
      const botFields: Record<string, string> = {};
      domData.forEach((value, key) => {
        if (typeof value === "string" && key.startsWith("website_url_")) {
          botFields[key] = value;
        }
      });
      const timestamp = domData.get("__form_timestamp");

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectType: formData.projectType,
          companyName: formData.companyName,
          businessDescription: formData.description,
          budget: configuration ? "" : formData.budget,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          gdprConsent,
          // IDs only; the server recomputes hours and price.
          configuration: configuration
            ? {
                tierId: configuration.tierId,
                addonIds: configuration.addons.map((a) => a.id),
              }
            : null,
          ...botFields,
          __form_timestamp: timestamp ? Number(timestamp) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || t("errors.submitError"));
        setIsSubmitting(false);
        return;
      }

      // 🎯 Conversion tracking
      if (typeof window !== 'undefined') {
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Lead');
          (window as any).fbq('track', 'SubmitApplication');
        }
        if ((window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            'event_category': 'Lead',
            'event_label': 'Quote Form Submitted',
            'value': 1
          });
          (window as any).gtag('event', 'generate_lead', {
            'currency': 'CZK',
            'value': 10000
          });
          (window as any).gtag('event', 'ads_conversion_Contact_Us_1', {});
        }
      }

      // 🎉 Celebrate with confetti!
      celebrateSuccess();

      // Redirect after short delay
      setTimeout(() => {
        router.push("/poptavka/dekujeme");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      alert(t("errors.submitError"));
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <HoneypotInput />

          {/* Configuration carried over from the price configurator */}
          {configuration && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-2">
              <p className="text-sm font-semibold">{t("form.configurationTitle")}</p>
              <div className="text-sm">
                <span className="text-muted-foreground">{t("form.configurationPackage")}: </span>
                <strong>{configuration.tierName}</strong>
              </div>
              {configuration.addons.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">{t("form.configurationAddons")}: </span>
                  {configuration.addons.map((a) => a.name).join(", ")}
                </div>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span>
                  <span className="text-muted-foreground">{t("form.configurationPrice")}: </span>
                  <strong>{formatCzk(configuration.totalPrice)} Kč</strong>
                </span>
                <span>
                  <span className="text-muted-foreground">{t("form.configurationHours")}: </span>
                  {configuration.totalHours} h
                </span>
                {configuration.deliveryDays && (
                  <span>
                    <span className="text-muted-foreground">{t("form.configurationDelivery")}: </span>
                    {configuration.deliveryDays}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Co potřebujete? */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("form.projectTypeLabel")} *</Label>
            <RadioGroup
              value={formData.projectType}
              onValueChange={(value) => handleInputChange("projectType", value)}
              className="flex flex-wrap gap-4"
            >
              {projectTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id} className="cursor-pointer font-normal">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.projectType && (
              <p className="text-sm text-red-500">{errors.projectType}</p>
            )}
          </div>

          {/* Název firmy/projektu */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium">
              {t("form.companyNameLabel")} *
            </Label>
            <Input
              id="companyName"
              placeholder={t("form.companyNamePlaceholder")}
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* Stručný popis */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("form.descriptionLabel")} *
            </Label>
            <Textarea
              id="description"
              placeholder={t("form.descriptionPlaceholder")}
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Rozpočet — hidden when a configuration already carries the price */}
          <div className={`space-y-2 ${configuration ? "hidden" : ""}`}>
            <Label htmlFor="budget" className="text-sm font-medium">
              {t("form.budgetLabel")} *
            </Label>
            <Select
              value={formData.budget}
              onValueChange={(value) => handleInputChange("budget", value)}
            >
              <SelectTrigger className={errors.budget ? "border-red-500" : ""}>
                <SelectValue placeholder={t("form.budgetPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {budgetOptions.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.budget && (
              <p className="text-sm text-red-500">{errors.budget}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("form.budgetHelp")}
            </p>
          </div>

          {/* Vaše jméno */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t("form.nameLabel")} *
            </Label>
            <Input
              id="name"
              placeholder={t("form.namePlaceholder")}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email a Telefon */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t("form.emailLabel")} *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("form.emailPlaceholder")}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                {t("form.phoneLabel")}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t("form.phonePlaceholder")}
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* GDPR consent */}
          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={gdprConsent}
                onChange={(e) => {
                  setGdprConsent(e.target.checked);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.gdprConsent;
                    return next;
                  });
                }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
              />
              <span className="text-muted-foreground">
                {t("form.gdprConsent")}{" "}
                <Link href={tRoutes("privacy")} className="text-primary hover:underline">
                  {t("form.gdprLink")}
                </Link>
                . *
              </span>
            </label>
            {errors.gdprConsent && (
              <p className="text-sm text-red-500">{errors.gdprConsent}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full mt-6"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            <Send className="mr-2 h-5 w-5" />
            {isSubmitting ? t("form.submitting") : t("form.submitButton")}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            {t("form.requiredFields")}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
