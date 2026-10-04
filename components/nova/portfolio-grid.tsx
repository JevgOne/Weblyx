"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface GridProject {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  href: string;
}

/**
 * Shows `max` of the homepage projects, picked at random on every visit, so
 * returning visitors see different work. The server renders the first ones
 * (stable HTML for crawlers and no-JS); the shuffle happens after mount. The
 * section sits well below the fold, so the swap is not seen.
 */
export function NovaPortfolioGrid({ projects, max }: { projects: GridProject[]; max: number }) {
  const [shown, setShown] = useState(() => projects.slice(0, max));

  useEffect(() => {
    const pool = [...projects];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setShown(pool.slice(0, max));
  }, [projects, max]);

  return (
    <div className="nova-col2 grid grid-cols-2 gap-8">
      {shown.map((project) => (
        <Link key={project.id} href={project.href} className="block">
          <div
            className="relative overflow-hidden rounded-2xl border"
            style={{ aspectRatio: "16 / 11", background: "#E2E8F0", borderColor: "var(--n-border-soft)" }}
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
        </Link>
      ))}
    </div>
  );
}
