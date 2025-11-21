/**
 * Script to upload demo portfolio projects to Firebase
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

// Demo portfolio projects
const demoProjects = [
  {
    title: 'E-shop s módou',
    slug: 'e-shop-s-modou',
    category: 'E-commerce',
    description: 'Moderní e-shop s pokročilými filtry a platební bránou',
    technologies: ['Next.js', 'Stripe', 'Tailwind'],
    imageUrl: '/images/portfolio-1.jpg',
    published: true,
    featured: true,
    order: 1,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Firemní prezentace',
    slug: 'firemni-prezentace',
    category: 'Web',
    description: 'Responzivní web pro konzultační společnost',
    technologies: ['React', 'SEO', 'Analytics'],
    imageUrl: '/images/portfolio-2.jpg',
    published: true,
    featured: true,
    order: 2,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Restaurace U Kocoura',
    slug: 'restaurace-u-kocoura',
    category: 'Web',
    description: 'Webová prezentace s online rezervačním systémem',
    technologies: ['Next.js', 'TypeScript', 'Tailwind'],
    imageUrl: '/images/portfolio-3.jpg',
    published: true,
    featured: true,
    order: 3,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Fitness Studio Pro',
    slug: 'fitness-studio-pro',
    category: 'Web',
    description: 'Web s online booking systémem pro tréninky',
    technologies: ['React', 'Firebase', 'Stripe'],
    imageUrl: '/images/portfolio-4.jpg',
    published: true,
    featured: false,
    order: 4,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Cestovní agentura Globe',
    slug: 'cestovni-agentura-globe',
    category: 'Web',
    description: 'Prezentační web s katalogem zájezdů',
    technologies: ['Next.js', 'CMS', 'SEO'],
    imageUrl: '/images/portfolio-5.jpg',
    published: true,
    featured: false,
    order: 5,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    title: 'Právní kancelář JUDr. Nováková',
    slug: 'pravni-kancelar-novakova',
    category: 'Web',
    description: 'Profesionální web pro advokátní kancelář',
    technologies: ['Next.js', 'TypeScript', 'Analytics'],
    imageUrl: '/images/portfolio-6.jpg',
    published: true,
    featured: false,
    order: 6,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function uploadPortfolio() {
  console.log('🚀 Starting portfolio upload...');

  try {
    const batch = db.batch();
    let count = 0;

    for (const project of demoProjects) {
      const docRef = db.collection('portfolio').doc();
      batch.set(docRef, project);
      count++;
      console.log(`✅ Added: ${project.title}`);
    }

    await batch.commit();
    console.log(`\n✅ Successfully uploaded ${count} portfolio projects to Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading portfolio:', error);
    process.exit(1);
  }
}

uploadPortfolio();
