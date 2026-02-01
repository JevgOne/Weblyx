'use client';

import { Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocale } from 'next-intl';

const shareLabels = {
  cs: {
    share: "Sdílet:",
    facebook: "Sdílet na Facebooku",
    twitter: "Sdílet na X (Twitter)",
    linkedin: "Sdílet na LinkedIn",
    copy: "Kopírovat odkaz",
    copied: "Zkopírováno!",
    copyLabel: "Zkopírovat odkaz",
  },
  de: {
    share: "Teilen:",
    facebook: "Auf Facebook teilen",
    twitter: "Auf X (Twitter) teilen",
    linkedin: "Auf LinkedIn teilen",
    copy: "Link kopieren",
    copied: "Kopiert!",
    copyLabel: "Link kopieren",
  },
} as const;

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const locale = useLocale() as 'cs' | 'de';
  const labels = shareLabels[locale] || shareLabels.cs;

  const baseUrl = locale === 'de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';
  const fullUrl = `${baseUrl}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        {labels.share}
      </span>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        asChild
      >
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.facebook}
        >
          <Facebook className="h-4 w-4" />
          <span className="hidden sm:inline">Facebook</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        asChild
      >
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.twitter}
        >
          <Twitter className="h-4 w-4" />
          <span className="hidden sm:inline">X</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        asChild
      >
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.linkedin}
        >
          <Linkedin className="h-4 w-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={copyToClipboard}
        aria-label={labels.copyLabel}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline text-primary">{labels.copied}</span>
          </>
        ) : (
          <>
            <LinkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{labels.copy}</span>
          </>
        )}
      </Button>
    </div>
  );
}
