'use client';

import { Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://weblyx.cz${url}`;
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
        Sdílet:
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
          aria-label="Sdílet na Facebooku"
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
          aria-label="Sdílet na X (Twitter)"
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
          aria-label="Sdílet na LinkedIn"
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
        aria-label="Zkopírovat odkaz"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline text-primary">Zkopírováno!</span>
          </>
        ) : (
          <>
            <LinkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Kopírovat odkaz</span>
          </>
        )}
      </Button>
    </div>
  );
}
