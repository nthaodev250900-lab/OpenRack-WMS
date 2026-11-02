import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
import { getWarehouseData } from '@/features/warehouse/queries';
export async function GET() {
  if (!isDemo && !(await getUser()))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { products, inventory, bins } = await getWarehouseData();
  return NextResponse.json(
    { demo: isDemo, products, inventory, bins },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
