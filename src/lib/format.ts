import { defaultTimeZone, type Locale } from '@/i18n/config';
export const formatNumber = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale).format(value);
export const formatDate = (value: string | Date, locale: Locale, timeZone = defaultTimeZone) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(
    new Date(value),
  );
