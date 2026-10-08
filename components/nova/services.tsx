import Link from "next/link";
import { getActiveServices } from "@/lib/turso/services";
import { safeRead } from "@/lib/safe-read";

/**
 * Services, read from the CMS.
 *
 * The six tiles used to be a constant in this file while the same six rows
 * already sat in the `services` table — so renaming a service in the admin
 * changed /sluzby and the old homepage but left this section saying the old
 * thing. The copy now lives in one place and this file only lays it out.
 *
 * The filter: rows that carry a price are the legacy package duplicates
 * (Landing Page / Základní Web / Standardní Web), whose prices belong to
 * `pricing_tiers` and whose cards belong to the configurator. A service is a
 * row without a price.
 */
const FALLBACK = [
  { title: "Webové stránky", description: "Moderní, responzivní weby na míru vašim potřebám i cílové skupině.", link: "/sluzby#web" },
  { title: "SEO optimalizace", description: "Přední pozice ve vyhledávačích — kompletní on-page i off-page SEO.", link: "/seo-optimalizace" },
  { title: "Redesign", description: "Modernizace zastaralých webů. Nový design, lepší UX, vyšší konverze.", link: "/redesign-webu" },
  { title: "Rychlost načítání", description: "Zrychlení webu pro lepší SEO i zážitek. Cíl: méně než 2 sekundy.", link: "/pagespeed-garance" },
  { title: "Údržba a podpora", description: "Aktualizace, zálohy a technická podpora. Web vždy funkční a bezpečný.", link: "/sluzby#maintenance" },
  { title: "Landing page", description: "Jedna stránka s vysokou konverzí — levnější a rychlejší než WordPress.", link: "/#cenik" },
];

/** Custom features we have shipped, named as the client would name them. */
const CUSTOM_WORK: { label: string; href?: string }[] = [
  { label: "Rezervační systém na míru s Telegram botem", href: "/rezervacni-system-na-miru" },
  { label: "Dárkové poukazy s QR kódem", href: "/rezervacni-system-na-miru#poukazy" },
  { label: "CRM systém na míru", href: "/crm-system-na-miru" },
  { label: "Interní messaging pro CRM systém", href: "/crm-system-na-miru#interni-komunikace" },
];

export async function NovaServices() {
  const rows = await safeRead(() => getActiveServices("cs"), [], "nova services");

  const services = rows
    .filter((service) => service.priceFrom === null || service.priceFrom === undefined)
    .sort((a, b) => a.order - b.order)
    .map((service) => ({
      title: service.title,
      description: service.description,
      link: service.link,
    }));

  // A database blip must not delete a section the navigation links to.
  const shown = services.length > 0 ? services : FALLBACK;

  return (
    <section id="sluzby" className="nova-container nova-section scroll-mt-20">
      <div className="mb-[72px] text-center">
        <h2 className="nova-h2">Co pro vás uděláme</h2>
        <p className="nova-lead">Konkrétní služby, transparentní ceny.</p>
      </div>

      {/* The 1px grid gap doubles as the divider: the wrapper's background
          shows through between tiles, so there are no per-card borders. */}
      <div
        className="nova-col3 grid grid-cols-3 gap-px overflow-hidden rounded-[20px] border"
        style={{ background: "var(--n-border)", borderColor: "var(--n-border)" }}
      >
        {shown.map((service) => {
          const body = (
            <>
              <h3 className="text-[22px] font-bold" style={{ letterSpacing: "-.02em" }}>
                {service.title}
              </h3>
              <p
                className="mt-3.5 text-[15px] font-medium"
                style={{ lineHeight: 1.6, color: "var(--n-text-muted)" }}
              >
                {service.description}
              </p>
              {service.link && (
                <span
                  className="mt-4 inline-block text-[15px] font-semibold"
                  style={{ color: "var(--n-brand-dark)" }}
                >
                  Zjistit více ›
                </span>
              )}
            </>
          );

          return service.link ? (
            <Link
              key={service.title}
              href={service.link}
              className="block px-9 py-[42px] transition-colors hover:bg-white"
              style={{ background: "var(--n-bg-alt)" }}
            >
              {body}
            </Link>
          ) : (
            <article key={service.title} className="px-9 py-[42px]" style={{ background: "var(--n-bg-alt)" }}>
              {body}
            </article>
          );
        })}
      </div>

      {/* Custom work sits outside the CMS grid: it is not a seventh service
          with a detail page, and six tiles are what fill the three columns. */}
      <div
        className="nova-col2 mt-6 grid items-center gap-12 rounded-[20px] px-9 py-[42px]"
        style={{ gridTemplateColumns: "1fr 1fr", background: "var(--n-ink)", color: "#ffffff" }}
      >
        <div>
          <p className="mb-4 text-sm font-semibold" style={{ color: "var(--n-brand-light)" }}>
            Funkce na míru
          </p>
          <h3 className="text-[28px] font-bold" style={{ letterSpacing: "-.02em", lineHeight: 1.2 }}>
            Potřebujete něco, co hotové řešení neumí?
          </h3>
          <p
            className="mt-4 max-w-[460px] text-[16px] font-medium"
            style={{ lineHeight: 1.6, color: "var(--n-text-dim)" }}
          >
            Web bývá jen začátek. Stavíme i systémy na míru: pro klienta jsme udělali CRM systém
            přesně podle jeho potřeb. Když potřebujete vlastní funkci, vymyslíme ji s vámi a
            naprogramujeme.
          </p>
          <a
            href="#kontakt"
            className="mt-7 inline-block rounded-xl px-[26px] py-[15px] text-base font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--n-brand)" }}
          >
            Probrat vlastní funkci
          </a>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold" style={{ color: "var(--n-text-dim)" }}>
            Naposledy jsme dodali
          </p>
          <ul className="grid gap-px overflow-hidden rounded-2xl" style={{ background: "var(--n-border-dark)" }}>
            {CUSTOM_WORK.map((item) => (
              <li key={item.label} className="text-[16px] font-semibold" style={{ background: "var(--n-ink-2)" }}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-white/5"
                  >
                    {item.label}
                    <span aria-hidden style={{ color: "var(--n-brand-light)" }}>›</span>
                  </Link>
                ) : (
                  <span className="block px-6 py-5">{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
