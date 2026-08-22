const STEPS = [
  { n: "01", title: "Konzultace", desc: "Nezávazně si vyslechneme vaše požadavky a cíle." },
  { n: "02", title: "Návrh designu", desc: "Vytvoříme návrh, který odpovídá vaší značce." },
  { n: "03", title: "Vývoj", desc: "Stavíme moderní web s důrazem na rychlost a UX." },
  { n: "04", title: "Testování", desc: "Důkladně otestujeme na všech zařízeních a prohlížečích." },
  { n: "05", title: "Spuštění", desc: "Nasadíme web a zajistíme bezproblémový start." },
  { n: "06", title: "Podpora", desc: "Poskytujeme podporu a pomůžeme s dalším rozvojem." },
];

export function NovaProcess() {
  return (
    <section
      id="postup"
      className="scroll-mt-20 border-y"
      style={{ background: "var(--n-bg-alt)", borderColor: "rgba(15,23,42,.07)" }}
    >
      <div className="nova-container nova-section">
        <div className="mb-[72px] text-center">
          <h2 className="nova-h2">Jak to probíhá</h2>
          <p className="nova-lead">Jednoduše, transparentně, efektivně.</p>
        </div>

        <ol className="nova-col3 grid grid-cols-3 gap-x-12 gap-y-14">
          {STEPS.map((step) => (
            <li key={step.n}>
              <div className="text-[15px] font-bold" style={{ color: "var(--n-brand-dark)" }}>
                {step.n}
              </div>
              <h3 className="mt-3.5 text-[21px] font-bold" style={{ letterSpacing: "-.02em" }}>
                {step.title}
              </h3>
              <p
                className="mt-2.5 text-[15px] font-medium"
                style={{ lineHeight: 1.6, color: "var(--n-text-muted)" }}
              >
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
