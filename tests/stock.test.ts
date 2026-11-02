import { beforeEach, describe, it, expect, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
  aggregate: vi.fn(),
  upsert: vi.fn(),
  create: vi.fn(),
}));
vi.mock('@/lib/db', () => ({ db: { $transaction: mocks.transaction } }));
import { postMovement } from '@/services/stock';
import { movementSchema } from '@/lib/validation';
const input = {
  type: 'TRANSFER' as const,
  productId: 'p1',
  sourceBinId: 'b1',
  targetBinId: 'b2',
  quantity: 5,
};
describe('stock movement invariants', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(async (fn) =>
      fn({
        inventory: {
          updateMany: mocks.updateMany,
          aggregate: mocks.aggregate,
          upsert: mocks.upsert,
        },
        bin: { findUnique: mocks.findUnique },
        stockMovement: { create: mocks.create },
      }),
    );
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.findUnique.mockResolvedValue({ capacity: 100 });
    mocks.aggregate.mockResolvedValue({ _sum: { quantity: 10 } });
  });
  it('transfers with conditional stock decrement, capacity check and audit in a serializable transaction', async () => {
    await postMovement(input, 'u1');
    expect(mocks.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { productId: 'p1', binId: 'b1', quantity: { gte: 5 } } }),
    );
    expect(mocks.upsert).toHaveBeenCalled();
    expect(mocks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        quantity: 5,
        createdById: 'u1',
        sourceBinId: 'b1',
        targetBinId: 'b2',
      }),
    });
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });
  it('rejects insufficient stock before adding stock or audit', async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });
    await expect(postMovement(input, 'u1')).rejects.toThrow('insufficientStock');
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('rejects destination capacity overflow', async () => {
    mocks.aggregate.mockResolvedValue({ _sum: { quantity: 99 } });
    await expect(postMovement(input, 'u1')).rejects.toThrow('capacityExceeded');
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('receives without debiting a source', async () => {
    await postMovement({ ...input, type: 'RECEIVE' }, 'u1');
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.upsert).toHaveBeenCalled();
  });
  it('issues without crediting a destination', async () => {
    await postMovement({ ...input, type: 'ISSUE' }, 'u1');
    expect(mocks.updateMany).toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it('rejects identical source and destination', () => {
    expect(movementSchema.safeParse({ ...input, targetBinId: 'b1' }).success).toBe(false);
  });
  it.each([0, -1, 1.5, NaN, 100000001])('rejects invalid quantity %s', (quantity) => {
    expect(movementSchema.safeParse({ ...input, quantity }).success).toBe(false);
  });
  it('requires bins appropriate to the movement type', () => {
    expect(movementSchema.safeParse({ ...input, sourceBinId: '' }).success).toBe(false);
    expect(movementSchema.safeParse({ ...input, targetBinId: '' }).success).toBe(false);
  });
});
