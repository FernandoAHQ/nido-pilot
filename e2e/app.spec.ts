import { expect, test } from '@playwright/test';

test('un niño puede comenzar y resolver el primer reto', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /bienvenido a nido/i })).toBeVisible();
  await expect(page.getByAltText(/nido\. pequeñas mentes/i)).toBeVisible();
  await expect(page.getByAltText(/lumi saluda con alegría/i)).toBeVisible();
  await page.getByRole('button', { name: /empezar aventura/i }).click();
  await page.getByRole('button', { name: /bosque de luz/i }).click();
  await page.getByRole('button', { name: /capítulo 1: una luz en el sendero/i }).click();
  await page.getByRole('button', { name: /resolver el patrón/i }).click();
  await expect(page.getByRole('heading', { name: /qué pieza falta/i })).toBeVisible();
  await page.getByRole('button', { name: 'hoja' }).click();
  await expect(page.getByText('¡Lo lograste!')).toBeVisible();
});

test('no hay desbordamiento horizontal en tableta', async ({ page }) => {
  await page.goto('/');
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
});

test('la portada responde en los tamaños objetivo de tableta', async ({ page }) => {
  const viewports = [
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1280, height: 800 },
    { width: 834, height: 1194 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /empezar aventura/i })).toBeVisible();
    await expect(page.getByAltText(/lumi saluda con alegría/i)).toBeVisible();

    const layout = await page.evaluate(() => {
      const cta = document.querySelector<HTMLButtonElement>('.welcome .button--primary')?.getBoundingClientRect();
      return {
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        ctaBottom: cta?.bottom ?? Number.POSITIVE_INFINITY,
        viewportHeight: window.innerHeight,
      };
    });

    expect(layout.hasHorizontalOverflow).toBe(false);
    expect(layout.ctaBottom).toBeLessThanOrEqual(layout.viewportHeight);

    await page.getByRole('button', { name: /empezar aventura/i }).click();
    await expect(page.getByRole('heading', { name: /historias de patrones/i })).toBeVisible();
    const mapLayout = await page.evaluate(() => ({
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      cardCount: document.querySelectorAll('.world-card').length,
    }));
    expect(mapLayout.hasHorizontalOverflow).toBe(false);
    expect(mapLayout.cardCount).toBe(5);
  }
});

test('las cinco historias están abiertas y las nuevas tienen arte propio', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /empezar aventura/i }).click();

  for (const name of [/bosque de luz/i, /festival de nido/i, /arrecife arcoíris/i, /tren de las estaciones/i, /ciudad de los inventos/i]) {
    await expect(page.getByRole('button', { name })).toBeEnabled();
  }

  await page.getByRole('button', { name: /arrecife arcoíris/i }).click();
  await page.getByRole('button', { name: /capítulo 1: la perla perdida/i }).click();
  await expect(page.getByAltText(/lumi y nara descubren una concha vacía/i)).toBeVisible();
  await expect(page.getByText(/nara cuidaba la perla luminosa/i)).toBeVisible();
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
  await expect(page.getByRole('heading', { name: /qué pieza falta/i })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: /qué pieza falta/i })).toBeVisible();
  await expect(festivalArtwork).toBeVisible();
});

test('el nivel escolar adapta la cantidad y complejidad del capítulo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /empezar aventura/i }).click();
  const firstGrade = page.getByRole('button', { name: /1\.º 5 patrones/i });
  await firstGrade.click();
  await expect(firstGrade).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /bosque de luz/i }).click();
  await page.getByRole('button', { name: /capítulo 1: una luz en el sendero/i }).click();
  await page.getByRole('button', { name: /resolver el patrón/i }).click();

  await expect(page.getByText('Patrón 1 de 5')).toBeVisible();
  await expect(page.getByText(/1\.º · reto 1 de 5/i)).toBeVisible();
  const correctPosition = await page.locator('.choice').evaluateAll((choices) =>
    choices.findIndex((choice) => choice.getAttribute('aria-label') === 'hoja'),
  );
  expect(correctPosition).not.toBe(1);
});
