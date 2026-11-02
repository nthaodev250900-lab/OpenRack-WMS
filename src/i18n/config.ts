export const locales = ['vi-VN', 'en-US'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi-VN';
export function resolveLocale(value: unknown): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}
export const defaultTimeZone = 'Asia/Ho_Chi_Minh';
