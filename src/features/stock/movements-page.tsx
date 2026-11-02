'use client';
import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations, useFormatter } from 'next-intl';
import { Plus } from 'lucide-react';
import { PageHeading } from '@/components/ui/page-heading';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DataTable } from '@/components/data-table';
import { MovementForm } from './movement-form';
import type { WarehouseData } from '@/features/warehouse/types';
export function MovementsPage({ data, canPost }: { data: WarehouseData; canPost: boolean }) {
  const t = useTranslations();
  const f = useFormatter();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [opened, setOpened] = useState(false);
  const open = canPost && (opened || params.get('new') === '1');
  function close() {
    setOpened(false);
    const next = new URLSearchParams(params);
    next.delete('new');
    router.replace(`${path}?${next}`, { scroll: false });
  }
  const type = params.get('type');
  const rows = data.movements
    .filter((m) => !['RECEIVE', 'ISSUE', 'TRANSFER'].includes(type ?? '') || m.type === type)
    .map((m) => ({
      id: m.id,
      values: {
        reference: m.reference,
        type: t(`stockMovements.${m.type}`),
        product: data.products.find((p) => p.id === m.productId)?.sku ?? '',
        quantity: m.quantity,
        source: data.bins.find((b) => b.id === m.sourceBinId)?.code ?? '—',
        target: data.bins.find((b) => b.id === m.targetBinId)?.code ?? '—',
        date: f.dateTime(new Date(m.createdAt), { dateStyle: 'medium', timeStyle: 'short' }),
      },
    }));
  return (
    <>
      <PageHeading
        title={t('stockMovements.title')}
        description={t('stockMovements.description')}
        action={
          canPost && (
            <Button onClick={() => setOpened(true)}>
              <Plus size={18} />
              {t('stockMovements.create')}
            </Button>
          )
        }
      />
      <div className="no-print mb-4 flex flex-wrap gap-2">
        {['', 'RECEIVE', 'ISSUE', 'TRANSFER'].map((value) => (
          <Button
            variant={type === value || (!type && !value) ? 'primary' : 'secondary'}
            key={value}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (value) next.set('type', value);
              else next.delete('type');
              next.delete('page');
              router.replace(`${path}?${next}`, { scroll: false });
            }}
          >
            {value ? t(`stockMovements.${value}`) : t('common.all')}
          </Button>
        ))}
      </div>
      <DataTable
        columns={['reference', 'type', 'product', 'quantity', 'source', 'target', 'date'].map(
          (key) => ({ key, label: t(`common.${key}`) }),
        )}
        rows={rows}
        exportable
        filename="stock-movements"
      />
      <Modal title={t('stockMovements.create')} open={open} onClose={close}>
        <MovementForm data={data} initialType={type ?? 'RECEIVE'} onDone={close} />
      </Modal>
    </>
  );
}
