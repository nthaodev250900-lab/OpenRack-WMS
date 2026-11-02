'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getUser, authorize } from '@/lib/auth';
import { db } from '@/lib/db';
import { actionError, type ActionResult } from '@/lib/errors';
import { preferenceSchema } from '@/lib/validation';
import { themeSchema, paletteFor } from '@/theme/palette';

export async function savePreferences(input: unknown): Promise<ActionResult> {
  const parsed = preferenceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  try {
    const user = await getUser();
    if (user) await db.user.update({ where: { id: user.id }, data: parsed.data });
    const store = await cookies();
    const options = {
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 31536000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };
    if (parsed.data.locale) store.set('openrack-locale', parsed.data.locale, options);
    if (parsed.data.appearance) store.set('openrack-appearance', parsed.data.appearance, options);
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveOrganizationTheme(input: unknown): Promise<ActionResult> {
  try {
    const user = await authorize(['ADMIN']);
    const parsed = themeSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'invalidColor' };
    const data = { ...parsed.data, customPalette: paletteFor(parsed.data), updatedById: user.id };
    await db.themeSetting.upsert({
      where: { companyId: user.companyId },
      create: { companyId: user.companyId, ...data },
      update: data,
    });
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
