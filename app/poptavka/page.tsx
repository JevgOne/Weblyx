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

// NEW: Project purposes
const projectPurposes = [
  { id: "portfolio", label: "Portfolio", desc: "Ukázka prací a referencí" },
  { id: "corporate", label: "Firemní prezentace", desc: "Prezentace firmy a služeb" },
  { id: "eshop", label: "E-shop", desc: "Prodej produktů online" },
  { id: "blog", label: "Blog / Magazín", desc: "Publikování článků a obsahu" },
  { id: "landing", label: "Landing page", desc: "Jedna stránka pro kampaň/produkt" },
  { id: "webapp", label: "Webová aplikace", desc: "Interaktivní aplikace" },
  { id: "booking", label: "Rezervační systém", desc: "Online objednávky a rezervace" },
  { id: "other", label: "Jiné", desc: "Vlastní typ projektu" },
];

// NEW: Main user actions
const mainActions = [
  "Číst informace",
  "Kontaktovat nás",
  "Objednat službu",
  "Koupit produkt",
  "Rezervovat termín",
  "Registrovat se / Přihlásit se",
  "Stáhnout soubory",
  "Zanechat recenzi",
  "Sledovat novinky",
  "Používat kalkulačku/nástroj",
];

// NEW: Common website sections
const commonSections = [
  "Domů / Homepage",
  "O nás / O mně",
  "Služby / Co nabízíme",
  "Portfolio / Reference",
  "Ceník",
  "Blog / Aktuality",
  "FAQ / Často kladené otázky",
  "Kontakt",
  "Galerie",
  "Tým / Kdo jsme",
  "Kariéra / Pracujte s námi",
  "Podmínky užití",
];

