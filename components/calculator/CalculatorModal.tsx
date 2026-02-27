'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { WebPriceCalculator } from './WebPriceCalculator';

interface CalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalculatorModal({ open, onOpenChange }: CalculatorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Kalkulačka ceny webu</DialogTitle>
        </VisuallyHidden>
        <div className="p-4 md:p-6">
          {/* Key forces remount on open → resets calculator state */}
          {open && <WebPriceCalculator key={Date.now()} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
