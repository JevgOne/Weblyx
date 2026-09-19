import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Performance optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebasestorage.app',
      },
      {
        protocol: 'https',
        hostname: '**.appspot.com',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'image.thum.io',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // Exclude heavy packages from lambda bundle
  serverExternalPackages: [
    'puppeteer',
    'puppeteer-core',
    '@sparticuz/chromium',
    '@react-pdf/renderer',
    'canvas',
    'sharp',
  ],

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
  }),

  // Enable React strict mode
  reactStrictMode: true,

  // Redirects: non-www → www, German route aliases, URL normalization
  async redirects() {
    return [
      // Non-www to www redirect (301 permanent instead of Vercel's default 307)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'weblyx.cz',
          },
        ],
        destination: 'https://www.weblyx.cz/:path*',
        permanent: true, // 301
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'seitelyx.de',
          },
        ],
        destination: 'https://www.seitelyx.de/:path*',
        permanent: true, // 301
      },
      // Retired standalone calculator — the price configurator lives in the pricing section
      {
        source: '/kalkulacka',
        destination: '/#cenik',
        statusCode: 301,
      },
      // URLs are never deleted, only redirected. These three were linked from
      // the AI manifests, robots and the hreflang map but never existed as
      // routes, so anything that followed them got a 404.
      {
        source: '/cenik',
        destination: '/#cenik',
        permanent: true,
      },
      {
        source: '/ochrana-osobnich-udaju',
        destination: '/ochrana-udaju',
        permanent: true,
      },
      {
        source: '/preise-uebersicht',
        destination: '/preise',
        permanent: true,
      },
      // Linked from six landing pages but never written. Redirected to the
      // comparison article that does exist rather than left as a 404.
      {
        source: '/blog/wordpress-vs-nextjs-srovnani-2026',
        destination: '/blog/wordpress-vs-wix-vs-web-na-miru-2026',
        permanent: true,
      },
      // The redesign was previewed at /nova and is now the Czech homepage.
      // Left as a 301 so the preview URL does not become a second, competing
      // copy of the same page once it is indexable.
      {
        source: '/nova',
        destination: '/',
        permanent: true,
      },
      // German route aliases: /referenzen → /portfolio (nav says "Referenzen" but page is /portfolio)
      {
        source: '/referenzen',
        destination: '/portfolio',
        permanent: true,
      },
      // URL normalization: /über-uns (with umlaut) → /uber-uns
      {
        source: '/%C3%BCber-uns',
        destination: '/uber-uns',
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // HSTS - force HTTPS. Never in dev: the browser would pin
          // localhost to HTTPS for a year, and `next dev` speaks plain HTTP.
          ...(isDev
            ? []
            : [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
              ]),
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js dev bundles (webpack eval source maps) need 'unsafe-eval',
              // production builds do not — never ship it.
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://connect.facebook.net https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              // Google Ads conversion beacons post to pagead2.googlesyndication.com and
              // google.com/pagead. They were missing here, so the browser refused
              // every conversion ping — which is why all nine conversion actions
              // read "never fired" in Google Ads while the tag itself loaded fine.
              "connect-src 'self' https://*.firebasestorage.app https://*.appspot.com https://*.turso.io wss://*.turso.io https://vercel.live https://*.google-analytics.com https://*.analytics.google.com https://www.facebook.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://*.googleadservices.com https://*.googlesyndication.com https://www.google.com https://www.google.cz",
              "frame-src 'self' https://vercel.live https://www.google.com https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              // The Facebook pixel falls back to a form POST for part of its
              // measurement; 'self' alone blocked it.
              "form-action 'self' https://www.facebook.com",
              "frame-ancestors 'none'",
              // Rewrites every http:// subresource to https://. On localhost
              // that points every stylesheet, script and image at a TLS port
              // `next dev` does not serve, so the page renders unstyled.
              // Chrome exempts localhost, Safari does not.
              ...(isDev ? [] : ['upgrade-insecure-requests']),
            ]
              .filter(Boolean)
              .join('; '),
          },
        ],
      },
    ];
  },
};

// Apply both plugins: next-intl and bundle analyzer
export default withNextIntl(withBundleAnalyzer(nextConfig));
