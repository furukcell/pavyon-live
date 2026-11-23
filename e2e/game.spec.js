import { test, expect } from '@playwright/test';

test('loads the 3D game and processes viewer commands', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.locator('.live-pill')).toHaveClass(/server-connected/);

  await page.locator('#username').fill('e2e_viewer');
  await page.locator('[data-command="!gel"]').click();
  await expect(page.locator('#guest-count')).toHaveText('1 / 100');
  await expect(page.locator('#event-log')).toContainText('e2e_viewer');

  await page.waitForTimeout(1250);
  await page.locator('[data-command="!dans"]').click();
  await expect(page.locator('#event-log')).toContainText('dans pistine çıktı');

  await page.waitForTimeout(1250);
  await page.locator('[data-command="!cik"]').click();
  await expect(page.locator('#guest-count')).toHaveText('0 / 100');
  expect(pageErrors).toEqual([]);
});

test('processes a test gift and updates the live event status', async ({ page }) => {
  await page.goto('/');
  await page.locator('#username').fill('e2e_gift');
  await page.locator('[data-gift="drink"]').click();
  await expect(page.locator('#guest-count')).toHaveText('1 / 100');
  await expect(page.locator('#event-log')).toContainText('servis');
  
  const before = await page.request.get('/api/status');
  const beforeStatus = await before.json();
  const payload = { type: 'like', username: 'e2e_provider', count: 7, eventId: 'e2e-event-once' };
  const accepted = await page.request.post('/dev/event', { data: payload });
  expect(accepted.status()).toBe(202);
  const duplicate = await page.request.post('/dev/event', { data: payload });
  expect(duplicate.status()).toBe(200);
  expect((await duplicate.json()).duplicate).toBe(true);

  const after = await (await page.request.get('/api/status')).json();
  expect(after.accepted).toBe(beforeStatus.accepted + 1);
  expect(after.likes).toBe(beforeStatus.likes + 1);
});

test('supports the OBS stream-only layout', async ({ page }) => {
  await page.goto('/?view=stream');
  await expect(page.locator('html')).toHaveClass(/stream-mode/);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.locator('#music-toggle')).toBeHidden();
  await expect(page.locator('.stream-event')).toBeVisible();
  await expect(page.locator('.controls')).toBeHidden();
});

test('handles 25, 50, 75 and 100 concurrent viewer entries', async ({ page }) => {
  await page.goto('/');
  const count = page.locator('#guest-count');
  for (const expected of [25, 50, 75, 100]) {
    await page.locator('[data-spawn="25"]').click();
    await expect(count).toHaveText(`${expected} / 100`, { timeout: 20_000 });
    await page.waitForTimeout(50);
  }
  await page.locator('[data-spawn="25"]').click();
  await expect(count).toHaveText('100 / 100');
  await expect(page.locator('#event-log')).toContainText('Kapasite 100/100');
});

test('keeps the mobile controls reachable on a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 568 });
  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.locator('[data-command="!gel"]')).toBeVisible();
  await expect(page.locator('[data-gift="vip"]')).toBeVisible();
  const shell = await page.locator('#game-shell').evaluate(el => ({
    height: el.getBoundingClientRect().height,
    viewport: window.innerHeight
  }));
  expect(shell.height).toBeLessThanOrEqual(shell.viewport + 1);
});
