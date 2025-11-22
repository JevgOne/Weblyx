import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { adminDbInstance } from "@/lib/firebase-admin";
import { Review } from "@/types/review";

async function getReviews(): Promise<Review[]> {
  try {
    if (!adminDbInstance) {
      console.error('Firebase Admin not initialized');
      return [];
    }

    const snapshot = await adminDbInstance
      .collection('reviews')
      .where('published', '==', true)
      .orderBy('order', 'asc')
      .limit(6)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const reviews: Review[] = [];
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        authorName: data.authorName || "",
        authorImage: data.authorImage || "",
        authorRole: data.authorRole || "",
        rating: data.rating || 5,
        text: data.text || "",
        date: data.date?.toDate?.() || new Date(),
        source: data.source || "manual",
        sourceUrl: data.sourceUrl || "",
        published: data.published || false,
        featured: data.featured || false,
        order: data.order || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as Review);
    });

    return reviews;
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
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export async function Reviews() {
  const reviews = await getReviews();

  // Don't render section if no reviews
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section id="recenze" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Co říkají naši klienti</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Přečtěte si, co o nás říkají spokojení zákazníci
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
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
                    {review.source === "google" && (
                      <p className="text-xs text-primary">Google recenze</p>
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
                    Zobrazit originál →
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
