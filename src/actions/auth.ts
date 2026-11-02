'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { db, isDemo } from '@/lib/db';
import { createSession, SESSION_COOKIE, hashToken } from '@/lib/auth';
import { actionError, type ActionResult } from '@/lib/errors';

const loginSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) });
export async function login(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  if (isDemo) return { ok: false, error: 'demoReadOnly' };
  try {
    const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    const dummyHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxA6bAukmFo9gB5uAIX/g3Kf3Si';
    const valid = await compare(parsed.data.password, user?.passwordHash ?? dummyHash);
    if (!user || (user.lockedUntil && user.lockedUntil > new Date()))
      return { ok: false, error: 'invalidCredentials' };
    if (!valid) {
      const updated = await db.user.update({
        where: { id: user.id },
        data: { failedLogins: { increment: 1 } },
      });
      if (updated.failedLogins >= 5)
        await db.user.update({
          where: { id: user.id },
          data: { lockedUntil: new Date(Date.now() + 15 * 60000) },
        });
      return { ok: false, error: 'invalidCredentials' };
    }
    await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
    await createSession(user.id);
  } catch (error) {
    return actionError(error);
  }
  redirect('/');
}
export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token && !isDemo) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(SESSION_COOKIE);
  redirect('/login');
}
