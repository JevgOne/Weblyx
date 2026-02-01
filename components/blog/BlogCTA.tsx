import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface BlogCTAProps {
  locale: string;
}

export function BlogCTA({ locale }: BlogCTAProps) {
  const isDE = locale === "de";

  return (
    <div className="not-prose my-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1 space-y-2">
          <p className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-foreground">
            {isDE
              ? "Brauchen Sie eine schnelle Website?"
              : "Potřebujete rychlý web?"}
          </p>
          <p className="text-sm text-neutral-500 dark:text-muted-foreground leading-relaxed">
            {isDE
              ? "Wir erstellen moderne Websites ab 320 € — in 5–7 Tagen, mit PageSpeed 90+. Kostenlose Beratung."
              : "Děláme moderní weby od 7 990 Kč — za 5–7 dní, s PageSpeed 90+. Konzultace zdarma."}
          </p>
        </div>
        <Link
          href={isDE ? "/anfrage" : "/poptavka"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shrink-0 group"
        >
          {isDE ? "Unverbindliche Anfrage" : "Nezávazná poptávka"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
