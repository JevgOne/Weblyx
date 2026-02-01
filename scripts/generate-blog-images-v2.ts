import { config } from 'dotenv';
config({ path: '.env.local' });

import sharp from 'sharp';

interface ImageConfig {
  slug: string;
  inputPath: string;
  outputPath: string;
}

async function createBlogImage(cfg: ImageConfig): Promise<void> {
  const width = 1200;
  const height = 630;

  // Load and resize the photo
  const photo = await sharp(cfg.inputPath)
    .resize(width, height, { fit: 'cover' })
    .toBuffer();

  // Create teal overlay + Weblyx branding
  const overlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a;stop-opacity:0.55" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:0.45" />
        </linearGradient>
        <linearGradient id="tealGlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0" />
        </linearGradient>
      </defs>

      <!-- Dark overlay -->
      <rect width="${width}" height="${height}" fill="url(#overlay)" />
      
      <!-- Teal glow bottom-left -->
      <rect width="${width}" height="${height}" fill="url(#tealGlow)" />

      <!-- Bottom bar -->
      <rect x="0" y="${height - 70}" width="${width}" height="70" fill="rgba(0,0,0,0.5)" />

      <!-- Weblyx logo -->
      <g transform="translate(40, ${height - 52})">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#14B8A6" />
        <text x="18" y="25" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">W</text>
      </g>
      <text x="88" y="${height - 26}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="white">Weblyx</text>

      <!-- URL -->
      <text x="${width - 40}" y="${height - 26}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#14B8A6" text-anchor="end">weblyx.cz/blog</text>
    </svg>
  `);

  // Composite photo + overlay
  const result = await sharp(photo)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();

  await sharp(result).toFile(cfg.outputPath);
  console.log(`✅ ${cfg.slug} → ${cfg.outputPath} (${(result.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  const images: ImageConfig[] = [
    {
      slug: 'wordpress-vs-nextjs',
      inputPath: '/tmp/unsplash-wordpress.jpg',
      outputPath: '/tmp/blog-v2-wordpress.jpg',
    },
    {
      slug: '5-veci-diy',
      inputPath: '/tmp/unsplash-diy.jpg',
      outputPath: '/tmp/blog-v2-diy.jpg',
    },
    {
      slug: 'kolik-vydelame',
      inputPath: '/tmp/unsplash-money.jpg',
      outputPath: '/tmp/blog-v2-money.jpg',
    },
  ];

  for (const img of images) {
    await createBlogImage(img);
  }

  console.log('\n✅ All images generated!');
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
