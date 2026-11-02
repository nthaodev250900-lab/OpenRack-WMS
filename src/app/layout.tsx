import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { getUser } from '@/lib/auth';
import { getTheme } from '@/theme/server';
import { themeVariables } from '@/theme/palette';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'OpenRack WMS', template: '%s · OpenRack WMS' },
  description: 'OpenRack Warehouse Management System',
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, user, theme, store] = await Promise.all([
    getLocale(),
    getUser(),
    getTheme(),
    cookies(),
  ]);
  const appearance = user?.appearance ?? store.get('openrack-appearance')?.value ?? 'system';
  return (
    <html lang={locale} suppressHydrationWarning style={themeVariables(theme) as CSSProperties}>
      <body>
        <NextIntlClientProvider>
          <Providers appearance={appearance}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
