'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations('common');
  return (
    <div className="mx-auto max-w-lg space-y-4 p-10 text-center">
      <h1 className="text-2xl font-bold">{t('errorTitle')}</h1>
      <p className="text-muted-foreground">{t('errorHint')}</p>
      <Button onClick={reset}>{t('refresh')}</Button>
    </div>
  );
}
