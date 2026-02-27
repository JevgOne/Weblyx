'use client';

import { FileText, Globe, Layout } from 'lucide-react';
import { CalculatorData, ProjectType } from '@/lib/calculator/types';
import { PACKAGES } from '@/lib/calculator/pricing-engine';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface StepProjectTypeProps {
  data: CalculatorData;
  onUpdate: (partial: Partial<CalculatorData>) => void;
  onNext: () => void;
}

const PROJECT_OPTIONS: {
  id: ProjectType;
  icon: React.ElementType;
  highlighted?: boolean;
}[] = [
  { id: 'landing', icon: FileText },
  { id: 'basic', icon: Globe },
  { id: 'standard', icon: Layout, highlighted: true },
];

export function StepProjectType({ data, onUpdate, onNext }: StepProjectTypeProps) {
  const handleSelect = (id: ProjectType) => {
    onUpdate({ projectType: id });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Jaký typ webu potřebujete?
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Vyberte balíček, který nejlépe odpovídá vašemu projektu.
      </p>

      <div className="space-y-3">
        {PROJECT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const pkg = PACKAGES[option.id];
          const isSelected = data.projectType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`relative flex items-start gap-4 w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : option.highlighted
                  ? 'border-primary/30 bg-card hover:border-primary/60'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              {/* Icon */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                  isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-foreground">{pkg.name}</span>
                  {option.highlighted && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Nejoblíbenější
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{pkg.description}</span>

                {/* Key features preview */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                  {pkg.features.slice(0, 3).map((feature, i) => (
                    <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="w-3 h-3 text-primary" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <span className="text-lg font-bold text-primary">
                  {pkg.price.toLocaleString('cs-CZ')} Kč
                </span>
                <span className="block text-[10px] text-muted-foreground">jednorázově</span>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={onNext}
          disabled={!data.projectType}
          className="px-6"
        >
          Pokračovat
        </Button>
      </div>
    </div>
  );
}
