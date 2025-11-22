import { adminDbInstance } from '../lib/firebase-admin';
import { createService } from '../lib/turso/services';

async function migrateServices() {
  if (!adminDbInstance) {
    console.error('Firebase Admin not initialized');
    return;
  }

  console.log('=== Fetching services from Firebase ===');
  const snapshot = await adminDbInstance.collection('services').get();

  console.log(`Found ${snapshot.size} services in Firebase`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`\nMigrating: ${data.title}`);
    console.log(`- ID: ${doc.id}`);
    console.log(`- Order: ${data.order || 0}`);
    console.log(`- Active: ${data.enabled !== false}`);
    console.log(`- Features: ${data.features?.length || 0}`);

    try {
      await createService({
        title: data.title,
        description: data.description,
        icon: data.icon,
        features: data.features || [],
        active: data.enabled !== false,
      });
      console.log('✅ Migrated successfully');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
    }
  }

  console.log('\n=== Migration complete ===');
}

migrateServices().catch(console.error);
