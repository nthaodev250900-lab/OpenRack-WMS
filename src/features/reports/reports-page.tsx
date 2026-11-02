'use client';
import { useTranslations } from 'next-intl';
import { PageHeading } from '@/components/ui/page-heading';
import { DataTable } from '@/components/data-table';
import type { WarehouseData } from '@/features/warehouse/types';
export function ReportsPage({ data }: { data: WarehouseData }) {
  const t = useTranslations();
  const rows = data.inventory.map((i) => {
    const p = data.products.find((p) => p.id === i.productId);
    const b = data.bins.find((b) => b.id === i.binId);
    return {
      id: i.id,
      values: {
        sku: p?.sku ?? '',
        name: p?.name ?? '',
        bin: b?.code ?? '',
        quantity: i.quantity,
        unit: p?.unit === 'pcs' ? t('common.pcs') : (p?.unit ?? ''),
      },
    };
  });
  return (
    <>
      <PageHeading title={t('reports.title')} description={t('reports.description')} />
      <div className="mb-5 rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold">{t('reports.stockReport')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('reports.exportHint')}</p>
      </div>
      <DataTable
        rows={rows}
        columns={[
          { key: 'sku', label: t('inventory.sku') },
          { key: 'name', label: t('common.product') },
          { key: 'bin', label: t('common.bin') },
          { key: 'quantity', label: t('common.quantity') },
          { key: 'unit', label: t('common.unit') },
        ]}
        exportable
        filename="inventory-report"
      />
    </>
  );
}
