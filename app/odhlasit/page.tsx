import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isUnsubscribed, isValidUnsubscribeLink, unsubscribe } from '@/lib/outreach/unsubscribe';

export const metadata: Metadata = {
  title: 'Odhlášení ze zpráv | Weblyx',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Where the unsubscribe link in our outreach e-mails leads.
 *
 * Opening the link does not unsubscribe by itself: mail scanners open every
 * link in a message, and they would opt people out who never clicked. The
 * visitor confirms with one button.
 */
export default async function OdhlasitPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e: email, t: token } = await searchParams;
  const valid = isValidUnsubscribeLink(email, token);
  const done = valid && (await isUnsubscribed(email));

  async function confirm() {
    'use server';
    if (!isValidUnsubscribeLink(email, token)) return;
    await unsubscribe(email, 'page');
    redirect(`/odhlasit?e=${encodeURIComponent(email)}&t=${token}`);
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {!valid ? (
          <>
            <h1 className="text-2xl font-bold">Odkaz není platný</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Odkaz pro odhlášení je neúplný nebo poškozený. Napište nám na{' '}
              <a href="mailto:info@weblyx.cz" className="font-semibold text-primary hover:underline">
                info@weblyx.cz
              </a>{' '}
              a odhlásíme vás ručně.
            </p>
          </>
        ) : done ? (
          <>
            <h1 className="text-2xl font-bold">Jste odhlášeni</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Na adresu <strong className="text-foreground">{email}</strong> už od nás žádná další zpráva
              nepřijde. Omlouváme se za vyrušení.
            </p>
            <Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
              Přejít na weblyx.cz
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Odhlásit se ze zpráv</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Potvrďte, že na adresu <strong className="text-foreground">{email}</strong> už nechcete od Weblyx
              dostávat žádné zprávy.
            </p>
            <form action={confirm} className="mt-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Ano, odhlásit
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
