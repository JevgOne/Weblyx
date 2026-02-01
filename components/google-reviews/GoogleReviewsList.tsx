"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLocale } from "next-intl";

interface GoogleReview {
  id: string;
  authorName: string;
  authorImage?: string;
  rating: number;
  text: string;
  date: string;
  sourceUrl?: string;
  relativeTime?: string;
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
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export function GoogleReviewsList() {
  const locale = useLocale();
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-reviews');
        const data = await response.json();

        if (data.success) {
          setReviews(data.data.reviews.slice(0, 6)); // Limit to 6 reviews
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nepodařilo se načíst recenze z Google.</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 space-y-4">
            {/* Rating */}
            <StarRating rating={review.rating} />

            {/* Review text */}
            <p className="text-muted-foreground leading-relaxed line-clamp-4">
              "{review.text}"
            </p>

            {/* Author info */}
            <div className="flex items-center gap-3 pt-4 border-t">
              {review.authorImage ? (
                <img
                  src={review.authorImage}
                  alt={review.authorName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                  {review.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold">{review.authorName}</p>
                <p className="text-xs text-primary">Google</p>
                {review.relativeTime && (
                  <p className="text-xs text-muted-foreground">{review.relativeTime}</p>
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
                {locale === 'de' ? 'Auf Google ansehen' : 'Zobrazit na Google'}
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
