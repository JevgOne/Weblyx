"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Instagram, Facebook, MessageCircle, MapPin } from "lucide-react";
import { useTranslations } from 'next-intl';
import { getBrandConfig, isSeitelyxDomain } from '@/lib/brand';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tRoutes = useTranslations('routes');

  // Get brand configuration
  const brand = getBrandConfig();
  const isGermanSite = isSeitelyxDomain();
  const brandName = brand.name;
  const contactEmail = isGermanSite ? 'kontakt@seitelyx.de' : 'info@weblyx.cz';

  // Get the services route for building anchor links
  const servicesRoute = tRoutes('services');

  const footerLinks = {
    company: [
      { name: tNav('about'), href: tRoutes('about') },
      { name: tNav('services'), href: tRoutes('services') },
      { name: tNav('portfolio'), href: tRoutes('portfolio') },
      { name: tNav('blog'), href: tRoutes('blog') },
      { name: tNav('faq'), href: tRoutes('faq') },
      { name: tNav('contact'), href: tRoutes('contact') },
    ],
    services: [
      { name: t('webDevelopment'), href: `${servicesRoute}#web` },
      { name: t('ecommerce'), href: `${servicesRoute}#eshop` },
      { name: t('seo'), href: `${servicesRoute}#seo` },
      { name: t('redesign'), href: `${servicesRoute}#redesign` },
      { name: t('maintenance'), href: `${servicesRoute}#maintenance` },
    ],
    legal: isGermanSite
      ? [
          { name: t('impressum'), href: tRoutes('impressum') },
          { name: t('privacy'), href: tRoutes('privacy') },
        ]
      : [
          { name: t('privacy'), href: tRoutes('privacy') },
          { name: t('terms'), href: tRoutes('terms') },
          { name: 'PageSpeed Garance', href: '/pagespeed-garance' },
        ],
  };


  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-xl">
                  {brandName.charAt(0)}
                </span>
              </div>
              <span className="font-bold text-xl">{brandName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('aboutText')}
            </p>
            {/* Social Media Links */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/weblyx.cz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61583944536147"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/420702110166"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="https://share.google/cZIQkYTq2bVmkRAAP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Google Business Profile"
                title="Najděte nás na Google Maps"
              >
                <MapPin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('servicesTitle')}</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('contactTitle')}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
              <li>
                <a
                  href="tel:+420702110166"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +420 702 110 166
                </a>
              </li>
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p className="mb-1">
              {t('copyright').replace('2024', new Date().getFullYear().toString())}
            </p>
            <p className="text-xs">
              Provozovatel: Altro Servis Group s.r.o. | IČO: 23673389 | Školská 660/3, 110 00 Praha
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
