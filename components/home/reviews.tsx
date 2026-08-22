import Image from "next/image";
import { Star } from "lucide-react";
import { Review } from "@/types/review";
import { getPublishedReviews } from "@/lib/turso/reviews";
import { getTranslations, getLocale } from "next-intl/server";
import { GoogleReviewsBadge } from "@/components/google-reviews/GoogleReviewsBadge";
import { LeadButton } from "@/components/tracking/LeadButton";
// NOTE: Individual Review JSON-LD schemas were removed (2026-02-01)
// Google does NOT support Review rich results for @type:Service (itemReviewed).
// The AggregateRating on LocalBusiness schema (in app/page.tsx) handles star ratings in search.
// See: https://developers.google.com/search/docs/appearance/structured-data/review-snippet

// Now using unified approach: Google reviews are imported to DB and approved in admin
// Both Google and manual reviews are displayed from Turso DB

async function getReviews(): Promise<Review[]> {
  try {
    // Get current locale to fetch locale-specific reviews
    const locale = (await getLocale()) as 'cs' | 'de';
    const reviews = await getPublishedReviews(locale);
    // Limit to 6 most important reviews (sorted by order)
    return reviews.slice(0, 6);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-[hsl(var(--hairline-strong))]"
          }`}
        />
      ))}
    </div>
  );
}

export async function Reviews() {
  const t = await getTranslations("reviews");
  const locale = await getLocale();
  const reviews = await getReviews();

  // Don't render section if no reviews
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section id="recenze" className="section surface-sunken hairline-top px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow">{locale === 'de' ? 'Bewertungen' : 'Recenze'}</p>
            <h2 className="display display-lg mt-5">{t("title")}</h2>
            <p className="lede mt-5">{t("subtitle")}</p>
          </div>

          {/* Google Reviews Badge */}
          <div className="shrink-0">
            <GoogleReviewsBadge
              rating={5.0}
              reviewCount={8}
              placeUrl="https://share.google/cZIQkYTq2bVmkRAAP"
            />
          </div>
        </div>

        {/* Reviews Grid - Unified (Google + Manual from DB) */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.id}
              className={`card-flat flex h-full flex-col p-7 ${
                review.featured ? "border-primary/35" : ""
              }`}
            >
              <div className="flex-1">
                {/* Rating */}
                <StarRating rating={review.rating} />

                {/* Review text */}
                <blockquote className="mt-5 text-[15px] leading-relaxed text-[hsl(var(--ink-soft))]">
                  {"\u201C"}{review.text}{"\u201D"}
                </blockquote>
              </div>

              {/* Author info */}
              <figcaption className="mt-6 flex items-center gap-3 border-t border-[hsl(var(--hairline))] pt-5">
                {review.authorImage ? (
                  <Image
                    src={review.authorImage}
                    alt={review.authorName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/[0.06] text-sm font-semibold text-primary">
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {review.authorName}
                  </p>
                  {review.authorRole && (
                    <p className="text-[13px] text-[hsl(var(--ink-faint))] truncate">
                      {review.authorRole}
                    </p>
                  )}
                  {review.source && review.source.toLowerCase() !== "manual" && review.source !== "Ověřený klient" && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--ink-faint))]">
                      {review.source}
                    </p>
                  )}
                </div>
              </figcaption>

              {/* Source link */}
              {review.sourceUrl && (
                <a
                  href={review.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-xs font-medium text-[hsl(var(--ink-faint))] underline underline-offset-4 decoration-[hsl(var(--hairline-strong))] hover:text-primary hover:decoration-primary transition-colors duration-200"
                >
                  {t("viewOriginal")}
                </a>
              )}
            </figure>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12">
          <LeadButton
            href={locale === 'de' ? '/anfrage' : '/poptavka'}
            size="lg"
            className="h-12 px-7 text-base font-semibold rounded-xl"
          >
            {locale === 'de' ? 'Werde unser nächster zufriedener Kunde' : 'Staňte se naším dalším spokojeným klientem'}
          </LeadButton>
        </div>
      </div>
    </section>
  );
}
