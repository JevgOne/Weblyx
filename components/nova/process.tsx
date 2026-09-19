const STEPS = [
  { n: "01", title: "Konzultace", desc: "Nezávazně si vyslechneme vaše požadavky a cíle." },
  { n: "02", title: "Návrh designu", desc: "Vytvoříme návrh, který odpovídá vaší značce." },
  { n: "03", title: "Vývoj", desc: "Stavíme moderní web s důrazem na rychlost a UX." },
  { n: "04", title: "Testování", desc: "Důkladně otestujeme na všech zařízeních a prohlížečích." },
  { n: "05", title: "Spuštění", desc: "Nasadíme web a zajistíme bezproblémový start." },
  { n: "06", title: "Podpora", desc: "Poskytujeme podporu a pomůžeme s dalším rozvojem." },
];

/**
 * The six steps read as a sequence, not a grid of paragraphs.
 *
 * They used to be six blocks of text floating in whitespace with a 15px number
 * above each — nothing said "first this, then that", which is the only thing
 * this section exists to say. Each step now carries a numbered marker sitting
 * on a rail that runs across its column, so the eye is pulled left to right
 * through the row. The rail is a hairline in the same border token the rest of
 * the page uses, so it reads as structure rather than decoration.
 */
export function NovaProcess() {
  return (
    <section
      id="postup"
      className="scroll-mt-20 border-y"
      style={{ background: "var(--n-bg-alt)", borderColor: "rgba(15,23,42,.07)" }}
    >
      <div className="nova-container nova-section">
        <div className="mb-16 text-center">
          <h2 className="nova-h2">Jak to probíhá</h2>
          <p className="nova-lead">Jednoduše, transparentně, efektivně.</p>
        </div>

        <ol className="nova-col3 grid grid-cols-3 gap-x-10 gap-y-12">
          {STEPS.map((step) => (
            <li key={step.n} className="nova-step">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                  style={{ background: "var(--n-brand)", letterSpacing: "-.02em" }}
                >
                  {step.n}
                </span>
                {/* The rail: it makes the row read as a progression. */}
                <span
                  aria-hidden="true"
                  className="nova-step-rail h-px flex-1"
                  style={{ background: "var(--n-border)" }}
                />
              </div>

              <h3 className="mt-5 text-[21px] font-bold" style={{ letterSpacing: "-.02em" }}>
                {step.title}
              </h3>
              <p
                className="mt-2.5 max-w-[320px] text-[15px] font-medium"
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
