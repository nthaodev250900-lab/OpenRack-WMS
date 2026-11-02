export type Warehouse = { id: string; code: string; name: string; address: string };
export type Zone = { id: string; code: string; name: string; warehouseId: string };
export type Rack = { id: string; code: string; name: string; zoneId: string };
export type Bin = { id: string; code: string; name: string; rackId: string; capacity: number };
export type Product = { id: string; sku: string; name: string; unit: string; minStock: number };
export type Balance = { id: string; productId: string; binId: string; quantity: number };
export type Movement = {
  id: string;
  reference: string;
  type: 'RECEIVE' | 'ISSUE' | 'TRANSFER';
  productId: string;
  quantity: number;
  sourceBinId: string | null;
  targetBinId: string | null;
  createdAt: string;
  note: string | null;
};
export type Member = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
};
export type WarehouseData = {
  warehouses: Warehouse[];
  zones: Zone[];
  racks: Rack[];
  bins: Bin[];
  products: Product[];
  inventory: Balance[];
  movements: Movement[];
  users: Member[];
};
export type EntityKind = 'warehouses' | 'zones' | 'racks' | 'bins' | 'inventory' | 'users';
