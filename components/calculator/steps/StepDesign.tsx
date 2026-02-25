'use client';

import { Button } from '@/components/ui/button';
import { CalculatorData, DesignStyle, BrandingStatus, Timeline } from '@/lib/calculator/types';
import {
  Minus,
  Zap,
  Briefcase,
  HelpCircle,
  BookOpen,
  Image,
  PaintBucket,
  Clock,
  Rocket,
  Calendar,
  CalendarClock,
} from 'lucide-react';

interface StepDesignProps {
  data: CalculatorData;
  onUpdate: (partial: Partial<CalculatorData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DESIGN_OPTIONS: { id: DesignStyle; label: string; icon: React.ElementType }[] = [
  { id: 'minimal', label: 'Minimalistický', icon: Minus },
  { id: 'creative', label: 'Kreativní', icon: Zap },
  { id: 'corporate', label: 'Korporátní', icon: Briefcase },
  { id: 'undecided', label: 'Nevím, poraďte', icon: HelpCircle },
];

const BRANDING_OPTIONS: { id: BrandingStatus; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'has-branding', label: 'Mám brandbook', hint: 'Logo + barvy + fonty', icon: BookOpen },
  { id: 'has-logo', label: 'Mám jen logo', hint: '+2 000 Kč za vizuální identitu', icon: Image },
  { id: 'needs-everything', label: 'Nemám nic', hint: '+4 000 Kč za kompletní branding', icon: PaintBucket },
];

const TIMELINE_OPTIONS: { id: Timeline; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'urgent', label: 'ASAP', hint: 'Express příplatek +20%', icon: Rocket },
  { id: 'normal', label: 'Do 2 týdnů', hint: 'Standardní termín', icon: Clock },
  { id: 'relaxed', label: 'Do měsíce', hint: 'Sleva -5%', icon: Calendar },
  { id: 'flexible', label: 'Není spěch', hint: 'Sleva -10%', icon: CalendarClock },
];

function RadioOption({
  selected,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 w-full ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selected ? 'border-primary' : 'border-muted-foreground/40'
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <Icon className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className="flex-1">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground ml-2">{hint}</span>}
      </div>
    </button>
  );
}

export function StepDesign({ data, onUpdate, onNext, onBack }: StepDesignProps) {
  const canProceed = data.designStyle && data.brandingStatus && data.timeline;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-2">
        Design a termín
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Upřesněte požadavky na vzhled a časový rámec.
      </p>

      {/* Design style */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-2.5">Styl designu</h3>
        <div className="grid grid-cols-2 gap-2">
          {DESIGN_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.id}
              selected={data.designStyle === opt.id}
              onClick={() => onUpdate({ designStyle: opt.id })}
              icon={opt.icon}
              label={opt.label}
            />
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-2.5">Firemní identita</h3>
        <div className="space-y-2">
          {BRANDING_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.id}
              selected={data.brandingStatus === opt.id}
              onClick={() => onUpdate({ brandingStatus: opt.id })}
              icon={opt.icon}
              label={opt.label}
              hint={opt.hint}
            />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-2.5">Kdy potřebujete web hotový?</h3>
        <div className="grid grid-cols-2 gap-2">
          {TIMELINE_OPTIONS.map((opt) => (
            <RadioOption
              key={opt.id}
              selected={data.timeline === opt.id}
              onClick={() => onUpdate({ timeline: opt.id })}
              icon={opt.icon}
              label={opt.label}
              hint={opt.hint}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Zpět
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="px-6">
          Pokračovat
        </Button>
      </div>
    </div>
  );
}
