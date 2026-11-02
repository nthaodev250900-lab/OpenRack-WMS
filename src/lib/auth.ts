import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import type { Role } from '@prisma/client';
import { db, isDemo } from './db';
import { AppError } from './errors';

export const SESSION_COOKIE = 'openrack-session';
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const getUser = cache(async () => {
  if (isDemo) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: { include: { company: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}

export function assertRole(role: Role, allowed: Role[]) {
  if (!allowed.includes(role)) throw new AppError('forbidden');
}

export async function authorize(allowed: Role[] = ['ADMIN', 'OPERATOR', 'VIEWER']) {
  if (isDemo) throw new AppError('demoReadOnly');
  const user = await getUser();
  if (!user) throw new AppError('unauthorized');
  assertRole(user.role, allowed);
  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}
