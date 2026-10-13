import { getPublishedPortfolio } from "@/lib/turso/portfolio";
import { safeRead } from "@/lib/safe-read";

/**
 * Clients, read from the portfolio CMS.
 *
 * The names were typed into this file during design and had already drifted —
 * the list missed a client the CMS carries. Every published project puts its
 * name here, so a new one appears without anyone remembering to flag it; the
 * "show on homepage" flag only picks the projects for the showcase below.
 *
 * They are set as type rather than logos: each gets its own weight and
 * tracking so the row reads as a wall of distinct marks. The styles are keyed
 * by position, not by name, so a new client inherits a look instead of
 * appearing unstyled.
 */
const NAME_STYLES: React.CSSProperties[] = [
  { fontWeight: 800, letterSpacing: "-.02em" },
  { fontWeight: 600, letterSpacing: ".04em", fontStyle: "italic" },
  { fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase" },
  { fontWeight: 800, letterSpacing: "-.04em" },
  { fontWeight: 500, letterSpacing: ".02em" },
  { fontWeight: 700, letterSpacing: "-.01em" },
];

/** "AK Barbers – web pro barber brand" reads as a project; we want the brand. */
function clientName(item: { clientName?: string; title: string }): string {
  if (item.clientName) return item.clientName;
  return item.title.split(/\s+[–-]\s+/)[0].trim();
}

export async function NovaClientLogos() {
  const items = await safeRead(() => getPublishedPortfolio("cs"), [], "nova client logos");

  // A "trusted by" row with nobody in it is worse than no row.
  const clients = [...new Set(items.map(clientName).filter(Boolean))];
  if (clients.length === 0) return null;

  // Shuffled on every render (the page is rebuilt about once a minute), so the
  // band does not open with the same five names for every visitor. Done on the
  // server: no script, and the copy below stays identical to the original.
  for (let i = clients.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clients[i], clients[j]] = [clients[j], clients[i]];
  }

  return (
    <section className="nova-container pt-16 pb-6">
      <h2
        className="mb-[34px] text-center text-[13px] font-semibold"
        style={{ letterSpacing: ".04em", color: "var(--n-text-muted)" }}
      >
        DŮVĚŘUJÍ NÁM
      </h2>
      {/* A moving band rather than a static wall: the names run past in a loop.
          The list is rendered twice so the band joins seamlessly at -50%; the
          copy is hidden from assistive tech. Pure CSS, so it costs no script,
          pauses on hover and stands still for reduced motion. */}
      <div className="nova-marquee opacity-80">
        <div className="nova-marquee-track" style={{ animationDuration: `${Math.max(20, clients.length * 5)}s` }}>
          {[0, 1].map((copy) => (
            <div key={copy} className="nova-marquee-group" aria-hidden={copy === 1 || undefined}>
              {clients.map((name, index) => (
                <span
                  key={name}
                  className="whitespace-nowrap text-[22px]"
                  style={NAME_STYLES[index % NAME_STYLES.length]}
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
