/**
 * Review copy comes from the design handoff. Before launch these must be
 * checked against the real Google reviews — see the note in the brief.
 */
const REVIEWS = [
  {
    text: "Od prvního kontaktu profesionální přístup. Vstřícná komunikace, dodržení termínů a vysoká kvalita. Doporučujeme každému, kdo hledá spolehlivého partnera.",
    author: "Václav Fejkl",
  },
  {
    text: "Web vytvořili přesně podle mých představ, vše přehledně vysvětleno a dodrželi termíny. Oceňuji smysl pro detail a moderní design.",
    author: "Kristýna Hyršová",
  },
  {
    text: "Žádné sliby do větru, normální lidská domluva. Web je rychlej, čistej a dává smysl. Za mě velkej respekt a jasný doporučení.",
    author: "Adam Shaker",
  },
];

export function NovaReviews() {
  return (
    <section className="nova-container nova-section">
      <div className="mb-16 text-center">
        <p className="text-[44px] font-extrabold" style={{ letterSpacing: "-.04em" }}>
          5.0 <span style={{ color: "var(--n-brand-dark)" }}>★</span>
        </p>
        <p className="mt-2.5 text-[17px] font-semibold" style={{ color: "var(--n-text-muted)" }}>
          Hodnocení na Google · reálné recenze klientů
        </p>
      </div>

      <div className="nova-col3 grid grid-cols-3 gap-6">
        {REVIEWS.map((review) => (
          <figure
            key={review.author}
            className="rounded-[18px] border p-[34px]"
            style={{ background: "var(--n-bg-alt)", borderColor: "var(--n-border-soft)" }}
          >
            <blockquote className="text-base font-medium" style={{ lineHeight: 1.6 }}>
              „{review.text}“
            </blockquote>
            <figcaption className="mt-6">
              <span className="block text-[15px] font-bold">{review.author}</span>
              <span
                className="block text-[13px] font-medium"
                style={{ color: "var(--n-text-muted)" }}
              >
                Google recenze
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
