import { getTranslations } from 'next-intl/server';
export default async function Loading() {
  const t = await getTranslations('common');
  return (
    <div role="status" className="panel p-12 text-center text-muted-foreground">
      {t('loading')}
    </div>
  );
}
