'use client';
import Link from 'next/link';
import { useTranslations, useFormatter } from 'next-intl';
import {
  Warehouse,
  Package,
  Boxes,
  ChartNoAxesCombined,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronRight,
  TriangleAlert,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeading } from '@/components/ui/page-heading';
import { buttonClass } from '@/components/ui/button';
import { stockForProduct, warehouseStats } from '@/features/warehouse/selectors';
import type { WarehouseData } from '@/features/warehouse/types';
export function Dashboard({ data }: { data: WarehouseData }) {
  const t = useTranslations();
  const f = useFormatter();
  const stats = warehouseStats(data);
  const stock = data.inventory.reduce((n, i) => n + i.quantity, 0);
  const capacity = data.bins.reduce((n, b) => n + b.capacity, 0);
  const low = data.products.filter((p) => stockForProduct(data, p.id) < p.minStock);
  const metrics = [
    { key: 'warehouses', value: data.warehouses.length, icon: Warehouse },
    { key: 'products', value: data.products.length, icon: Package },
    { key: 'stock', value: stock, icon: Boxes },
    { key: 'utilization', value: capacity ? stock / capacity : 0, icon: ChartNoAxesCombined },
  ];
  return (
    <>
      <PageHeading
        eyebrow={t('dashboard.eyebrow')}
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
        action={
          <Link href="/stock-movements?new=1&type=RECEIVE" className={buttonClass()}>
            <ArrowDownLeft size={18} />
            {t('dashboard.receive')}
          </Link>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.key} className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t(`dashboard.${m.key}`)}</span>
              <span className="rounded-xl bg-accent p-2.5 text-accent-foreground">
                <m.icon size={20} strokeWidth={1.7} />
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-tight">
              {m.key === 'utilization'
                ? f.number(m.value, { style: 'percent', maximumFractionDigits: 1 })
                : f.number(m.value)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{t('dashboard.welcome')}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title={t('dashboard.capacity')} description={t('dashboard.capacityHint')} />
          <div className="space-y-6 p-5 pt-1">
            {stats.map((w) => (
              <div key={w.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Warehouse size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">
                      {f.number(w.percent / 100, { style: 'percent' })}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {f.number(w.quantity)} / {f.number(w.capacity)}
                    </p>
                  </div>
                </div>
                <div
                  className="capacity-track"
                  role="progressbar"
                  aria-label={w.name}
                  aria-valuenow={w.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="capacity-fill"
                    style={{ width: `${Math.min(100, w.percent)}%` }}
                    data-level={
                      w.percent >= 95 ? 'danger' : w.percent >= 80 ? 'warning' : 'success'
                    }
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {t('dashboard.available', {
                    count: f.number(Math.max(0, w.capacity - w.quantity)),
                  })}
                </p>
              </div>
            ))}
            {!stats.length && (
              <p className="py-12 text-center text-muted-foreground">
                {t('dashboard.noWarehouses')}
              </p>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader
            title={t('dashboard.distribution')}
            description={t('dashboard.distributionHint')}
          />
          <div className="flex min-h-56 items-end justify-around gap-5 px-6 pb-5 pt-7">
            {stats.map((w, index) => (
              <div key={w.id} className="flex flex-1 flex-col items-center gap-3">
                <span className="text-sm font-semibold">{f.number(w.quantity)}</span>
                <div
                  className="w-full max-w-20 rounded-t-lg"
                  style={{
                    height: `${Math.max(4, stock ? (w.quantity / stock) * 170 : 4)}px`,
                    background: `var(--chart-${(index % 5) + 1})`,
                  }}
                />
                <span className="text-xs text-muted-foreground">{w.code}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader
            title={t('dashboard.activity')}
            description={t('dashboard.activityHint')}
            action={
              <Link
                href="/stock-movements"
                className="text-xs font-semibold underline underline-offset-4"
              >
                {t('common.viewAll')}
              </Link>
            }
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('common.reference')}</th>
                  <th>{t('common.type')}</th>
                  <th>{t('common.quantity')}</th>
                  <th>{t('common.date')}</th>
                </tr>
              </thead>
              <tbody>
                {data.movements.slice(0, 5).map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-xs">{m.reference}</td>
                    <td>
                      <Badge
                        tone={
                          m.type === 'RECEIVE' ? 'success' : m.type === 'ISSUE' ? 'warning' : 'info'
                        }
                      >
                        {t(`stockMovements.${m.type}`)}
                      </Badge>
                    </td>
                    <td>{f.number(m.quantity)}</td>
                    <td className="text-xs text-muted-foreground">
                      {f.dateTime(new Date(m.createdAt), {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.movements.length && (
              <p className="p-10 text-center text-muted-foreground">{t('common.noActivity')}</p>
            )}
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title={t('dashboard.quickActions')} />
            <div className="space-y-2 px-5 pb-5">
              {[
                { key: 'receive', type: 'RECEIVE', icon: ArrowDownLeft },
                { key: 'issue', type: 'ISSUE', icon: ArrowUpRight },
                { key: 'transfer', type: 'TRANSFER', icon: ArrowLeftRight },
              ].map((a) => (
                <Link
                  key={a.key}
                  href={`/stock-movements?new=1&type=${a.type}`}
                  className="flex min-h-12 items-center gap-3 rounded-lg border border-border px-3 hover:bg-muted"
                >
                  <a.icon size={18} className="text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">{t(`dashboard.${a.key}`)}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title={t('dashboard.lowStock')} description={t('dashboard.lowStockHint')} />
            <div className="px-5 pb-5">
              {low.length ? (
                low.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg bg-warning-soft p-3 text-warning"
                  >
                    <TriangleAlert size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs">
                        {p.sku} · {t('dashboard.minimum', { count: f.number(p.minStock) })}
                      </p>
                    </div>
                    <span className="text-lg font-bold">
                      {f.number(stockForProduct(data, p.id))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('dashboard.allHealthy')}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
