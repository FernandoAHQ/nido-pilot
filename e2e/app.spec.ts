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

test('los capítulos separan la lectura ilustrada del patrón', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('nido-pattern-progress', JSON.stringify({
      version: 1,
      unlockedWorld: 5,
      completedChallenges: [],
      lastWorld: 5,
    }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: /empezar aventura/i }).click();
  await page.getByRole('button', { name: /bosque de luz/i }).click();
  await expect(page.getByText(/todos los cuentos están abiertos/i)).toBeVisible();
  await page.getByRole('button', { name: /capítulo 1: una luz en el sendero/i }).click();

  await expect(page.getByText('Capítulo 1 de 6')).toBeVisible();
  await expect(page.getByRole('heading', { name: /una luz en el sendero/i })).toBeVisible();
  await expect(page.getByAltText(/lumi y lila frente a un sendero/i)).toBeVisible();
  await page.getByRole('button', { name: /siguiente/i }).click();
  await expect(page.getByRole('heading', { name: /el puente de bellotas/i })).toBeVisible();
  await page.getByRole('button', { name: /anterior/i }).click();
  await expect(page.getByRole('heading', { name: /una luz en el sendero/i })).toBeVisible();
  await page.getByRole('button', { name: /resolver el patrón/i }).click();
  await expect(page.getByRole('heading', { name: /qué pieza sigue/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /volver al cuento/i })).toBeVisible();
  await expect(page.getByAltText(/lumi y lila frente a un sendero/i)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('la ilustración del Festival acompaña el cuento y el patrón', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /empezar aventura/i }).click();
  await page.getByRole('button', { name: /festival de nido/i }).click();
  await page.getByRole('button', { name: /capítulo 1: la plaza despierta/i }).click();

  const festivalArtwork = page.getByAltText(/lumi decorando una plaza/i);
  await expect(festivalArtwork).toBeVisible();
  await page.getByRole('button', { name: /resolver el patrón/i }).click();
  await expect(page.getByRole('heading', { name: /qué pieza sigue/i })).toBeVisible();
  await expect(festivalArtwork).toBeVisible();
});
