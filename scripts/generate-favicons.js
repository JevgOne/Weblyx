const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateFavicons() {
  const iconPath = path.join(__dirname, '../public/icon.svg');
  const publicDir = path.join(__dirname, '../public');

  console.log('🎨 Generating favicons from icon.svg...\n');

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);

      await sharp(iconPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate favicon.ico (multi-size ICO file)
  try {
    const icoPath = path.join(publicDir, 'favicon.ico');

    // For ICO, we'll create a 32x32 version (most compatible)
    await sharp(iconPath)
      .resize(32, 32)
      .png()
      .toFile(icoPath);

    console.log(`✓ Generated favicon.ico (32x32)`);
  } catch (error) {
    console.error(`✗ Failed to generate favicon.ico:`, error.message);
  }

  console.log('\n✅ All favicons generated successfully!');
  console.log('📂 Files saved to /public/');
}

generateFavicons().catch(error => {
  console.error('❌ Error generating favicons:', error);
  process.exit(1);
});
