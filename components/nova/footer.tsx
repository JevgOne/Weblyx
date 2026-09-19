const FOOTER_COLUMNS = [
  {
    title: "Služby",
    links: [
      { label: "Tvorba webových stránek", href: "/sluzby#web" },
      { label: "SEO optimalizace", href: "/seo-optimalizace" },
      { label: "Redesign webu", href: "/redesign-webu" },
      { label: "Rychlost načítání", href: "/pagespeed-garance" },
      { label: "Údržba a podpora", href: "/sluzby#maintenance" },
    ],
  },
  {
    title: "Kde působíme",
    links: [
      { label: "Tvorba webu Praha", href: "/tvorba-webu-praha" },
      { label: "Tvorba webu Brno", href: "/tvorba-webu-brno" },
      { label: "Tvorba webu Ostrava", href: "/tvorba-webu-ostrava" },
      { label: "Web pro živnostníky", href: "/web-pro-zivnostniky" },
      { label: "Web pro restaurace", href: "/web-pro-restaurace" },
    ],
  },
  {
    title: "Weblyx",
    links: [
      { label: "O nás", href: "/o-nas" },
      { label: "Naše práce", href: "/portfolio" },
      { label: "Recenze", href: "/recenze" },
      { label: "Blog", href: "/blog" },
      { label: "Časté otázky", href: "/faq" },
      { label: "Archiv změn", href: "/archiv" },
    ],
  },
  {
    title: "Kontakt a podmínky",
    links: [
      { label: "info@weblyx.cz", href: "mailto:info@weblyx.cz" },
      { label: "+420 702 110 166", href: "tel:+420702110166" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "Ochrana údajů", href: "/ochrana-udaju" },
      { label: "Obchodní podmínky", href: "/obchodni-podminky" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function NovaFooter() {
  // Never a literal year: a footer that still says 2026 in January is the
  // cheapest possible signal that nobody maintains the site.
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{
        background: "var(--n-ink)",
        color: "var(--n-text-dim)",
        borderColor: "rgba(255,255,255,.1)",
      }}
    >
      {/* No admin link here — the panel is not linked from the public site. */}
      {/* The previous structure carried 39 internal links from the homepage and
          this one carried 14 — three legal pages and the nav. Every service,
          city and reference page below depends on the homepage to be found at
          all, so the footer is where that linking belongs. */}
      <div className="nova-container grid gap-10 py-14 md:grid-cols-4">
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3
              className="text-[13px] font-bold uppercase"
              style={{ letterSpacing: ".08em", color: "#ffffff" }}
            >
              {column.title}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14px] font-medium">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        className="nova-container flex flex-wrap items-center justify-between gap-4 border-t py-7 text-[13px] font-medium"
        style={{ borderColor: "rgba(255,255,255,.1)" }}
      >
        <span className="text-[17px] font-bold text-white">Weblyx</span>
        <span>© {year} Weblyx · Altro Servis Group s.r.o. · IČO 23673389</span>
        <span>Vytvořeno v Česku</span>
      </div>
    </footer>
  );
}
