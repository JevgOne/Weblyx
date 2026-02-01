import { config } from 'dotenv';
config({ path: '.env.local' });

import sharp from 'sharp';

interface ImageConfig {
  slug: string;
  badge: string;
  titleLines: string[];
  subtitle: string;
  iconArea: string; // SVG snippet for right-side decoration
}

function generateSVG(cfg: ImageConfig): string {
  const width = 1200;
  const height = 630;

  return `
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

    <!-- Right-side decoration -->
    ${cfg.iconArea}

    <!-- Badge -->
    <g transform="translate(100, 100)">
      <rect x="0" y="0" width="160" height="44" rx="10" fill="rgba(20, 184, 166, 0.12)" stroke="#14B8A6" stroke-width="1.5" />
      <text x="80" y="29" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#14B8A6" text-anchor="middle">${cfg.badge}</text>
    </g>

    <!-- Title -->
    ${cfg.titleLines.map((line, i) => `<text x="100" y="${220 + i * 60}" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" fill="white">${line}</text>`).join('\n    ')}

    <!-- Subtitle -->
    <text x="100" y="${220 + cfg.titleLines.length * 60 + 20}" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#94a3b8">${cfg.subtitle}</text>

    <!-- Bottom bar -->
    <rect x="0" y="${height - 80}" width="${width}" height="80" fill="rgba(0,0,0,0.3)" />

    <!-- Weblyx logo -->
    <g transform="translate(80, ${height - 56})">
      <rect x="0" y="0" width="40" height="40" rx="8" fill="#14B8A6" />
      <text x="20" y="28" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">W</text>
    </g>
    <text x="132" y="${height - 28}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="white">Weblyx</text>

    <text x="${width - 100}" y="${height - 28}" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#64748b" text-anchor="end">Weblyx Team</text>
    <text x="${width - 100}" y="${height - 52}" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#14B8A6" text-anchor="end">weblyx.cz/blog</text>
  </svg>`;
}

const images: ImageConfig[] = [
  {
    slug: '5-veci-co-si-opravite-sami-za-30-minut',
    badge: '🔧 DIY Web',
    titleLines: [
      '5 věcí, co si na webu',
      'opravíš sám',
      'za 30 minut',
    ],
    subtitle: 'Praktický návod bez programátora — krok za krokem',
    iconArea: `
      <!-- Wrench/tools decoration -->
      <g transform="translate(940, 220)">
        <rect x="0" y="0" width="160" height="160" rx="24" fill="rgba(20, 184, 166, 0.1)" stroke="#14B8A6" stroke-width="2" opacity="0.6" />
        <text x="80" y="100" font-family="Arial, Helvetica, sans-serif" font-size="72" text-anchor="middle" opacity="0.8">🔧</text>
      </g>
      <g transform="translate(960, 420)">
        <rect x="0" y="0" width="64" height="64" rx="12" fill="rgba(20, 184, 166, 0.08)" stroke="#14B8A6" stroke-width="1" opacity="0.4" />
        <text x="32" y="44" font-family="Arial, Helvetica, sans-serif" font-size="32" text-anchor="middle" opacity="0.5">⚡</text>
      </g>
      <g transform="translate(1040, 420)">
        <rect x="0" y="0" width="64" height="64" rx="12" fill="rgba(20, 184, 166, 0.15)" stroke="#14B8A6" stroke-width="1.5" opacity="0.6" />
        <text x="32" y="44" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#14B8A6" text-anchor="middle" opacity="0.7">30m</text>
      </g>
    `,
  },
  {
    slug: 'kolik-realne-vydelame-na-webu-za-8-tisic',
    badge: '💰 Zákulisí',
    titleLines: [
      'Kolik REÁLNĚ',
      'vyděláme na webu',
      'za 8 000 Kč',
    ],
    subtitle: 'Ano, ukazujeme čísla — transparentní pohled do agentury',
    iconArea: `
      <!-- Money/chart decoration -->
      <g transform="translate(940, 220)">
        <rect x="0" y="0" width="160" height="160" rx="24" fill="rgba(20, 184, 166, 0.1)" stroke="#14B8A6" stroke-width="2" opacity="0.6" />
        <text x="80" y="70" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" fill="#14B8A6" text-anchor="middle" opacity="0.8">8 000</text>
        <text x="80" y="110" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#14B8A6" text-anchor="middle" opacity="0.5">Kč</text>
      </g>
      <!-- Bar chart -->
      <g transform="translate(960, 420)">
        <rect x="0" y="30" width="20" height="34" rx="4" fill="#14B8A6" opacity="0.3" />
        <rect x="28" y="15" width="20" height="49" rx="4" fill="#14B8A6" opacity="0.5" />
        <rect x="56" y="0" width="20" height="64" rx="4" fill="#14B8A6" opacity="0.7" />
        <rect x="84" y="20" width="20" height="44" rx="4" fill="#14B8A6" opacity="0.4" />
        <rect x="112" y="5" width="20" height="59" rx="4" fill="#14B8A6" opacity="0.6" />
      </g>
    `,
  },
];

async function main() {
  for (const img of images) {
    console.log(`🎨 Generating: ${img.slug}`);
    const svg = generateSVG(img);
    const buffer = await sharp(Buffer.from(svg))
      .png({ quality: 90 })
      .toBuffer();

    const outPath = `/tmp/blog-${img.slug}.png`;
    await sharp(buffer).toFile(outPath);
    console.log(`   ✅ Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
  console.log('\n✅ Done! Preview images at /tmp/blog-*.png');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
