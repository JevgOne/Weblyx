/**
 * Add twitter card metadata to all pages missing it.
 * Reads each file, finds openGraph blocks, adds matching twitter blocks.
 */
import { readFileSync, writeFileSync } from 'fs';

const files = [
  'app/kontakt/page.tsx',
  'app/sluzby/page.tsx',
  'app/o-nas/page.tsx',
  'app/portfolio/page.tsx',
  'app/faq/page.tsx',
  'app/leistungen/page.tsx',
  'app/uber-uns/page.tsx',
  'app/anfrage/page.tsx',
  'app/preise/page.tsx',
  'app/blog/page.tsx',
];

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    
    if (content.includes('twitter:') || content.includes('twitter :')) {
      console.log("SKIP (already has twitter): " + file);
      continue;
    }

    // Find all openGraph blocks and add twitter after the closing },
    // Pattern: find "openGraph: {" ... "}," and add twitter after
    const ogRegex = /(openGraph:\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\},?\n)/g;
    
    let modified = false;
    content = content.replace(ogRegex, (match) => {
      // Extract title and description from the openGraph block
      const titleMatch = match.match(/title:\s*["'`]([^"'`]+)["'`]/);
      const descMatch = match.match(/description:\s*["'`]([^"'`]+)["'`]/);
      
      if (titleMatch && descMatch) {
        const title = titleMatch[1];
        const desc = descMatch[1];
        // Determine indent
        const indent = match.match(/^(\s*)/)?.[1] || '  ';
        const twitterBlock = `${indent}twitter: {\n${indent}  card: "summary_large_image",\n${indent}  title: "${title}",\n${indent}  description: "${desc}",\n${indent}},\n`;
        modified = true;
        return match + twitterBlock;
      }
      return match;
    });

    if (modified) {
      writeFileSync(file, content);
      console.log("UPDATED: " + file);
    } else {
      console.log("NO CHANGE (no OG match): " + file);
    }
  } catch (e: any) {
    console.log("ERROR: " + file + " - " + e.message);
  }
}

console.log("Done!");