export default function QuotePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: "",
    projectTypeOther: "",
    projectGoal: "", // NOVÉ: Hlavní cíl projektu
    projectReason: "", // NOVÉ: Proč potřebujete web
    companyName: "",
    businessDescription: "",
    // EXTENDED: Business context
    existingWebsite: "",
    companySize: "",
    industry: "",
    ico: "", // NOVÉ: IČO
    address: "", // NOVÉ: Adresa
    yearsInBusiness: "", // NOVÉ: Kolik let podnikáte
    socialMedia: { // NOVÉ: Sociální sítě
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    customerAcquisition: "", // NOVÉ: Jak získáváte zákazníky teď
    usp: "", // NOVÉ: Co vás odlišuje od konkurence
    topCompetitors: [ // NOVÉ: Rozšířené info o konkurenci
      { url: "", notes: "" },
      { url: "", notes: "" },
      { url: "", notes: "" },
    ],
    // NEW: Extended project details
    projectDetails: {
      purpose: "",
      targetAudience: "",
      mainActions: [] as string[],
      sections: [] as string[],
      hasContent: "",
      contentNotes: "",
      competitors: ["", "", ""],
      projectPriority: "",
      hasDomain: "",
      hasHosting: "",
      // NOVÉ: Detaily projektu
      estimatedPages: "", // Odhadovaný počet stránek
      productsCount: "", // Počet produktů (eshop)
      paymentGateway: "", // Preferovaná platební brána
      needsInvoicing: "", // Potřebuje fakturační systém
      referenceWebsites: [ // Reference weby
        { url: "", whatYouLike: "" },
        { url: "", whatYouLike: "" },
      ],
    },
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
      // NOVÉ: Brand assets
      hasLogo: "", // yes/no/need-creation
      hasBrandManual: "", // yes/no
      hasPhotos: "", // yes/no/need-professional
      needsPhotoVideo: false, // Potřebuje profesionální foto/video
    },
    // NEW: Marketing & Technical
    marketingTech: {
      needsAnalytics: false,
      needsFacebookPixel: false,
      needsGoogleAds: false,
      integrations: [] as string[],
      languages: [] as string[],
      // NOVÉ: Marketing strategie
      plansPPC: "", // Plánuje PPC reklamu
      emailMarketing: "", // Email marketing strategie
      needsRetargeting: false,
      newsletterFrequency: "", // Frekvence newsletteru
    },
    budget: "",
    timeline: "",
    // NOVÉ: Budget details
    paymentPreference: "", // jednorázově/splátky
    monthlyMaintenance: "", // Měsíční rozpočet na údržbu
    marketingBudget: "", // Rozpočet na marketing
    name: "",
    email: "",
    phone: "",
    // NOVÉ: Extra info
    additionalRequirements: "", // Jakékoliv další požadavky
    howDidYouHear: "", // Odkud o nás víte
    preferredContact: "", // email/phone/meeting
    preferredMeetingTime: "", // Preferovaný čas schůzky
  });

  const totalSteps = 8; // 1-Type+Goal, 2-Business+Social, 3-Details+Competition, 4-Design+Brand, 5-Marketing, 6-Budget, 7-Contact, 8-Extra

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      console.log("Form submitted:", formData);

      // Submit to API endpoint
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Error saving lead:", data.error);
        alert(data.error || "Došlo k chybě při odesílání. Zkuste to prosím znovu.");
        return;
      }

      console.log("✅ Lead saved successfully:", data.leadId);
      router.push("/poptavka/dekujeme");
    } catch (error) {
      console.error("❌ Error saving lead:", error);
      alert("Došlo k chybě při odesílání. Zkuste to prosím znovu.");
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.projectType !== "" && formData.projectReason !== "" && formData.projectGoal !== "";
      case 2:
        return formData.companyName !== "" && formData.businessDescription !== "" && formData.industry !== "" && formData.usp !== "";
      case 3:
        // NEW: Project details - purpose and target audience required
        return (
          formData.projectDetails.purpose !== "" &&
          formData.projectDetails.targetAudience !== "" &&
          formData.projectDetails.mainActions.length > 0 &&
          formData.projectDetails.projectPriority !== ""
        );
      case 4:
        // Design step - style is required
        return formData.designPreferences.style !== "";
      case 5:
        // Marketing & Tech - at least one selection or skip
        return true; // Optional step
      case 6:
        return formData.budget !== "" && formData.timeline !== "";
      case 7:
        return formData.name !== "" && formData.email !== "";
      case 8:
        return true; // Extra info je optional
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
              {step === 3 && "Účel a cílová skupina"}
              {step === 4 && "Design & Preference"}
              {step === 5 && "Marketing & Technologie"}
              {step === 6 && "Časový rámec & Rozpočet"}
              {step === 7 && "Kontaktní údaje"}
              {step === 8 && "Závěrečné informace"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Typ projektu, důvod a hlavní cíl"}
              {step === 2 && "Detailní informace o vaší firmě, konkurenci a USP"}
              {step === 3 && "Pro koho je web, co budou dělat, priorita projektu"}
              {step === 4 && "Design, barvy, styl, brand assets"}
              {step === 5 && "Tracking, integrace, jazyky, marketing strategie"}
              {step === 6 && "Timeline, rozpočet, platba, měsíční náklady"}
              {step === 7 && "Jak se s vámi můžeme spojit"}
              {step === 8 && "Další požadavky a preference komunikace"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Project Type + Goal */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Typ projektu *</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectReason">Proč potřebujete nový web? *</Label>
                  <Textarea
                    id="projectReason"
                    value={formData.projectReason}
                    onChange={(e) => setFormData({ ...formData, projectReason: e.target.value })}
                    placeholder="Např. starý web je zastaralý, nefunguje na mobilu, potřebuji eshop..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectGoal">Jaký je hlavní cíl webu? *</Label>
                  <Textarea
                    id="projectGoal"
                    value={formData.projectGoal}
                    onChange={(e) => setFormData({ ...formData, projectGoal: e.target.value })}
                    placeholder="Např. zvýšit prodeje o 30%, získat 50 kontaktů měsíčně, informovat zákazníky..."
                    rows={3}
                  />
                </div>
              </div>
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

                <div className="space-y-2">
                  <Label htmlFor="industry">Odvětví / Obor podnikání *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Např. Zdraví & Fitness, E-commerce, IT služby, Marketing..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Velikost firmy</Label>
                  <RadioGroup
                    value={formData.companySize}
                    onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                  >
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="1-5" />
                      <span>1-5 zaměstnanců</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="6-20" />
                      <span>6-20 zaměstnanců</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="21-50" />
                      <span>21-50 zaměstnanců</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="50+" />
                      <span>50+ zaměstnanců</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingWebsite">Máte existující web? (URL)</Label>
                  <Input
                    id="existingWebsite"
                    type="url"
                    value={formData.existingWebsite}
                    onChange={(e) => setFormData({ ...formData, existingWebsite: e.target.value })}
                    placeholder="https://mujweb.cz"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pokud děláte redesign, zadejte URL aktuálního webu
                  </p>
                </div>

                {/* NOVÉ: IČO a Adresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ico">IČO (volitelné)</Label>
                    <Input
                      id="ico"
                      value={formData.ico}
                      onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsInBusiness">Kolik let podnikáte?</Label>
                    <Input
                      id="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                      placeholder="Např. 5 let, od 2018..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa firmy (volitelné)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ulice 123, 120 00 Praha 2"
                  />
                </div>

                {/* NOVÉ: Sociální sítě */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Sociální sítě (volitelné)</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Facebook URL (např. https://facebook.com/vase-stranka)"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="Instagram URL (např. https://instagram.com/vase_stranka)"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                      })}
                    />
                    <Input
                      placeholder="LinkedIn URL (např. https://linkedin.com/company/vase-firma)"
                      value={formData.socialMedia.linkedin}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {/* NOVÉ: USP a Customer Acquisition */}
                <div className="space-y-2">
                  <Label htmlFor="usp">Co vás odlišuje od konkurence? (USP) *</Label>
                  <Textarea
                    id="usp"
                    value={formData.usp}
                    onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
                    placeholder="Např. Jsme jediní kdo nabízí..., Máme 20 let zkušeností s..., Naše ceny jsou o 30% nižší..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAcquisition">Jak teď získáváte zákazníky?</Label>
                  <Textarea
                    id="customerAcquisition"
                    value={formData.customerAcquisition}
                    onChange={(e) => setFormData({ ...formData, customerAcquisition: e.target.value })}
                    placeholder="Např. Google reklama, doporučení, sociální sítě, veletrhy..."
                    rows={2}
                  />
                </div>

                {/* NOVÉ: Top 3 konkurenti s poznámkami */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Top 3 konkurenti</Label>
                  <p className="text-sm text-muted-foreground">
                    Zadejte weby vašich hlavních konkurentů a co se vám na nich líbí/nelíbí
                  </p>
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <Input
                        type="url"
                        value={formData.topCompetitors[index].url}
                        onChange={(e) => {
                          const newCompetitors = [...formData.topCompetitors];
                          newCompetitors[index].url = e.target.value;
                          setFormData({ ...formData, topCompetitors: newCompetitors });
                        }}
                        placeholder={`Konkurent ${index + 1}: https://...`}
                      />
                      <Textarea
                        value={formData.topCompetitors[index].notes}
                        onChange={(e) => {
                          const newCompetitors = [...formData.topCompetitors];
                          newCompetitors[index].notes = e.target.value;
                          setFormData({ ...formData, topCompetitors: newCompetitors });
                        }}
                        placeholder="Co se vám líbí/nelíbí na tomto konkurentovi?"
                        rows={2}
                      />
                    </div>
                  ))}
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

            {/* Step 3: NEW - Project Details (Purpose, Target Audience, Sections) */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Purpose */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Jaký je hlavní účel webu? *</Label>
                  <RadioGroup
                    value={formData.projectDetails.purpose}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        projectDetails: { ...formData.projectDetails, purpose: value },
                      })
                    }
                  >
                    <div className="grid gap-3">
                      {projectPurposes.map((purpose) => (
                        <Label
                          key={purpose.id}
                          htmlFor={`purpose-${purpose.id}`}
                          className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          <RadioGroupItem value={purpose.id} id={`purpose-${purpose.id}`} className="mt-1" />
                          <div className="flex-1">
                            <div className="font-medium">{purpose.label}</div>
                            <div className="text-sm text-muted-foreground">{purpose.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-base font-semibold">
                    Pro koho je web určený? (Cílová skupina) *
                  </Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.projectDetails.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectDetails: { ...formData.projectDetails, targetAudience: e.target.value },
                      })
                    }
                    placeholder="Např. mladí profesionálové 25-35 let, firmy v Praze, rodiče s dětmi..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Popište věk, zájmy, potřeby vaší cílové skupiny
                  </p>
                </div>

                {/* Main Actions */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Co budou návštěvníci na webu dělat? (vyberte min. 1) *
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mainActions.map((action) => (
                      <Label
                        key={action}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={formData.projectDetails.mainActions.includes(action)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                projectDetails: {
                                  ...formData.projectDetails,
                                  mainActions: [...formData.projectDetails.mainActions, action],
                                },
                              });
                            } else {
                              setFormData({
                                ...formData,
                                projectDetails: {
                                  ...formData.projectDetails,
                                  mainActions: formData.projectDetails.mainActions.filter(
                                    (a) => a !== action
                                  ),
                                },
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{action}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Jaké sekce/stránky by měl web obsahovat?
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {commonSections.map((section) => (
                      <Label
                        key={section}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={formData.projectDetails.sections.includes(section)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                projectDetails: {
                                  ...formData.projectDetails,
                                  sections: [...formData.projectDetails.sections, section],
                                },
                              });
                            } else {
                              setFormData({
                                ...formData,
                                projectDetails: {
                                  ...formData.projectDetails,
                                  sections: formData.projectDetails.sections.filter(
                                    (s) => s !== section
                                  ),
                                },
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{section}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {/* Content Availability */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Máte připravené texty a fotky?</Label>
                  <RadioGroup
                    value={formData.projectDetails.hasContent}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        projectDetails: { ...formData.projectDetails, hasContent: value },
                      })
                    }
                  >
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="yes" />
                      <span>Ano, mám vše připravené</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="partial" />
                      <span>Částečně (některé texty/fotky)</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="no" />
                      <span>Ne, potřebuji pomoc s obsahem</span>
                    </Label>
                  </RadioGroup>
                </div>

                {/* Content Notes */}
                <div className="space-y-2">
                  <Label htmlFor="contentNotes" className="text-base font-semibold">
                    Poznámky k obsahu (volitelné)
                  </Label>
                  <Textarea
                    id="contentNotes"
                    value={formData.projectDetails.contentNotes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectDetails: { ...formData.projectDetails, contentNotes: e.target.value },
                      })
                    }
                    placeholder="Např. potřebuji copywriting, mám fotky ale ne profesionální..."
                    rows={3}
                  />
                </div>

                {/* NEW: Competition Analysis */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Konkurenční weby (volitelné)</Label>
                  <p className="text-sm text-muted-foreground">
                    Zadejte URL 3 konkurenčních webů, které se vám líbí nebo se inspirujte
                  </p>
                  {[0, 1, 2].map((index) => (
                    <Input
                      key={index}
                      type="url"
                      value={formData.projectDetails.competitors[index]}
                      onChange={(e) => {
                        const newCompetitors = [...formData.projectDetails.competitors];
                        newCompetitors[index] = e.target.value;
                        setFormData({
                          ...formData,
                          projectDetails: { ...formData.projectDetails, competitors: newCompetitors },
                        });
                      }}
                      placeholder={`Konkurent ${index + 1}: https://...`}
                    />
                  ))}
                </div>

                {/* NEW: Project Priority */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Priorita projektu *</Label>
                  <RadioGroup
                    value={formData.projectDetails.projectPriority}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        projectDetails: { ...formData.projectDetails, projectPriority: value },
                      })
                    }
                  >
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="urgent" />
                      <div>
                        <div className="font-medium">Urgentní</div>
                        <div className="text-sm text-muted-foreground">Potřebuji to co nejdříve</div>
                      </div>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="normal" />
                      <div>
                        <div className="font-medium">Normální</div>
                        <div className="text-sm text-muted-foreground">Standardní časový rámec</div>
                      </div>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="flexible" />
                      <div>
                        <div className="font-medium">Flexibilní</div>
                        <div className="text-sm text-muted-foreground">Nemám pevný deadline</div>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                {/* NEW: Domain & Hosting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Máte doménu?</Label>
                    <RadioGroup
                      value={formData.projectDetails.hasDomain}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          projectDetails: { ...formData.projectDetails, hasDomain: value },
                        })
                      }
                    >
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="yes" />
                        <span>Ano, mám</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="no" />
                        <span>Ne, chci koupit</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="need-help" />
                        <span>Potřebuji poradit</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Máte hosting?</Label>
                    <RadioGroup
                      value={formData.projectDetails.hasHosting}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          projectDetails: { ...formData.projectDetails, hasHosting: value },
                        })
                      }
                    >
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="yes" />
                        <span>Ano, mám</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="no" />
                        <span>Ne, potřebuji</span>
                      </Label>
                      <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                        <RadioGroupItem value="need-help" />
                        <span>Potřebuji poradit</span>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Design & Preferences */}
            {step === 4 && (
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

            {/* Step 5: Marketing & Technical */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Tracking & Analytika</Label>
                  <p className="text-sm text-muted-foreground">
                    Vyberte nástroje, které potřebujete pro měření návštěvnosti a konverzí
                  </p>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.marketingTech.needsAnalytics}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            marketingTech: { ...formData.marketingTech, needsAnalytics: checked as boolean },
                          })
                        }
                      />
                      <span>Google Analytics 4</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.marketingTech.needsFacebookPixel}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            marketingTech: { ...formData.marketingTech, needsFacebookPixel: checked as boolean },
                          })
                        }
                      />
                      <span>Facebook Pixel / Meta Ads</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.marketingTech.needsGoogleAds}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            marketingTech: { ...formData.marketingTech, needsGoogleAds: checked as boolean },
                          })
                        }
                      />
                      <span>Google Ads konverze</span>
                    </Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Integrace třetích stran</Label>
                  <p className="text-sm text-muted-foreground">
                    Vyberte systémy, které potřebujete propojit
                  </p>
                  {["Platební brána (GoPay, Stripe...)", "Email marketing (Mailchimp, ActiveCampaign...)", "CRM systém (HubSpot, Pipedrive...)", "Rezervační systém", "Live chat", "Newsletter"].map((integration) => (
                    <Label key={integration} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.marketingTech.integrations.includes(integration)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              marketingTech: {
                                ...formData.marketingTech,
                                integrations: [...formData.marketingTech.integrations, integration],
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              marketingTech: {
                                ...formData.marketingTech,
                                integrations: formData.marketingTech.integrations.filter((i) => i !== integration),
                              },
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{integration}</span>
                    </Label>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Jazykové mutace</Label>
                  <p className="text-sm text-muted-foreground">
                    Vyberte jazyky, ve kterých chcete web provozovat
                  </p>
                  {["Čeština", "Angličtina", "Němčina", "Slovenština", "Polština", "Jiný jazyk"].map((lang) => (
                    <Label key={lang} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.marketingTech.languages.includes(lang)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              marketingTech: {
                                ...formData.marketingTech,
                                languages: [...formData.marketingTech.languages, lang],
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              marketingTech: {
                                ...formData.marketingTech,
                                languages: formData.marketingTech.languages.filter((l) => l !== lang),
                              },
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{lang}</span>
                    </Label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Timeline & Budget */}
            {step === 6 && (
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

            {/* Step 7: Contact Info */}
            {step === 7 && (
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

            {/* Step 8: Extra Info */}
            {step === 8 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="additionalRequirements">Jakékoliv další požadavky nebo poznámky</Label>
                  <Textarea
                    id="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                    placeholder="Např. potřebuji integrace s konkrétním systémem, speciální funkcionalitu..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="howDidYouHear">Jak jste se o nás dozvěděli?</Label>
                  <RadioGroup
                    value={formData.howDidYouHear}
                    onValueChange={(value) => setFormData({ ...formData, howDidYouHear: value })}
                  >
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="google" />
                      <span>Google vyhledávání</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="social" />
                      <span>Sociální sítě (Facebook, Instagram...)</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="recommendation" />
                      <span>Doporučení od známého</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="ad" />
                      <span>Reklama</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="other" />
                      <span>Jiné</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredContact">Preferovaný způsob komunikace</Label>
                  <RadioGroup
                    value={formData.preferredContact}
                    onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}
                  >
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="email" />
                      <span>Email</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="phone" />
                      <span>Telefon</span>
                    </Label>
                    <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                      <RadioGroupItem value="meeting" />
                      <span>Osobní schůzka / Online meeting</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredMeetingTime">Preferovaný čas pro první schůzku (volitelné)</Label>
                  <Input
                    id="preferredMeetingTime"
                    value={formData.preferredMeetingTime}
                    onChange={(e) => setFormData({ ...formData, preferredMeetingTime: e.target.value })}
                    placeholder="Např. pondělí 14:00-16:00, úterý dopoledne..."
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
