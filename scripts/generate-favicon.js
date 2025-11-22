const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Simple SVG favicon with W letter in cyan/teal gradient
const faviconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06B6D4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="#FFFFFF"/>
  <path d="M80 140 L160 380 L240 220 L320 380 L400 140"
        stroke="url(#grad)"
        stroke-width="50"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  console.log('🎨 Generating favicons...');

  const svgBuffer = Buffer.from(faviconSVG);

  // Generate different sizes
  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ];

  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`✅ Created ${name}`);
  }

  // Create favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✅ Created favicon.ico');

  console.log('🎉 All favicons generated successfully!');
}

generateFavicons().catch(console.error);
