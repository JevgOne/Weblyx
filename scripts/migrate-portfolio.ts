import { adminDbInstance } from '../lib/firebase-admin';
import { createPortfolio } from '../lib/turso/portfolio';

async function migratePortfolio() {
  if (!adminDbInstance) {
    console.error('Firebase Admin not initialized');
    return;
  }

  console.log('=== Fetching portfolio from Firebase ===');
  const snapshot = await adminDbInstance.collection('portfolio').get();

  console.log(`Found ${snapshot.size} portfolio items in Firebase`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`\nMigrating: ${data.title}`);
    console.log(`- ID: ${doc.id}`);
    console.log(`- Published: ${data.published || false}`);
    console.log(`- Featured: ${data.featured || false}`);

    try {
      await createPortfolio({
        title: data.title,
        category: data.category || 'Web',
        description: data.description || '',
        technologies: data.technologies || [],
        imageUrl: data.imageUrl || '',
        projectUrl: data.projectUrl || '',
        published: data.published !== false,
        featured: data.featured !== false,
      });
      console.log('✅ Migrated successfully');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('\n=== Migration complete ===');
}

migratePortfolio().catch(console.error);
