import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { buttonClass } from '@/components/ui/button';
export default async function NotFound() {
  const t = await getTranslations('common');
  return (
    <div className="mx-auto max-w-lg space-y-4 p-10 text-center">
      <p className="text-5xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold">{t('notFound')}</h1>
      <p className="text-muted-foreground">{t('notFoundHint')}</p>
      <Link href="/" className={buttonClass()}>
        {t('back')}
      </Link>
    </div>
  );
}
