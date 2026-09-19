import Link from "next/link";
import {
  CHANGE_TYPE_COLORS,
  CHANGE_TYPE_LABELS,
  formatChangeDate,
  type ChangelogEntry,
} from "@/lib/changelog/types";
import { listPublicChanges, PUBLIC_TIMELINE_LIMIT } from "@/lib/changelog/server";
import { safeRead } from "@/lib/safe-read";

export function ChangeBadge({ type }: { type: ChangelogEntry["type"] }) {
  const color = CHANGE_TYPE_COLORS[type];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-bold"
      style={{ color: color.fg, background: color.bg, letterSpacing: ".01em" }}
    >
      {CHANGE_TYPE_LABELS[type]}
    </span>
  );
}

/**
 * The timeline itself, shared by the landing-page section and /archiv.
 *
 * `author` is never rendered here: who inside the studio made a change is
 * internal, while the change itself is the point of showing the list at all.
 */
export function ChangelogTimeline({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <ol className="relative m-0 list-none p-0">
      {entries.map((entry, index) => (
        <li
          key={entry.id}
          className="nova-change-row grid gap-x-6 gap-y-2 py-6"
          style={{
            gridTemplateColumns: "120px 1px 1fr",
            borderTop: index === 0 ? "none" : "1px solid var(--n-border-soft)",
          }}
        >
          <time
            dateTime={new Date(entry.createdAt * 1000).toISOString()}
            className="text-sm font-medium"
            style={{ color: "var(--n-text-muted)" }}
          >
            {formatChangeDate(entry.createdAt)}
          </time>

          {/* The rail: a hairline with the entry's dot sitting on it. */}
          <div className="nova-change-rail relative" style={{ background: "var(--n-border-soft)" }}>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[7px] h-2 w-2 -translate-x-1/2 rounded-full"
              style={{ background: "var(--n-brand)" }}
            />
          </div>

          <div>
            <ChangeBadge type={entry.type} />
            <p className="mt-2 text-base font-semibold" style={{ letterSpacing: "-.01em" }}>
              {entry.title}
            </p>
            {entry.detail && (
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--n-text-muted)" }}>
                {entry.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * `#archiv` on the landing page: the ten newest public entries.
 *
 * Renders nothing at all when the archive is empty — a "what's new" heading
 * over a blank list argues the opposite of what the section is for.
 */
export async function NovaChangelog() {
  const entries = await safeRead(
    () => listPublicChanges(PUBLIC_TIMELINE_LIMIT),
    [],
    "nova changelog"
  );

  if (entries.length === 0) return null;

  return (
    <section id="archiv" className="nova-section" style={{ background: "var(--n-bg-alt)" }}>
      <div className="nova-container">
        <div className="mb-14 max-w-[720px]">
          <h2 className="nova-h2">Co je na webu nového</h2>
          <p className="nova-lead">
            Průběžně web vyvíjíme a rozšiřujeme. Tady je přehled posledních změn.
          </p>
        </div>

        <ChangelogTimeline entries={entries} />

        <Link
          href="/archiv"
          className="mt-10 inline-block text-[15px] font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--n-brand-dark)" }}
        >
          Zobrazit celý archiv ›
        </Link>
      </div>
    </section>
  );
}
