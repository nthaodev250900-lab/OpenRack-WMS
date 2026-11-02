import { cache } from 'react';
import { db, isDemo } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { demoData } from './demo';
import type { WarehouseData } from './types';
export const getWarehouseData = cache(async (): Promise<WarehouseData> => {
  if (isDemo) return demoData;
  const user = await requireUser();
  const [warehouses, zones, racks, bins, products, inventory, movements, users] = await Promise.all(
    [
      db.warehouse.findMany({ orderBy: { code: 'asc' } }),
      db.zone.findMany({ orderBy: { code: 'asc' } }),
      db.rack.findMany({ orderBy: { code: 'asc' } }),
      db.bin.findMany({ orderBy: { code: 'asc' } }),
      db.product.findMany({ orderBy: { sku: 'asc' } }),
      db.inventory.findMany(),
      db.stockMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
      user.role === 'ADMIN'
        ? db.user.findMany({
            where: { companyId: user.companyId },
            select: { id: true, name: true, email: true, role: true },
          })
        : Promise.resolve([]),
    ],
  );
  return {
    warehouses,
    zones,
    racks,
    bins,
    products,
    inventory,
    movements: movements.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    users,
  };
});
