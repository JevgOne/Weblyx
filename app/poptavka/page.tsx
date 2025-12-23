"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send } from "lucide-react";
import confetti from "canvas-confetti";

const projectTypes = [
  { id: "new-web", label: "Nový web" },
  { id: "redesign", label: "Redesign" },
  { id: "eshop", label: "E-shop" },
  { id: "landing", label: "Landing page" },
  { id: "other", label: "Jiné" },
];

export default function QuotePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    projectType: "",
    companyName: "",
    description: "",
    budget: "",
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!formData.projectType) finalErrors.projectType = "Vyberte typ projektu";
    if (!formData.companyName.trim())
      finalErrors.companyName = "Název firmy/projektu je povinný";
    if (!formData.description.trim()) finalErrors.description = "Popis je povinný";
    if (!formData.name.trim()) finalErrors.name = "Jméno je povinné";
    if (!formData.email.trim()) finalErrors.email = "Email je povinný";

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectType: formData.projectType,
          companyName: formData.companyName,
          businessDescription: formData.description,
          budget: formData.budget,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Došlo k chybě při odesílání.");
        setIsSubmitting(false);
        return;
      }

      // 🎉 Celebrate with confetti!
      celebrateSuccess();

      // Redirect after short delay
      setTimeout(() => {
        router.push("/poptavka/dekujeme");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      alert("Došlo k chybě při odesílání. Zkuste to prosím znovu.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Nezávazná poptávka
              </h1>
              <p className="text-muted-foreground">
                Vyplňte formulář a my se vám ozveme do 24 hodin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Co potřebujete? */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Co potřebujete? *</Label>
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

              {/* Stručný popis */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Stručný popis *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Stačí pár slov – čím se zabýváte? Nemusíte psát román."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Rozpočet */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  Rozpočet{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    (nepovinné)
                  </span>
                </Label>
                <Input
                  id="budget"
                  placeholder="Např. 50 000 - 100 000 Kč"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                />
              </div>

              {/* Vaše jméno */}
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

              {/* Email a Telefon */}
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
                    Telefon{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (nepovinné)
                    </span>
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

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full mt-6"
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

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Máte otázku? Napište nám na{" "}
          <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">
            info@weblyx.cz
          </a>
        </div>
      </div>
    </div>
  );
}
