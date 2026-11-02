import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { movementSchema } from '@/lib/validation';
import type { z } from 'zod';

export async function postMovement(input: z.infer<typeof movementSchema>, userId: string) {
  // Retry serialization conflicts; stock, capacity and ledger always commit together.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(
        async (tx) => {
          const source = input.type === 'RECEIVE' ? undefined : input.sourceBinId;
          const target = input.type === 'ISSUE' ? undefined : input.targetBinId;
          if (source) {
            const changed = await tx.inventory.updateMany({
              where: {
                productId: input.productId,
                binId: source,
                quantity: { gte: input.quantity },
              },
              data: { quantity: { decrement: input.quantity } },
            });
            if (changed.count !== 1) throw new AppError('insufficientStock');
          }
          if (target) {
            const bin = await tx.bin.findUnique({ where: { id: target } });
            if (!bin) throw new AppError('invalid');
            const total = await tx.inventory.aggregate({
              where: { binId: target },
              _sum: { quantity: true },
            });
            if ((total._sum.quantity ?? 0) + input.quantity > bin.capacity)
              throw new AppError('capacityExceeded');
            await tx.inventory.upsert({
              where: { productId_binId: { productId: input.productId, binId: target } },
              create: { productId: input.productId, binId: target, quantity: input.quantity },
              update: { quantity: { increment: input.quantity } },
            });
          }
          return tx.stockMovement.create({
            data: {
              type: input.type,
              productId: input.productId,
              quantity: input.quantity,
              sourceBinId: source,
              targetBinId: target,
              note: input.note,
              createdById: userId,
              reference: `MV-${randomUUID()}`,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034' &&
        attempt < 2
      )
        continue;
      throw error;
    }
  }
}
