"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Send, Phone, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { DesignPreference } from "@/types/cms";

const STEPS = [
  { id: 1, name: "Kontakt", description: "Základní informace" },
  { id: 2, name: "Projekt", description: "O vašem projektu" },
  { id: 3, name: "Design", description: "Designové preference (AI)" }
];

export function ContactAdvanced() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wantAIDesigns, setWantAIDesigns] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic
    name: "",
    email: "",
    phone: "",

    // Step 2: Project
    projectType: "",
    budget: "",
    message: "",

    // Step 3: Design (AI)
    industry: "",
    targetAudience: "",
    stylePreference: "" as DesignPreference['stylePreference'] | "",
    colorPreferences: [] as string[],
    inspirationUrls: "",
    requiredFeatures: [] as string[],
    contentReady: false,
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const colorOptions = [
    { value: "blue", label: "Modrá", hex: "#3B82F6" },
    { value: "green", label: "Zelená", hex: "#10B981" },
    { value: "red", label: "Červená", hex: "#EF4444" },
    { value: "purple", label: "Fialová", hex: "#8B5CF6" },
    { value: "orange", label: "Oranžová", hex: "#F59E0B" },
    { value: "pink", label: "Růžová", hex: "#EC4899" },
    { value: "black", label: "Černá", hex: "#000000" },
    { value: "white", label: "Bílá", hex: "#FFFFFF" },
  ];

  const featureOptions = [
    "Kontaktní formulář",
    "Galerie/Portfolio",
    "Blog/Novinky",
    "E-shop",
    "Rezervační systém",
    "Vícejazyčnost",
    "Přihlášení uživatelů",
    "Platební brána"
  ];

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colorPreferences: prev.colorPreferences.includes(color)
        ? prev.colorPreferences.filter(c => c !== color)
        : [...prev.colorPreferences, color]
    }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      requiredFeatures: prev.requiredFeatures.includes(feature)
        ? prev.requiredFeatures.filter(f => f !== feature)
        : [...prev.requiredFeatures, feature]
    }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.name && formData.email;
    }
    if (currentStep === 2) {
      return formData.projectType && formData.message;
    }
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;

    // Skip step 3 if user doesn't want AI designs
    if (currentStep === 2 && !wantAIDesigns) {
      handleSubmit();
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const designPreferences: DesignPreference | undefined = wantAIDesigns && currentStep === 3 ? {
        industry: formData.industry,
        targetAudience: formData.targetAudience,
        stylePreference: formData.stylePreference as DesignPreference['stylePreference'],
        colorPreferences: formData.colorPreferences,
        inspirationUrls: formData.inspirationUrls.split('\n').filter(url => url.trim()),
        requiredFeatures: formData.requiredFeatures,
        contentReady: formData.contentReady,
        additionalNotes: formData.additionalNotes
      } : undefined;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          projectType: formData.projectType,
          budget: formData.budget,
          message: formData.message,
          designPreferences,
          generateAIDesigns: wantAIDesigns && currentStep === 3
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Něco se pokazilo");
      }

      setSubmitStatus({
        type: "success",
        message: wantAIDesigns && currentStep === 3
          ? "Děkujeme! Generujeme 3 návrhy designu pomocí AI. Ozveme se vám do 24 hodin s návrhy."
          : "Děkujeme za vaši zprávu! Ozveme se vám do 24 hodin."
      });

      // Reset form
      setTimeout(() => {
        setCurrentStep(1);
        setWantAIDesigns(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          projectType: "",
          budget: "",
          message: "",
          industry: "",
          targetAudience: "",
          stylePreference: "",
          colorPreferences: [],
          inspirationUrls: "",
          requiredFeatures: [],
          contentReady: false,
          additionalNotes: "",
        });
      }, 5000);

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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Napište nám
          </h2>
          <p className="text-lg text-muted-foreground">
            Nezávazně nás kontaktujte a my vám do 24 hodin odpovíme
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
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a
                      href="mailto:weblyxinfo@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      weblyxinfo@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
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
                    <h3 className="font-semibold mb-1">Adresa</h3>
                    <p className="text-muted-foreground">
                      Praha, Česká republika
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="font-semibold">Otevírací doba</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Po - Pá: 9:00 - 18:00</p>
                <p>So - Ne: Zavřeno</p>
              </div>
            </div>

            {/* AI Design Feature Badge */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">AI Design Generator</p>
                    <p className="text-xs text-muted-foreground">
                      Vyplňte pokročilý formulář a AI vám vygeneruje 3 unikátní návrhy designu vašeho webu
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  {/* Progress Steps */}
                  <div className="flex items-center justify-between">
                    {STEPS.map((step, index) => (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`
                            h-10 w-10 rounded-full flex items-center justify-center font-semibold
                            ${currentStep >= step.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'}
                          `}>
                            {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-sm font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                          </div>
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className={`h-1 flex-1 mx-2 rounded ${
                            currentStep > step.id ? 'bg-primary' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <form className="space-y-6">
                  {/* Step 1: Contact Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      <CardTitle>Základní informace</CardTitle>

                      <div className="space-y-2">
                        <Label htmlFor="name">Jméno a příjmení *</Label>
                        <Input
                          id="name"
                          placeholder="Jan Novák"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="jan@priklad.cz"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+420 123 456 789"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Project Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      <CardTitle>O vašem projektu</CardTitle>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="projectType">Typ projektu *</Label>
                          <Select
                            value={formData.projectType}
                            onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                          >
                            <SelectTrigger id="projectType">
                              <SelectValue placeholder="Vyberte typ projektu" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="web">Webové stránky</SelectItem>
                              <SelectItem value="eshop">E-shop</SelectItem>
                              <SelectItem value="redesign">Redesign</SelectItem>
                              <SelectItem value="seo">SEO optimalizace</SelectItem>
                              <SelectItem value="other">Jiné</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="budget">Orientační rozpočet</Label>
                          <Select
                            value={formData.budget}
                            onValueChange={(value) => setFormData({ ...formData, budget: value })}
                          >
                            <SelectTrigger id="budget">
                              <SelectValue placeholder="Vyberte rozpočet" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10-20k">10 000 - 20 000 Kč</SelectItem>
                              <SelectItem value="20-50k">20 000 - 50 000 Kč</SelectItem>
                              <SelectItem value="50-100k">50 000 - 100 000 Kč</SelectItem>
                              <SelectItem value="100k+">100 000+ Kč</SelectItem>
                              <SelectItem value="flexible">Flexibilní</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Popište váš projekt *</Label>
                        <Textarea
                          id="message"
                          placeholder="Např. Potřebuji moderní web pro malou kavárnu v Praze. Chceme tam menu, fotogalerii a kontakt..."
                          rows={6}
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>

                      {/* AI Design Option */}
                      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="wantAI"
                              checked={wantAIDesigns}
                              onCheckedChange={(checked) => setWantAIDesigns(checked as boolean)}
                            />
                            <div className="space-y-1">
                              <Label htmlFor="wantAI" className="cursor-pointer font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Chci AI návrhy designu (doporučeno)
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                AI vygeneruje 3 unikátní designové varianty vašeho webu na míru.
                                Zabere to jen 2 minuty navíc.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Step 3: Design Preferences (AI) */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>Designové preference pro AI</CardTitle>
                      </div>
                      <CardDescription>
                        Tyto informace pomohou AI vygenerovat 3 perfektní návrhy designu pro váš web
                      </CardDescription>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="industry">Vaše odvětví/obor *</Label>
                          <Input
                            id="industry"
                            placeholder="např. Kavárna, IT firma, E-shop s módou"
                            required
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="targetAudience">Cílová skupina *</Label>
                          <Input
                            id="targetAudience"
                            placeholder="např. Mladí profesionálové 25-40 let"
                            required
                            value={formData.targetAudience}
                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stylePreference">Preferovaný styl *</Label>
                        <Select
                          value={formData.stylePreference}
                          onValueChange={(value) => setFormData({ ...formData, stylePreference: value as DesignPreference['stylePreference'] })}
                        >
                          <SelectTrigger id="stylePreference">
                            <SelectValue placeholder="Vyberte preferovaný styl" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimalist">Minimalistický - čistý, jednoduché</SelectItem>
                            <SelectItem value="modern">Moderní - trendy, inovativní</SelectItem>
                            <SelectItem value="classic">Klasický - časeless, profesionální</SelectItem>
                            <SelectItem value="bold">Odvážný - výrazný, kreativní</SelectItem>
                            <SelectItem value="elegant">Elegantní - luxusní, sofistikovaný</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Barevné preference (vyberte 1-3)</Label>
                        <div className="grid grid-cols-4 gap-3">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => toggleColor(color.value)}
                              className={`
                                relative p-3 rounded-lg border-2 transition-all
                                ${formData.colorPreferences.includes(color.value)
                                  ? 'border-primary ring-2 ring-primary/20'
                                  : 'border-border hover:border-primary/50'}
                              `}
                            >
                              <div
                                className="w-full h-12 rounded mb-2"
                                style={{ backgroundColor: color.hex }}
                              />
                              <p className="text-xs font-medium">{color.label}</p>
                              {formData.colorPreferences.includes(color.value) && (
                                <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Potřebné funkce (vyberte všechny)</Label>
                        <div className="grid md:grid-cols-2 gap-3">
                          {featureOptions.map((feature) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <Checkbox
                                id={`feature-${feature}`}
                                checked={formData.requiredFeatures.includes(feature)}
                                onCheckedChange={() => toggleFeature(feature)}
                              />
                              <Label htmlFor={`feature-${feature}`} className="cursor-pointer text-sm">
                                {feature}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inspirationUrls">Inspirace - weby co se vám líbí (1 URL na řádek)</Label>
                        <Textarea
                          id="inspirationUrls"
                          placeholder="https://priklad1.cz&#10;https://priklad2.com"
                          rows={3}
                          value={formData.inspirationUrls}
                          onChange={(e) => setFormData({ ...formData, inspirationUrls: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="contentReady"
                          checked={formData.contentReady}
                          onCheckedChange={(checked) => setFormData({ ...formData, contentReady: checked as boolean })}
                        />
                        <Label htmlFor="contentReady" className="cursor-pointer text-sm">
                          Mám připravený obsah (texty, fotky, logo)
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalNotes">Další poznámky</Label>
                        <Textarea
                          id="additionalNotes"
                          placeholder="Cokoliv dalšího, co by AI měla vědět..."
                          rows={3}
                          value={formData.additionalNotes}
                          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {submitStatus.type && (
                    <div
                      className={`p-4 rounded-lg ${
                        submitStatus.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Zpět
                    </Button>

                    {(currentStep < 3 || !wantAIDesigns) ? (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                      >
                        {currentStep === 2 && !wantAIDesigns ? (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Odesílání..." : "Odeslat"}
                          </>
                        ) : (
                          <>
                            Další
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.industry || !formData.targetAudience || !formData.stylePreference}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Generuji AI návrhy..." : "Vygenerovat AI návrhy"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
