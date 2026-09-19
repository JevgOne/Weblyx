"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

/**
 * Hides the shared site chrome (header, footer, chat bubble, popups) on routes
 * that ship their own complete shell. The redesign preview at /nova has its own
 * header and footer, so the global ones would double up. /archiv reuses that
 * same shell and belongs on this list for the same reason.
 *
 * The cookie bar is deliberately not part of this — see `CookieChrome`.
 */
const OWN_SHELL_PREFIXES = ["/nova", "/archiv", "/admin"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();

  // The Czech homepage is the redesign, which carries its own header and
  // footer. The German one is still the original and needs the shared chrome,
  // so the same path has to resolve differently per domain.
  const isRedesignedHome = pathname === "/" && locale === "cs";

  if (isRedesignedHome || OWN_SHELL_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
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
