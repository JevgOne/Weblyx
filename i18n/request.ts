import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * The locale is a build-time constant, not a per-request value.
 *
 * weblyx.cz and seitelyx.de are two Vercel projects building the same repo
 * with different `NEXT_PUBLIC_DOMAIN`, so `routing.defaultLocale` already
 * decides the language before a single request arrives.
 *
 * This used to `await requestLocale`, which reads the `X-NEXT-INTL-LOCALE`
 * header — a header nothing sets: middleware.ts creates the next-intl
 * middleware and never calls it, and the `x-locale` header it does build is
 * never passed to `NextResponse.next()`. So the value was always undefined and
 * the code always fell through to the line below anyway.
 *
 * Reading it was not free, though. `headers()` in a root layout opts every
 * route into dynamic rendering: all 46 public pages were re-rendered on every
 * request, database reads included, and Vercel's edge cache never held a
 * single one of them. Dropping a value we discarded anyway is what makes them
 * cacheable.
 */
export default getRequestConfig(async () => {
  const locale = routing.defaultLocale;

  return {
    locale,
    // Given explicitly for the same reason: without it next-intl resolves the
    // time zone per request, which is another read that forces dynamic.
    timeZone: 'Europe/Prague',
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
