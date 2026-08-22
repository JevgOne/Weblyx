"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the shared site chrome (header, footer, chat bubble, popups) on routes
 * that ship their own complete shell. The redesign preview at /nova has its own
 * header and footer, so the global ones would double up.
 *
 * The cookie bar is deliberately not part of this — see `CookieChrome`.
 */
const OWN_SHELL_PREFIXES = ["/nova", "/admin"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (OWN_SHELL_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Consent has to run everywhere the public site is measured, /nova included —
 * analytics default to denied and the pixel waits for the `cookie-consent`
 * cookie, so without the bar tracking would stay off for good. Only the admin
 * panel is exempt.
 */
export function CookieChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <>{children}</>;
}
