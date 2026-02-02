'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { useLocale } from 'next-intl';
import type { TocHeading } from '@/lib/blog-utils';

const tocLabels = {
  cs: { title: 'Obsah článku', expand: 'Zobrazit obsah' },
  de: { title: 'Inhaltsverzeichnis', expand: 'Inhaltsverzeichnis anzeigen' },
} as const;

interface TableOfContentsProps {
  headings: TocHeading[];
}

/**
 * Desktop Table of Contents — fixed on the right side of the viewport.
 * Only visible on xl+ screens where there's enough room beside the article.
 */
export function DesktopTableOfContents({ headings }: TableOfContentsProps) {
  const locale = useLocale() as 'cs' | 'de';
  const labels = tocLabels[locale] || tocLabels.cs;
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  if (headings.length < 3) return null;

  return (
    <nav
      className="hidden xl:block fixed top-28 w-52 max-h-[65vh] overflow-y-auto scrollbar-thin"
      style={{ left: 'calc(50% + 22rem + 2.5rem)' }}
      aria-label={labels.title}
    >
      <p className="text-[11px] uppercase tracking-widest text-neutral-300 dark:text-neutral-600 font-mono mb-3">
        {labels.title}
      </p>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => scrollTo(heading.id)}
              className={`
                text-left text-[13px] leading-snug w-full py-1 transition-colors duration-200
                ${heading.level === 3 ? 'pl-3' : 'pl-0'}
                ${
                  activeId === heading.id
                    ? 'text-primary font-medium'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }
              `}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Mobile Table of Contents — collapsible accordion within the article flow.
 * Visible on screens smaller than xl.
 */
export function MobileTableOfContents({ headings }: TableOfContentsProps) {
  const locale = useLocale() as 'cs' | 'de';
  const labels = tocLabels[locale] || tocLabels.cs;
  const [open, setOpen] = useState(false);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      setOpen(false);
    }
  }, []);

  if (headings.length < 3) return null;

  return (
    <div className="xl:hidden mb-8 rounded-lg border border-neutral-100 dark:border-border bg-neutral-50/50 dark:bg-card/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-neutral-600 dark:text-foreground/70 hover:text-neutral-900 dark:hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <List className="h-4 w-4" />
          {labels.title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul className="px-4 pb-3 space-y-0.5 border-t border-neutral-100 dark:border-border pt-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollTo(heading.id)}
                className={`
                  text-left text-sm leading-relaxed w-full py-1 text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors
                  ${heading.level === 3 ? 'pl-4' : 'pl-0 font-medium'}
                `}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
