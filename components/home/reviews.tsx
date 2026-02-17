import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Review } from "@/types/review";
import { getPublishedReviews } from "@/lib/turso/reviews";
import { getTranslations, getLocale } from "next-intl/server";
import { GoogleReviewsBadge } from "@/components/google-reviews/GoogleReviewsBadge";
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
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );
}

export async function Reviews() {
  const t = await getTranslations("reviews");
  const reviews = await getReviews();

  // Don't render section if no reviews
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section id="recenze" className="py-24 bg-muted/30">

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Google Reviews Badge */}
        <GoogleReviewsBadge
          rating={5.0}
          reviewCount={8}
          placeUrl="https://share.google/cZIQkYTq2bVmkRAAP"
        />

        {/* Reviews Grid - Unified (Google + Manual from DB) */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mt-12">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className={`hover:shadow-lg transition-shadow ${
                review.featured ? "border-2 border-primary" : ""
              }`}
            >
              <CardContent className="p-6 space-y-4">
                {/* Rating */}
                <StarRating rating={review.rating} />

                {/* Review text */}
                <p className="text-muted-foreground leading-relaxed">
                  "{review.text}"
                </p>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  {review.authorImage ? (
                    <img
                      src={review.authorImage}
                      alt={review.authorName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{review.authorName}</p>
                    {review.authorRole && (
                      <p className="text-sm text-muted-foreground">
                        {review.authorRole}
                      </p>
                    )}
                    {review.source && review.source.toLowerCase() !== "manual" && review.source !== "Ověřený klient" && (
                      <p className="text-xs text-primary">{review.source}</p>
                    )}
                  </div>
                </div>

                {/* Source link */}
                {review.sourceUrl && (
                  <a
                    href={review.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block"
                  >
                    {t("viewOriginal")}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
