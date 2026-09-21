import Link from "next/link";
import { notFound } from "next/navigation";
import { ChangelogTimeline } from "@/components/nova/changelog";
import { listChanges, PAGE_SIZE } from "@/lib/changelog/server";
import { safeRead } from "@/lib/safe-read";

export const revalidate = 300;

/**
 * The full public archive.
 *
 * Paginated through the URL rather than a "load more" button: the landing page
 * ships almost no JavaScript on purpose, and a list of dated links is also the
 * version a crawler and a bookmark can both follow.
 */
export default async function ArchivPage({
  searchParams,
}: {
  searchParams: Promise<{ strana?: string }>;
}) {
  const params = await searchParams;
  const requested = Number(params.strana ?? "1");
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;

  const { entries, total } = await safeRead(
    () => listChanges({ publicOnly: true, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    { entries: [], total: 0 },
    "archiv page"
  );

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Page 1 stays reachable even when the archive is empty; anything past the
  // end is a dead URL, not an empty page.
  if (page > 1 && page > lastPage) notFound();

  return (
    <>
      <main className="nova-container nova-section">
        <div className="mb-14 max-w-[720px]">
          <p className="nova-label">Archiv změn</p>
          <h1 className="nova-h2 mt-3">Co je na webu nového</h1>
          <p className="nova-lead">
            Průběžně web vyvíjíme a rozšiřujeme. Tady je kompletní přehled změn.
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-base font-medium" style={{ color: "var(--n-text-muted)" }}>
            Zatím tu nic není. Jakmile na webu něco upravíme, objeví se to tady.
          </p>
        ) : (
          <ChangelogTimeline entries={entries} />
        )}

        {lastPage > 1 && (
          <nav
            className="mt-12 flex items-center justify-between gap-4 border-t pt-8 text-[15px] font-semibold"
            style={{ borderColor: "var(--n-border-soft)" }}
            aria-label="Stránkování archivu"
          >
            {page > 1 ? (
              <Link
                href={page === 2 ? "/archiv" : `/archiv?strana=${page - 1}`}
                style={{ color: "var(--n-brand-dark)" }}
                className="transition-opacity hover:opacity-70"
              >
                ‹ Novější
              </Link>
            ) : (
              <span />
            )}

            <span className="text-sm font-medium" style={{ color: "var(--n-text-muted)" }}>
              Strana {page} z {lastPage}
            </span>

            {page < lastPage ? (
              <Link
                href={`/archiv?strana=${page + 1}`}
                style={{ color: "var(--n-brand-dark)" }}
                className="transition-opacity hover:opacity-70"
              >
                Starší ›
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <Link
          href="/"
          className="mt-12 inline-block text-[15px] font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--n-brand-dark)" }}
        >
          ‹ Zpět na web
        </Link>
      </main>
    </>
  );
}
