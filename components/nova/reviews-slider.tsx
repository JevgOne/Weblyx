"use client";

import { useEffect, useRef, useState } from "react";

export interface SliderReview {
  id: string;
  authorName: string;
  authorImage: string | null;
  rating: number;
  text: string;
  /** "leden 2026" — formatted on the server so the client renders the same. */
  date: string;
  fromGoogle: boolean;
  sourceUrl: string | null;
}

/** Long reviews are clamped to this many lines until someone opens them. */
const CLAMP_CHARS = 260;

function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** Brand-adjacent tints so the avatars read as a set, not a rainbow. */
const AVATAR_TINTS = ["#0d9488", "#0f766e", "#14b8a6", "#0e7490", "#115e59", "#0891b2"];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`Hodnocení ${rating} z 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden="true">
          <path
            d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
            fill={i <= rating ? "#f5b301" : "#e2e8f0"}
          />
        </svg>
      ))}
    </span>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function ReviewCard({ review, index }: { review: SliderReview; index: number }) {
  const [open, setOpen] = useState(false);
  const long = review.text.length > CLAMP_CHARS;
  const text = long && !open ? review.text.slice(0, review.text.lastIndexOf(" ", CLAMP_CHARS)) + "…" : review.text;

  return (
    <figure
      className="nova-review-card flex shrink-0 snap-start flex-col rounded-[20px] border bg-white p-7"
      style={{ borderColor: "var(--n-border-soft)", boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.05)" }}
    >
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        {review.fromGoogle && <GoogleMark />}
      </div>

      <blockquote className="mt-5 flex-1 text-[15.5px] font-medium" style={{ lineHeight: 1.65, color: "var(--n-text-body)" }}>
        „{text}“
        {long && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 font-semibold hover:underline"
            style={{ color: "var(--n-brand-dark)" }}
          >
            {open ? "Méně" : "Číst celé"}
          </button>
        )}
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t pt-5" style={{ borderColor: "var(--n-border-soft)" }}>
        {review.authorImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- Google profile photos, already small
          <img src={review.authorImage} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold text-white"
            style={{ background: AVATAR_TINTS[index % AVATAR_TINTS.length] }}
            aria-hidden="true"
          >
            {initials(review.authorName)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-bold" style={{ color: "var(--n-ink)" }}>
            {review.authorName}
          </span>
          <span className="block text-[13px] font-medium" style={{ color: "var(--n-text-muted)" }}>
            {review.fromGoogle ? "Recenze na Googlu" : "Recenze"} · {review.date}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * A horizontal band instead of a wall: fifteen reviews stacked one under
 * another made the homepage endless on a phone. Native scroll-snap does the
 * sliding — swipe on touch, arrows on desktop — so it needs no carousel
 * library and stays usable without JavaScript.
 */
export function ReviewsSlider({ reviews }: { reviews: SliderReview[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
      const card = el.querySelector<HTMLElement>(".nova-review-card");
      if (card) setActive(Math.round(el.scrollLeft / (card.offsetWidth + 20)));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".nova-review-card");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 360) + 20), behavior: "smooth" });
  };

  const arrow = (dir: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      onClick={() => scrollBy(dir)}
      disabled={disabled}
      aria-label={dir === 1 ? "Další recenze" : "Předchozí recenze"}
      className="flex h-11 w-11 items-center justify-center rounded-full border bg-white transition-opacity disabled:opacity-30"
      style={{ borderColor: "var(--n-border)" }}
    >
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d={dir === 1 ? "M8 4l6 6-6 6" : "M12 4l-6 6 6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <div>
      <div
        ref={track}
        className="nova-review-track flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
        role="region"
        aria-label="Recenze zákazníků"
        tabIndex={0}
      >
        {reviews.map((review, index) => (
          <ReviewCard key={review.id} review={review} index={index} />
        ))}
      </div>
      {/* Position dots on phones, where there are no arrows to say "there is more". */}
      <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
        {reviews.map((r, i) => (
          <span
            key={r.id}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === active ? 18 : 6, background: i === active ? "var(--n-brand-dark)" : "#cbd5e1" }}
          />
        ))}
      </div>
      <div className="mt-4 hidden justify-end gap-3 md:flex">
        {arrow(-1, edge.start)}
        {arrow(1, edge.end)}
      </div>
    </div>
  );
}
