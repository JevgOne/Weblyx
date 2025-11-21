/**
 * Skript pro vyčištění VŠECH dat z Firebase databáze
 * Smaže vše - portfolio, leads, blog, projects, atd.
 *
 * POZOR: Toto je DESTRUKTIVNÍ operace!
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !line.startsWith('#')) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

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

// Kolekce k vyčištění
const collectionsToClean = [
  'leads',
  'blog',
  'portfolio',
  'services',
  'pricing_tiers',
  'homepage_sections',
  'homepage_process',
  'homepage_faq',
  'homepage_cta',
  'contact_info',
  'page_content',
  'promo_codes',
  'projects',
  'web_analyses',
  'admins', // Vynechám - chceš zachovat přístup do adminu
];

async function deleteCollection(collectionName) {
  try {
    // Skip admins collection - keep admin access
    if (collectionName === 'admins') {
      console.log(`⏭️  Skipping ${collectionName} (keeping admin access)`);
      return;
    }

    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`✅ ${collectionName}: už prázdná (0 dokumentů)`);
      return;
    }

    console.log(`🗑️  ${collectionName}: mazání ${snapshot.size} dokumentů...`);

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ ${collectionName}: smazáno ${snapshot.size} dokumentů`);
  } catch (error) {
    console.error(`❌ Chyba při mazání ${collectionName}:`, error.message);
  }
}

async function clearAllData() {
  console.log('\n🧹 Začínám mazat ALL data z Firebase...\n');
  console.log('⚠️  POZOR: Toto smaže VŠECHNA data (kromě admin účtů)!\n');

  for (const collection of collectionsToClean) {
    await deleteCollection(collection);
  }

  console.log('\n✅ Firebase databáze vyčištěna!');
  console.log('📝 Nyní můžeš nahrát reálná data přes admin panel.\n');

  process.exit(0);
}

clearAllData();
