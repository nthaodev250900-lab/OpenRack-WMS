import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('dashboard and appearance meet automated WCAG AA checks in light and dark modes', async ({
  page,
}) => {
  for (const mode of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: mode as 'light' | 'dark' });
    for (const path of ['/', '/settings/appearance', '/login']) {
      await page.goto(path);
      await expect(page.locator('h1,h2').first()).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          description: v.description,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  }
});

test('custom white and black brand colors keep readable preview controls', async ({ page }) => {
  await page.goto('/settings/appearance');
  for (const color of ['#ffffff', '#000000', '#ffff00']) {
    await page.locator('#brand-hex').fill(color);
    const result = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});

test('capture desktop and mobile previews', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({
    path: 'test-results/dashboard-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.goto('/settings/appearance');
  await page.screenshot({
    path: 'test-results/appearance-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'test-results/appearance-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
});
