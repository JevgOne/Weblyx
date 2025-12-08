import { Metadata } from 'next';

export type Locale = 'cs' | 'de';

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
    title: 'Tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč) | Web za týden | Weblyx',
    titleTemplate: '%s | Weblyx',
    description: 'Rychlá tvorba webů od 10 000 Kč (AKCE 7 990 Kč). Web za 5-7 pracovních dní, načítání pod 2s, SEO zdarma. Next.js místo WordPressu. Nezávazná konzultace zdarma.',
    keywords: [
      'tvorba webových stránek',
      'tvorba webu',
      'webové stránky cena',
      'kolik stojí webové stránky',
      'férové ceny webové stránky',
      'rychlá tvorba webu',
      'web za týden',
      'web do týdne',
      'web od 10 000 Kč',
      'nejrychlejší webové stránky',
      'web pod 2 sekundy',
      'Next.js web',
      'web pro živnostníky',
      'e-shop na míru',
      'SEO optimalizace',
      'webdesign',
    ],
    siteName: 'Weblyx',
    siteUrl: 'https://weblyx.cz',
    ogTitle: 'Tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč) | Web za týden',
    ogDescription: 'Rychlá tvorba webů od 10 000 Kč (AKCE 7 990 Kč). Web za 5-7 dní, načítání pod 2s, SEO zdarma.',
    twitterTitle: 'Tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč) | Web za týden',
    twitterDescription: 'Rychlá tvorba webů od 10 000 Kč (AKCE 7 990 Kč). Web za 5-7 dní, načítání pod 2s, SEO zdarma.',
    locale: 'cs_CZ',
    alternateLang: 'de',
    alternateUrl: 'https://seitelyx.de',
  },
  de: {
    title: 'Website erstellen lassen | Festpreis ab 399€ | Seitelyx',
    titleTemplate: '%s | Seitelyx',
    description: 'Website erstellen lassen ab 399€ Festpreis. 3× schneller als WordPress, Lieferung in 3-7 Tagen, DSGVO-konform. Webdesign Agentur für moderne Next.js Websites ohne monatliche Kosten.',
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
    ogTitle: 'Website erstellen lassen | Festpreis ab 349€',
    ogDescription: 'Website erstellen lassen ab 349€ Festpreis. 3× schneller als WordPress, Lieferung in 3-7 Tagen, DSGVO-konform.',
    twitterTitle: 'Website erstellen lassen | Festpreis ab 349€',
    twitterDescription: 'Website erstellen lassen ab 349€ Festpreis. 3× schneller als WordPress, Lieferung in 3-7 Tagen, DSGVO-konform.',
    locale: 'de_DE',
    alternateLang: 'cs',
    alternateUrl: 'https://weblyx.cz',
  },
};

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
      languages: {
        [content.alternateLang]: content.alternateUrl,
      },
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
  const url = page.path ? `${content.siteUrl}${page.path}` : content.siteUrl;

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
    },
  };
}
