'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CalculatorData } from '@/lib/calculator/types';
import { HoneypotInput } from '@/components/security/HoneypotInput';
import { Calculator, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

interface StepContactProps {
  data: CalculatorData;
  onUpdate: (partial: Partial<CalculatorData>) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function StepContact({ data, onUpdate, onSubmit, onBack, isSubmitting }: StepContactProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim() || data.name.trim().length < 2) {
      newErrors.name = 'Zadejte vaše jméno (min. 2 znaky)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      newErrors.email = 'Zadejte emailovou adresu';
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    if (data.phone && !/^(\+420)?\s?\d{3}\s?\d{3}\s?\d{3}$/.test(data.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Neplatný formát telefonu';
    }

    if (!data.gdprConsent) {
      newErrors.gdpr = 'Souhlas se zpracováním údajů je povinný';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Kam poslat kalkulaci?
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Výsledek uvidíte ihned a zároveň vám ho pošleme na email.
      </p>

      <HoneypotInput />

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="calc-name" className="text-sm font-medium">
            Jméno <span className="text-red-500">*</span>
          </Label>
          <Input
            id="calc-name"
            type="text"
            placeholder="Jan Novák"
            value={data.name}
            onChange={(e) => {
              onUpdate({ name: e.target.value });
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="calc-email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="calc-email"
            type="email"
            placeholder="vas@email.cz"
            value={data.email}
            onChange={(e) => {
              onUpdate({ email: e.target.value });
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="calc-phone" className="text-sm font-medium">
            Telefon <span className="text-muted-foreground">(volitelné)</span>
          </Label>
          <Input
            id="calc-phone"
            type="tel"
            placeholder="+420 123 456 789"
            value={data.phone}
            onChange={(e) => {
              onUpdate({ phone: e.target.value });
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="calc-company" className="text-sm font-medium">
            Firma / Projekt <span className="text-muted-foreground">(volitelné)</span>
          </Label>
          <Input
            id="calc-company"
            type="text"
            placeholder="Název firmy nebo projektu"
            value={data.company}
            onChange={(e) => onUpdate({ company: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* GDPR Consent */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={data.gdprConsent}
              onCheckedChange={(checked) => {
                onUpdate({ gdprConsent: checked === true });
                if (errors.gdpr) setErrors((prev) => ({ ...prev, gdpr: '' }));
              }}
              className="mt-0.5"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              Souhlasím se zpracováním osobních údajů za účelem zpracování cenové kalkulace.{' '}
              <Link href="/ochrana-udaju" target="_blank" className="text-primary underline hover:no-underline">
                Ochrana údajů
              </Link>
            </span>
          </label>
          {errors.gdpr && <p className="text-xs text-red-500 mt-1 ml-7">{errors.gdpr}</p>}
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>Vaše údaje jsou v bezpečí. Nesdílíme je s třetími stranami.</span>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Zpět
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Počítám...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Zobrazit moji cenu
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
