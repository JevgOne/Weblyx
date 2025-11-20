"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle, Palette, Sparkles, Layout, Target } from "lucide-react";

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

// Design styles
const designStyles = [
  { id: "modern-minimal", label: "Moderní & Minimalistický", desc: "Čisté linie, hodně bílého prostoru" },
  { id: "classic-elegant", label: "Klasický & Elegantní", desc: "Nadčasový, profesionální vzhled" },
  { id: "creative-bold", label: "Kreativní & Odvážný", desc: "Výrazné barvy, unikátní design" },
  { id: "professional-corporate", label: "Profesionální & Korporátní", desc: "Důvěryhodný, seriózní" },
  { id: "playful-colorful", label: "Hravý & Barevný", desc: "Veselý, přátelský" },
  { id: "dont-know", label: "Nevím / Poraďte mi", desc: "Potřebuji konzultaci" },
];

// Must-have features for design step
const mustHaveFeatures = [
  "Přehledná navigace",
  "Mobilní responzivita",
  "Rychlé načítání",
  "SEO optimalizace",
  "Integrace sociálních sítí",
  "Kontaktní formulář",
  "Online chat",
  "Newsletter",
  "Blog/Aktuality",
  "E-shop funkcionalita",
  "Rezervační systém",
  "Uživatelské účty",
  "Vícejazyčnost",
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
    designPreferences: {
      colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        noPreference: false,
      },
      inspiration: "",
      style: "",
      mustHave: [] as string[],
      expectations: "",
    },
    budget: "",
    timeline: "",
    name: "",
    email: "",
    phone: "",
  });

  const totalSteps = 5; // Extended to include design step

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      console.log("Form submitted:", formData);

      // Uložit do Firestore
      const leadRef = await db.collection("leads").add({
        ...formData,
        status: "new",
        createdAt: new Date().toISOString(),
        source: "questionnaire",
      });

      console.log("✅ Lead saved to Firestore");

      // Trigger AI design generation in background
      // This runs asynchronously and doesn't block the user flow
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      fetch(`${siteUrl}/api/leads/${leadRef.id}/generate-design`, {
        method: "POST",
      })
        .then((res) => {
          if (res.ok) {
            console.log("✅ AI design generation triggered successfully");
          } else {
            console.error("⚠️ AI design generation failed:", res.statusText);
          }
        })
        .catch((err) => {
          console.error("⚠️ AI design generation error:", err);
          // Don't block user flow on AI generation failure
        });

      router.push("/poptavka/dekujeme");
    } catch (error) {
      console.error("❌ Error saving lead:", error);
      // V produkci by zde měla být nějaká error notifikace
      // Pro účely demo pokračujeme dál
      router.push("/poptavka/dekujeme");
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.projectType !== "";
      case 2:
        return formData.companyName !== "" && formData.businessDescription !== "";
      case 3:
        // Design step - style is required
        return formData.designPreferences.style !== "";
      case 4:
        return formData.budget !== "" && formData.timeline !== "";
      case 5:
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
              {step === 3 && "Design & Preference"}
              {step === 4 && "Časový rámec & Rozpočet"}
              {step === 5 && "Kontaktní údaje"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Vyberte typ projektu, který potřebujete"}
              {step === 2 && "Řekněte nám více o vašem podnikání"}
              {step === 3 && "Jak by měl váš web vypadat a co by měl umět?"}
              {step === 4 && "Kdy potřebujete web a jaký je váš rozpočet"}
              {step === 5 && "Jak se s vámi můžeme spojit"}
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

            {/* Step 3: Design & Preferences */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Color Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Preferované barvy</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="text-sm">
                        Hlavní barva
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="primaryColor"
                          type="color"
                          value={formData.designPreferences.colors.primary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              designPreferences: {
                                ...formData.designPreferences,
                                colors: {
                                  ...formData.designPreferences.colors,
                                  primary: e.target.value,
                                },
                              },
                            })
                          }
                          disabled={formData.designPreferences.colors.noPreference}
                          className="w-16 h-16 rounded-lg border-2 cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <Input
                            value={formData.designPreferences.colors.primary}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                designPreferences: {
                                  ...formData.designPreferences,
                                  colors: {
                                    ...formData.designPreferences.colors,
                                    primary: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={formData.designPreferences.colors.noPreference}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor" className="text-sm">
                        Doplňková barva
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="secondaryColor"
                          type="color"
                          value={formData.designPreferences.colors.secondary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              designPreferences: {
                                ...formData.designPreferences,
                                colors: {
                                  ...formData.designPreferences.colors,
                                  secondary: e.target.value,
                                },
                              },
                            })
                          }
                          disabled={formData.designPreferences.colors.noPreference}
                          className="w-16 h-16 rounded-lg border-2 cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <Input
                            value={formData.designPreferences.colors.secondary}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                designPreferences: {
                                  ...formData.designPreferences,
                                  colors: {
                                    ...formData.designPreferences.colors,
                                    secondary: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={formData.designPreferences.colors.noPreference}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accentColor" className="text-sm">
                        Akcentová barva
                      </Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="accentColor"
                          type="color"
                          value={formData.designPreferences.colors.accent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              designPreferences: {
                                ...formData.designPreferences,
                                colors: {
                                  ...formData.designPreferences.colors,
                                  accent: e.target.value,
                                },
                              },
                            })
                          }
                          disabled={formData.designPreferences.colors.noPreference}
                          className="w-16 h-16 rounded-lg border-2 cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <Input
                            value={formData.designPreferences.colors.accent}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                designPreferences: {
                                  ...formData.designPreferences,
                                  colors: {
                                    ...formData.designPreferences.colors,
                                    accent: e.target.value,
                                  },
                                },
                              })
                            }
                            disabled={formData.designPreferences.colors.noPreference}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <Checkbox
                      checked={formData.designPreferences.colors.noPreference}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          designPreferences: {
                            ...formData.designPreferences,
                            colors: {
                              ...formData.designPreferences.colors,
                              noPreference: checked as boolean,
                            },
                          },
                        })
                      }
                    />
                    <span className="text-sm">Nevím, nechám na vás</span>
                  </Label>
                </div>

                {/* Inspiration */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <Label htmlFor="inspiration" className="text-base font-semibold">
                      Inspirace
                    </Label>
                  </div>
                  <Textarea
                    id="inspiration"
                    value={formData.designPreferences.inspiration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designPreferences: {
                          ...formData.designPreferences,
                          inspiration: e.target.value,
                        },
                      })
                    }
                    placeholder="Máte nějaké weby, které se vám líbí? (URL nebo popis)&#10;např. www.example.com - líbí se mi čistý design"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Uveďte URL nebo popište, co se vám líbí na jiných webech
                  </p>
                </div>

                {/* Style Preference */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Styl webu *</Label>
                  </div>
                  <RadioGroup
                    value={formData.designPreferences.style}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        designPreferences: {
                          ...formData.designPreferences,
                          style: value,
                        },
                      })
                    }
                  >
                    <div className="grid gap-3">
                      {designStyles.map((style) => (
                        <Label
                          key={style.id}
                          htmlFor={style.id}
                          className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <RadioGroupItem value={style.id} id={style.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Must-Have Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Co musí web umět?</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mustHaveFeatures.map((feature) => (
                      <Label
                        key={feature}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={formData.designPreferences.mustHave.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                designPreferences: {
                                  ...formData.designPreferences,
                                  mustHave: [...formData.designPreferences.mustHave, feature],
                                },
                              });
                            } else {
                              setFormData({
                                ...formData,
                                designPreferences: {
                                  ...formData.designPreferences,
                                  mustHave: formData.designPreferences.mustHave.filter(
                                    (f) => f !== feature
                                  ),
                                },
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{feature}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Expectations */}
                <div className="space-y-2">
                  <Label htmlFor="expectations" className="text-base font-semibold">
                    Co od webu očekáváte?
                  </Label>
                  <Textarea
                    id="expectations"
                    value={formData.designPreferences.expectations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designPreferences: {
                          ...formData.designPreferences,
                          expectations: e.target.value,
                        },
                      })
                    }
                    placeholder="Chci, aby web přiváděl nové zákazníky a působil profesionálně..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Popište, co je pro vás u webu nejdůležitější
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Timeline & Budget */}
            {step === 4 && (
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

            {/* Step 5: Contact Info */}
            {step === 5 && (
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
                <Button variant="outline" onClick={handleNext} disabled={!isStepValid()} className="gap-2 ml-auto">
                  Pokračovat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
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
