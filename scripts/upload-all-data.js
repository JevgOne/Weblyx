/**
 * Script to upload ALL demo data to Firebase
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 not found in environment');
  process.exit(1);
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ===== PRICING TIERS =====
const pricingTiers = [
  {
    name: 'Landing Page',
    slug: 'landing-page',
    price: 7990,
    description: 'Jednostránkový web pro rychlé představení vaší firmy',
    features: [
      'Responzivní design',
      'SEO optimalizace',
      'Kontaktní formulář',
      'Google Analytics',
      'Hosting na 1 rok zdarma',
      'SSL certifikát'
    ],
    highlighted: false,
    enabled: true,
    order: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: 'Základní Web',
    slug: 'zakladni-web',
    price: 9990,
    description: 'Vícestránkový web s plnou funkčností',
    features: [
      'Až 5 podstránek',
      'Responzivní design',
      'SEO optimalizace',
      'Kontaktní formulář',
      'Google Analytics',
      'Blog/Aktuality',
      'Hosting na 1 rok zdarma',
      'SSL certifikát'
    ],
    highlighted: false,
    enabled: true,
    order: 2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: 'Standardní Web',
    slug: 'standardni-web',
    price: 24990,
    description: 'Kompletní řešení pro rostoucí firmy',
    features: [
      'Až 10 podstránek',
      'Pokročilý design',
      'SEO optimalizace',
      'Kontaktní formuláře',
      'Google Analytics',
      'Blog s administrací',
      'Newsletter integrace',
      'Sociální sítě integrace',
      'Hosting na 1 rok zdarma',
      'SSL certifikát',
      'Technická podpora'
    ],
    highlighted: true,
    enabled: true,
    order: 3,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: 'Mini E-shop',
    slug: 'mini-eshop',
    price: 49990,
    description: 'Malý e-shop s platební bránou',
    features: [
      'Až 50 produktů',
      'Platební brána',
      'Správa objednávek',
      'Doprava a platba',
      'SEO optimalizace',
      'Google Analytics',
      'Newsletter',
      'Blog',
      'Hosting na 1 rok zdarma',
      'SSL certifikát',
      'Technická podpora'
    ],
    highlighted: false,
    enabled: true,
    order: 4,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    name: 'Premium E-shop',
    slug: 'premium-eshop',
    price: 89990,
    description: 'Profesionální e-shop s pokročilými funkcemi',
    features: [
      'Neomezené produkty',
      'Platební brána',
      'Správa objednávek',
      'Skladové hospodářství',
      'Doprava a platba',
      'SEO optimalizace',
      'Google Analytics',
      'Newsletter',
      'Blog',
      'Wishlist',
      'Srovnávač produktů',
      'Hosting na 1 rok zdarma',
      'SSL certifikát',
      'Technická podpora'
    ],
    highlighted: false,
    enabled: true,
    order: 5,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// ===== PROCESS STEPS =====
const processSteps = [
  {
    title: 'Konzultace',
    description: 'Nezávazná konzultace zdarma, kde si vyslechneme vaše požadavky a cíle.',
    icon: 'MessageSquare',
    number: 1,
    enabled: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Návrh designu',
    description: 'Vytvoříme designový návrh, který odpovídá vaší značce a cílům.',
    icon: 'Palette',
    number: 2,
    enabled: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Vývoj',
    description: 'Vyvíjíme moderní web s důrazem na rychlost a uživatelskou zkušenost.',
    icon: 'Code',
    number: 3,
    enabled: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Testování',
    description: 'Důkladně otestujeme na všech zařízeních a prohlížečích.',
    icon: 'TestTube',
    number: 4,
    enabled: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Spuštění',
    description: 'Nasadíme web na produkci a zajistíme bezproblémový start.',
    icon: 'Rocket',
    number: 5,
    enabled: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Podpora',
    description: 'Poskytujeme technickou podporu a pomůžeme s dalším rozvojem.',
    icon: 'HeadphonesIcon',
    number: 6,
    enabled: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// ===== SERVICES =====
const services = [
  {
    title: 'Webové stránky',
    slug: 'webove-stranky',
    description: 'Moderní responzivní weby optimalizované pro vyhledávače',
    icon: 'Globe',
    features: [
      'Responzivní design',
      'SEO optimalizace',
      'Rychlé načítání',
      'Admin panel'
    ],
    enabled: true,
    order: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'SEO Optimalizace',
    slug: 'seo-optimalizace',
    description: 'Zajistíme, aby vás zákazníci našli na prvních pozicích Google',
    icon: 'TrendingUp',
    features: [
      'Keyword research',
      'On-page SEO',
      'Technické SEO',
      'Reporting'
    ],
    enabled: true,
    order: 2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'E-shopy',
    slug: 'e-shopy',
    description: 'Kompletní řešení pro online prodej s platební bránou',
    icon: 'ShoppingCart',
    features: [
      'Platební brána',
      'Správa produktů',
      'Objednávky',
      'Doprava'
    ],
    enabled: true,
    order: 3,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

// ===== HOMEPAGE SECTIONS =====
const homepageSections = {
  hero: {
    heading: 'Moderní weby, které přináší výsledky',
    subheading: 'Vytváříme rychlé, responzivní a SEO optimalizované weby pro firmy, které chtějí růst',
    primaryCta: 'Nezávazná poptávka',
    secondaryCta: 'Naše služby',
    enabled: true,
  },
  process: {
    heading: 'Jak to funguje',
    subheading: 'Náš proces je jednoduchý, transparentní a efektivní',
    enabled: true,
  },
  cta: {
    heading: 'Připraveni začít?',
    subheading: 'Vytvořte si nezávaznou poptávku a my vám do 24 hodin představíme návrh řešení',
    buttonText: 'Nezávazná poptávka',
    enabled: true,
  },
};

async function uploadAllData() {
  console.log('🚀 Starting data upload to Firebase...\n');

  try {
    // Upload Pricing Tiers
    console.log('📊 Uploading Pricing Tiers...');
    for (const tier of pricingTiers) {
      await db.collection('pricing_tiers').add(tier);
      console.log(`  ✅ ${tier.name}`);
    }

    // Upload Process Steps
    console.log('\n🔄 Uploading Process Steps...');
    for (const step of processSteps) {
      await db.collection('homepage_process_steps').add(step);
      console.log(`  ✅ ${step.title}`);
    }

    // Upload Process Section Config
    await db.collection('homepage_sections').doc('process').set(homepageSections.process);
    console.log('  ✅ Process section config');

    // Upload Services
    console.log('\n🛠️  Uploading Services...');
    for (const service of services) {
      await db.collection('services').add(service);
      console.log(`  ✅ ${service.title}`);
    }

    // Upload Homepage Sections
    console.log('\n🏠 Uploading Homepage Sections...');
    await db.collection('homepage_sections').doc('hero').set(homepageSections.hero);
    console.log('  ✅ Hero section');
    await db.collection('homepage_sections').doc('cta').set(homepageSections.cta);
    console.log('  ✅ CTA section');

    console.log('\n✅ ALL DATA UPLOADED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log(`  📊 Pricing Tiers: ${pricingTiers.length}`);
    console.log(`  🔄 Process Steps: ${processSteps.length}`);
    console.log(`  🛠️  Services: ${services.length}`);
    console.log(`  🏠 Homepage Sections: 3`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading data:', error);
    process.exit(1);
  }
}

uploadAllData();
