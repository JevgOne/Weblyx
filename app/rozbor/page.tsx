import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isValidReportLink } from '@/lib/outreach/unsubscribe';
import { leadForReport, sendLeadReport } from '@/lib/outreach/report';

export const metadata: Metadata = {
  title: 'Rozbor vašeho webu | Weblyx',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';
// The report is sent from the form action, and reading a site can take a while.
export const maxDuration = 60;

/**
 * Where "Poslat mi celý rozbor zdarma" in an outreach e-mail leads.
 *
 * One button sends the analysis of the company's website to the address the
 * e-mail went to — nobody has to notice a reply first. Opening the link does
 * nothing by itself: mail scanners open every link in a message.
 */
export default async function RozborPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; chyba?: string }>;
}) {
  const { e: email, t: token, chyba } = await searchParams;
  const valid = isValidReportLink(email, token);
  const lead = valid ? await leadForReport(email) : null;

  async function send() {
    'use server';
    if (!isValidReportLink(email, token)) return;
    const target = await leadForReport(email);
    const here = `/rozbor?e=${encodeURIComponent(email)}&t=${token}`;
    if (!target || target.alreadySent) redirect(here);
    const result = await sendLeadReport(target.id, 'link');
    redirect('error' in result ? `${here}&chyba=1` : here);
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {!valid || !lead ? (
          <>
            <h1 className="text-2xl font-bold">Odkaz není platný</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Odkaz je neúplný nebo už neplatí. Napište nám na{' '}
              <a href="mailto:info@weblyx.cz" className="font-semibold text-primary hover:underline">
                info@weblyx.cz
              </a>{' '}
              a rozbor vám pošleme.
            </p>
          </>
        ) : lead.alreadySent ? (
          <>
            <h1 className="text-2xl font-bold">Rozbor je na cestě</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Rozbor webu <strong className="text-foreground">{lead.domain}</strong> jsme poslali na{' '}
              <strong className="text-foreground">{email}</strong>. Pokud ho nevidíte, podívejte se do hromadné pošty nebo
              spamu.
            </p>
            <Link href="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
              Přejít na weblyx.cz
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Rozbor webu {lead.domain}</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Pošleme ho zdarma a bez závazků na <strong className="text-foreground">{email}</strong>. Najdete v něm
              skóre, kontrolu bod po bodu a u každé věci i to, jak ji opravit.
            </p>
            {chyba && <p className="mt-3 text-sm text-red-600">Odeslání se teď nepovedlo. Zkuste to prosím znovu.</p>}
            <form action={send} className="mt-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Poslat mi rozbor
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
