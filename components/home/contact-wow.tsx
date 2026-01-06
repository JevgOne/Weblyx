"use client";

import { useState, useEffect } from "react";
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
import { useTranslations } from 'next-intl';

export function ContactWow() {
  const t = useTranslations('contactForm.contactWow');

  const formFields = [
    { id: "name", label: t('fields.name'), icon: User, placeholder: t('fields.namePlaceholder'), type: "text", required: true },
    { id: "email", label: t('fields.email'), icon: Mail, placeholder: t('fields.emailPlaceholder'), type: "email", required: true },
    { id: "phone", label: t('fields.phone'), icon: Phone, placeholder: t('fields.phonePlaceholder'), type: "tel", required: false },
    { id: "projectType", label: t('fields.projectType'), icon: Briefcase, type: "select", required: true },
    { id: "budget", label: t('fields.budget'), icon: DollarSign, type: "select", required: false },
    { id: "message", label: t('fields.message'), icon: MessageSquare, placeholder: t('fields.messagePlaceholder'), type: "textarea", required: true },
  ];

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

  // Trigger confetti when success screen appears
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const validateField = (fieldId: string, value: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (!field) return "";

    if (field.required && !value.trim()) {
      return t('errors.fieldRequired');
    }

    if (fieldId === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return t('errors.invalidEmail');
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
        throw new Error(t('errors.somethingWrong'));
      }

      // Success! 🎉
      setIsSuccess(true);

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
      setErrors({ submit: t('errors.sendingError') });
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
              <SelectValue placeholder={`${t('selectPlaceholder')} ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.id === "projectType" ? (
                <>
                  <SelectItem value="web">{t('projectTypes.web')}</SelectItem>
                  <SelectItem value="eshop">{t('projectTypes.eshop')}</SelectItem>
                  <SelectItem value="redesign">{t('projectTypes.redesign')}</SelectItem>
                  <SelectItem value="seo">{t('projectTypes.seo')}</SelectItem>
                  <SelectItem value="other">{t('projectTypes.other')}</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="10-20k">{t('budgetRanges.10-20k')}</SelectItem>
                  <SelectItem value="20-50k">{t('budgetRanges.20-50k')}</SelectItem>
                  <SelectItem value="50-100k">{t('budgetRanges.50-100k')}</SelectItem>
                  <SelectItem value="100k+">{t('budgetRanges.100k+')}</SelectItem>
                  <SelectItem value="flexible">{t('budgetRanges.flexible')}</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {error && (
            <p
              className="text-sm text-red-500"
            >
              {error}
            </p>
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
            <p
              className="text-sm text-red-500"
            >
              {error}
            </p>
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
          <p
            className="text-sm text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    );
  };

  if (isSuccess) {
    return (
      <section id="contact" className="relative py-16 md:py-24 px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/3 animate-gradient" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <div
            className="text-center space-y-6"
          >
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 shadow-2xl"
            >
              <Check className="w-12 h-12 text-white" />
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-2">{t('success.title')}</h2>
              <p className="text-xl text-muted-foreground">
                {t('success.message')}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                {t('success.followUp')}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/3 animate-gradient" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div
            className="space-y-6"
          >
            <Card className="backdrop-blur-sm bg-card/50 border-2">
              <div className="p-6 space-y-6">
                <div
                  className="flex items-start gap-4"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.email')}</h3>
                    <a
                      href="mailto:info@weblyx.cz"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      info@weblyx.cz
                    </a>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.phone')}</h3>
                    <a
                      href="tel:+420702110166"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      +420 702 110 166
                    </a>
                  </div>
                </div>

                <div
                  className="flex items-start gap-4"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t('contact.address')}</h3>
                    <p className="text-muted-foreground">
                      {t('contact.addressValue')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="backdrop-blur-sm bg-card/50 border-2">
              <div className="p-4">
                <h3 className="font-semibold mb-2">{t('contact.hours')}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{t('contact.weekdays')}</p>
                  <p>{t('contact.weekend')}</p>
                </div>
              </div>
            </Card>

          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div
            >
              <Card className="backdrop-blur-sm bg-card/50 border-2">
                <div className="p-6 space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{t('progress.step')} {currentField + 1} {t('progress.of')} {formFields.length}</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                  </div>

                  {/* Current Field */}
                  <div
                    key={currentField}
                  >
                    {renderField(formFields[currentField])}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentField === 0}
                      className="min-w-24"
                    >
                      {t('buttons.back')}
                    </Button>

                    {currentField === formFields.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="min-w-32 gap-2"
                      >
                        {isSubmitting ? (
                          t('buttons.sending')
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {t('buttons.submit')}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleNext}
                        className="min-w-32 gap-2"
                      >
                        {t('buttons.next')}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Keyboard hint */}
                  <p className="text-xs text-center text-muted-foreground">
                    {t('keyboardHint')}
                  </p>
                </div>
              </Card>
            </div>
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
