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
import { useAdminTranslation } from '@/lib/admin-i18n';

interface AnalysisProgressProps {
  currentStep: string;
  completedSteps: string[];
}

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  fetch: Globe,
  speed: Zap,
  seo: Search,
  geo: Bot,
  design: Palette,
  report: FileText,
};

const STEP_IDS = ['fetch', 'speed', 'seo', 'geo', 'design', 'report'] as const;

export function AnalysisProgress({ currentStep, completedSteps }: AnalysisProgressProps) {
  const { t } = useAdminTranslation();

  return (
    <Card className="bg-card border-border">
      <CardContent className="py-6">
        <div className="space-y-4">
          {STEP_IDS.map((stepId) => {
            const isCompleted = completedSteps.includes(stepId);
            const isCurrent = currentStep === stepId;
            const Icon = STEP_ICONS[stepId];
            const label = t.eroweb.steps[stepId as keyof typeof t.eroweb.steps];

            return (
              <div key={stepId} className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-primary text-white animate-pulse',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
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
                    isCompleted && 'text-foreground',
                    isCurrent && 'text-foreground font-medium',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {label}
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
  const { t } = useAdminTranslation();

  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span>{t.eroweb.analyzing}</span>
    </div>
  );
}
