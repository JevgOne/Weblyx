'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Globe,
  Zap,
  Search,
  Bot,
  Palette,
  FileText,
  Check,
} from 'lucide-react';

const STEPS = [
  { id: 'fetch', label: 'Nacitani webu', icon: Globe },
  { id: 'speed', label: 'Analyza rychlosti', icon: Zap },
  { id: 'seo', label: 'Kontrola SEO', icon: Search },
  { id: 'geo', label: 'Analyza GEO/AIEO', icon: Bot },
  { id: 'design', label: 'Hodnoceni designu', icon: Palette },
  { id: 'report', label: 'Generovani reportu', icon: FileText },
];

interface AnalysisProgressProps {
  currentStep: string;
  completedSteps: string[];
}

export function AnalysisProgress({ currentStep, completedSteps }: AnalysisProgressProps) {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardContent className="py-6">
        <div className="space-y-4">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isCompleted && 'bg-[#10B981] text-white',
                    isCurrent && 'bg-[#7C3AED] text-white animate-pulse',
                    !isCompleted && !isCurrent && 'bg-[#252525] text-[#71717A]'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    isCompleted && 'text-white',
                    isCurrent && 'text-white font-medium',
                    !isCompleted && !isCurrent && 'text-[#71717A]'
                  )}
                >
                  {step.label}
                  {isCurrent && '...'}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple loading indicator for inline use
export function AnalysisLoadingInline() {
  return (
    <div className="flex items-center gap-3 text-[#A1A1AA]">
      <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
      <span>Analyzuji web...</span>
    </div>
  );
}
