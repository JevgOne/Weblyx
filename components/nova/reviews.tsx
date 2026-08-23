import { getPublishedReviews } from "@/lib/turso/reviews";
import { safeRead } from "@/lib/safe-read";

/**
 * Real reviews, read from the CMS.
 *
 * This section used to carry three testimonials written into the file during
 * design — under the names of actual clients, but not in their words. The
 * database holds what those people actually wrote, so it is the only
 * acceptable source: quoting a named person means quoting them.
 *
 * The rating and the count are counted from the same rows, so the headline can
 * never claim an average the reviews below it do not support.
 */
const MAX_SHOWN = 3;

/** "5 recenzí" — Czech has three plural forms: 1, 2–4, 5+. */
function reviewCountLabel(count: number): string {
  if (count === 1) return "1 recenze";
  if (count < 5) return `${count} recenze`;
  return `${count} recenzí`;
}

function formatRating(value: number): string {
  // 5 -> "5.0", 4.67 -> "4.7"; the design sets this as a display figure.
  return value.toFixed(1);
}

export async function NovaReviews() {
  const reviews = await safeRead(() => getPublishedReviews("cs"), [], "nova reviews");

  // Nothing to show is better than an empty five-star headline.
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const shown = reviews.slice(0, MAX_SHOWN);

  // Only claim Google as the source when every review shown actually came from
  // it. The column is free text and the rows say "Google", not "google".
  const isGoogle = (source?: string) => source?.trim().toLowerCase() === "google";
  const allFromGoogle = shown.every((r) => isGoogle(r.source));
  const sourceLabel = allFromGoogle ? "Hodnocení na Google" : "Hodnocení klientů";

  return (
    <section className="nova-container nova-section">
      <div className="mb-16 text-center">
        <p className="text-[44px] font-extrabold" style={{ letterSpacing: "-.04em" }}>
          {formatRating(average)} <span style={{ color: "var(--n-brand-dark)" }}>★</span>
        </p>
        <p className="mt-2.5 text-[17px] font-semibold" style={{ color: "var(--n-text-muted)" }}>
          {sourceLabel} · {reviewCountLabel(reviews.length)}
        </p>
      </div>

      <div className="nova-col3 grid grid-cols-3 gap-6">
        {shown.map((review) => (
          <figure
            key={review.id}
            className="rounded-[18px] border p-[34px]"
            style={{ background: "var(--n-bg-alt)", borderColor: "var(--n-border-soft)" }}
          >
            <blockquote className="text-base font-medium" style={{ lineHeight: 1.6 }}>
              „{review.text}“
            </blockquote>
            <figcaption className="mt-6">
              <span className="block text-[15px] font-bold">{review.authorName}</span>
              <span
                className="block text-[13px] font-medium"
                style={{ color: "var(--n-text-muted)" }}
              >
                {review.authorRole || (isGoogle(review.source) ? "Google recenze" : "Klient")}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
