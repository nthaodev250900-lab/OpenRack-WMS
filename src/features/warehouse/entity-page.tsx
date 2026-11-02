'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { PageHeading } from '@/components/ui/page-heading';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DataTable, type TableColumn, type TableRow } from '@/components/data-table';
import { EntityForm } from './entity-form';
import { stockForProduct, stockForBin } from './selectors';
import type { WarehouseData, EntityKind } from './types';
export function EntityPage({
  kind,
  data,
  canManage,
}: {
  kind: EntityKind;
  data: WarehouseData;
  canManage: boolean;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const columns: TableColumn[] = [
    {
      key: 'code',
      label:
        kind === 'inventory'
          ? t('inventory.sku')
          : kind === 'users'
            ? t('common.email')
            : t('common.code'),
    },
    { key: 'name', label: t('common.name') },
  ];
  let rows: TableRow[] = [];
  switch (kind) {
    case 'warehouses':
      columns.push({ key: 'address', label: t('common.address') });
      rows = data.warehouses.map((w) => ({
        id: w.id,
        values: { code: w.code, name: w.name, address: w.address },
        status: 'active',
      }));
      break;
    case 'zones':
      columns.push({ key: 'parent', label: t('navigation.warehouses') });
      rows = data.zones.map((z) => ({
        id: z.id,
        values: {
          code: z.code,
          name: z.name,
          parent: data.warehouses.find((w) => w.id === z.warehouseId)?.code ?? '',
        },
      }));
      break;
    case 'racks':
      columns.push({ key: 'parent', label: t('navigation.zones') });
      rows = data.racks.map((r) => ({
        id: r.id,
        values: {
          code: r.code,
          name: r.name,
          parent: data.zones.find((z) => z.id === r.zoneId)?.code ?? '',
        },
      }));
      break;
    case 'bins':
      columns.push(
        { key: 'parent', label: t('navigation.racks') },
        { key: 'stock', label: t('inventory.stock') },
        { key: 'capacity', label: t('common.capacity') },
      );
      rows = data.bins.map((b) => ({
        id: b.id,
        values: {
          code: b.code,
          name: b.name,
          parent: data.racks.find((r) => r.id === b.rackId)?.code ?? '',
          stock: stockForBin(data, b.id),
          capacity: b.capacity,
        },
        status: stockForBin(data, b.id) / b.capacity >= 0.8 ? 'full' : 'healthy',
      }));
      break;
    case 'inventory':
      columns.push(
        { key: 'stock', label: t('inventory.stock') },
        { key: 'minimum', label: t('inventory.minStock') },
        { key: 'unit', label: t('common.unit') },
      );
      rows = data.products.map((p) => ({
        id: p.id,
        values: {
          code: p.sku,
          name: p.name,
          stock: stockForProduct(data, p.id),
          minimum: p.minStock,
          unit: p.unit === 'pcs' ? t('common.pcs') : p.unit,
        },
        status: stockForProduct(data, p.id) < p.minStock ? 'low' : 'healthy',
      }));
      break;
    case 'users':
      columns.push({ key: 'role', label: t('common.role') });
      rows = data.users.map((u) => ({
        id: u.id,
        values: { code: u.email, name: u.name, role: t(`users.${u.role}`) },
      }));
      break;
  }
  return (
    <>
      <PageHeading
        title={t(`${kind}.title`)}
        description={t(`${kind}.description`)}
        action={
          canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus size={18} />
              {t(`${kind}.create`)}
            </Button>
          )
        }
      />
      <DataTable columns={columns} rows={rows} filename={kind} exportable={kind !== 'users'} />
      <Modal title={t(`${kind}.create`)} open={open} onClose={() => setOpen(false)}>
        <EntityForm kind={kind} data={data} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
