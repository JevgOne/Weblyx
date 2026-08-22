/**
 * Client names are set as type rather than logos — each gets its own weight and
 * tracking so the row reads as a wall of distinct marks. Swap for real logo
 * files when they land; the layout takes images at the same size.
 */
const CLIENTS: { name: string; style: React.CSSProperties }[] = [
  { name: "Titan Gym", style: { fontWeight: 800, letterSpacing: "-.02em" } },
  { name: "Resilient Mind", style: { fontWeight: 600, letterSpacing: ".04em", fontStyle: "italic" } },
  { name: "KAJO 360", style: { fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" } },
  { name: "AK Barbers", style: { fontWeight: 800, letterSpacing: "-.04em" } },
  { name: "Wardon Design", style: { fontWeight: 500, letterSpacing: ".02em" } },
  { name: "CarMakléř", style: { fontWeight: 700, letterSpacing: "-.01em" } },
];

export function NovaClientLogos() {
  return (
    <section className="nova-container pt-16 pb-6">
      <h2
        className="mb-[34px] text-center text-[13px] font-semibold"
        style={{ letterSpacing: ".04em", color: "var(--n-text-muted)" }}
      >
        DŮVĚŘUJÍ NÁM
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-5 opacity-80">
        {CLIENTS.map((client) => (
          <span key={client.name} className="text-[22px]" style={client.style}>
            {client.name}
          </span>
        ))}
      </div>
    </section>
  );
}
