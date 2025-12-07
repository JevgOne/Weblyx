"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadButton } from "@/components/tracking/LeadButton";
import { useTranslations } from 'next-intl';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');

  const navigation = [
    { name: t('services'), href: "/sluzby" },
    { name: t('portfolio'), href: "/portfolio" },
    { name: t('blog'), href: "/blog" },
    { name: t('faq'), href: "/faq" },
    { name: t('about'), href: "/o-nas" },
    { name: t('contact'), href: "/kontakt" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Weblyx" className="h-10" />
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
            <LeadButton href="/poptavka" className="shadow-elegant">
              {t('cta')}
            </LeadButton>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            <LeadButton href="/poptavka" className="w-full">
              {t('cta')}
            </LeadButton>
          </div>
        </div>
      )}
    </header>
  );
}
