import { ProjectType, AddonService, PackageResult } from './types';

export interface Package {
  name: string;
  price: number;
  description: string;
  features: string[];
  deliveryDays: { min: number; max: number };
}

export const PACKAGES: Record<ProjectType, Package> = {
  landing: {
    name: 'Landing Page',
    price: 7990,
    description: '1 stránka, 3–5 sekcí',
    features: [
      'Responzivní design',
      'Kontaktní formulář',
      'SEO základy',
      'Google Analytics',
      'Dodání za 3–5 dní',
      '1 měsíc podpora',
    ],
    deliveryDays: { min: 3, max: 5 },
  },
  basic: {
    name: 'Základní Web',
    price: 9990,
    description: '3–5 podstránek s moderním designem',
    features: [
      '3–5 podstránek',
      'Moderní design',
      'Pokročilé SEO',
      'Blog s CMS editorem',
      'Kontaktní formulář',
      'Napojení na sociální sítě',
      'Dodání za 5–7 dní',
      '2 měsíce podpora',
    ],
    deliveryDays: { min: 5, max: 7 },
  },
  standard: {
    name: 'Standardní Web',
    price: 24990,
    description: '10+ podstránek, premium design na míru',
    features: [
      '10+ podstránek',
      'Premium design na míru',
      'Pokročilé animace',
      'Full CMS pro správu obsahu',
      'Rezervační systém',
      'Newsletter integrace',
      'Pokročilé SEO a Analytics',
      'Dodání za 7–10 dní',
      '3 měsíce podpora',
      'Bezplatné drobné úpravy (2h)',
    ],
    deliveryDays: { min: 7, max: 10 },
  },
};

export const ADDON_SERVICES: Record<AddonService, { label: string; description: string }> = {
  seo: { label: 'SEO optimalizace', description: 'Dlouhodobá SEO strategie a optimalizace' },
  'lead-generation': { label: 'Sbírání leadů', description: 'Formuláře, pop-upy a konverzní prvky' },
  'email-marketing': { label: 'Email marketing', description: 'Automatizované kampaně a newslettery' },
  'ai-ads': { label: 'AI ADS podpora', description: 'Meta & Google Ads s AI optimalizací' },
};

export interface CalculateInput {
  projectType: ProjectType;
  addons: AddonService[];
}

export function calculatePrice(input: CalculateInput): PackageResult {
  const pkg = PACKAGES[input.projectType];

  const selectedAddons = input.addons
    .filter((id) => ADDON_SERVICES[id])
    .map((id) => ({ id, label: ADDON_SERVICES[id].label }));

  return {
    packageName: pkg.name,
    price: pkg.price,
    features: pkg.features,
    deliveryDays: pkg.deliveryDays,
    addons: selectedAddons,
  };
}
