import { cache } from 'react';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { defaultTheme, themeSchema } from './palette';
export const getTheme = cache(async () => {
  const user = await getUser();
  if (!user) return defaultTheme;
  const saved = await db.themeSetting.findUnique({ where: { companyId: user.companyId } });
  const parsed = themeSchema.safeParse(saved);
  return parsed.success ? parsed.data : defaultTheme;
});
