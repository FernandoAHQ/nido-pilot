import { expect, test } from '@playwright/test';

test('un niño puede comenzar y resolver el primer reto', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /bienvenido a nido/i })).toBeVisible();
  await page.getByRole('button', { name: /empezar aventura/i }).click();
  await page.getByRole('button', { name: /jardín saltarín/i }).click();
  await expect(page.getByRole('heading', { name: /qué pieza sigue/i })).toBeVisible();
  await page.getByRole('button', { name: 'rojo' }).click();
  await expect(page.getByText('¡Lo lograste!')).toBeVisible();
});

test('no hay desbordamiento horizontal en tableta', async ({ page }) => {
  await page.goto('/');
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
});
