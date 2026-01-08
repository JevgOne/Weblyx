/**
 * Add Pricing Packages to Services section
 */

import { turso } from '../lib/turso';
import { nanoid } from 'nanoid';

const packages = [
  {
    id: nanoid(),
    title: 'Starter',
    description: 'Perfect for small businesses - jednoduchý a rychlý web pro malé firmy a OSVČ.',
    icon: 'Rocket',
    features: JSON.stringify([
      'Moderní design',
      '5 podstránek',
      'Mobilní optimalizace',
      'SEO základ',
      '1 měsíc podpora'
    ]),
    price_from: 9990,
    price_to: 9990,
    order: 7,
    active: 1,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  },
  {
    id: nanoid(),
    title: 'Landing Page',
    description: 'Levnější než WordPress, rychlejší než konkurence - jedna stránka s vysokou konverzí.',
    icon: 'FileText',
    features: JSON.stringify([
      '1 stránka, 3–5 sekcí',
      'Responzivní design',
      'Kontaktní formulář',
      'SEO základy',
      'Google Analytics',
      'Dodání za 3–5 dní',
      '1 měsíc podpora'
    ]),
    price_from: 7990,
    price_to: 7990,
    order: 8,
    active: 1,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  },
  {
    id: nanoid(),
    title: 'Základní Web',
    description: 'Moderní web bez zbytečností - komplexní web s blogem a pokročilými funkcemi.',
    icon: 'Globe',
    features: JSON.stringify([
      '3–5 podstránek',
      'Moderní design',
      'Pokročilé SEO',
      'Blog s CMS editorem',
      'Kontaktní formulář',
      'Napojení na sociální sítě',
      'Dodání za 5–7 dní',
      '2 měsíce podpora'
    ]),
    price_from: 9990,
    price_to: 9990,
    order: 9,
    active: 1,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  },
  {
    id: nanoid(),
    title: 'Standardní Web',
    description: 'Co konkurence dělá za 40k a měsíc, my za 25k a týden - premium web s pokročilými funkcemi.',
    icon: 'Award',
    features: JSON.stringify([
      '10+ podstránek',
      'Premium design na míru',
      'Pokročilé animace',
      'Kompletní CMS pro správu obsahu',
      'Rezervační systém',
      'Newsletter integrace',
      'Pokročilé SEO a Analytics',
      'Dodání za 7–10 dní',
      '3 měsíce podpora',
      '2h úprav zdarma'
    ]),
    price_from: 24990,
    price_to: 24990,
    order: 10,
    active: 1,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  },
  {
    id: nanoid(),
    title: 'Mini E-shop',
    description: 'Moderní e-shop bez WordPress limitů - plnohodnotný online obchod s platební bránou.',
    icon: 'ShoppingCart',
    features: JSON.stringify([
      'Do 50 produktů',
      'Platební brána (Stripe, GoPay)',
      'Správa objednávek',
      'Kategorie a filtry',
      'Wishlist, košík, checkout',
      'Email notifikace',
      'SEO optimalizace',
      'Dodání za 14 dní',
      '6 měsíců podpora'
    ]),
    price_from: 49990,
    price_to: 49990,
    order: 11,
    active: 1,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  },
];

async function addPackages() {
  console.log('🚀 Adding pricing packages to services...\n');

  for (const pkg of packages) {
    try {
      await turso.execute({
        sql: `INSERT INTO services (
          id, title, description, icon, features, price_from, price_to,
          "order", active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          pkg.id,
          pkg.title,
          pkg.description,
          pkg.icon,
          pkg.features,
          pkg.price_from,
          pkg.price_to,
          pkg.order,
          pkg.active,
          pkg.created_at,
          pkg.updated_at,
        ],
      });

      console.log(`✅ Added: ${pkg.title} (${pkg.price_from} Kč)`);
    } catch (error) {
      console.error(`❌ Error adding ${pkg.title}:`, error);
    }
  }

  console.log('\n✅ Done! Pricing packages added to services.');
  console.log('👉 Check your Services section on homepage.');
}

addPackages();
