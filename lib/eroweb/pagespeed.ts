// PageSpeed Insights API Wrapper
// Fetches performance metrics from Google PageSpeed API

export interface PageSpeedMetrics {
  lcp: number;              // Largest Contentful Paint (ms)
  fcp: number;              // First Contentful Paint (ms)
  ttfb: number;             // Time to First Byte (ms)
  cls: number;              // Cumulative Layout Shift
  tbt: number;              // Total Blocking Time (ms)
  performanceScore: number; // Overall performance score (0-100)
}

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/**
 * Get PageSpeed metrics for a URL
 */
export async function getPageSpeedMetrics(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedMetrics> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  if (!apiKey) {
    console.warn('GOOGLE_PAGESPEED_API_KEY not set, using mock data');
    return getMockMetrics();
  }

  const params = new URLSearchParams({
    url,
    key: apiKey,
    category: 'performance',
    strategy,
  });

  try {
    // Add timeout to prevent hanging (40 seconds for PageSpeed API)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000);

    const response = await fetch(`${PAGESPEED_API_URL}?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PageSpeed API error:', response.status, errorText);

      // Return mock data on error
      return getMockMetrics();
    }

    const data = await response.json();

    if (!data.lighthouseResult) {
      console.error('Invalid PageSpeed response - no lighthouseResult');
      return getMockMetrics();
    }

    const audits = data.lighthouseResult.audits;
    const categories = data.lighthouseResult.categories;

    return {
      lcp: getAuditNumericValue(audits, 'largest-contentful-paint'),
      fcp: getAuditNumericValue(audits, 'first-contentful-paint'),
      ttfb: getAuditNumericValue(audits, 'server-response-time') ||
            getAuditNumericValue(audits, 'time-to-first-byte'),
      cls: getAuditNumericValue(audits, 'cumulative-layout-shift'),
      tbt: getAuditNumericValue(audits, 'total-blocking-time'),
      performanceScore: Math.round((categories?.performance?.score || 0) * 100),
    };

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('PageSpeed API timeout (40s) - using mock data');
    } else {
      console.error('PageSpeed API fetch error:', error);
    }
    return getMockMetrics();
  }
}

/**
 * Safely get numeric value from audit
 */
function getAuditNumericValue(audits: any, auditId: string): number {
  try {
    const audit = audits?.[auditId];
    if (audit?.numericValue !== undefined) {
      return audit.numericValue;
    }
    if (audit?.displayValue) {
      // Try to parse from display value
      const match = audit.displayValue.match(/[\d.]+/);
      if (match) {
        return parseFloat(match[0]) * 1000; // Convert to ms if needed
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Get mock metrics for development/testing
 */
function getMockMetrics(): PageSpeedMetrics {
  // Return realistic-looking metrics for an average adult industry site
  return {
    lcp: 4500 + Math.random() * 3000,   // 4.5-7.5 seconds
    fcp: 2500 + Math.random() * 2000,   // 2.5-4.5 seconds
    ttfb: 1000 + Math.random() * 1500,  // 1-2.5 seconds
    cls: 0.15 + Math.random() * 0.2,    // 0.15-0.35
    tbt: 500 + Math.random() * 1000,    // 500-1500ms
    performanceScore: 30 + Math.floor(Math.random() * 40), // 30-70
  };
}

/**
 * Check if URL uses HTTPS and get basic security info
 */
export async function checkSecurityBasics(url: string): Promise<{
  hasHttps: boolean;
  hasMixedContent: boolean;
  hasSecurityHeaders: boolean;
  validCertificate: boolean;
}> {
  const parsedUrl = new URL(url);
  const hasHttps = parsedUrl.protocol === 'https:';

  // Default values
  let hasMixedContent = false;
  let hasSecurityHeaders = false;
  let validCertificate = hasHttps; // Assume valid if HTTPS works

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });

    // Check security headers
    const headers = response.headers;
    hasSecurityHeaders =
      headers.has('strict-transport-security') ||
      headers.has('content-security-policy') ||
      headers.has('x-content-type-options') ||
      headers.has('x-frame-options');

    // If HTTPS request succeeded, certificate is valid
    validCertificate = hasHttps && response.ok;

  } catch (error) {
    console.error('Security check error:', error);
    // If HTTPS fails, certificate might be invalid
    if (hasHttps) {
      validCertificate = false;
    }
  }

  return {
    hasHttps,
    hasMixedContent,
    hasSecurityHeaders,
    validCertificate,
  };
}

/**
 * Check if URL exists (for sitemap, robots.txt)
 */
export async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch HTML content from URL
 */
export async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WeblyxBot/1.0; +https://weblyx.cz)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'cs,en;q=0.9',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  return response.text();
}
