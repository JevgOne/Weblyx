#!/usr/bin/env node

/**
 * Upload demo services to Firestore
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8')
  );
} else {
  // Fallback to local file
  const fs = require('fs');
  const path = require('path');
  const serviceAccountPath = '/tmp/firebase-service-account-fixed.json';

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Firebase service account not found!');
    console.error('Expected at:', serviceAccountPath);
    process.exit(1);
  }

  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const services = [
  {
    id: "web",
    title: "Tvorba webových stránek",
    description: "Vytvoříme pro vás moderní, responzivní webové stránky přizpůsobené na míru vašim potřebám a cílové skupině.",
    icon: "Globe",
    features: [
      "Responzivní design (mobil, tablet, desktop)",
      "Moderní a čistý design",
      "Základní SEO optimalizace",
      "Kontaktní formulář",
      "Google Analytics integrace",
      "Rychlé načítání (< 2s)",
      "1 měsíc podpora zdarma",
      "Školení pro správu webu",
    ],
    order: 0,
    enabled: true,
  },
  {
    id: "eshop",
    title: "E-shopy",
    description: "Kompletní e-commerce řešení pro online prodej s platebními branami, správou produktů a objednávek.",
    icon: "ShoppingCart",
    features: [
      "Katalog produktů s variantami",
      "Nákupní košík a checkout",
      "Platební brány (GoPay, Stripe, PayPal)",
      "Doprava (Zásilkovna, PPL, Česká pošta)",
      "Admin panel pro správu",
      "Správa skladu a objednávek",
      "Email notifikace",
      "SEO optimalizace pro produkty",
      "6 měsíců podpora zdarma",
    ],
    order: 1,
    enabled: true,
  },
  {
    id: "seo",
    title: "SEO optimalizace",
    description: "Dostaňte se na přední pozice ve vyhledávačích. Kompletní on-page i off-page SEO pro lepší viditelnost.",
    icon: "TrendingUp",
    features: [
      "Keyword research",
      "On-page optimalizace",
      "Technické SEO (rychlost, Core Web Vitals)",
      "Content optimalizace",
      "Meta tags a structured data",
      "Link building",
      "Měsíční reporty a analytics",
      "Competitor analysis",
    ],
    order: 2,
    enabled: true,
  },
  {
    id: "redesign",
    title: "Redesign webu",
    description: "Modernizace zastaralých webů. Nový design, lepší UX, vyšší konverze při zachování vaší značky.",
    icon: "Palette",
    features: [
      "Analýza současného webu",
      "Nový moderní design",
      "Zlepšení UX/UI",
      "Optimalizace pro mobilní zařízení",
      "Migrace obsahu",
      "SEO redirecty",
      "Vyšší rychlost načítání",
      "3 měsíce podpora zdarma",
    ],
    order: 3,
    enabled: true,
  },
  {
    id: "speed",
    title: "Optimalizace rychlosti",
    description: "Zrychlení načítání webu pro lepší SEO a uživatelskou zkušenost. Cíl: < 2 sekundy.",
    icon: "Zap",
    features: [
      "Audit výkonu webu",
      "Optimalizace obrázků",
      "Minifikace CSS/JS",
      "Lazy loading",
      "Caching strategie",
      "CDN implementace",
      "Core Web Vitals optimalizace",
      "Lighthouse score > 90",
    ],
    order: 4,
    enabled: true,
  },
  {
    id: "maintenance",
    title: "Údržba a podpora",
    description: "Pravidelné aktualizace, zálohy a technická podpora. Váš web bude vždy funkční a bezpečný.",
    icon: "HeadphonesIcon",
    features: [
      "Pravidelné aktualizace systému",
      "Bezpečnostní zálohy",
      "Monitoring výkonu a dostupnosti",
      "Technická podpora (email, telefon)",
      "Malé úpravy obsahu",
      "Opravy bugů",
      "Měsíční reporty",
      "Prioritní reakce na problémy",
    ],
    order: 5,
    enabled: true,
  },
];

async function uploadServices() {
  console.log('🔥 Uploading services to Firestore...\n');

  try {
    for (const service of services) {
      const docRef = db.collection('services').doc(service.id);

      await docRef.set({
        ...service,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Uploaded: ${service.title} (${service.id})`);
    }

    console.log(`\n✅ Successfully uploaded ${services.length} services!`);
    console.log('\n📝 Další kroky:');
    console.log('1. Otevři admin panel: https://weblyx.cz/admin/content/services');
    console.log('2. Můžeš přidat fotky ke službám pomocí tlačítka "Upravit"');
    console.log('3. Služby se automaticky zobrazí na /sluzby stránce');

  } catch (error) {
    console.error('❌ Error uploading services:', error);
    process.exit(1);
  }
}

uploadServices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
