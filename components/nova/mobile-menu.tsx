"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface MobileNavItem {
  label: string;
  href: string;
}

/**
 * The menu below the 1080px breakpoint. The desktop nav simply disappeared on
 * phones and left only the "Poptávka" button — no way to reach the price
 * list, the audit or the blog without scrolling the whole homepage.
 */
export function NovaMobileMenu({ items, extra }: { items: MobileNavItem[]; extra: MobileNavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation, and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const link = (item: MobileNavItem, big: boolean) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setOpen(false)}
      className={big ? "block py-3 text-[22px] font-bold" : "block py-2 text-[16px] font-medium"}
      style={{ color: big ? "var(--n-ink)" : "var(--n-text-body)", letterSpacing: big ? "-.02em" : undefined }}
    >
      {item.label}
    </Link>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="nova-mobile-menu"
        aria-label={open ? "Zavřít menu" : "Otevřít menu"}
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ color: "var(--n-ink)" }}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {/* Portalled to <body>: the header's backdrop-filter makes it the
          containing block for fixed children, which squeezed the panel into
          the header's own 65px. */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          id="nova-mobile-menu"
          className="nova fixed inset-x-0 bottom-0 top-[65px] z-[60] overflow-y-auto border-t bg-white px-6 pb-10 pt-4 lg:hidden"
          style={{ borderColor: "rgba(15,23,42,.07)" }}
        >
          <nav aria-label="Hlavní menu">{items.map((item) => link(item, true))}</nav>
          <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--n-border-soft)" }}>
            {extra.map((item) => link(item, false))}
          </div>
          <div className="mt-8 space-y-3">
            <Link
              href="/#kontakt"
              onClick={() => setOpen(false)}
              className="block rounded-xl py-3.5 text-center text-base font-semibold text-white"
              style={{ background: "var(--n-brand)" }}
            >
              Nezávazná poptávka
            </Link>
            <a
              href="tel:+420702110166"
              className="block rounded-xl border py-3.5 text-center text-base font-semibold"
              style={{ borderColor: "var(--n-border)", color: "var(--n-ink)" }}
            >
              Zavolat 702 110 166
            </a>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
