import { Metadata } from "next";
import { Star, ExternalLink, Quote } from "lucide-react";
import { getPublishedReviews } from "@/lib/turso/reviews";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bewertungen | Seitelyx – was unsere Kunden sagen",
  description:
    "Lesen Sie Bewertungen von unseren zufriedenen Kunden. Seitelyx – Website-Erstellung mit 5.0 Google-Bewertung.",
};

const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJu9LD5DuVC0cRaH6kYvXkDbM";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function BewertungenPage() {
  const reviews = await getPublishedReviews("de");
  // Fallback: if no DE reviews, show all reviews
  const allReviews =
    reviews.length > 0 ? reviews : await getPublishedReviews();

  const reviewCount = allReviews.length;
  const avgRating =
    reviewCount > 0
      ? Math.round(
          (allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
        ) / 10
      : 5;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-3xl text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Was unsere Kunden sagen
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Echte Bewertungen von Menschen, denen wir mit ihrer Website
            geholfen haben.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="text-2xl font-bold">{avgRating}</span>
            <span className="text-muted-foreground">
              ({reviewCount} Bewertungen)
            </span>
          </div>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {allReviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {allReviews.map((review) => (
                <div
                  key={review.id}
                  className="relative bg-card border border-border/60 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-teal-500/10" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-teal-500 font-semibold text-sm">
                          {review.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {review.authorName}
                        </p>
                        {review.authorRole && (
                          <p className="text-xs text-muted-foreground">
                            {review.authorRole}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90">
                    {review.text}
                  </p>

                  {review.sourceUrl && (
                    <a
                      href={review.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-teal-500 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {review.source === "Google"
                        ? "Google Bewertung"
                        : review.source}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Noch keine Bewertungen. Seien Sie der Erste!
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-border/40 bg-muted/20">
        <div className="container mx-auto max-w-lg text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Haben wir zusammengearbeitet? Lassen Sie es uns wissen!
          </h2>
          <p className="text-muted-foreground">
            Ihr Feedback hilft uns, unsere Dienstleistungen zu verbessern. Jede
            Bewertung zählt.
          </p>

          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="w-7 h-7 text-yellow-400 fill-yellow-400"
              />
            ))}
          </div>

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

          <p className="text-xs text-muted-foreground">
            Es dauert nur eine Minute — wählen Sie die Sterne und schreiben
            Sie ein paar Worte.
          </p>
        </div>
      </section>
    </main>
  );
}
