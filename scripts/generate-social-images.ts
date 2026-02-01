import { config } from 'dotenv';
config({ path: '.env.local' });

import sharp from 'sharp';

interface SocialImageConfig {
  slug: string;
  badge: string;
  titleLines: string[];
  subtitle: string;
  iconArea: string;
}

function generateSocialSVG(cfg: SocialImageConfig): string {
  const size = 1080;

  return `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1e293b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
      </linearGradient>
      <radialGradient id="glow1" cx="20%" cy="30%" r="50%">
        <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:0.18" />
        <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0" />
      </radialGradient>
      <radialGradient id="glow2" cx="80%" cy="80%" r="40%">
        <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:0.12" />
        <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0" />
      </radialGradient>
      <linearGradient id="accentLine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#14B8A6;stop-opacity:0.5" />
        <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${size}" height="${size}" fill="url(#bg)" />
    <rect width="${size}" height="${size}" fill="url(#glow1)" />
    <rect width="${size}" height="${size}" fill="url(#glow2)" />

    <!-- Subtle grid -->
    <g opacity="0.03">
      ${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${size}" stroke="white" stroke-width="1"/>`).join('')}
      ${Array.from({ length: 18 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="${size}" y2="${i * 60}" stroke="white" stroke-width="1"/>`).join('')}
    </g>

    <!-- Decorative circles -->
    <circle cx="850" cy="200" r="200" fill="none" stroke="#14B8A6" stroke-width="1" opacity="0.08" />
    <circle cx="850" cy="200" r="140" fill="none" stroke="#14B8A6" stroke-width="1" opacity="0.05" />
    <circle cx="200" cy="850" r="150" fill="none" stroke="#14B8A6" stroke-width="1" opacity="0.06" />

    <!-- Left accent line -->
    <rect x="80" y="180" width="5" height="250" rx="2" fill="url(#accentLine)" />

    <!-- Icon area (right side, centered vertically) -->
    ${cfg.iconArea}

    <!-- Badge -->
    <g transform="translate(100, 180)">
      <rect x="0" y="0" width="180" height="50" rx="12" fill="rgba(20, 184, 166, 0.12)" stroke="#14B8A6" stroke-width="1.5" />
      <text x="90" y="33" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#14B8A6" text-anchor="middle">${cfg.badge}</text>
    </g>

    <!-- Title -->
    ${cfg.titleLines.map((line, i) => `<text x="100" y="${310 + i * 72}" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="bold" fill="white">${line}</text>`).join('\n    ')}

    <!-- Subtitle -->
    <text x="100" y="${310 + cfg.titleLines.length * 72 + 40}" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#94a3b8">${cfg.subtitle}</text>

    <!-- Bottom bar -->
    <rect x="0" y="${size - 90}" width="${size}" height="90" fill="rgba(0,0,0,0.4)" />

    <!-- Weblyx logo -->
    <g transform="translate(60, ${size - 64})">
      <rect x="0" y="0" width="44" height="44" rx="10" fill="#14B8A6" />
      <text x="22" y="30" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">W</text>
    </g>
    <text x="118" y="${size - 34}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" fill="white">Weblyx</text>

    <text x="${size - 60}" y="${size - 34}" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#14B8A6" text-anchor="end">weblyx.cz/blog</text>
  </svg>`;
}

const images: SocialImageConfig[] = [
  {
    slug: 'wordpress',
    badge: '📝 Brutální pravda',
    titleLines: [
      'WordPress',
      'je mrtvý',
      'a vaše agentura',
      'vám to neřekne',
    ],
    subtitle: 'Upřímné srovnání pro rok 2026',
    iconArea: `
      <g transform="translate(780, 580)">
        <rect x="0" y="0" width="180" height="180" rx="30" fill="rgba(20, 184, 166, 0.1)" stroke="#14B8A6" stroke-width="2" opacity="0.6" />
        <text x="90" y="110" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" fill="#14B8A6" text-anchor="middle" opacity="0.8">VS</text>
      </g>
    `,
  },
  {
    slug: 'diy',
    badge: '🔧 DIY Web',
    titleLines: [
      '5 věcí, co si',
      'na webu opravíš',
      'sám za 30 minut',
    ],
    subtitle: 'Bez programátora, krok za krokem',
    iconArea: `
      <g transform="translate(780, 580)">
        <rect x="0" y="0" width="180" height="180" rx="30" fill="rgba(20, 184, 166, 0.1)" stroke="#14B8A6" stroke-width="2" opacity="0.6" />
        <text x="90" y="100" font-family="Arial, Helvetica, sans-serif" font-size="80" text-anchor="middle" opacity="0.8">🔧</text>
      </g>
      <g transform="translate(820, 790)">
        <rect x="0" y="0" width="80" height="80" rx="16" fill="rgba(20, 184, 166, 0.15)" stroke="#14B8A6" stroke-width="1.5" opacity="0.6" />
        <text x="40" y="54" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#14B8A6" text-anchor="middle" opacity="0.7">30m</text>
      </g>
    `,
  },
  {
    slug: 'money',
    badge: '💰 Zákulisí',
    titleLines: [
      'Kolik REÁLNĚ',
      'vyděláme',
      'na webu',
      'za 8 000 Kč',
    ],
    subtitle: 'Ukazujeme čísla. Bez bullshitu.',
    iconArea: `
      <g transform="translate(750, 580)">
        <rect x="0" y="0" width="210" height="180" rx="30" fill="rgba(20, 184, 166, 0.1)" stroke="#14B8A6" stroke-width="2" opacity="0.6" />
        <text x="105" y="80" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="bold" fill="#14B8A6" text-anchor="middle" opacity="0.8">8 000</text>
        <text x="105" y="130" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#14B8A6" text-anchor="middle" opacity="0.5">Kč</text>
      </g>
      <g transform="translate(780, 790)">
        <rect x="0" y="30" width="24" height="40" rx="4" fill="#14B8A6" opacity="0.3" />
        <rect x="34" y="15" width="24" height="55" rx="4" fill="#14B8A6" opacity="0.5" />
        <rect x="68" y="0" width="24" height="70" rx="4" fill="#14B8A6" opacity="0.7" />
        <rect x="102" y="20" width="24" height="50" rx="4" fill="#14B8A6" opacity="0.4" />
        <rect x="136" y="5" width="24" height="65" rx="4" fill="#14B8A6" opacity="0.6" />
      </g>
    `,
  },
];

async function main() {
  for (const img of images) {
    console.log(`🎨 ${img.slug}...`);
    const svg = generateSocialSVG(img);
    const buffer = await sharp(Buffer.from(svg))
      .png({ quality: 90 })
      .toBuffer();

    const outPath = `/tmp/social-${img.slug}-1080.png`;
    await sharp(buffer).toFile(outPath);
    console.log(`   ✅ ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  }
  console.log('\n✅ All social images ready!');
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
