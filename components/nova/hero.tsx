import Image from "next/image";

const TRUST = ["Bez závazku", "Odpověď do 2 h", "Záruka spokojenosti"];

export function NovaHero({
  fromPrice,
  announcement,
}: {
  fromPrice: string;
  announcement: string;
}) {
  const CARDS = [
    { value: "5–7 dní", label: "Základní web" },
    { value: "Pod 2s", label: "Načítání webu" },
    { value: fromPrice, label: "Jednorázově" },
  ];

  return (
    <section
      className="nova-container-hero nova-hero nova-col2 grid items-center gap-[72px] pt-24 pb-[104px]"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
      <div>
        <div
          className="nova-up nova-d1 inline-flex items-center gap-2 rounded-full px-4 py-[9px] text-sm font-semibold"
          style={{ background: "var(--n-brand-tint)", color: "var(--n-brand-dark)" }}
        >
          {announcement}
        </div>

        <h1 className="nova-h1 nova-up nova-d2 mt-6">
          Profesionální web za týden — bez měsíčních poplatků
        </h1>

        <p
          className="nova-up nova-d3 mt-[22px] max-w-[520px] text-[18px] font-medium"
          style={{ lineHeight: 1.65, color: "var(--n-text-body)" }}
        >
          Tvoříme{" "}
          <strong className="font-bold" style={{ color: "var(--n-ink)" }}>
            rychlé a moderní weby
          </strong>{" "}
          pro živnostníky a malé firmy. Základní web za{" "}
          <strong className="font-bold" style={{ color: "var(--n-ink)" }}>
            5–7 pracovních dní
          </strong>
          . Načítání{" "}
          <strong className="font-bold" style={{ color: "var(--n-ink)" }}>
            pod 2 sekundy garantujeme
          </strong>
          , SEO v ceně.
        </p>

        <div className="nova-up nova-d4 mt-8 flex flex-wrap items-center gap-3.5">
          <a
            href="#kontakt"
            className="rounded-xl px-[26px] py-[15px] text-base font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--n-brand)" }}
          >
            Nezávazná konzultace zdarma
          </a>
          <a
            href="#cenik"
            className="rounded-xl border px-[26px] py-[15px] text-base font-semibold transition-colors"
            style={{
              color: "var(--n-ink)",
              background: "var(--n-bg)",
              borderColor: "rgba(15,23,42,.14)",
            }}
          >
            Podívat se na ceník
          </a>
        </div>

        <div
          className="nova-up nova-d5 mt-7 flex flex-wrap gap-x-[26px] gap-y-2 text-sm font-medium"
          style={{ color: "var(--n-text-muted)" }}
        >
          {TRUST.map((item) => (
            <span key={item} className="inline-flex items-center gap-[7px]">
              <span aria-hidden="true" className="font-bold" style={{ color: "var(--n-brand)" }}>
                ✓
              </span>
              {item}
            </span>
          ))}
        </div>

        <div className="nova-up nova-d6 nova-col3 mt-10 grid grid-cols-3 gap-3">
          {CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-[14px] border p-[18px] text-center"
              style={{ borderColor: "var(--n-border)" }}
            >
              <div className="text-[19px] font-extrabold" style={{ letterSpacing: "-.02em" }}>
                {card.value}
              </div>
              <div
                className="mt-1 text-[13px] font-medium"
                style={{ color: "var(--n-text-muted)" }}
              >
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="nova-up relative aspect-square overflow-hidden rounded-[22px]"
        style={{ background: "var(--n-bg-slot)", animationDelay: ".3s" }}
      >
        <Image
          src="/images/hero/hero-mascot.jpg"
          alt="Maskot Weblyx — ilustrace tvorby webových stránek"
          fill
          priority
          sizes="(max-width: 1080px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
