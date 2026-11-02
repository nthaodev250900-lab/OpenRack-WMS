import { notFound } from 'next/navigation';
import { EntityPage } from '@/features/warehouse/entity-page';
import { getWarehouseData } from '@/features/warehouse/queries';
import { getUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
import type { EntityKind } from '@/features/warehouse/types';
export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!['warehouses', 'zones', 'racks', 'bins', 'inventory', 'users'].includes(module)) notFound();
  const user = await getUser();
  if (module === 'users' && !isDemo && user?.role !== 'ADMIN') notFound();
  return (
    <EntityPage
      kind={module as EntityKind}
      data={await getWarehouseData()}
      canManage={isDemo || user?.role === 'ADMIN'}
    />
  );
}
