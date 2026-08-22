const STATS = [
  { value: "15+", label: "Dokončených projektů" },
  { value: "5.0", label: "Google hodnocení" },
  { value: "< 2s", label: "Průměrná rychlost" },
  { value: "5–7 dní", label: "Průměrná doba dodání" },
];

const BADGES = [
  "Zabezpečený HTTPS",
  "PageSpeed 90+ garance",
  "Dodání v termínu",
  "Bez skrytých poplatků",
];

export function NovaStatsBar() {
  return (
    <section
      className="border-y"
      style={{ background: "var(--n-bg-alt)", borderColor: "var(--n-border-soft)" }}
    >
      <dl className="nova-container nova-col4 grid grid-cols-4 gap-6 py-11 text-center">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <dd
              className="text-[32px] font-extrabold"
              style={{ letterSpacing: "-.03em", color: "var(--n-brand-dark)" }}
            >
              {stat.value}
            </dd>
            <dt className="mt-1.5 text-sm font-medium" style={{ color: "var(--n-text-muted)" }}>
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      <div
        className="nova-container flex flex-wrap justify-center gap-x-10 gap-y-4 pb-10 text-sm font-medium"
        style={{ color: "var(--n-text-muted)" }}
      >
        {BADGES.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
    </section>
  );
}
