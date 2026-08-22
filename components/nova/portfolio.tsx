import Image from "next/image";
import Link from "next/link";
import { getPublishedPortfolio } from "@/lib/turso/portfolio";

/**
 * The four featured projects and their copy are an editorial choice from the
 * design, so they are fixed here. Screenshots come from the portfolio CMS —
 * matched by name — so uploading an image in the admin updates this section
 * without a code change.
 */
const FEATURED = [
  { name: "NovaDom", category: "Reality · správa nemovitostí · investice" },
  { name: "Resilient Mind", category: "Prémiový coaching · membership · booking" },
  { name: "KAJO Studio 360", category: "360° video booth · eventy" },
  { name: "AK Barbers", category: "Barber brand · pixel-perfect realizace" },
];

/** Loose match so "AK Barbers – web" in the CMS still resolves to "AK Barbers". */
function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function NovaPortfolio() {
  let cmsItems: { title: string; imageUrl?: string; id: string }[] = [];
  try {
    cmsItems = await getPublishedPortfolio("cs");
  } catch {
    // Section still renders with placeholders if the CMS is unreachable.
  }

  const projects = FEATURED.map((project) => {
    const key = normalise(project.name);
    const match = cmsItems.find((item) => {
      const title = normalise(item.title);
      return title.includes(key) || key.includes(title);
    });

    return {
      ...project,
      imageUrl: match?.imageUrl,
      href: match ? `/portfolio/${match.id}` : undefined,
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

      <div className="nova-col2 grid grid-cols-2 gap-8">
        {projects.map((project) => {
          const card = (
            <>
              <div
                className="relative overflow-hidden rounded-2xl border"
                style={{
                  aspectRatio: "16 / 11",
                  background: "#E2E8F0",
                  borderColor: "var(--n-border-soft)",
                }}
              >
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={`${project.name} — ukázka realizace`}
                    fill
                    sizes="(max-width: 1080px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-sm font-medium"
                    style={{ color: "var(--n-text-muted)" }}
                  >
                    {project.name}
                  </span>
                )}
              </div>
              <h3 className="mt-5 text-xl font-bold" style={{ letterSpacing: "-.02em" }}>
                {project.name}
              </h3>
              <p className="mt-1 text-[15px] font-medium" style={{ color: "var(--n-text-muted)" }}>
                {project.category}
              </p>
            </>
          );

          return project.href ? (
            <Link key={project.name} href={project.href} className="block">
              {card}
            </Link>
          ) : (
            <article key={project.name}>{card}</article>
          );
        })}
      </div>
    </section>
  );
}
