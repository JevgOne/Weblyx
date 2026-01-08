import Link from "next/link";
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('notFound');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {t('homeButton')}
          </Link>
          <Link
            href={t('contactLink')}
            className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            {t('contactButton')}
          </Link>
        </div>
      </div>
    </div>
  );
}
