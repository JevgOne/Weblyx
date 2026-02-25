'use client';

import { FileText, Globe, Layout, ShoppingCart } from 'lucide-react';
import { CalculatorData, ProjectType } from '@/lib/calculator/types';
import { Button } from '@/components/ui/button';

interface StepProjectTypeProps {
  data: CalculatorData;
  onUpdate: (partial: Partial<CalculatorData>) => void;
  onNext: () => void;
}

const PROJECT_OPTIONS: {
  id: ProjectType;
  label: string;
  description: string;
  icon: React.ElementType;
  priceHint: string;
}[] = [
  {
    id: 'landing',
    label: 'Landing Page',
    description: 'Jedna stránka s 3–5 sekcemi',
    icon: FileText,
    priceHint: 'od 7 990 Kč',
  },
  {
    id: 'basic',
    label: 'Firemní web',
    description: '3–5 podstránek s moderním designem',
    icon: Globe,
    priceHint: 'od 9 990 Kč',
  },
  {
    id: 'standard',
    label: 'Rozšířený web',
    description: '10+ podstránek, premium design',
    icon: Layout,
    priceHint: 'od 24 990 Kč',
  },
  {
    id: 'eshop',
    label: 'E-shop / Aplikace',
    description: 'Kompletní e-shop s platební bránou',
    icon: ShoppingCart,
    priceHint: 'od 49 990 Kč',
  },
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
        Vyberte, co nejlépe odpovídá vašemu projektu.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROJECT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = data.projectType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${
                  isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-foreground">{option.label}</span>
              <span className="text-sm text-muted-foreground mt-1">{option.description}</span>
              <span className="text-xs text-primary font-medium mt-2">{option.priceHint}</span>
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
