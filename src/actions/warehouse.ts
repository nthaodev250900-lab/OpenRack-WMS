'use server';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { authorize } from '@/lib/auth';
import { db } from '@/lib/db';
import { entitySchema, movementSchema } from '@/lib/validation';
import { actionError, type ActionResult } from '@/lib/errors';
import { postMovement } from '@/services/stock';
import type { EntityKind } from '@/features/warehouse/types';

export async function createEntity(kind: EntityKind, input: unknown): Promise<ActionResult> {
  try {
    const user = await authorize(['ADMIN']);
    if (kind === 'users') {
      const parsed = z
        .object({
          name: z.string().trim().min(1).max(120),
          email: z.email().max(254),
          password: z.string().min(12).max(128),
          role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']),
        })
        .safeParse(input);
      if (!parsed.success) return { ok: false, error: 'invalid' };
      const { password, ...data } = parsed.data;
      await db.user.create({
        data: {
          ...data,
          email: data.email.toLowerCase(),
          passwordHash: await hash(password, 12),
          companyId: user.companyId,
        },
      });
    } else {
      const parsed = entitySchema.safeParse(input);
      if (!parsed.success) return { ok: false, error: 'invalid' };
      const { code, name, parentId, address, capacity, minStock } = parsed.data;
      switch (kind) {
        case 'warehouses':
          await db.warehouse.create({ data: { code, name, address: address ?? '' } });
          break;
        case 'zones':
          if (!parentId) return { ok: false, error: 'required' };
          await db.zone.create({ data: { code, name, warehouseId: parentId } });
          break;
        case 'racks':
          if (!parentId) return { ok: false, error: 'required' };
          await db.rack.create({ data: { code, name, zoneId: parentId } });
          break;
        case 'bins':
          if (!parentId) return { ok: false, error: 'required' };
          await db.bin.create({
            data: { code, name, rackId: parentId, capacity: capacity ?? 1000 },
          });
          break;
        case 'inventory':
          await db.product.create({ data: { sku: code, name, minStock: minStock ?? 10 } });
          break;
        default:
          return { ok: false, error: 'invalid' };
      }
    }
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createMovement(input: unknown): Promise<ActionResult> {
  try {
    const user = await authorize(['ADMIN', 'OPERATOR']);
    const parsed = movementSchema.safeParse(input);
    if (!parsed.success)
      return {
        ok: false,
        error: parsed.error.issues.some((i) => i.message === 'sameBin') ? 'sameBin' : 'invalid',
      };
    await postMovement(parsed.data, user.id);
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveWorkspace(input: unknown): Promise<ActionResult> {
  try {
    const user = await authorize(['ADMIN']);
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(120),
        timeZone: z
          .string()
          .max(100)
          .refine((value) => {
            try {
              new Intl.DateTimeFormat('en', { timeZone: value });
              return true;
            } catch {
              return false;
            }
          }),
      })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: 'invalid' };
    await db.company.update({ where: { id: user.companyId }, data: parsed.data });
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
