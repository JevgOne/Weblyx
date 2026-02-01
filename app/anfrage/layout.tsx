import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unverbindliche Anfrage | Seitelyx',
  description: 'Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden. Transparente Preise ab 320 €. Schnelle Website in 7 Tagen.',
  openGraph: {
    title: 'Unverbindliche Anfrage | Seitelyx',
    description: 'Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden. Transparente Preise ab 320 €.',
    type: 'website',
    locale: 'de_DE',
    siteName: 'Seitelyx',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unverbindliche Anfrage | Seitelyx',
    description: 'Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://seitelyx.de/anfrage',
  },
};

export default function AnfrageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
