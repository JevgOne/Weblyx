import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Děkujeme za poptávku | Weblyx',
  description: 'Vaše poptávka byla úspěšně odeslána. Ozveme se vám do 24 hodin.',
  openGraph: {
    title: 'Děkujeme za poptávku | Weblyx',
    description: 'Vaše poptávka byla úspěšně odeslána. Ozveme se vám do 24 hodin.',
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Weblyx',
  },
  twitter: {
    card: 'summary',
    title: 'Děkujeme za poptávku | Weblyx',
    description: 'Vaše poptávka byla úspěšně odeslána.',
  },
  robots: {
    index: false, // Don't index conversion pages
    follow: false,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
