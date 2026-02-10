import { Metadata } from 'next';

export type Locale = 'cs' | 'de';

// Path mapping mezi češtinou a němčinou
const pathMapping: Record<string, { cs: string; de: string }> = {
  '/': { cs: '/', de: '/' },
  '/sluzby': { cs: '/sluzby', de: '/leistungen' },
  '/o-nas': { cs: '/o-nas', de: '/uber-uns' },
  '/portfolio': { cs: '/portfolio', de: '/portfolio' },
  '/blog': { cs: '/blog', de: '/blog' },
  '/faq': { cs: '/faq', de: '/faq' },
  '/poptavka': { cs: '/poptavka', de: '/anfrage' },
  '/cenik': { cs: '/cenik', de: '/preise' },
  '/kontakt': { cs: '/kontakt', de: '/kontakt' },
  '/ochrana-udaju': { cs: '/ochrana-udaju', de: '/datenschutz' },
  '/obchodni-podminky': { cs: '/obchodni-podminky', de: '/impressum' },
  '/napiste-recenzi': { cs: '/napiste-recenzi', de: '/schreiben-sie-eine-bewertung' },
  // City-specific SEO landing pages (no cross-language equivalent)
  '/tvorba-webu-praha': { cs: '/tvorba-webu-praha', de: '/tvorba-webu-praha' },
  '/tvorba-webu-brno': { cs: '/tvorba-webu-brno', de: '/tvorba-webu-brno' },
  '/tvorba-webu-ostrava': { cs: '/tvorba-webu-ostrava', de: '/tvorba-webu-ostrava' },
  '/website-erstellen-berlin': { cs: '/website-erstellen-berlin', de: '/website-erstellen-berlin' },
  '/website-erstellen-muenchen': { cs: '/website-erstellen-muenchen', de: '/website-erstellen-muenchen' },
  // Comparison pages (CZ)
  '/webnode-alternativa': { cs: '/webnode-alternativa', de: '/webnode-alternativa' },
  '/wordpress-alternativa': { cs: '/wordpress-alternativa', de: '/wordpress-alternative' },
  // German service pages
  '/onlineshop-erstellen': { cs: '/onlineshop-erstellen', de: '/onlineshop-erstellen' },
  '/wordpress-alternative': { cs: '/wordpress-alternativa', de: '/wordpress-alternative' },
  '/website-fuer-aerzte': { cs: '/website-fuer-aerzte', de: '/website-fuer-aerzte' },
};

interface SEOContent {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  siteName: string;
  siteUrl: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  locale: string;
  alternateLang: string;
  alternateUrl: string;
}

const seoContent: Record<Locale, SEOContent> = {
  cs: {
    title: 'Tvorba webových stránek od 7 990 Kč | Web za týden | Weblyx',
    titleTemplate: '%s | Weblyx',
    description: 'Profesionální webové stránky od 7 990 Kč. Dodání za 5-7 dní, načítání pod 2s, SEO v ceně. Česká webová agentura s garancí kvality.',
    keywords: [
      // Core keywords
      'tvorba webových stránek',
      'tvorba webu',
      'webové stránky na míru',
      'profesionální webové stránky',
      'tvorba webových stránek cena',
      'webová agentura',
      'webdesign agentura',

      // Price & value keywords
      'kolik stojí webové stránky',
      'kolik stojí web',
      'cena webových stránek',
      'levné webové stránky',
      'férové ceny webové stránky',
      'webové stránky od 10000 Kč',

      // Speed & quality keywords
      'rychlá tvorba webu',
      'rychlé webové stránky',
      'moderní webové stránky',
      'responzivní webové stránky',
      'mobilní web',
      'rychlý web',
      'nejrychlejší webové stránky',

      // Time-based keywords
      'web za týden',
      'web do týdne',
      'jak dlouho trvá tvorba webu',
      'rychlé dodání webu',

      // Target audience keywords
      'web pro živnostníky',
      'web pro malé firmy',
      'firemní webové stránky',
      'prezentační web',

      // Technical keywords
      'SEO optimalizace',
      'webdesign',
      'responzivní design',
      'Next.js web',
      'moderní technologie web',

      // Service-specific keywords
      'e-shop na míru',
      'tvorba e-shopu',
      'redesign webu',
      'webové řešení',

      // Location keywords (national)
      'česká webová agentura',
      'webové stránky česká republika',
      'tvorba webu online',
    ],
    siteName: 'Weblyx',
    siteUrl: 'https://www.weblyx.cz',
    ogTitle: 'Tvorba webových stránek od 7 990 Kč | Web za týden',
    ogDescription: 'Profesionální web za 5-7 dní od 7 990 Kč. Načítání pod 2s, SEO v ceně.',
    twitterTitle: 'Tvorba webových stránek od 7 990 Kč | Web za týden',
    twitterDescription: 'Profesionální web za 5-7 dní od 7 990 Kč. Načítání pod 2s, SEO v ceně.',
    locale: 'cs_CZ',
    alternateLang: 'de',
    alternateUrl: 'https://seitelyx.de',
  },
  de: {
    title: 'Website erstellen lassen | Festpreis ab 320 € | Seitelyx',
    titleTemplate: '%s | Seitelyx',
    description: 'Website erstellen lassen ab 320 € Festpreis. 3× schneller als WordPress, Lieferung in 3-7 Tagen, DSGVO-konform. Webdesign Agentur für moderne Next.js Websites ohne monatliche Kosten.',
    keywords: [
      'website erstellen lassen',
      'webdesign agentur',
      'homepage erstellen lassen',
      'webseite erstellen lassen kosten',
      'website kosten',
      'festpreis website',
      'wordpress alternative',
      'next.js website',
      'schnelle website',
      'dsgvo website',
      'website erstellen lassen preise',
      'professionelle website',
      'moderne website',
      'website agentur',
      'webentwicklung',
    ],
    siteName: 'Seitelyx',
    siteUrl: 'https://seitelyx.de',
    ogTitle: 'Website erstellen lassen | Festpreis ab 320 €',
    ogDescription: 'Website erstellen lassen ab 320 € Festpreis. 3× schneller als WordPress, Lieferung in 3-7 Tagen, DSGVO-konform.',
    twitterTitle: 'Website erstellen lassen | Festpreis ab 320 €',
    twitterDescription: 'Website erstellen lassen ab 320 € Festpreis. 3× schneller als WordPress, Lieferung in 3-7 Tagen, DSGVO-konform.',
    locale: 'de_DE',
    alternateLang: 'cs',
    alternateUrl: 'https://www.weblyx.cz',
  },
};

