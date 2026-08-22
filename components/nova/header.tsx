import Link from "next/link";

const NAV = [
  { label: "Služby", href: "#sluzby" },
  { label: "Práce", href: "#prace" },
  { label: "Ceník", href: "#cenik" },
  { label: "Postup", href: "#postup" },
  { label: "Kontakt", href: "#kontakt" },
];

export function NovaHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backdropFilter: "saturate(150%) blur(18px)",
        WebkitBackdropFilter: "saturate(150%) blur(18px)",
        background: "rgba(255,255,255,.8)",
        borderColor: "rgba(15,23,42,.07)",
      }}
    >
      <div className="nova-container flex items-center justify-between gap-6 py-4">
        <Link href="/nova" className="flex items-center gap-2.5 shrink-0">
          <span
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[17px] font-extrabold text-white"
            style={{ background: "var(--n-brand)", letterSpacing: "-.03em" }}
          >
            W
          </span>
          <span className="text-xl font-bold" style={{ letterSpacing: "-.02em" }}>
            Weblyx
          </span>
        </Link>

        {/* Nav collapses below the 1080px breakpoint; the CTA always stays. */}
        <nav
          className="hidden lg:flex gap-[34px] text-sm font-medium"
          style={{ color: "var(--n-text-body)" }}
        >
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:opacity-70 transition-opacity">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#kontakt"
          className="shrink-0 rounded-full px-[18px] py-[9px] text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--n-brand)" }}
        >
          Poptávka
        </a>
      </div>
    </header>
  );
}
