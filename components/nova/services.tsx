const SERVICES = [
  {
    title: "Webové stránky",
    desc: "Moderní, responzivní weby na míru vašim potřebám i cílové skupině.",
  },
  {
    title: "SEO optimalizace",
    desc: "Přední pozice ve vyhledávačích — kompletní on-page i off-page SEO.",
  },
  {
    title: "Redesign",
    desc: "Modernizace zastaralých webů. Nový design, lepší UX, vyšší konverze.",
  },
  {
    title: "Rychlost načítání",
    desc: "Zrychlení webu pro lepší SEO i zážitek. Cíl: méně než 2 sekundy.",
  },
  {
    title: "Údržba a podpora",
    desc: "Aktualizace, zálohy a technická podpora. Web vždy funkční a bezpečný.",
  },
  {
    title: "Landing page",
    desc: "Jedna stránka s vysokou konverzí — levnější a rychlejší než WordPress.",
  },
];

export function NovaServices() {
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
        {SERVICES.map((service) => (
          <article key={service.title} className="px-9 py-[42px]" style={{ background: "var(--n-bg-alt)" }}>
            <h3 className="text-[22px] font-bold" style={{ letterSpacing: "-.02em" }}>
              {service.title}
            </h3>
            <p
              className="mt-3.5 text-[15px] font-medium"
              style={{ lineHeight: 1.6, color: "var(--n-text-muted)" }}
            >
              {service.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
