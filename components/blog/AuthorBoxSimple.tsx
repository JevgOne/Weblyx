import Link from 'next/link';
import { Users } from 'lucide-react';

const authorContent = {
  cs: {
    name: 'Tým Weblyx',
    bio: 'Vytváříme moderní weby s garancí rychlosti. Next.js místo WordPress — rychlejší, bezpečnější, lepší SEO.',
    linkText: 'Více o nás →',
    linkHref: '/o-nas',
  },
  de: {
    name: 'Weblyx Team',
    bio: 'Wir erstellen moderne Websites mit Geschwindigkeitsgarantie. Next.js statt WordPress — schneller, sicherer, besseres SEO.',
    linkText: 'Mehr über uns →',
    linkHref: '/uber-uns',
  },
} as const;

interface AuthorBoxSimpleProps {
  locale: 'cs' | 'de';
}

export function AuthorBoxSimple({ locale }: AuthorBoxSimpleProps) {
  const t = authorContent[locale] || authorContent.cs;

  return (
    <div className="not-prose mt-10 mb-2 flex items-start gap-4 p-5 rounded-xl border border-neutral-100 dark:border-border bg-neutral-50/50 dark:bg-card/30">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/15 flex-shrink-0">
        <Users className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-foreground">
          {t.name}
        </p>
        <p className="text-sm text-neutral-500 dark:text-muted-foreground leading-relaxed mt-1">
          {t.bio}
        </p>
        <Link
          href={t.linkHref}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium mt-2 inline-block"
        >
          {t.linkText}
        </Link>
      </div>
    </div>
  );
}
