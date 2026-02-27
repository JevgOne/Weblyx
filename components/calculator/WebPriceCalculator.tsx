'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';
import { CalculatorStep } from './CalculatorStep';
import { StepProjectType } from './steps/StepProjectType';
import { StepAddons } from './steps/StepAddons';
import { StepContact } from './steps/StepContact';
import { StepResult } from './steps/StepResult';
import {
  CalculatorData,
  PackageResult,
  INITIAL_CALCULATOR_DATA,
} from '@/lib/calculator/types';

interface WebPriceCalculatorProps {
  embedded?: boolean;
}

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Balíček', 'Doplňky', 'Kontakt', 'Doporučení'];

export function WebPriceCalculator({ embedded = false }: WebPriceCalculatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [data, setData] = useState<CalculatorData>(INITIAL_CALCULATOR_DATA);
  const [priceResult, setPriceResult] = useState<PackageResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const stepKey = useRef(0);

  const goNext = useCallback(() => {
    setDirection('forward');
    stepKey.current++;
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    trackStep(currentStep + 1);
  }, [currentStep]);

  const goBack = useCallback(() => {
    setDirection('backward');
    stepKey.current++;
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const updateData = useCallback((partial: Partial<CalculatorData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const form = document.querySelector('form');
      const formData = form ? new FormData(form) : new FormData();
      const honeypotFields: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (key !== '__form_timestamp' && typeof value === 'string') {
          honeypotFields[key] = value;
        }
      });

      const timestamp = formData.get('__form_timestamp');

      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...honeypotFields,
          __form_timestamp: timestamp ? Number(timestamp) : undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Došlo k chybě. Zkuste to znovu.');
        return;
      }

      setPriceResult(result.priceResult);
      setDirection('forward');
      stepKey.current++;
      setCurrentStep(TOTAL_STEPS);

      trackConversion(result.priceResult);
    } catch {
      setError('Nepodařilo se spojit se serverem. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  }, [data]);

  const progressPercent = currentStep === TOTAL_STEPS
    ? 100
    : ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <section
      id="web-calculator"
      className={embedded ? 'py-20 md:py-28' : ''}
    >
      <div className={`${embedded ? 'container mx-auto px-4' : ''} max-w-2xl ${embedded ? 'mx-auto' : ''}`}>
        {/* Header - only in embedded mode */}
        {embedded && (
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Interaktivní kalkulačka
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Kolik bude stát váš web?
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Odpovězte na 3 otázky a zjistíte doporučený balíček i cenu.
            </p>
          </div>
        )}

        {/* Progress */}
        {currentStep < TOTAL_STEPS && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Krok {currentStep} z {TOTAL_STEPS - 1}
              </span>
              <span className="text-xs text-muted-foreground">
                {STEP_LABELS[currentStep - 1]}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Card with steps */}
        <Card className="shadow-lg border-border/50">
          <CardContent className="p-5 md:p-8">
            <form onSubmit={(e) => e.preventDefault()}>
              <CalculatorStep key={stepKey.current} direction={direction}>
                {currentStep === 1 && (
                  <StepProjectType data={data} onUpdate={updateData} onNext={goNext} />
                )}
                {currentStep === 2 && (
                  <StepAddons data={data} onUpdate={updateData} onNext={goNext} onBack={goBack} />
                )}
                {currentStep === 3 && (
                  <StepContact
                    data={data}
                    onUpdate={updateData}
                    onSubmit={handleSubmit}
                    onBack={goBack}
                    isSubmitting={isSubmitting}
                  />
                )}
                {currentStep === 4 && priceResult && (
                  <StepResult priceResult={priceResult} data={data} />
                )}
              </CalculatorStep>

              {error && (
                <p className="text-sm text-red-500 text-center mt-4">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Social proof below card */}
        {currentStep < TOTAL_STEPS && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Kalkulace je nezávazná a zdarma
          </p>
        )}
      </div>
    </section>
  );
}

function trackStep(step: number) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.gtag) {
    w.gtag('event', 'calculator_step', {
      event_category: 'Calculator',
      step_number: step,
      step_name: STEP_LABELS[step - 1] || '',
    });
  }
}

function trackConversion(result: PackageResult) {
  if (typeof window === 'undefined') return;
  const w = window as any;

  if (w.gtag) {
    w.gtag('event', 'generate_lead', {
      currency: 'CZK',
      value: result.price,
    });
    w.gtag('event', 'calculator_complete', {
      event_category: 'Lead',
      value: result.price,
    });
  }

  if (w.fbq) {
    w.fbq('track', 'Lead');
    w.fbq('trackCustom', 'CalculatorComplete', {
      package: result.packageName,
      price: result.price,
    });
  }
}
