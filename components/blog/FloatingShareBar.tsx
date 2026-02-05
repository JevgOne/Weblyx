'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Link as LinkIcon, Check, MessageCircle } from 'lucide-react';
import { useLocale } from 'next-intl';

const labels = {
  cs: {
    share: 'Sdílet',
    copied: 'Zkopírováno!',
    copyLink: 'Kopírovat odkaz',
    facebook: 'Sdílet na Facebooku',
    twitter: 'Sdílet na X',
    linkedin: 'Sdílet na LinkedIn',
    whatsapp: 'Sdílet přes WhatsApp',
  },
  de: {
    share: 'Teilen',
    copied: 'Kopiert!',
    copyLink: 'Link kopieren',
    facebook: 'Auf Facebook teilen',
    twitter: 'Auf X teilen',
    linkedin: 'Auf LinkedIn teilen',
    whatsapp: 'Per WhatsApp teilen',
  },
} as const;

interface FloatingShareBarProps {
  url: string;
  title: string;
}

export function FloatingShareBar({ url, title }: FloatingShareBarProps) {
  const locale = useLocale() as 'cs' | 'de';
  const t = labels[locale] || labels.cs;
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);

  // Hide when scrolled past the article into the footer
  useEffect(() => {
    const article = document.getElementById('article-content');
    if (!article) return;

    const handleScroll = () => {
      const rect = article.getBoundingClientRect();
      setVisible(rect.bottom > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseUrl = locale === 'de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';
  const fullUrl = `${baseUrl}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = fullUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const iconBtnClass =
    'flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200 dark:border-border bg-white dark:bg-card text-neutral-500 dark:text-neutral-400 hover:text-primary hover:border-primary/30 dark:hover:text-primary dark:hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow';

  return (
    <>
      {/* Desktop: Fixed left side */}
      <div
        className={`hidden xl:flex fixed top-1/3 flex-col gap-2 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ right: 'calc(50% + 22rem + 2.5rem)' }}
        aria-label={t.share}
      >
        <button
          onClick={copyToClipboard}
          className={iconBtnClass}
          aria-label={t.copyLink}
          title={t.copyLink}
        >
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <LinkIcon className="h-4 w-4" />
          )}
        </button>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={iconBtnClass}
          aria-label={t.twitter}
          title={t.twitter}
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={iconBtnClass}
          aria-label={t.linkedin}
          title={t.linkedin}
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className={iconBtnClass}
          aria-label={t.facebook}
          title={t.facebook}
        >
          <Facebook className="h-4 w-4" />
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={iconBtnClass}
          aria-label={t.whatsapp}
          title={t.whatsapp}
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>

      {/* Mobile: Fixed bottom bar */}
      <div className={`xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-card/90 backdrop-blur-md border-t border-neutral-100 dark:border-border px-4 py-2 flex items-center justify-center gap-3 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-border text-neutral-600 dark:text-neutral-300 hover:text-primary hover:border-primary/30 transition-all"
          aria-label={t.copyLink}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" />
              <span className="text-primary">{t.copied}</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-3.5 w-3.5" />
              <span>{t.copyLink}</span>
            </>
          )}
        </button>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors"
          aria-label={t.twitter}
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors"
          aria-label={t.linkedin}
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors"
          aria-label={t.facebook}
        >
          <Facebook className="h-4 w-4" />
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors"
          aria-label={t.whatsapp}
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>
    </>
  );
}
