'use client';

import { useEffect } from 'react';
import { LOAD_TAGS_EVENT, LOAD_TAGS_FLAG } from '@/lib/analytics/lead-conversion';

/**
 * Injects third-party scripts on the visitor's first interaction instead of
 * during page load.
 *
 * gtag (GA4 + Google Ads) and the Facebook Pixel were ~460 KB and ~600 ms of
 * main-thread work on a mid-range phone, loaded before anyone had done
 * anything — the biggest single cost on a homepage that promises PageSpeed
 * 90+. Nothing is lost by waiting: `gtag()` writes to `dataLayer` and the
 * `fbq` stub queues its calls, and both libraries replay the queue when they
 * arrive. Conversions happen on a form submit, which is an interaction.
 *
 * A visitor who never scrolls, taps or types still gets the scripts after
 * FALLBACK_MS, so a page left open is counted.
 */
// LOAD_TAGS_EVENT: the thank-you page needs the tags at once to report the
// conversion, whether or not the visitor touches anything there.
const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel', LOAD_TAGS_EVENT] as const;
const FALLBACK_MS = 12000;

export function LoadOnInteraction({ srcs }: { srcs: string[] }) {
  useEffect(() => {
    let done = false;

    const load = () => {
      if (done) return;
      done = true;
      cleanup();
      for (const src of srcs) {
        if (document.querySelector(`script[src="${src}"]`)) continue;
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        document.head.appendChild(s);
      }
    };

    const timer = window.setTimeout(load, FALLBACK_MS);
    const cleanup = () => {
      window.clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, load));
    };
    EVENTS.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    // On a fresh load of the thank-you page its effect runs before this one
    // (children first), so the event above was already sent; the flag is not.
    if ((window as unknown as Record<string, unknown>)[LOAD_TAGS_FLAG]) load();

    return cleanup;
  }, [srcs]);

  return null;
}
