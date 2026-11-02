import { ReportsPage } from '@/features/reports/reports-page';
import { getWarehouseData } from '@/features/warehouse/queries';
export default async function Page() {
  return <ReportsPage data={await getWarehouseData()} />;
}
