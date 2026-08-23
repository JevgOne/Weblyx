/**
 * Runs a CMS/database read and falls back instead of throwing.
 *
 * Homepage sections render as server components, so one unguarded read takes
 * the whole page down with a 500 — that is exactly what happened on preview
 * deployments, where the Turso credentials are not injected: `CaseStudy` called
 * `getPublishedPortfolio` outside a try and the homepage died, while every
 * section that already guarded its own read degraded quietly.
 *
 * Content is not worth a 500. Each caller passes the empty value it already
 * knows how to render — an empty list, a null section — so a database blip
 * costs a section, not the page.
 */
export async function safeRead<T>(
  read: () => Promise<T>,
  fallback: T,
  label: string
): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(`[cms] ${label} failed, rendering without it:`, error);
    return fallback;
  }
}
