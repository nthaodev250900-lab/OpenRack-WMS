import { QrPage } from '@/features/qr/qr-page';
import { getWarehouseData } from '@/features/warehouse/queries';
export default async function Page() {
  return <QrPage bins={(await getWarehouseData()).bins} />;
}
