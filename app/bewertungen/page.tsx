import { Metadata } from "next";
import Link from "next/link";
import { Star, Heart, ExternalLink, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Bewerten Sie uns | Seitelyx",
  description:
    "Ihr Feedback hilft uns zu wachsen. Hinterlassen Sie uns eine Google-Bewertung — es dauert nur eine Minute.",
  robots: { index: false, follow: false },
};

const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJu9LD5DuVC0cRaH6kYvXkDbM";

export default function BewertungenPage() {
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
            Vielen Dank für die Zusammenarbeit!
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Wir freuen uns, dass Sie sich für Seitelyx entschieden haben. Ihr
            Feedback hilft uns, unsere Dienstleistungen zu verbessern und
            weiteren Kunden zu helfen.
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
          Google-Bewertung hinterlassen
          <ExternalLink className="w-4 h-4 opacity-70" />
        </a>

        <p className="text-sm text-muted-foreground">
          Es dauert nur eine Minute — wählen Sie die Sternanzahl und
          schreiben Sie ein paar Worte. Jede Bewertung zählt! ⭐
        </p>

        {/* Alternative */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">
            Haben Sie eine Idee, wie wir uns verbessern können?
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 text-sm text-teal-500 hover:text-teal-400 transition-colors font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            Schreiben Sie uns direkt
          </Link>
        </div>
      </div>
    </main>
  );
}
