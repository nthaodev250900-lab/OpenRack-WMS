import { z } from 'zod';
export const preferenceSchema = z.object({
  locale: z.enum(['vi-VN', 'en-US']).optional(),
  appearance: z.enum(['light', 'dark', 'system']).optional(),
});
export const codeSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[A-Za-z0-9_-]+$/);
export const entitySchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(1).max(120),
  parentId: z.string().optional(),
  address: z.string().trim().max(250).optional(),
  capacity: z.coerce.number().int().min(1).max(100000000).optional(),
  minStock: z.coerce.number().int().min(0).max(100000000).optional(),
});
export const movementSchema = z
  .object({
    type: z.enum(['RECEIVE', 'ISSUE', 'TRANSFER']),
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(100000000),
    sourceBinId: z.string().optional(),
    targetBinId: z.string().optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type !== 'RECEIVE' && !value.sourceBinId)
      ctx.addIssue({ code: 'custom', path: ['sourceBinId'], message: 'required' });
    if (value.type !== 'ISSUE' && !value.targetBinId)
      ctx.addIssue({ code: 'custom', path: ['targetBinId'], message: 'required' });
    if (value.type === 'TRANSFER' && value.sourceBinId === value.targetBinId)
      ctx.addIssue({ code: 'custom', path: ['targetBinId'], message: 'sameBin' });
  });
