/**
 * Blog utility functions for heading extraction, HTML processing, and content splitting.
 */

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Create a URL-safe slug from text, supporting Czech/German characters.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics for IDs
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Extract H2/H3 headings from raw markdown content.
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  const idCounts: Record<string, number> = {};
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    // Strip inline markdown formatting (bold, italic, code, links)
    const text = match[2]
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    let id = slugify(text);

    // Handle duplicate IDs
    if (idCounts[id] !== undefined) {
      idCounts[id]++;
      id = `${id}-${idCounts[id]}`;
    } else {
      idCounts[id] = 0;
    }

    headings.push({ id, text, level: match[1].length });
  }

  return headings;
}

/**
 * Post-process rendered HTML to add id attributes to h2/h3 elements.
 * Matches the same slugification logic as extractHeadings.
 */
export function addHeadingIds(html: string): string {
  const idCounts: Record<string, number> = {};

  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, (match, level, attrs, innerHtml) => {
    // Strip HTML tags to get plain text for ID generation
    const plainText = innerHtml.replace(/<[^>]*>/g, '').trim();
    let id = slugify(plainText);

    // Handle duplicate IDs (same logic as extractHeadings)
    if (idCounts[id] !== undefined) {
      idCounts[id]++;
      id = `${id}-${idCounts[id]}`;
    } else {
      idCounts[id] = 0;
    }

    // Preserve existing attributes but add/replace id
    const cleanAttrs = attrs.replace(/\s*id="[^"]*"/g, '');
    return `<h${level}${cleanAttrs} id="${id}">${innerHtml}</h${level}>`;
  });
}

/**
 * Split HTML content at ~40% mark at a safe paragraph/block boundary.
 * Returns [firstHalf, secondHalf].
 */
export function splitContentForCTA(html: string): [string, string] {
  const targetPosition = Math.floor(html.length * 0.4);

  // Find the nearest closing block-level tag after the 40% mark
  const closingTagRegex = /<\/(p|h[1-6]|ul|ol|div|pre|blockquote|table|figure|section)>/gi;
  let match;
  let bestPos = -1;

  while ((match = closingTagRegex.exec(html)) !== null) {
    const endPos = match.index + match[0].length;
    if (endPos >= targetPosition) {
      bestPos = endPos;
      break;
    }
  }

  // If no suitable split point found, don't split
  if (bestPos === -1) {
    return [html, ''];
  }

  return [html.slice(0, bestPos), html.slice(bestPos)];
}

/**
 * Enhance blockquotes in HTML to be styled as pull quotes.
 * Adds a data attribute for additional styling hooks.
 */
export function enhanceBlockquotes(html: string): string {
  return html.replace(
    /<blockquote>/gi,
    '<blockquote data-pull-quote="true">'
  );
}
