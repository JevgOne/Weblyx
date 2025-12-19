"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Send, Phone } from "lucide-react";
import { HoneypotInput } from "@/components/security/HoneypotInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import confetti from "canvas-confetti";

interface ContactProps {
  isMainPage?: boolean; // If true, use H1 instead of H2
}

export function Contact({ isMainPage = false }: ContactProps) {
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
          newErrors.email = "Neplatná emailová adresa";
        } else {
          delete newErrors.email;
        }
        break;
      case "phone":
        if (value && !/^(\+420)?[0-9\s]{9,}$/.test(value.replace(/\s/g, ""))) {
          newErrors.phone = "Neplatné telefonní číslo";
        } else {
          delete newErrors.phone;
        }
        break;
      case "companyName":
        if (!value.trim()) {
          newErrors.companyName = "Název firmy/projektu je povinný";
        } else {
          delete newErrors.companyName;
        }
        break;
      case "description":
        if (!value.trim()) {
          newErrors.description = "Popis je povinný";
        } else if (value.trim().length < 10) {
          newErrors.description = "Popis musí obsahovat alespoň 10 znaků";
        } else {
          delete newErrors.description;
        }
        break;
      case "name":
        if (!value.trim()) {
          newErrors.name = "Jméno je povinné";
        } else {
          delete newErrors.name;
        }
        break;
      case "projectType":
        if (!value) {
          newErrors.projectType = "Vyberte typ projektu";
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

  // 🎉 Confetti animation
  const celebrateSuccess = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire confetti from two positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Final validation
    const finalErrors: Record<string, string> = {};
    if (!formData.projectType) finalErrors.projectType = "Vyberte typ projektu";
    if (!formData.companyName.trim()) finalErrors.companyName = "Název firmy/projektu je povinný";
    if (!formData.description.trim()) finalErrors.description = "Popis je povinný";
    if (!formData.name.trim()) finalErrors.name = "Jméno je povinné";
    if (!formData.email.trim()) finalErrors.email = "Email je povinný";

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
        throw new Error(data.error || "Něco se pokazilo");
      }

      setSubmitStatus({
        type: "success",
        message: "Děkujeme! Ozveme se vám do 24 hodin a domluvíme bezplatnou konzultaci.",
      });

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
            : "Došlo k chybě při odesílání. Zkuste to prosím znovu.",
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
              Nezávazná poptávka
            </h1>
          ) : (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Nezávazná poptávka
            </h2>
          )}
          <p className="text-lg text-muted-foreground">
            Vyplňte formulář a my se vám ozveme do 24 hodin
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
                      href="mailto:info@weblyx.cz"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      info@weblyx.cz
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
                      Praha, Česká republika
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Otevírací doba</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Po - Pá: 9:00 - 18:00</p>
                <p>So - Ne: Zavřeno</p>
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

                  {/* Co potřebujete? */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Co potřebujete? *
                    </Label>
                    <RadioGroup
                      value={formData.projectType}
                      onValueChange={(value) => handleInputChange("projectType", value)}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new-web" id="new-web" />
                        <Label htmlFor="new-web" className="cursor-pointer font-normal">
                          Nový web
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="redesign" id="redesign" />
                        <Label htmlFor="redesign" className="cursor-pointer font-normal">
                          Redesign
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eshop" id="eshop" />
                        <Label htmlFor="eshop" className="cursor-pointer font-normal">
                          E-shop
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landing" id="landing" />
                        <Label htmlFor="landing" className="cursor-pointer font-normal">
                          Landing page
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer font-normal">
                          Jiné
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.projectType && (
                      <p className="text-sm text-red-500">{errors.projectType}</p>
                    )}
                  </div>

                  {/* Název firmy + Jméno na jednom řádku */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-sm font-medium">
                        Název firmy/projektu *
                      </Label>
                      <Input
                        id="companyName"
                        placeholder="Např. Firma s.r.o."
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
                        Vaše jméno *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Jan Novák"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Email + Telefon na jednom řádku */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jan@priklad.cz"
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
                        Telefon <span className="text-muted-foreground font-normal text-xs">(nepovinné)</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+420 123 456 789"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Stručný popis */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Stručný popis *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Stačí pár slov – čím se zabýváte? Nemusíte psát román."
                      rows={2}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  {/* Success/Error Messages */}
                  {submitStatus.type && (
                    <div
                      className={`p-4 rounded-lg ${
                        submitStatus.type === "success"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {submitStatus.message}
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
                    {isSubmitting ? "Odesílání..." : "Odeslat poptávku"}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    * Povinná pole
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
