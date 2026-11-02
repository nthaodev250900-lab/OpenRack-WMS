import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { demoData } from '../src/features/warehouse/demo';
const db = new PrismaClient();
async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 12 || password.length > 128)
    throw new Error('Set SEED_ADMIN_PASSWORD to 12–128 characters.');
  const company = await db.company.upsert({
    where: { id: 'openrack-company' },
    update: {},
    create: { id: 'openrack-company', name: 'OpenRack' },
  });
  const admin = await db.user.upsert({
    where: { email: (process.env.SEED_ADMIN_EMAIL ?? 'admin@openrack.local').toLowerCase() },
    update: {},
    create: {
      companyId: company.id,
      name: 'Administrator',
      email: (process.env.SEED_ADMIN_EMAIL ?? 'admin@openrack.local').toLowerCase(),
      passwordHash: await hash(password, 12),
      role: 'ADMIN',
    },
  });
  await db.themeSetting.upsert({
    where: { companyId: company.id },
    update: {},
    create: { companyId: company.id },
  });
  // Idempotent seed: do not overwrite live quantities or duplicate audit entries.
  for (const item of demoData.warehouses)
    await db.warehouse.upsert({ where: { id: item.id }, update: {}, create: item });
  for (const item of demoData.zones)
    await db.zone.upsert({ where: { id: item.id }, update: {}, create: item });
  for (const item of demoData.racks)
    await db.rack.upsert({ where: { id: item.id }, update: {}, create: item });
  for (const item of demoData.bins)
    await db.bin.upsert({ where: { id: item.id }, update: {}, create: item });
  for (const item of demoData.products)
    await db.product.upsert({ where: { id: item.id }, update: {}, create: item });
  for (const item of demoData.inventory)
    await db.inventory.upsert({ where: { id: item.id }, update: {}, create: item });
  for (const item of demoData.movements)
    await db.stockMovement.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, createdById: admin.id, createdAt: new Date(item.createdAt) },
    });
  console.log('OpenRack seed completed. Existing records preserved.');
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
