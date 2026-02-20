"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadButton } from "@/components/tracking/LeadButton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslations } from 'next-intl';
import { getBrandConfig } from '@/lib/brand';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const tRoutes = useTranslations('routes');

  // Get brand configuration based on domain
  const brand = getBrandConfig();
  const { name: brandName, logo } = brand;

  const navigation = [
    { name: t('services'), href: tRoutes('services') },
    { name: t('portfolio'), href: tRoutes('portfolio') },
    { name: t('blog'), href: tRoutes('blog') },
    { name: t('faq'), href: tRoutes('faq') },
    { name: t('about'), href: tRoutes('about') },
    { name: t('contact'), href: tRoutes('contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center text-foreground" aria-label={logo.alt}>
            {brand.name === 'Seitelyx' ? (
              <svg width="150" height="40" viewBox="0 0 240 50" className="h-10" role="img" aria-label={logo.alt}>
                <defs>
                  <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4"/>
                    <stop offset="100%" stopColor="#14B8A6"/>
                  </linearGradient>
                </defs>
                <g transform="translate(5, 5)">
                  <path d="M28 5 C28 5 25 0 17 0 C9 0 3 6 3 12 C3 18 9 21 17 24 C25 27 30 30 30 37 C30 44 23 50 14 50 C5 50 0 44 0 44"
                    stroke="url(#sGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="scale(0.8)"/>
                </g>
                <text x="52" y="35" fontFamily="Inter, system-ui, sans-serif" fontSize="28" fontWeight="800" fill="currentColor">
                  Seite<tspan fill="url(#sGrad)">lyx</tspan>
                </text>
              </svg>
            ) : (
              <svg width="150" height="40" viewBox="0 0 200 50" className="h-10" role="img" aria-label={logo.alt}>
                <path d="M8 12 L16 38 L24 20 L32 38 L40 12"
                  stroke="hsl(172, 78%, 40%)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="52" y="35" fontFamily="Inter, system-ui, sans-serif" fontSize="28" fontWeight="800" fill="currentColor">
                  Web<tspan fill="hsl(172, 78%, 40%)">lyx</tspan>
                </text>
              </svg>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <LeadButton href={tRoutes('quote')} className="shadow-elegant">
              {t('cta')}
            </LeadButton>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <LeadButton href={tRoutes('quote')} className="w-full">
              {t('cta')}
            </LeadButton>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <ThemeToggle />
              <span className="text-sm text-muted-foreground">Tmavý režim</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
