import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/auth';
import { defaultTimeZone, resolveLocale } from './config';

export default getRequestConfig(async () => {
  const user = await getUser();
  const locale = resolveLocale(user?.locale ?? (await cookies()).get('openrack-locale')?.value);
  return {
    locale,
    timeZone: user?.company.timeZone ?? defaultTimeZone,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      if (process.env.NODE_ENV !== 'production') console.error('[i18n]', error);
    },
    getMessageFallback({ namespace, key }) {
      return [namespace, key].filter(Boolean).join('.');
    },
  };
});
