import { getHomepagePortfolio } from "@/lib/turso/portfolio";
import { safeRead } from "@/lib/safe-read";

/**
 * Clients, read from the portfolio CMS.
 *
 * The names were typed into this file during design and had already drifted —
 * the list missed a client the CMS carries. Flagging a project for the
 * homepage in the admin is now the only thing that puts a name here.
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
  const items = await safeRead(() => getHomepagePortfolio("cs"), [], "nova client logos");

  // A "trusted by" row with nobody in it is worse than no row.
  const clients = [...new Set(items.map(clientName).filter(Boolean))];
  if (clients.length === 0) return null;

  return (
    <section className="nova-container pt-16 pb-6">
      <h2
        className="mb-[34px] text-center text-[13px] font-semibold"
        style={{ letterSpacing: ".04em", color: "var(--n-text-muted)" }}
      >
        DŮVĚŘUJÍ NÁM
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-5 opacity-80">
        {clients.map((name, index) => (
          <span key={name} className="text-[22px]" style={NAME_STYLES[index % NAME_STYLES.length]}>
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
