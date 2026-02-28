import type { Metadata } from 'next';
import { WebPriceCalculator } from '@/components/calculator/WebPriceCalculator';
import { Calculator } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kalkulačka ceny webu – webové stránky od 7 990 Kč',
  description:
    'Zjistěte orientační cenu vašeho webu za 2 minuty. Interaktivní kalkulačka ceny webových stránek. Výsledek ihned na email.',
  keywords: [
    'cena webu',
    'kalkulačka webu',
    'kolik stojí web',
    'tvorba webu cena',
    'cena webových stránek',
    'kalkulačka ceny webových stránek',
  ],
  openGraph: {
    title: 'Kolik bude stát váš web? | Weblyx',
    description: 'Zjistěte orientační cenu za 2 minuty. Bez závazků.',
    url: 'https://www.weblyx.cz/kalkulacka',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.weblyx.cz/kalkulacka',
  },
};

export default function CalculatorPage() {
  return (
    <main className="min-h-screen py-12 md:py-20 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            Interaktivní kalkulačka
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            Kolik bude stát váš web?
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Odpovězte na 4 otázky a za 2 minuty zjistíte orientační cenu.
          </p>
        </div>

        {/* Calculator */}
        <WebPriceCalculator />

        {/* Trust */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <span>Nezávazné</span>
          <span>Zdarma</span>
          <span>Výsledek ihned</span>
        </div>
      </div>
    </main>
  );
}
