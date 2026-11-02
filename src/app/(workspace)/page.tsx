import { Dashboard } from '@/features/dashboard/dashboard';
import { getWarehouseData } from '@/features/warehouse/queries';
export default async function DashboardPage() {
  return <Dashboard data={await getWarehouseData()} />;
}
