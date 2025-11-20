"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Mail,
  MapPin,
  Phone,
  User,
  Briefcase,
  DollarSign,
  MessageSquare,
  Send,
  Sparkles,
  Check,
  ArrowRight
} from "lucide-react";

const formFields = [
  { id: "name", label: "Jméno a příjmení", icon: User, placeholder: "Jan Novák", type: "text", required: true },
  { id: "email", label: "Email", icon: Mail, placeholder: "jan@priklad.cz", type: "email", required: true },
  { id: "phone", label: "Telefon", icon: Phone, placeholder: "+420 123 456 789", type: "tel", required: false },
  { id: "projectType", label: "Typ projektu", icon: Briefcase, type: "select", required: true },
  { id: "budget", label: "Rozpočet", icon: DollarSign, type: "select", required: false },
  { id: "message", label: "Zpráva", icon: MessageSquare, placeholder: "Popište nám váš projekt...", type: "textarea", required: true },
];

export function ContactWow() {
  const [currentField, setCurrentField] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const progress = ((currentField + 1) / formFields.length) * 100;

  const validateField = (fieldId: string, value: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (!field) return "";

    if (field.required && !value.trim()) {
      return "Toto pole je povinné";
    }

    if (fieldId === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Neplatný formát emailu";
      }
    }

    return "";
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => ({ ...prev, [fieldId]: "" }));
  };

  const handleNext = () => {
    const field = formFields[currentField];
    const error = validateField(field.id, formData[field.id as keyof typeof formData]);

    if (error) {
      setErrors(prev => ({ ...prev, [field.id]: error }));
      return;
    }

    if (currentField < formFields.length - 1) {
      setCurrentField(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentField > 0) {
      setCurrentField(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    formFields.forEach(field => {
      const error = validateField(field.id, formData[field.id as keyof typeof formData]);
      if (error) newErrors[field.id] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Něco se pokazilo");
      }

      // Success! 🎉
      setIsSuccess(true);

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setCurrentField(0);
        setFormData({
          name: "",
          email: "",
          phone: "",
          projectType: "",
          budget: "",
          message: "",
        });
      }, 3000);

    } catch (error) {
      setErrors({ submit: "Došlo k chybě při odesílání. Zkuste to prosím znovu." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (currentField === formFields.length - 1) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const renderField = (field: typeof formFields[0]) => {
    const Icon = field.icon;
    const value = formData[field.id as keyof typeof formData];
    const error = errors[field.id];

    if (field.type === "select") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger className="h-14 border-2 focus:border-primary transition-all">
              <SelectValue placeholder={`Vyberte ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.id === "projectType" ? (
                <>
                  <SelectItem value="web">Webové stránky</SelectItem>
                  <SelectItem value="eshop">E-shop</SelectItem>
                  <SelectItem value="redesign">Redesign</SelectItem>
                  <SelectItem value="seo">SEO optimalizace</SelectItem>
                  <SelectItem value="other">Jiné</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="10-20k">10 000 - 20 000 Kč</SelectItem>
                  <SelectItem value="20-50k">20 000 - 50 000 Kč</SelectItem>
                  <SelectItem value="50-100k">50 000 - 100 000 Kč</SelectItem>
                  <SelectItem value="100k+">100 000+ Kč</SelectItem>
                  <SelectItem value="flexible">Flexibilní</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
            className="border-2 focus:border-primary transition-all resize-none"
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        <Input
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => handleFieldChange(field.id, e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-14 border-2 focus:border-primary transition-all"
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  };

  if (isSuccess) {
    return (
      <section id="contact" className="relative py-16 md:py-24 px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 animate-gradient" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>

            <div>
              <h2 className="text-4xl font-bold mb-2">Děkujeme! 🎉</h2>
              <p className="text-xl text-muted-foreground">
                Vaše zpráva byla úspěšně odeslána
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Ozveme se vám do 24 hodin
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 animate-gradient" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Napište nám
          </h2>
          <p className="text-lg text-muted-foreground">
            Nezávazně nás kontaktujte a my vám do 24 hodin odpovíme
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="backdrop-blur-sm bg-card/50 border-2">
              <div className="p-6 space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4"
                >
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
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4"
                >
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
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Adresa</h3>
                    <p className="text-muted-foreground">
                      Praha, Česká republika
                    </p>
                  </div>
                </motion.div>
              </div>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 border-2">
              <div className="p-4">
                <h3 className="font-semibold mb-2">Otevírací doba</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Po - Pá: 9:00 - 18:00</p>
                  <p>So - Ne: Zavřeno</p>
                </div>
              </div>
            </Card>

            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="backdrop-blur-sm bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/20">
                <div className="p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold mb-1">AI Design Generator</p>
                    <p className="text-xs text-muted-foreground">
                      Po odeslání vám AI vygeneruje 3 unikátní návrhy designu
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-card/50 border-2">
                <div className="p-6 space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Krok {currentField + 1} z {formFields.length}</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Current Field */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentField}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderField(formFields[currentField])}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentField === 0}
                      className="min-w-24"
                    >
                      Zpět
                    </Button>

                    {currentField === formFields.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="min-w-32 gap-2"
                      >
                        {isSubmitting ? (
                          "Odesílám..."
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Odeslat
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        className="min-w-32 gap-2"
                      >
                        Další
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Keyboard hint */}
                  <p className="text-xs text-center text-muted-foreground">
                    💡 Tip: Použijte Enter pro přechod na další pole
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </section>
  );
}