// Helper pro generování hreflang alternates pro danou cestu
export function getAlternateLanguages(path: string = '/'): Record<string, string> {
  // Najdi mapping pro tuto cestu
  const mapping = pathMapping[path];

  if (mapping) {
    // Máme mapping - použij ho
    return {
      'cs': `https://www.weblyx.cz${mapping.cs}`,
      'de': `https://seitelyx.de${mapping.de}`,
      'x-default': `https://www.weblyx.cz${mapping.cs}`,
    };
  }

  // Nemáme mapping - použij stejnou cestu na obou doménách (pro blog/portfolio detail)
  return {
    'cs': `https://www.weblyx.cz${path}`,
    'de': `https://seitelyx.de${path}`,
    'x-default': `https://www.weblyx.cz${path}`,
  };
}

export function getLocaleFromDomain(): Locale {
  // Server-side: read from env var
  if (typeof window === 'undefined') {
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'weblyx.cz';
    return domain.includes('seitelyx.de') ? 'de' : 'cs';
  }

  // Client-side: read from window.location
  const hostname = window.location.hostname;
  return hostname.includes('seitelyx.de') ? 'de' : 'cs';
}

export function getSEOMetadata(locale?: Locale, pageTitle?: string): Metadata {
  const currentLocale = locale || getLocaleFromDomain();
  const content = seoContent[currentLocale];

  return {
    metadataBase: new URL(content.siteUrl),
    title: {
      default: content.title,
      template: content.titleTemplate,
    },
    description: content.description,
    keywords: content.keywords,
    authors: [{ name: content.siteName, url: content.siteUrl }],
    creator: content.siteName,
    publisher: content.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: content.locale,
      url: content.siteUrl,
      title: pageTitle || content.ogTitle,
      description: content.ogDescription,
      siteName: content.siteName,
      images: [{ url: '/images/og/og-homepage.png', width: 1200, height: 630, alt: content.siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle || content.twitterTitle,
      description: content.twitterDescription,
      creator: `@${content.siteName.toLowerCase()}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: content.siteUrl,
      languages: getAlternateLanguages('/'),
    },
  };
}

// Helper pro page-specific metadata
export function getPageMetadata(
  locale: Locale,
  page: {
    title: string;
    description: string;
    path?: string;
  }
): Metadata {
  const content = seoContent[locale];
  const fullTitle = `${page.title} | ${content.siteName}`;
  const path = page.path || '/';
  const url = `${content.siteUrl}${path}`;

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: fullTitle,
      description: page.description,
      url: url,
    },
    twitter: {
      title: fullTitle,
      description: page.description,
    },
    alternates: {
      canonical: url,
      languages: getAlternateLanguages(path),
    },
  };
}
