import { adminDbInstance } from '../lib/firebase-admin';

async function checkFirebasePortfolio() {
  if (!adminDbInstance) {
    console.log('Firebase Admin not initialized (using mock)');
    return;
  }

  const snapshot = await adminDbInstance.collection('portfolio').get();
  console.log(`Found ${snapshot.size} portfolio items in Firebase`);

  if (snapshot.size > 0) {
    console.log('\n=== Portfolio Items ===');
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      console.log(`\n- ${data.title || 'Untitled'}`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Published: ${data.published || false}`);
      console.log(`  Featured: ${data.featured || false}`);
      console.log(`  Has image: ${!!data.imageUrl}`);
    });
  }
}

checkFirebasePortfolio().catch(console.error);
