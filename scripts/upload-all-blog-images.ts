import { config } from 'dotenv';
config({ path: '.env.local' });

import sharp from 'sharp';
import { put } from '@vercel/blob';
import { createClient } from '@libsql/client';
import * as fs from 'fs';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function uploadAndUpdate(localPath: string, blobName: string, postId: string) {
  const buffer = fs.readFileSync(localPath);
  
  console.log(`☁️  Uploading ${blobName}...`);
  const blob = await put(`blog/${blobName}`, buffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,
  });
  console.log(`   URL: ${blob.url}`);

  console.log(`📝 Updating post ${postId}...`);
  await db.execute({
    sql: 'UPDATE blog_posts SET featured_image = ? WHERE id = ?',
    args: [blob.url, postId],
  });
  console.log(`   ✅ Done`);
}

async function main() {
  await uploadAndUpdate(
    '/tmp/blog-5-veci-co-si-opravite-sami-za-30-minut.png',
    '5-veci-diy-web-og.png',
    '4HOccVH3J3AxDpVFi4p9h'
  );

  await uploadAndUpdate(
    '/tmp/blog-kolik-realne-vydelame-na-webu-za-8-tisic.png',
    'kolik-realne-vydelame-og.png',
    '8UXhKIwABwQVfOTXgQk7Z'
  );

  console.log('\n✅ All images uploaded and posts updated!');
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
