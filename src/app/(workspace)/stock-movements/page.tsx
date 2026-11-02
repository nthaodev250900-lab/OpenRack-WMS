import { MovementsPage } from '@/features/stock/movements-page';
import { getWarehouseData } from '@/features/warehouse/queries';
import { getUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
export default async function StockMovementsPage() {
  const user = await getUser();
  return (
    <MovementsPage
      data={await getWarehouseData()}
      canPost={isDemo || user?.role === 'ADMIN' || user?.role === 'OPERATOR'}
    />
  );
}
