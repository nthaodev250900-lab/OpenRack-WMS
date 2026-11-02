import { test, expect } from '@playwright/test';
test('Vietnamese default, language switching preserves URL filters and persists after reload', async ({
  page,
}) => {
  await page.goto('/inventory?q=PKG&page=1');
  await expect(page.getByRole('heading', { name: 'Tồn kho', exact: true })).toBeVisible();
  await page.locator('header select').selectOption('en-US');
  await expect(page.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('q')).toBe('PKG');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Inventory', exact: true })).toBeVisible();
});
test('brand preview is isolated, Apply is temporary, Cancel restores and reset requires confirmation', async ({
  page,
}) => {
  await page.goto('/settings/appearance');
  const primary = () =>
    page.locator('html').evaluate((el) => getComputedStyle(el).getPropertyValue('--primary'));
  const original = await primary();
  await page.getByRole('button', { name: 'Tím', exact: true }).click();
  expect(await primary()).toBe(original);
  await page.getByRole('button', { name: 'Áp dụng giao diện', exact: true }).click();
  expect(await primary()).toBe('#7c3aed');
  await page.getByRole('button', { name: 'Hủy', exact: true }).first().click();
  expect(await primary()).toBe(original);
  await page.getByRole('button', { name: 'Khôi phục mặc định', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Xác nhận', exact: true }).click();
  expect(await page.locator('#brand-hex').inputValue()).toBe('#397e90');
});
test('invalid colors prevent saving and demo saves report read-only', async ({ page }) => {
  await page.goto('/settings/appearance');
  await page.locator('#brand-hex').fill('#zzzzzz');
  await expect(page.locator('#hex-error')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lưu thay đổi', exact: true })).toBeDisabled();
  await page.locator('#brand-hex').fill('#123456');
  await page.getByRole('button', { name: 'Lưu thay đổi', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Bản mẫu chỉ cho phép xem');
});
test('light, dark and system modes persist and QR renders', async ({ page }) => {
  await page.goto('/settings/appearance');
  await page.getByRole('button', { name: 'Tối', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Sáng', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/light/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('button', { name: 'Theo hệ thống', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.goto('/qr');
  await expect(page.getByRole('img', { name: /Mã định danh/ })).toBeVisible();
});
test('all core screens render in both locales without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['vi-VN', 'en-US']) {
    await page.goto('/');
    await page.locator('header select').selectOption(locale);
    for (const path of [
      '/',
      '/warehouses',
      '/zones',
      '/racks',
      '/bins',
      '/inventory',
      '/stock-movements',
      '/reports',
      '/users',
      '/settings',
      '/settings/appearance',
      '/qr',
    ]) {
      await page.goto(path);
      await expect(page.locator('main h1')).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});
test('mobile navigation is usable and layout does not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mở điều hướng' }).click();
  await page.getByRole('link', { name: 'Giao dịch kho', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Giao dịch kho', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
