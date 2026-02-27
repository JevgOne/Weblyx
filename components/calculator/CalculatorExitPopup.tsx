'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calculator, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CalculatorExitPopupProps {
  onOpenCalculator: () => void;
  isModalOpen: boolean;
}

const MOBILE_DELAY_MS = 45_000;
const SESSION_KEY = 'calc-exit-shown';

export function CalculatorExitPopup({ onOpenCalculator, isModalOpen }: CalculatorExitPopupProps) {
  const t = useTranslations('calculatorPopup');
  const [isVisible, setIsVisible] = useState(false);

  const showPopup = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (isModalOpen) return;
    sessionStorage.setItem(SESSION_KEY, '1');
    setIsVisible(true);

    // Track impression
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.gtag) {
        w.gtag('event', 'calculator_exit_popup_shown', {
          event_category: 'Lead',
        });
      }
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const isMobile = window.matchMedia('(pointer: coarse)').matches;

    if (isMobile) {
      // Mobile: show after 45 seconds
      const timer = setTimeout(showPopup, MOBILE_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      // Desktop: exit-intent detection
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          showPopup();
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [showPopup]);

  // Close if modal opens from another trigger
  useEffect(() => {
    if (isModalOpen) setIsVisible(false);
  }, [isModalOpen]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleOpenCalculator = () => {
    setIsVisible(false);
    onOpenCalculator();

    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.gtag) {
        w.gtag('event', 'calculator_exit_popup_click', {
          event_category: 'Lead',
        });
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-300"
        onClick={handleDismiss}
      />

      {/* Popup Card */}
      <div className="relative z-10 w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border/50 animate-in zoom-in-95 fade-in-0 duration-300">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="h-7 w-7 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {t('exitTitle')}
          </h3>

          {/* Subtitle */}
          <p className="text-muted-foreground mb-6">
            {t('exitSubtitle')}
          </p>

          {/* CTA Button */}
          <button
            onClick={handleOpenCalculator}
            className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors text-base shadow-md"
          >
            {t('exitButton')}
          </button>

          {/* Dismiss link */}
          <button
            onClick={handleDismiss}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('exitDismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
