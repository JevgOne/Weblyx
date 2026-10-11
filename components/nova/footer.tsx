import Link from "next/link";
import { Facebook, Instagram, MapPin, MessageCircle } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Služby",
    links: [
      { label: "Tvorba webových stránek", href: "/sluzby#web" },
      { label: "Audit webu zdarma", href: "/audit" },
      { label: "Ceník webu", href: "/cenik-webu" },
      { label: "Web za 3–5 dní", href: "/web-za-3-5-dni" },
      { label: "SEO optimalizace", href: "/seo-optimalizace" },
      { label: "Redesign webu", href: "/redesign-webu" },
      { label: "Tvorba e-shopu", href: "/tvorba-eshopu" },
      { label: "Rezervační systém na míru", href: "/rezervacni-system-na-miru" },
      { label: "CRM systém na míru", href: "/crm-system-na-miru" },
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
      { label: "Web pro malé firmy", href: "/web-pro-male-firmy" },
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
      { label: "Kontakt", href: "/kontakt" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Ochrana údajů", href: "/ochrana-udaju" },
  { label: "Obchodní podmínky", href: "/obchodni-podminky" },
  { label: "Cookies", href: "/cookies" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/weblyx.cz/", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61583944536147", Icon: Facebook },
  { label: "WhatsApp", href: "https://wa.me/420702110166", Icon: MessageCircle },
  { label: "Weblyx na Mapách Google", href: "https://share.google/cZIQkYTq2bVmkRAAP", Icon: MapPin },
];

export function NovaFooter() {
  // Never a literal year: a footer that still says 2026 in January is the
  // cheapest possible signal that nobody maintains the site.
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t"
      style={{
        // A faint teal light behind the logo, so the brand corner is where the
        // eye lands instead of four equal columns of grey links.
        background:
          "radial-gradient(720px 360px at 12% 0%, rgba(20,184,166,.13), transparent 70%), var(--n-ink)",
        color: "var(--n-text-dim)",
        borderColor: "rgba(255,255,255,.1)",
      }}
    >
      {/* No admin link here — the panel is not linked from the public site. */}
      {/* The previous structure carried 39 internal links from the homepage and
          this one carried 14 — three legal pages and the nav. Every service,
          city and reference page below depends on the homepage to be found at
          all, so the footer is where that linking belongs. */}
      <div className="nova-container grid grid-cols-2 gap-x-8 gap-y-12 py-16 lg:gap-x-10 lg:grid-cols-[1.5fr_1.15fr_1fr_.75fr] lg:py-20">
        {/* Brand and contact: the one column a visitor is actually looking for. */}
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3.5" aria-label="Weblyx – úvodní stránka">
            <span
              className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[30px] font-extrabold text-white"
              style={{ background: "var(--n-brand)", letterSpacing: "-.03em" }}
            >
              W
            </span>
            <span className="text-[36px] font-bold leading-none text-white" style={{ letterSpacing: "-.02em" }}>
              Weblyx
            </span>
          </Link>

          <p className="mt-6 max-w-[340px] text-[15px] font-medium leading-relaxed">
            Tvoříme weby, e-shopy a systémy na míru pro české firmy a živnostníky.
          </p>

          <div className="mt-8 flex flex-col items-start gap-1.5">
            <a
              href="mailto:info@weblyx.cz"
              className="text-[22px] font-bold text-white transition-colors hover:text-[color:var(--n-brand-light)]"
              style={{ letterSpacing: "-.01em" }}
            >
              info@weblyx.cz
            </a>
            <a
              href="tel:+420702110166"
              className="text-[22px] font-bold text-white transition-colors hover:text-[color:var(--n-brand-light)]"
              style={{ letterSpacing: "-.01em" }}
            >
              +420 702 110 166
            </a>
          </div>

          <p className="mt-5 text-[14px] font-medium leading-relaxed">
            Školská 660/3, Praha 1
            <br />
            Po–Pá 8:00–18:00
          </p>

          <ul className="mt-7 flex gap-2.5">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-[color:var(--n-brand-light)] hover:text-[color:var(--n-brand-light)]"
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3
              className="text-[13px] font-bold uppercase"
              style={{ letterSpacing: ".08em", color: "#ffffff" }}
            >
              {column.title}
            </h3>
            <ul className="mt-5 flex flex-col gap-3 text-[14px] font-medium">
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

      <div className="nova-container">
        <div
          className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t py-7 text-[13px] font-medium"
          style={{ borderColor: "rgba(255,255,255,.1)" }}
        >
          <span>© {year} Weblyx · Altro Servis Group s.r.o. · IČO 23673389</span>
          <nav aria-label="Právní informace">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <span>Vytvořeno v Česku</span>
        </div>
      </div>
    </footer>
  );
}
