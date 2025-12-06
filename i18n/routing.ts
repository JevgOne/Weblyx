import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// Domain detection based on environment variables
const isGermanDomain = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';

export const routing = defineRouting({
  // Available locales
  locales: ['cs', 'de'],

  // Default locale based on domain
  defaultLocale: isGermanDomain ? 'de' : 'cs',

  // Domain-based routing configuration
  // - weblyx.cz: Czech only (no locale prefix in URL)
  // - seitelyx.de: German only (no locale prefix in URL)
  localePrefix: 'never', // Don't show /cs or /de in URL

  // Locale detection from domain
  localeDetection: true,
});

// Type-safe navigation utilities
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

export type Locale = typeof routing.locales[number];
