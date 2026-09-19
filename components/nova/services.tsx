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
    </section>
  );
}
