"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Send, Phone, CheckCircle2, XCircle } from "lucide-react";
import { HoneypotInput } from "@/components/security/HoneypotInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import confetti from "canvas-confetti";
import { useTranslations, useLocale } from 'next-intl';

interface ContactProps {
  isMainPage?: boolean; // If true, use H1 instead of H2
}

export function Contact({ isMainPage = false }: ContactProps) {
  // i18n translations
  const t = useTranslations('contactForm');
  const locale = useLocale();
  const isDE = locale === 'de';
  const contactEmail = isDE ? 'kontakt@seitelyx.de' : 'info@weblyx.cz';

  const [formData, setFormData] = useState({
    projectType: "",
    companyName: "",
    description: "",
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = t('errors.invalidEmail');
        } else {
          delete newErrors.email;
        }
        break;
      case "phone":
        if (value && !/^(\+420)?[0-9\s]{9,}$/.test(value.replace(/\s/g, ""))) {
          newErrors.phone = t('errors.invalidPhone');
        } else {
          delete newErrors.phone;
        }
        break;
      case "companyName":
        if (!value.trim()) {
          newErrors.companyName = t('errors.companyNameRequired');
        } else {
          delete newErrors.companyName;
        }
        break;
      case "description":
        if (!value.trim()) {
          newErrors.description = t('errors.descriptionRequired');
        } else if (value.trim().length < 10) {
          newErrors.description = t('errors.descriptionTooShort');
        } else {
          delete newErrors.description;
        }
        break;
      case "name":
        if (!value.trim()) {
          newErrors.name = t('errors.nameRequired');
        } else {
          delete newErrors.name;
        }
        break;
      case "projectType":
        if (!value) {
          newErrors.projectType = t('errors.projectTypeRequired');
        } else {
          delete newErrors.projectType;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (
    name: string,
    value: string
  ) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // 🎉 MEGA Confetti animation - Extra visible!
  const celebrateSuccess = () => {
    const duration = 5000; // Longer duration
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 45, // Faster
      spread: 360,
      ticks: 100, // More ticks = longer fall
      zIndex: 9999, // On top of everything
      gravity: 0.8,
      shapes: ['circle', 'square'] as any,
      colors: ['#14B8A6', '#0D9488', '#2DD4BF', '#5EEAD4', '#99F6E4'] // Teal colors
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Initial burst from center
    confetti({
      ...defaults,
      particleCount: 150,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
    });

    // Continuous confetti from sides
    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 80 * (timeLeft / duration);

      // Fire confetti from three positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0.5, y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Final validation
    const finalErrors: Record<string, string> = {};
    if (!formData.projectType) finalErrors.projectType = t('errors.projectTypeRequired');
    if (!formData.companyName.trim()) finalErrors.companyName = t('errors.companyNameRequired');
    if (!formData.description.trim()) finalErrors.description = t('errors.descriptionRequired');
    if (!formData.name.trim()) finalErrors.name = t('errors.nameRequired');
    if (!formData.email.trim()) finalErrors.email = t('errors.emailRequired');

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('messages.errorTitle'));
      }

      setSubmitStatus({
        type: "success",
        message: t('messages.successMessage'),
      });

      // Google Ads conversion tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ads_conversion_Contact_Us_1', {});
      }

      // 🎉 Celebrate with confetti!
      celebrateSuccess();

      // Reset form
      setFormData({
        projectType: "",
        companyName: "",
        description: "",
        name: "",
        email: "",
        phone: "",
      });
      setErrors({});
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t('messages.errorMessage'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          {isMainPage ? (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              {t('form.title')}
            </h1>
          ) : (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              {t('form.title')}
            </h2>
          )}
          <p className="text-lg text-muted-foreground">
            {t('form.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">Email</h3>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">Telefon</h3>
                    <a
                      href="tel:+420702110166"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      +420 702 110 166
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg">Adresa</h3>
                    <p className="text-muted-foreground">
                      {t('contact.address')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('contact.hours')}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t('contact.weekdays')}</p>
                <p>{t('contact.weekend')}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* 🤖 Anti-bot protection */}
                  <HoneypotInput />

                  {/* Project Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('form.projectTypeLabel')} *
                    </Label>
                    <RadioGroup
                      value={formData.projectType}
                      onValueChange={(value) => handleInputChange("projectType", value)}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new-web" id="new-web" />
                        <Label htmlFor="new-web" className="cursor-pointer font-normal">
                          {t('form.projectType.newWebsite')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="redesign" id="redesign" />
                        <Label htmlFor="redesign" className="cursor-pointer font-normal">
                          {t('form.projectType.redesign')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eshop" id="eshop" />
                        <Label htmlFor="eshop" className="cursor-pointer font-normal">
                          {t('form.projectType.eshop')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landing" id="landing" />
                        <Label htmlFor="landing" className="cursor-pointer font-normal">
                          {t('form.projectType.landingPage')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer font-normal">
                          {t('form.projectType.other')}
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.projectType && (
                      <p className="text-sm text-red-500">{errors.projectType}</p>
                    )}
                  </div>

                  {/* Company Name + Name Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-sm font-medium">
                        {t('form.companyNameLabel')} *
                      </Label>
                      <Input
                        id="companyName"
                        placeholder={t('form.companyNamePlaceholder')}
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        className={errors.companyName ? "border-red-500" : ""}
                      />
                      {errors.companyName && (
                        <p className="text-sm text-red-500">{errors.companyName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        {t('form.nameLabel')} *
                      </Label>
                      <Input
                        id="name"
                        placeholder={t('form.namePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Email + Phone Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        {t('form.emailLabel')} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('form.emailPlaceholder')}
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
                        {t('form.phoneLabel')}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t('form.phonePlaceholder')}
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      {t('form.descriptionLabel')} *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder={t('form.descriptionPlaceholder')}
                      rows={2}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  {/* Success/Error Messages - BIG and VISIBLE! */}
                  {submitStatus.type && (
                    <div
                      className={`p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 ${
                        submitStatus.type === "success"
                          ? "bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-500"
                          : "bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-500"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {submitStatus.type === "success" ? (
                          <CheckCircle2 className="w-8 h-8 text-teal-600 flex-shrink-0 animate-in zoom-in duration-500" />
                        ) : (
                          <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 ${
                            submitStatus.type === "success" ? "text-teal-900" : "text-red-900"
                          }`}>
                            {submitStatus.type === "success" ? "🎉 Úspěch!" : "❌ Chyba"}
                          </h3>
                          <p className={`text-base leading-relaxed ${
                            submitStatus.type === "success" ? "text-teal-800" : "text-red-800"
                          }`}>
                            {submitStatus.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isSubmitting ? t('form.submitting') : t('form.submitButton')}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    {t('form.requiredFields')}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
