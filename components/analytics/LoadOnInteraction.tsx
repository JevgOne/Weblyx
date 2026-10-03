'use client';

import { useEffect } from 'react';

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
const EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;
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

    return cleanup;
  }, [srcs]);

  return null;
}
