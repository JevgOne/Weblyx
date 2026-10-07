'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { useLocale } from 'next-intl';
import type { TocHeading } from '@/lib/blog-utils';

const tocLabels = {
  cs: { title: 'V tomto článku', expand: 'Zobrazit obsah' },
  de: { title: 'Inhaltsverzeichnis', expand: 'Inhaltsverzeichnis anzeigen' },
} as const;

interface TableOfContentsProps {
  headings: TocHeading[];
}

/**
 * The contents list shows chapters only. With sub-headings included it ran to
 * twenty faint lines — "Řešení:", "Typické problémy:" repeated under every
 * chapter — and nobody could tell where in the article they were. Sub-headings
 * come back only for an article that has too few chapters to navigate by.
 */
function chapters(headings: TocHeading[]): TocHeading[] {
  const top = headings.filter((h) => h.level === 2);
  return top.length >= 3 ? top : headings;
}

/**
 * Desktop Table of Contents — fixed on the right side of the viewport.
 * Only visible on xl+ screens where there's enough room beside the article.
 */
export function DesktopTableOfContents({ headings }: TableOfContentsProps) {
  const locale = useLocale() as 'cs' | 'de';
  const labels = tocLabels[locale] || tocLabels.cs;
  const [activeId, setActiveId] = useState<string>('');

  const [isArticleVisible, setIsArticleVisible] = useState(true);
  const items = chapters(headings);

  useEffect(() => {
    const headingElements = items
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings]);

  // Hide when scrolled past the article into the footer
  useEffect(() => {
    const article = document.getElementById('article-content');
    if (!article) return;

    const handleScroll = () => {
      const rect = article.getBoundingClientRect();
      setIsArticleVisible(rect.bottom > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`hidden xl:block fixed top-28 w-56 max-h-[70vh] overflow-y-auto scrollbar-thin transition-opacity duration-300 ${isArticleVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ left: 'calc(50% + 22rem + 2.5rem)' }}
      aria-label={labels.title}
    >
      <p className="mb-3 text-sm font-bold text-neutral-900 dark:text-foreground">{labels.title}</p>
      <ol className="border-l border-neutral-200 dark:border-border">
        {items.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={heading.id}>
              <button
                onClick={() => scrollTo(heading.id)}
                aria-current={active ? 'location' : undefined}
                className={`-ml-px block w-full border-l-2 py-1.5 pl-4 text-left text-[14px] leading-snug transition-colors duration-200 ${
                  active
                    ? 'border-primary font-semibold text-neutral-900 dark:text-foreground'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 dark:text-muted-foreground dark:hover:text-foreground'
                }`}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ol>
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
          {chapters(headings).map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollTo(heading.id)}
                className={`
                  text-left text-sm leading-relaxed w-full py-1 text-neutral-600 dark:text-muted-foreground hover:text-primary transition-colors
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
