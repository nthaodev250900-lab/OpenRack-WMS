'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
export function SettingsTabs() {
  const t = useTranslations('settings');
  const path = usePathname();
  return (
    <nav className="no-print mb-6 flex gap-5 border-b border-border" aria-label={t('title')}>
      {[
        { href: '/settings', key: 'general' },
        { href: '/settings/appearance', key: 'appearance' },
      ].map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`min-h-11 border-b-2 px-1 pb-3 text-sm font-medium ${path === item.href ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
          aria-current={path === item.href ? 'page' : undefined}
        >
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}
