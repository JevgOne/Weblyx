'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalculatorData } from '@/lib/calculator/types';
import { FEATURE_PRICES } from '@/lib/calculator/pricing-engine';
import {
  Newspaper,
  CalendarCheck,
  Mail,
  Search,
  Languages,
  Sparkles,
  Settings,
  CreditCard,
  Image,
  MessageCircle,
} from 'lucide-react';

interface StepFeaturesProps {
  data: CalculatorData;
  onUpdate: (partial: Partial<CalculatorData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FEATURE_ICONS: Record<string, React.ElementType> = {
  blog: Newspaper,
  booking: CalendarCheck,
  newsletter: Mail,
  'advanced-seo': Search,
  multilang: Languages,
  animations: Sparkles,
  'custom-cms': Settings,
  payment: CreditCard,
  gallery: Image,
  'live-chat': MessageCircle,
};

const FEATURE_ORDER = [
  'blog',
  'advanced-seo',
  'gallery',
  'newsletter',
  'booking',
  'multilang',
  'animations',
  'custom-cms',
  'payment',
  'live-chat',
];

export function StepFeatures({ data, onUpdate, onNext, onBack }: StepFeaturesProps) {
  const toggleFeature = (featureId: string) => {
    const current = data.features;
    const updated = current.includes(featureId)
      ? current.filter((f) => f !== featureId)
      : [...current, featureId];
    onUpdate({ features: updated });
  };

  const totalAddons = data.features.reduce((sum, f) => {
    const feature = FEATURE_PRICES[f];
    return sum + (feature ? feature.price : 0);
  }, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Jaké funkce potřebujete?
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Vyberte doplňkové funkce pro váš web. Můžete přeskočit.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {FEATURE_ORDER.map((featureId) => {
          const feature = FEATURE_PRICES[featureId];
          if (!feature) return null;
          const Icon = FEATURE_ICONS[featureId] || Settings;
          const isChecked = data.features.includes(featureId);

          return (
            <label
              key={featureId}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                isChecked
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleFeature(featureId)}
              />
              <Icon className={`w-4 h-4 flex-shrink-0 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium cursor-pointer">{feature.label}</Label>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                +{feature.price.toLocaleString('cs-CZ')} Kč
              </span>
            </label>
          );
        })}
      </div>

      {totalAddons > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <span className="text-muted-foreground">Vybrané doplňky: </span>
          <span className="font-semibold text-primary">
            +{totalAddons.toLocaleString('cs-CZ')} Kč
          </span>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Zpět
        </Button>
        <Button onClick={onNext} className="px-6">
          Pokračovat
        </Button>
      </div>
    </div>
  );
}
