/**
 * Server-only brand utilities that use next/headers
 * Import ONLY in server components, route handlers, and generateMetadata
 */
import { headers } from 'next/headers';
import { buildBrandConfig, type BrandConfig } from './brand';

/**
 * Detect domain from request headers (async)
 */
export async function getRequestDomain(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get('x-domain') || h.get('host') || '';
    if (host.includes('seitelyx.de')) return 'seitelyx.de';
    if (host.includes('weblyx.cz')) return 'weblyx.cz';
  } catch {
    // Outside request context (build time, scripts, etc.)
  }
  return process.env.NEXT_PUBLIC_DOMAIN || 'weblyx.cz';
}

/**
 * Get locale from request headers (async)
 */
export async function getRequestLocale(): Promise<'cs' | 'de'> {
  const domain = await getRequestDomain();
  return domain.includes('seitelyx.de') ? 'de' : 'cs';
}

/**
 * Get brand config from request headers (async)
 */
export async function getRequestBrandConfig(): Promise<BrandConfig> {
  const domain = await getRequestDomain();
  return buildBrandConfig(domain);
}
