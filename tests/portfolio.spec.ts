import { test, expect } from '@playwright/test';

test('desktop project access, dialogs, clipboard and browser CSP', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  const violations: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (/Content Security Policy|Refused to|violates/.test(message.text())) violations.push(message.text());
  });
  await page.goto('/');
  const opening = page.locator('.ia-welcome').getByRole('link', { name: /^View Projects/ });
  await expect(opening).toBeVisible();
  const bounds = await opening.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(1000);
  await opening.click();
  await expect(page.locator('#projects article h3').first()).toHaveText('RSNA Pneumonia Detection');
  await expect(page.locator('#projects article h3').nth(1)).toHaveText('Walmart Store Weekly Sales Forecasting');
  const trigger = page.getByRole('button', { name: 'Project Details — RSNA Pneumonia Detection', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  for (let index = 0; index < 12; index++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  expect(await page.locator('#contact').evaluate(element => element.hasAttribute("inert"))).toBe(true);
  await expect(dialog.getByText('My contribution', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.locator('#contact').evaluate(element => element.hasAttribute("inert"))).toBe(false);
  await page.getByRole('link', { name: 'RESUME', exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.getByRole('link', { name: 'CONTACT', exact: true }).click();
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toHaveText('Email copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('charannaram1710@gmail.com');
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:charannaram1710@gmail.com');
  expect(await page.locator('#projects img').evaluateAll(images => images.filter(image => !(image as HTMLImageElement).complete || !(image as HTMLImageElement).naturalWidth).length)).toBe(0);
  await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'document.documentElement.dataset.injected="true"';
    document.body.append(script);
  });
  expect(await page.locator('html').getAttribute('data-injected')).toBeNull();
  expect(violations.some(message => message.includes('inline script'))).toBe(true);
  expect(violations.filter(message => !message.includes('inline script'))).toEqual([]);
  expect(errors).toEqual([]);
});

test('mobile reading, dialog layout and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#top canvas')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: /^View Projects/ }).click();
  await page.getByRole('button', { name: 'Project Details — RSNA Pneumonia Detection', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
  await expect(page.locator('#contact a[href^="mailto:"]').locator('..')).toHaveCSS('opacity', '1');
  // Smaller phones must retain visible navigation controls rather than clipping them.
  await page.setViewportSize({ width: 320, height: 740 });
  const button = await page.getByRole('button', { name: 'Open menu' }).boundingBox();
  expect(button!.x + button!.width).toBeLessThanOrEqual(320);
});

test('armor loads its local model under CSP without script or texture violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  const violations: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (/Content Security Policy|Refused to|violates/.test(message.text())) violations.push(message.text()); });
  await page.goto('/armor/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'SYSTEM ONLINE' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(violations).toEqual([]);
});
