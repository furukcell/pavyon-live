import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/(fonts\.googleapis|fonts\.gstatic)\.com\//, route => route.abort());
  page.setDefaultNavigationTimeout(15_000);
});

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
  await page.locator('[data-command="!masa"]').click();
  await expect(page.locator('#event-log')).toContainText('masaya oturdu');

  await page.waitForTimeout(1250);
  await page.locator('[data-command="!sahne"]').click();
  await expect(page.locator('#event-log')).toContainText('sahneye çıktı');

  await page.waitForTimeout(1250);
  await page.locator('[data-command="!cik"]').click();
  await expect(page.locator('#guest-count')).toHaveText('0 / 100');
  expect(pageErrors).toEqual([]);
});

test('runs all five gift actions and updates the live event status', async ({ page }) => {
  await page.goto('/');

  await page.locator('#username').fill('e2e_invite');
  await page.locator('#kons-select').selectOption('kons-1');
  await page.locator('[data-gift="invite"]').click();
  await expect(page.locator('#event-log')).toContainText('masasına gidiyor');

  await page.locator('#username').fill('e2e_dance');
  await page.locator('#kons-select').selectOption('kons-2');
  await page.locator('[data-gift="dance"]').click();
  await expect(page.locator('#event-log')).toContainText('birlikte dans ediyor');

  await page.locator('#username').fill('e2e_vip');
  await page.locator('#kons-select').selectOption('kons-3');
  await page.locator('[data-gift="vip"]').click();
  await expect(page.locator('#event-log')).toContainText('VIP locaya geçti');

  await page.locator('#username').fill('e2e_drink');
  await page.locator('[data-gift="drink"]').click();
  await expect(page.locator('#event-log')).toContainText('servis');

  await page.locator('#username').fill('e2e_stage');
  await page.locator('[data-gift="stage"]').click();
  await expect(page.locator('#event-log')).toContainText('sahne gösterisi başladı');
  await expect(page.locator('#guest-count')).toHaveText('5 / 100');

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
  await expect(page.locator('#live-event-count')).toHaveText(String(after.accepted));
  await expect(page.locator('#like-count')).toHaveText(String(after.likes));
  await expect(page.locator('#live-event-history')).toContainText('e2e_provider');
});

test('music panel imports tracks and preserves favorites across categories', async ({ page }) => {
  await page.goto('/');
  await page.locator('#music-toggle').click();
  await expect(page.locator('#music-panel')).toBeVisible();
  await page.locator('[data-music-category="ankara"]').click();
  await page.locator('#music-files').setInputFiles({
    name: 'rehearsal.wav',
    mimeType: 'audio/wav',
    buffer: Buffer.alloc(64)
  });
  await expect(page.locator('.music-track-name')).toHaveText('rehearsal.wav');
  await page.locator('.music-favorite').click();
  await page.locator('[data-music-category="favorites"]').click();
  await expect(page.locator('.music-track-name')).toHaveText('rehearsal.wav');
  await page.locator('#music-close').click();
  await expect(page.locator('#music-panel')).toBeHidden();
});

test('supports the OBS stream-only layout', async ({ page }) => {
  await page.goto('/?view=stream');
  await expect(page.locator('html')).toHaveClass(/stream-mode/);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.locator('#music-toggle')).toBeHidden();
  await expect(page.locator('.stream-event')).toBeVisible();
  await expect(page.locator('.controls')).toBeHidden();
});

test('handles 10, 25, 50 and 100 concurrent viewer entries', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'The 100-actor stress scenario is desktop-only; mobile gets its own viewport checks.');
  test.setTimeout(120_000);
  await page.goto('/');
  const count = page.locator('#guest-count');
  await page.locator('[data-spawn="10"]').click();
  await expect(count).toHaveText('10 / 100', { timeout: 20_000 });
  await page.reload();
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
