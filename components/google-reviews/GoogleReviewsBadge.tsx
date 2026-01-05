"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleReviewsBadgeProps {
  rating?: number;
  reviewCount?: number;
  placeUrl?: string;
}

export function GoogleReviewsBadge({
  rating = 5.0,
  reviewCount = 7,
  placeUrl = "https://share.google/cZIQkYTq2bVmkRAAP"
}: GoogleReviewsBadgeProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
      {/* Google Badge */}
      <a
        href={placeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 dark:border-gray-700 group"
      >
        {/* Google Logo */}
        <svg className="h-8 w-8" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {reviewCount} Google {reviewCount === 1 ? 'recenze' : 'recenzí'}
          </div>
        </div>

        <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* CTA Button */}
      <Button
        asChild
        variant="outline"
        className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
      >
        <a
          href={placeUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Napsat recenzi na Google
        </a>
      </Button>
    </div>
  );
}
