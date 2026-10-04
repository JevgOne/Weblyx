import Link from "next/link";
import { getHomepagePortfolio } from "@/lib/turso/portfolio";
import { safeRead } from "@/lib/safe-read";
import { NovaPortfolioGrid } from "./portfolio-grid";

/**
 * Featured work, read from the portfolio CMS.
 *
 * Four projects and their taglines used to be written into this file and only
 * their screenshots came from the CMS, so a project renamed or retired in the
 * admin kept its old name here — and one listed project was not flagged for
 * the homepage at all. Flagging a project in the admin is now the whole
 * mechanism: name, tagline, image and link all travel together.
 *
 * All flagged projects are sent; four of them are shown, chosen at random on
 * each visit (NovaPortfolioGrid).
 */
const MAX_SHOWN = 4;

/** "AK Barbers – web pro barber brand" -> name "AK Barbers", tagline the rest. */
function splitTitle(title: string): { name: string; tagline: string } {
  const [name, ...rest] = title.split(/\s+[\u2013-]\s+/);
  return { name: name.trim(), tagline: rest.join(" – ").trim() };
}

export async function NovaPortfolio() {
  const items = await safeRead(() => getHomepagePortfolio("cs"), [], "nova portfolio");

  // The section is all cards; with none it would render as a bare heading.
  if (items.length === 0) return null;

  const projects = items.map((item) => {
    const { name, tagline } = splitTitle(item.title);
    return {
      id: item.id,
      name: item.clientName || name,
      // Prefer the editorial category; fall back to what the title says.
      category: item.category || tagline,
      imageUrl: item.imageUrl || undefined,
      href: `/portfolio/${item.id}`,
    };
  });

  return (
    <section id="prace" className="nova-container nova-section scroll-mt-20">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="nova-h2">Naše práce</h2>
          <p className="nova-lead">Reálné projekty, reálné výsledky.</p>
        </div>
        <Link
          href="/portfolio"
          className="text-base font-semibold"
          style={{ color: "var(--n-brand-dark)" }}
        >
          Všechny projekty ›
        </Link>
      </div>

      <NovaPortfolioGrid projects={projects} max={MAX_SHOWN} />
    </section>
  );
}
