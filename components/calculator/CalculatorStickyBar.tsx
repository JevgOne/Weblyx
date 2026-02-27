'use client';

import { useState, useEffect } from 'react';
import { Calculator, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CalculatorStickyBarProps {
  onOpenCalculator: () => void;
}

export function CalculatorStickyBar({ onOpenCalculator }: CalculatorStickyBarProps) {
  const t = useTranslations('calculatorPopup');
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Don't show if dismissed this session
    if (sessionStorage.getItem('calc-bar-dismissed')) {
      setIsDismissed(true);
      return;
    }

    // Wait for cookie consent to be accepted before showing
    const checkCookieConsent = () => {
      const cookies = document.cookie;
      return cookies.includes('cookie-consent');
    };

    // Delay initial show by 3 seconds
    const showTimer = setTimeout(() => {
      if (checkCookieConsent()) {
        setIsVisible(true);
      } else {
        // Poll for cookie consent acceptance
        const interval = setInterval(() => {
          if (checkCookieConsent()) {
            setIsVisible(true);
            clearInterval(interval);
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    }, 3000);

    // Hide when #web-calculator is in viewport
    const calculatorSection = document.getElementById('web-calculator');
    let observer: IntersectionObserver | null = null;

    if (calculatorSection) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(false);
          } else if (!isDismissed && checkCookieConsent()) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(calculatorSection);
    }

    return () => {
      clearTimeout(showTimer);
      observer?.disconnect();
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('calc-bar-dismissed', '1');
  };

  const handleClick = () => {
    onOpenCalculator();
    // Track click
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (w.gtag) {
        w.gtag('event', 'calculator_sticky_bar_click', {
          event_category: 'Lead',
        });
      }
    }
  };

  if (isDismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-700 dark:to-teal-600 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Calculator className="h-4.5 w-4.5 text-white" />
            </div>
            <p className="text-white text-sm md:text-base font-medium truncate">
              {t('barText')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClick}
              className="px-4 py-2 bg-white text-teal-700 font-semibold text-sm rounded-lg hover:bg-teal-50 transition-colors shadow-sm"
            >
              {t('barButton')}
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
