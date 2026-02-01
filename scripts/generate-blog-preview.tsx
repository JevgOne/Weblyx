// Quick preview generator for blog OG images
// Run: cd /Users/zen/weblyx && npx tsx scripts/generate-blog-preview.tsx

import { writeFileSync } from 'fs';

const title = "WordPress je mrtvý a vaše agentura vám to neřekne";
const category = "BRUTÁLNÍ PRAVDA";

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="30%" r="50%">
      <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="70%" r="50%">
      <stop offset="0%" style="stop-color:#14B8A6;stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:#14B8A6;stop-opacity:0"/>
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  
  <!-- Accent line top -->
  <rect x="80" y="70" width="80" height="4" rx="2" fill="#14B8A6"/>
  
  <!-- Category badge -->
  <rect x="80" y="95" width="240" height="36" rx="18" fill="#14B8A6" opacity="0.15"/>
  <text x="200" y="119" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#14B8A6" text-anchor="middle" letter-spacing="2">💀 ${category}</text>
  
  <!-- Title -->
  <text x="80" y="200" font-family="Arial Black, Arial, sans-serif" font-size="52" font-weight="900" fill="#ffffff" width="900">
    <tspan x="80" dy="0">WordPress je mrtvý</tspan>
    <tspan x="80" dy="68">a vaše agentura vám</tspan>
    <tspan x="80" dy="68">to neřekne</tspan>
  </text>
  
  <!-- Subtitle line -->
  <text x="80" y="440" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8">Upřímné srovnání WordPress vs Next.js pro podnikatele</text>

  <!-- Bottom bar -->
  <rect x="0" y="590" width="1200" height="40" fill="#14B8A6" opacity="0.9"/>
  
  <!-- Brand -->
  <rect x="80" y="510" width="48" height="48" rx="12" fill="#14B8A6"/>
  <text x="104" y="542" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">W</text>
  <text x="145" y="540" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff">Weblyx</text>
  <text x="260" y="540" font-family="Arial, sans-serif" font-size="16" fill="#64748b">weblyx.cz/blog</text>
  
  <!-- Bottom bar text -->
  <text x="600" y="616" font-family="Arial, sans-serif" font-size="15" font-weight="600" fill="#0f172a" text-anchor="middle">TVORBA WEBOVÝCH STRÁNEK • OD 7 990 KČ • WEB ZA TÝDEN</text>
  
  <!-- Decorative code brackets -->
  <text x="1050" y="200" font-family="Courier New, monospace" font-size="180" fill="#14B8A6" opacity="0.08">&lt;/&gt;</text>
</svg>`;

writeFileSync('/Users/zen/Desktop/weblyx-blog-preview.svg', svg);
console.log('✅ Preview saved to ~/Desktop/weblyx-blog-preview.svg');
