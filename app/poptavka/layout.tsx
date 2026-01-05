import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nezávazná poptávka | Weblyx',
  description: 'Vyplňte formulář a my se vám ozveme do 24 hodin. Transparentní ceny od 7 990 Kč. Rychlý web za 7 dní.',
  openGraph: {
    title: 'Nezávazná poptávka | Weblyx',
    description: 'Vyplňte formulář a my se vám ozveme do 24 hodin. Transparentní ceny od 7 990 Kč.',
    type: 'website',
    locale: 'cs_CZ',
    siteName: 'Weblyx',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nezávazná poptávka | Weblyx',
    description: 'Vyplňte formulář a my se vám ozveme do 24 hodin.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://weblyx.cz/poptavka',
  },
};

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
