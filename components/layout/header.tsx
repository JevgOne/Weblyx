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
          <Link href="/" className="flex items-center">
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-10 dark:brightness-0 dark:invert"
              width={logo.width}
              height={logo.height}
            />
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
