import { describe, it, expect } from 'vitest';
import { createTranslator } from 'next-intl';
import vi from '../messages/vi-VN.json';
import en from '../messages/en-US.json';
import { resolveLocale } from '@/i18n/config';
import { formatDate, formatNumber } from '@/lib/format';
function flatten(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, v]) =>
    typeof v === 'object' ? flatten(v, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}
describe('internationalization', () => {
  it('has matching nonempty keys across all modules', () => {
    expect(flatten(vi).sort()).toEqual(flatten(en).sort());
    for (const messages of [vi, en])
      for (const section of Object.values(messages))
        for (const value of Object.values(section)) expect(value.trim().length).toBeGreaterThan(0);
  });
  it('defaults to Vietnamese and rejects unsupported locales', () => {
    expect(resolveLocale(undefined)).toBe('vi-VN');
    expect(resolveLocale('fr-FR')).toBe('vi-VN');
    expect(resolveLocale('en-US')).toBe('en-US');
  });
  it.each([
    ['vi-VN', vi, 'Tổng quan kho hàng'],
    ['en-US', en, 'Warehouse overview'],
  ] as const)('renders %s messages', (locale, messages, title) => {
    const t = createTranslator({ locale, messages });
    expect(t('dashboard.title')).toBe(title);
    expect(t('common.page', { page: 2, total: 4 })).toContain('2');
  });
  it('formats numbers using locale separators', () => {
    expect(formatNumber(1234.5, 'vi-VN')).toBe('1.234,5');
    expect(formatNumber(1234.5, 'en-US')).toBe('1,234.5');
  });
  it('converts UTC to the configured display zone', () => {
    const value = '2026-11-02T00:00:00Z';
    expect(formatDate(value, 'en-US')).toContain('7:00');
    expect(formatDate(value, 'en-US', 'UTC')).toContain('12:00');
  });
});
