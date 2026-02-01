import { turso } from '../lib/turso';

async function addBeforeImageColumn() {
  try {
    await turso.execute(
      `ALTER TABLE portfolio ADD COLUMN before_image_url TEXT DEFAULT NULL`
    );
    console.log('✅ Added before_image_url column to portfolio table');
  } catch (error: any) {
    if (error.message?.includes('duplicate column')) {
      console.log('Column already exists, skipping.');
    } else {
      throw error;
    }
  }
}

addBeforeImageColumn().catch(console.error);
