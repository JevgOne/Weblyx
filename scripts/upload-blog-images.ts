import { put } from '@vercel/blob';
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  // Upload sablony image
  const sablonyBuffer = readFileSync('/tmp/blog-images/sablony-v2.jpg');
  const sablonyBlob = await put('blog/sablony-agentury-v2.jpg', sablonyBuffer, {
    access: 'public',
    contentType: 'image/jpeg',
  });
  console.log("Sablony image uploaded: " + sablonyBlob.url);

  // Upload pagespeed image
  const pagespeedBuffer = readFileSync('/tmp/blog-images/pagespeed-v2.jpg');
  const pagespeedBlob = await put('blog/pagespeed-analyza-v2.jpg', pagespeedBuffer, {
    access: 'public',
    contentType: 'image/jpeg',
  });
  console.log("PageSpeed image uploaded: " + pagespeedBlob.url);

  // Update CS + DE articles with images
  // Article #6: sablony (CS: PfZmumHS54vxut-276XvG, DE: 5E7AEEqt_rDttzuCyYMIT)
  await client.execute({
    sql: "UPDATE blog_posts SET featured_image = ? WHERE id IN (?, ?)",
    args: [sablonyBlob.url, 'PfZmumHS54vxut-276XvG', '5E7AEEqt_rDttzuCyYMIT'],
  });
  console.log("Article #6 images updated (CS + DE)");

  // Article #9: pagespeed (CS: iQeRfJkgAZHnGaZG9Cc_9, DE: lRk66ysvl2zo88X-BsrSB)
  await client.execute({
    sql: "UPDATE blog_posts SET featured_image = ? WHERE id IN (?, ?)",
    args: [pagespeedBlob.url, 'iQeRfJkgAZHnGaZG9Cc_9', 'lRk66ysvl2zo88X-BsrSB'],
  });
  console.log("Article #9 images updated (CS + DE)");
}

main().catch(console.error);
