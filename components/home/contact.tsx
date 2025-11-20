"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Send } from "lucide-react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

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
        message: data.message || "Děkujeme za vaši zprávu!",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        projectType: "",
        budget: "",
        message: "",
      });
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
                      href="mailto:info@weblyx.cz"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      info@weblyx.cz
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
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Jméno a příjmení *
                      </label>
                      <Input
                        id="name"
                        placeholder="Jan Novák"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jan@priklad.cz"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Telefon
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+420 123 456 789"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="projectType"
                        className="text-sm font-medium"
                      >
                        Typ projektu *
                      </label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, projectType: value })
                        }
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

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="budget" className="text-sm font-medium">
                        Orientační rozpočet
                      </label>
                      <Select
                        value={formData.budget}
                        onValueChange={(value) =>
                          setFormData({ ...formData, budget: value })
                        }
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

                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Zpráva *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Popište nám váš projekt..."
                        rows={6}
                        required
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {submitStatus.type && (
                    <div
                      className={`p-4 rounded-lg ${
                        submitStatus.type === "success"
                          ? "bg-cyan-50 text-cyan-800 border border-cyan-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isSubmitting ? "Odesílání..." : "Odeslat zprávu"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
