'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

const ctaLabels = {
  cs: {
    heading: '📬 Chcete dostávat tipy na zlepšení webu?',
    description: 'Přihlaste se k odběru — praktické tipy pro rychlejší web, lepší SEO a více zákazníků. Žádný spam.',
    placeholder: 'váš@email.cz',
    button: 'Odebírat',
    success: 'Děkujeme! Potvrzení jsme poslali na váš e-mail.',
    error: 'Něco se pokazilo. Zkuste to prosím znovu.',
    already: 'Tento e-mail je již přihlášen k odběru.',
    invalid: 'Zadejte platnou e-mailovou adresu.',
  },
  de: {
    heading: '📬 Möchten Sie Tipps zur Website-Verbesserung erhalten?',
    description: 'Melden Sie sich an — praktische Tipps für schnellere Websites, besseres SEO und mehr Kunden. Kein Spam.',
    placeholder: 'ihre@email.de',
    button: 'Abonnieren',
    success: 'Vielen Dank! Wir haben eine Bestätigung an Ihre E-Mail gesendet.',
    error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    already: 'Diese E-Mail ist bereits angemeldet.',
    invalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
  },
} as const;

export function InlineNewsletterCTA() {
  const locale = useLocale() as 'cs' | 'de';
  const t = ctaLabels[locale] || ctaLabels.cs;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already' | 'invalid'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('invalid');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, source: 'blog-inline' }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else if (data.code === 'ALREADY_SUBSCRIBED') {
        setStatus('already');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="not-prose my-10 rounded-xl border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06] p-6 md:p-8 text-center">
        <div className="inline-flex items-center gap-2 text-primary font-medium">
          <CheckCircle className="h-5 w-5" />
          {t.success}
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose my-10 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.03] dark:from-primary/[0.06] dark:to-primary/[0.06] p-6 md:p-8">
      <div className="flex items-start gap-3 mb-4">
        <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-foreground mb-1">
            {t.heading}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-muted-foreground leading-relaxed">
            {t.description}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle' && status !== 'loading') setStatus('idle');
          }}
          placeholder={t.placeholder}
          className="flex-1 h-10 rounded-lg border border-neutral-200 dark:border-border bg-white dark:bg-background px-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          disabled={status === 'loading'}
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t.button}
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {(status === 'error' || status === 'already' || status === 'invalid') && (
        <p className={`text-xs mt-2 ${status === 'already' ? 'text-amber-600' : 'text-red-500'}`}>
          {status === 'already' ? t.already : status === 'invalid' ? t.invalid : t.error}
        </p>
      )}
    </div>
  );
}
