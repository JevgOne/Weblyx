import { config } from 'dotenv';
config({ path: '.env.local' });

import { put } from '@vercel/blob';
import { createClient } from '@libsql/client';
import * as fs from 'fs';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

interface Upload {
  localPath: string;
  blobName: string;
  postId: string;
  title: string;
}

const uploads: Upload[] = [
  {
    localPath: '/tmp/blog-v2-wordpress.jpg',
    blobName: 'blog/wordpress-vs-nextjs-v2.jpg',
    postId: 'Ef9uBmET9E1T8gN7JQ1XP',
    title: 'WordPress je mrtvý',
  },
  {
    localPath: '/tmp/blog-v2-diy.jpg',
    blobName: 'blog/5-veci-diy-v2.jpg',
    postId: '4HOccVH3J3AxDpVFi4p9h',
    title: '5 věcí co si opravíš sám',
  },
  {
    localPath: '/tmp/blog-v2-money.jpg',
    blobName: 'blog/kolik-vydelame-v2.jpg',
    postId: '8UXhKIwABwQVfOTXgQk7Z',
    title: 'Kolik REÁLNĚ vyděláme',
  },
];

async function main() {
  for (const u of uploads) {
    const buffer = fs.readFileSync(u.localPath);
    
    console.log(`☁️  ${u.title}...`);
    const blob = await put(u.blobName, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
    });

    await db.execute({
      sql: 'UPDATE blog_posts SET featured_image = ? WHERE id = ?',
      args: [blob.url, u.postId],
    });
    console.log(`   ✅ ${blob.url}`);
  }

  // Also publish all 3
  console.log('\n📢 Publishing all 3 articles...');
  for (const u of uploads) {
    await db.execute({
      sql: 'UPDATE blog_posts SET published = 1, published_at = unixepoch() WHERE id = ?',
      args: [u.postId],
    });
    console.log(`   ✅ ${u.title} — LIVE`);
  }

  console.log('\n🔥 Done! All 3 articles published with V2 images.');
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
