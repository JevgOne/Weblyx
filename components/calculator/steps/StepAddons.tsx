'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalculatorData, AddonService } from '@/lib/calculator/types';
import { ADDON_SERVICES } from '@/lib/calculator/pricing-engine';
import { Search, Users, Mail, Megaphone } from 'lucide-react';

interface StepAddonsProps {
  data: CalculatorData;
  onUpdate: (partial: Partial<CalculatorData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ADDON_ICONS: Record<AddonService, React.ElementType> = {
  seo: Search,
  'lead-generation': Users,
  'email-marketing': Mail,
  'ai-ads': Megaphone,
};

const ADDON_ORDER: AddonService[] = ['seo', 'lead-generation', 'email-marketing', 'ai-ads'];

export function StepAddons({ data, onUpdate, onNext, onBack }: StepAddonsProps) {
  const toggleAddon = (addonId: AddonService) => {
    const current = data.addons;
    const updated = current.includes(addonId)
      ? current.filter((a) => a !== addonId)
      : [...current, addonId];
    onUpdate({ addons: updated });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Máte zájem o doplňkové služby?
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Vyberte služby, které vás zajímají. Můžete přeskočit.
      </p>

      <div className="space-y-2.5">
        {ADDON_ORDER.map((addonId) => {
          const addon = ADDON_SERVICES[addonId];
          const Icon = ADDON_ICONS[addonId];
          const isChecked = data.addons.includes(addonId);

          return (
            <label
              key={addonId}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isChecked
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleAddon(addonId)}
              />
              <Icon className={`w-5 h-5 flex-shrink-0 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-semibold cursor-pointer block">{addon.label}</Label>
                <span className="text-xs text-muted-foreground">{addon.description}</span>
              </div>
            </label>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Cenu doplňkových služeb vám připravíme individuálně
      </p>

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
