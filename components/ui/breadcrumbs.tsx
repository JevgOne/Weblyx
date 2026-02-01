import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from 'next-intl';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const t = useTranslations('nav');
  const homeLabel = t('home');

  return (
    <nav aria-label="Breadcrumb" className={`py-4 px-4 ${className}`}>
      <ol className="flex items-center gap-2 text-sm text-muted-foreground container mx-auto max-w-7xl">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
            aria-label={homeLabel}
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">{homeLabel}</span>
          </Link>
        </li>

        {/* Dynamic breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
