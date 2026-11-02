'use client';
import type { CSSProperties } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Box, LayoutDashboard, Package, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { themeVariables, type ThemeConfig } from '@/theme/palette';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
export function ThemePreview({ theme }: { theme: ThemeConfig }) {
  const t = useTranslations();
  const f = useFormatter();
  return (
    <div style={themeVariables(theme) as CSSProperties} className="panel overflow-hidden">
      <div className="flex min-h-[440px]">
        <div className="hidden w-40 shrink-0 bg-sidebar p-3 text-sidebar-foreground sm:block">
          <div className="mb-8 flex items-center gap-2 px-2 py-3 font-semibold">
            <Box size={20} />
            OpenRack
          </div>
          <nav aria-label={t('settings.previewSidebar')} className="space-y-2">
            {[
              { key: 'dashboard', icon: LayoutDashboard },
              { key: 'inventory', icon: Package },
              { key: 'stockMovements', icon: ArrowLeftRight },
            ].map((item, i) => (
              <div
                key={item.key}
                className={`flex items-center gap-2 rounded-lg px-2 py-3 text-xs ${i === 0 ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''}`}
              >
                <item.icon size={15} />
                {t(`navigation.${item.key}`)}
              </div>
            ))}
          </nav>
        </div>
        <div className="min-w-0 flex-1 bg-background p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-semibold">{t('navigation.dashboard')}</h3>
            <Badge tone="success">{t('settings.sampleBadge')}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="panel p-3">
              <p className="text-[11px] text-muted-foreground">{t('dashboard.stock')}</p>
              <p className="mt-2 text-2xl font-semibold">{f.number(2840)}</p>
            </div>
            <div className="panel p-3">
              <p className="text-[11px] text-muted-foreground">{t('dashboard.utilization')}</p>
              <p className="mt-2 text-2xl font-semibold">{f.number(0.72, { style: 'percent' })}</p>
            </div>
          </div>
          <div className="panel mt-3 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <TrendingUp size={15} />
              {t('settings.sampleChart')}
            </p>
            <div
              className="mt-5 flex h-20 items-end gap-2"
              role="img"
              aria-label={t('settings.sampleChart')}
            >
              {[35, 60, 45, 85, 65, 100, 80].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${height}%`, background: `var(--chart-${(i % 5) + 1})` }}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button">{t('settings.primaryButton')}</Button>
            <Button type="button" variant="secondary">
              {t('settings.secondaryButton')}
            </Button>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">{t('common.search')}</span>
            <input className="field" placeholder={t('settings.sampleInput')} />
          </label>
        </div>
      </div>
      <div className="table-wrap border-t border-border">
        <table>
          <thead>
            <tr>
              <th>{t('common.product')}</th>
              <th>{t('common.quantity')}</th>
              <th>{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('settings.sampleProduct')}</td>
              <td>{f.number(240)}</td>
              <td>
                <Badge tone="success">{t('common.healthy')}</Badge>
              </td>
            </tr>
            <tr>
              <td>{t('settings.sampleProduct')}</td>
              <td>{f.number(8)}</td>
              <td>
                <Badge tone="warning">{t('common.low')}</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
