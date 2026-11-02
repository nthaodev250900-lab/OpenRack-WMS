import type { WarehouseData } from './types';
export function stockForProduct(data: WarehouseData, id: string) {
  return data.inventory.filter((i) => i.productId === id).reduce((n, i) => n + i.quantity, 0);
}
export function stockForBin(data: WarehouseData, id: string) {
  return data.inventory.filter((i) => i.binId === id).reduce((n, i) => n + i.quantity, 0);
}
export function warehouseStats(data: WarehouseData) {
  return data.warehouses.map((warehouse) => {
    const zones = new Set(
      data.zones.filter((z) => z.warehouseId === warehouse.id).map((z) => z.id),
    );
    const racks = new Set(data.racks.filter((r) => zones.has(r.zoneId)).map((r) => r.id));
    const bins = data.bins.filter((b) => racks.has(b.rackId));
    const capacity = bins.reduce((n, b) => n + b.capacity, 0);
    const quantity = bins.reduce((n, b) => n + stockForBin(data, b.id), 0);
    return {
      ...warehouse,
      capacity,
      quantity,
      percent: capacity ? Math.round((quantity / capacity) * 100) : 0,
    };
  });
}
