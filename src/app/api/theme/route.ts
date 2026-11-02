import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { isDemo } from '@/lib/db';
import { getTheme } from '@/theme/server';
export async function GET() {
  if (!isDemo && !(await getUser()))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(await getTheme(), { headers: { 'Cache-Control': 'private, no-store' } });
}
