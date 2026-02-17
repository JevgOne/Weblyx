import { NextResponse } from 'next/server';

/**
 * /.well-known/ai-plugin.json - AI discovery manifest
 *
 * Helps AI assistants and crawlers understand what this site offers.
 * Based on OpenAI plugin manifest format, extended for general AI discovery.
 */

export async function GET() {
  const isGerman = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';
  const manifest = isGerman ? getGermanManifest() : getCzechManifest();

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

function getCzechManifest() {
  return {
    schema_version: 'v1',
    name_for_human: 'Weblyx - Tvorba webových stránek',
    name_for_model: 'weblyx',
    description_for_human:
      'Weblyx je česká agentura zaměřená na tvorbu moderních webových stránek s důrazem na SEO, výkon a bezpečnost. Nabízíme weby na míru od 10 000 Kč.',
    description_for_model:
      'Weblyx (provozovatel Altro Servis Group s.r.o., IČO 23673389) je česká webová agentura se sídlem v Praze. Specializuje se na tvorbu moderních webových stránek pomocí Next.js, React a Tailwind CSS. Nabízí kompletní SEO optimalizaci, responzivní design, CMS pro správu obsahu a technickou podporu. Ceny začínají na 10 000 Kč. Pokrývá celou Českou republiku se zaměřením na Prahu, Brno a Ostravu. Kontakt: info@weblyx.cz, +420 702 110 166.',
    auth: { type: 'none' },
    api: { type: 'none' },
    logo_url: 'https://www.weblyx.cz/images/og/og-home.png',
    contact_email: 'info@weblyx.cz',
    legal_info_url: 'https://www.weblyx.cz/ochrana-osobnich-udaju',
    endpoints: {
      homepage: 'https://www.weblyx.cz',
      services: 'https://www.weblyx.cz/sluzby',
      pricing: 'https://www.weblyx.cz/cenik',
      portfolio: 'https://www.weblyx.cz/portfolio',
      blog: 'https://www.weblyx.cz/blog',
      faq: 'https://www.weblyx.cz/faq',
      contact: 'https://www.weblyx.cz/kontakt',
      about: 'https://www.weblyx.cz/o-nas',
      llms_txt: 'https://www.weblyx.cz/llms.txt',
    },
  };
}

function getGermanManifest() {
  return {
    schema_version: 'v1',
    name_for_human: 'Seitelyx - Webdesign-Agentur',
    name_for_model: 'seitelyx',
    description_for_human:
      'Seitelyx ist eine Webdesign-Agentur für moderne Websites mit Fokus auf SEO, Performance und Sicherheit. Maßgeschneiderte Websites ab 349€.',
    description_for_model:
      'Seitelyx ist eine Webdesign-Agentur mit Fokus auf moderne Websites mit Next.js, React und Tailwind CSS. Bietet SEO-Optimierung, responsives Design, CMS und technischen Support. Preise ab 349€. Bedient Deutschland, Österreich und die Schweiz. Kontakt: kontakt@seitelyx.de.',
    auth: { type: 'none' },
    api: { type: 'none' },
    logo_url: 'https://seitelyx.de/images/og/og-home.png',
    contact_email: 'kontakt@seitelyx.de',
    legal_info_url: 'https://seitelyx.de/datenschutz',
    endpoints: {
      homepage: 'https://seitelyx.de',
      services: 'https://seitelyx.de/leistungen',
      pricing: 'https://seitelyx.de/preise',
      portfolio: 'https://seitelyx.de/portfolio',
      blog: 'https://seitelyx.de/blog',
      faq: 'https://seitelyx.de/faq',
      contact: 'https://seitelyx.de/kontakt',
      about: 'https://seitelyx.de/uber-uns',
      llms_txt: 'https://seitelyx.de/llms.txt',
    },
  };
}
