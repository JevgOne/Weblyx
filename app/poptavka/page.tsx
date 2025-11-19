"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

// Typ projektu options
const projectTypes = [
  { id: "new-web", label: "Nový web", desc: "Začínám od nuly" },
  { id: "redesign", label: "Redesign webu", desc: "Mám starý web, chci nový" },
  { id: "eshop", label: "E-shop", desc: "Chci prodávat online" },
  { id: "landing", label: "Landing page", desc: "Jedna stránka pro kampaň" },
  { id: "web-eshop", label: "Web + E-shop", desc: "Kombinace" },
  { id: "other", label: "Jiné", desc: "Popíšu vlastní potřebu" },
];

const features = [
  "Kontaktní formulář",
  "Galerie / Portfolio",
  "Blog / Aktuality",
  "Online rezervace",
  "E-shop / Košík",
  "Uživatelské účty",
  "Vícejazyčnost",
  "Live chat",
  "Newsletter",
  "Integrace sociálních sítí",
  "Video galerie",
  "Mapa / Pobočky",
];

export default function QuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: "",
    projectTypeOther: "",
    companyName: "",
    businessDescription: "",
    features: [] as string[],
    budget: "",
    timeline: "",
    name: "",
    email: "",
    phone: "",
  });

  const totalSteps = 4; // Zjednodušená verze (místo 10 kroků)

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // TODO: Odeslat do Firebase
    router.push("/poptavka/dekujeme");
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.projectType !== "";
      case 2:
        return formData.companyName !== "" && formData.businessDescription !== "";
      case 3:
        return formData.budget !== "" && formData.timeline !== "";
      case 4:
        return formData.name !== "" && formData.email !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Krok {step} z {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "Co potřebujete vytvořit?"}
              {step === 2 && "O vašem byznysu"}
              {step === 3 && "Časový rámec & Rozpočet"}
              {step === 4 && "Kontaktní údaje"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Vyberte typ projektu, který potřebujete"}
              {step === 2 && "Řekněte nám více o vašem podnikání"}
              {step === 3 && "Kdy potřebujete web a jaký je váš rozpočet"}
              {step === 4 && "Jak se s vámi můžeme spojit"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Project Type */}
            {step === 1 && (
              <RadioGroup
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
              >
                <div className="grid gap-4">
                  {projectTypes.map((type) => (
                    <Label
                      key={type.id}
                      htmlFor={type.id}
                      className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.desc}</div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Step 2: Business Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Název firmy / projektu *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Např. Fitness Studio Praha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Stručný popis (2-3 věty) *</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, businessDescription: e.target.value })
                    }
                    placeholder="Čím se zabýváte? Komu pomáháte? Co nabízíte?"
                    rows={4}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Jaké funkce potřebujete? (vyberte více)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature) => (
                      <Label
                        key={feature}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={formData.features.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                features: [...formData.features, feature],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                features: formData.features.filter((f) => f !== feature),
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{feature}</span>
                      </Label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Timeline & Budget */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Kdy potřebujete web spustit? *</Label>
                  <RadioGroup
                    value={formData.timeline}
                    onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                  >
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="asap" />
                      <span>Co nejdříve (do 2 týdnů)</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="month" />
                      <span>Během měsíce (2-4 týdny)</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="2months" />
                      <span>1-2 měsíce</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="flexible" />
                      <span>Nemám spěch (3+ měsíce)</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Jaká je vaše představa o rozpočtu? *</Label>
                  <RadioGroup
                    value={formData.budget}
                    onValueChange={(value) => setFormData({ ...formData, budget: value })}
                  >
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="10-30k" />
                      <span>10 000 - 30 000 Kč</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="30-60k" />
                      <span>30 000 - 60 000 Kč</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="60-100k" />
                      <span>60 000 - 100 000 Kč</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="100k+" />
                      <span>100 000+ Kč</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="unknown" />
                      <span>Nevím / Rád bych konzultaci</span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Jméno a příjmení *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jan Novák"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jan@priklad.cz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+420 123 456 789"
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    Odesláním souhlasíte se zpracováním osobních údajů podle{" "}
                    <a href="/ochrana-udaju" className="text-primary hover:underline">
                      GDPR
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zpět
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button onClick={handleNext} disabled={!isStepValid()} className="gap-2 ml-auto">
                  Pokračovat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="gap-2 ml-auto"
                >
                  <CheckCircle className="h-4 w-4" />
                  Odeslat poptávku
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help text */}
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
