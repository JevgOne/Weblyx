import { config } from 'dotenv';
config({ path: '.env.local' });

import sharp from 'sharp';
import { put } from '@vercel/blob';
import { updateBlogPost, getBlogPostBySlug } from '../lib/turso/blog';

async function generateFeaturedImage(): Promise<Buffer> {
  const width = 1200;
  const height = 630;

  // Create a stunning dark gradient blog header with SVG
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1e293b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
      </linearGradient>
      <radialGradient id="glow1" cx="20%" cy="30%" r="40%">
        <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:0.15" />
        <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0" />
      </radialGradient>
      <radialGradient id="glow2" cx="80%" cy="70%" r="35%">
        <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0" />
      </radialGradient>
      <linearGradient id="accentLine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#14B8A6;stop-opacity:0.5" />
        <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <rect width="${width}" height="${height}" fill="url(#glow1)" />
    <rect width="${width}" height="${height}" fill="url(#glow2)" />

    <!-- Subtle grid pattern -->
    <g opacity="0.03">
      ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${height}" stroke="white" stroke-width="1"/>`).join('')}
      ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="${width}" y2="${i * 60}" stroke="white" stroke-width="1"/>`).join('')}
    </g>

    <!-- Decorative circles -->
    <circle cx="950" cy="120" r="180" fill="none" stroke="#14B8A6" stroke-width="1" opacity="0.08" />
    <circle cx="950" cy="120" r="130" fill="none" stroke="#14B8A6" stroke-width="1" opacity="0.05" />
    <circle cx="150" cy="500" r="120" fill="none" stroke="#14B8A6" stroke-width="1" opacity="0.06" />

    <!-- Left accent line -->
    <rect x="80" y="100" width="4" height="200" rx="2" fill="url(#accentLine)" />

    <!-- VS badge -->
    <g transform="translate(960, 240)">
      <rect x="0" y="0" width="140" height="140" rx="24" fill="rgba(20, 184, 166, 0.1)" stroke="#14B8A6" stroke-width="2" opacity="0.6" />
      <text x="70" y="85" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="bold" fill="#14B8A6" text-anchor="middle" opacity="0.8">VS</text>
    </g>

    <!-- WP icon area -->
    <g transform="translate(960, 420)">
      <rect x="0" y="0" width="64" height="64" rx="12" fill="rgba(20, 184, 166, 0.08)" stroke="#14B8A6" stroke-width="1" opacity="0.4" />
      <text x="32" y="42" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#14B8A6" text-anchor="middle" opacity="0.5">WP</text>
    </g>
    <g transform="translate(1040, 420)">
      <rect x="0" y="0" width="64" height="64" rx="12" fill="rgba(20, 184, 166, 0.15)" stroke="#14B8A6" stroke-width="1.5" opacity="0.6" />
      <text x="32" y="42" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#14B8A6" text-anchor="middle" opacity="0.7">N</text>
    </g>

    <!-- Badge -->
    <g transform="translate(100, 100)">
      <rect x="0" y="0" width="130" height="44" rx="10" fill="rgba(20, 184, 166, 0.12)" stroke="#14B8A6" stroke-width="1.5" />
      <text x="65" y="29" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#14B8A6" text-anchor="middle">📝 Blog</text>
    </g>

    <!-- Title line 1 -->
    <text x="100" y="220" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" fill="white">
      WordPress je mrtvý
    </text>
    <!-- Title line 2 -->
    <text x="100" y="280" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" fill="white">
      a vaše agentura
    </text>
    <!-- Title line 3 -->
    <text x="100" y="340" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" fill="white">
      vám to neřekne
    </text>

    <!-- Subtitle -->
    <text x="100" y="400" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#94a3b8">
      Upřímné srovnání WordPress vs Next.js pro rok 2026
    </text>

    <!-- Bottom bar -->
    <rect x="0" y="${height - 80}" width="${width}" height="80" fill="rgba(0,0,0,0.3)" />

    <!-- Weblyx logo area -->
    <g transform="translate(80, ${height - 56})">
      <rect x="0" y="0" width="40" height="40" rx="8" fill="#14B8A6" />
      <text x="20" y="28" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">W</text>
    </g>
    <text x="132" y="${height - 28}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="white">Weblyx</text>

    <!-- Author -->
    <text x="${width - 100}" y="${height - 28}" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#64748b" text-anchor="end">Weblyx Team</text>

    <!-- weblyx.cz -->
    <text x="${width - 100}" y="${height - 52}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#14B8A6" text-anchor="end">weblyx.cz/blog</text>
  </svg>`;

  // Convert SVG to PNG via sharp
  const buffer = await sharp(Buffer.from(svg))
    .png({ quality: 90 })
    .toBuffer();

  return buffer;
}

async function main() {
  console.log('🎨 Generating featured image...');
  const imageBuffer = await generateFeaturedImage();
  console.log(`   Generated ${(imageBuffer.length / 1024).toFixed(0)} KB image`);

  console.log('☁️  Uploading to Vercel Blob...');
  const blob = await put('blog/wordpress-vs-nextjs-srovnani-2026-og.png', imageBuffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,
  });
  console.log(`   Uploaded: ${blob.url}`);

  console.log('📝 Updating blog post...');
  const post = await getBlogPostBySlug('wordpress-vs-nextjs-srovnani-2026');
  if (!post) {
    console.error('❌ Blog post not found!');
    process.exit(1);
  }

  await updateBlogPost(post.id, {
    featuredImage: blob.url,
  });

  console.log('✅ Blog post updated with featured image!');
  console.log(`   Post: ${post.title}`);
  console.log(`   Image: ${blob.url}`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
