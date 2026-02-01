import { Metadata } from "next";
import Link from "next/link";
import { Star, Heart, ExternalLink, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Ohodnoťte nás | Weblyx",
  description:
    "Vaše zpětná vazba nám pomáhá růst. Zanechte nám recenzi na Google — zabere to jen minutku.",
  robots: { index: false, follow: false },
};

const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJu9LD5DuVC0cRaH6kYvXkDbM";

export default function RecenzePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-lg text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center">
          <Heart className="w-10 h-10 text-teal-500" />
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Děkujeme za spolupráci!
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Jsme rádi, že jste si vybrali Weblyx. Vaše zpětná vazba nám
            pomáhá zlepšovat služby a pomáhat dalším klientům.
          </p>
        </div>

        {/* Stars decoration */}
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="w-8 h-8 text-yellow-400 fill-yellow-400"
            />
          ))}
        </div>

        {/* CTA Button */}
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5"
        >
          <Star className="w-5 h-5" />
          Zanechat recenzi na Google
          <ExternalLink className="w-4 h-4 opacity-70" />
        </a>

        <p className="text-sm text-muted-foreground">
          Zabere to jen minutku — stačí zvolit počet hvězdiček a napsat pár
          slov. Každá recenze se počítá! ⭐
        </p>

        {/* Alternative */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">
            Máte nápad, jak se můžeme zlepšit?
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            Napište nám přímo
          </Link>
        </div>
      </div>
    </main>
  );
}
