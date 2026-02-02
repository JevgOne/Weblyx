'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLocale } from 'next-intl';

const feedbackLabels = {
  cs: {
    question: 'Byl tento článek užitečný?',
    yes: 'Ano',
    no: 'Ne',
    thankYou: 'Děkujeme za zpětnou vazbu! 🙏',
  },
  de: {
    question: 'War dieser Artikel hilfreich?',
    yes: 'Ja',
    no: 'Nein',
    thankYou: 'Danke für Ihr Feedback! 🙏',
  },
} as const;

interface ArticleFeedbackProps {
  postId: string;
}

export function ArticleFeedback({ postId }: ArticleFeedbackProps) {
  const locale = useLocale() as 'cs' | 'de';
  const t = feedbackLabels[locale] || feedbackLabels.cs;
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<'up' | 'down' | null>(null);

  const handleFeedback = async (vote: 'up' | 'down') => {
    setSelected(vote);
    setSubmitted(true);

    try {
      await fetch('/api/blog/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, vote, locale }),
      });
    } catch {
      // Silently fail — UX already shows the thank-you
    }
  };

  if (submitted) {
    return (
      <div className="not-prose my-10 py-6 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 dark:bg-primary/10 text-primary text-sm font-medium">
          {selected === 'up' ? (
            <ThumbsUp className="h-4 w-4 fill-primary" />
          ) : (
            <ThumbsDown className="h-4 w-4 fill-primary" />
          )}
          {t.thankYou}
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose my-10 py-6 flex flex-col items-center gap-4">
      <p className="text-sm text-neutral-500 dark:text-muted-foreground font-medium">
        {t.question}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleFeedback('up')}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-border text-neutral-600 dark:text-neutral-300 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 text-sm"
          aria-label={t.yes}
        >
          <ThumbsUp className="h-4 w-4" />
          {t.yes}
        </button>
        <button
          onClick={() => handleFeedback('down')}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 dark:border-border text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 text-sm"
          aria-label={t.no}
        >
          <ThumbsDown className="h-4 w-4" />
          {t.no}
        </button>
      </div>
    </div>
  );
}
