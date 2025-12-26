/**
 * Brand configuration based on domain
 *
 * Returns brand-specific assets and configuration for multi-domain setup:
 * - weblyx.cz: Czech brand (Weblyx)
 * - seitelyx.de: German brand (Seitelyx)
 */

export interface BrandConfig {
  name: string;
  domain: string;
  locale: 'cs' | 'de';
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  colors: {
    primary: string;
    secondary: string;
  };
}

/**
 * Get brand configuration based on domain
 */
export function getBrandConfig(): BrandConfig {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'weblyx.cz';
  const isSeitelyx = domain.includes('seitelyx.de');

  if (isSeitelyx) {
    return {
      name: 'Seitelyx',
      domain: 'seitelyx.de',
      locale: 'de',
      logo: {
        src: '/logos/seitelyx-logo.svg',
        alt: 'Seitelyx - Website erstellen lassen',
        width: 150,
        height: 40,
      },
      colors: {
        primary: '#14B8A6', // Teal
        secondary: '#0F766E',
      },
    };
  }

  // Default: Weblyx (Czech)
  return {
    name: 'Weblyx',
    domain: 'weblyx.cz',
    locale: 'cs',
    logo: {
      src: '/logos/weblyx-logo.svg',
      alt: 'Weblyx - Tvorba webových stránek',
      width: 150,
      height: 40,
    },
    colors: {
      primary: '#14B8A6', // Teal
      secondary: '#0F766E',
    },
  };
}

/**
 * Get current locale based on domain
 */
export function getDomainLocale(): 'cs' | 'de' {
  return getBrandConfig().locale;
}

/**
 * Check if current domain is Seitelyx
 */
export function isSeitelyxDomain(): boolean {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || '';
  return domain.includes('seitelyx.de');
}

/**
 * Check if current domain is Weblyx
 */
export function isWeblyxDomain(): boolean {
  return !isSeitelyxDomain();
}
