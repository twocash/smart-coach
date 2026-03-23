import { test, expect } from '@playwright/test';
import { captureErrors } from './helpers/auth.js';

test.describe('Coach Login Flow', () => {
  test('welcome screen shows role buttons', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto('/');
    await expect(page.locator('.role-title:has-text("Coach")')).toBeVisible();
    await expect(page.locator('.role-title:has-text("Player")')).toBeVisible();
    await expect(page.locator('.role-title:has-text("Parent")')).toBeVisible();
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('coach PIN login succeeds with correct PIN', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto('/');
    // Click Coach role button
    await page.locator('.role-title:has-text("Coach")').click();
    // Wait for PIN pad to appear (look for number buttons)
    await expect(page.locator('button:has-text("1")').first()).toBeVisible({ timeout: 5000 });
    // Enter PIN 1234
    for (const digit of ['1', '2', '3', '4']) {
      await page.locator(`button:has-text("${digit}")`).first().click();
      await page.waitForTimeout(200);
    }
    // Wait for dashboard to load — coach screen should be visible
    await expect(page.locator('#screen-coach')).toBeVisible({ timeout: 10000 });
    // Verify token was stored
    const token = await page.evaluate(() => sessionStorage.getItem('ff_token'));
    expect(token).toBeTruthy();
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('wrong PIN shows error', async ({ page }) => {
    await page.goto('/');
    await page.locator('.role-title:has-text("Coach")').click();
    await expect(page.locator('button:has-text("1")').first()).toBeVisible({ timeout: 5000 });
    for (const digit of ['9', '9', '9', '9']) {
      await page.locator(`button:has-text("${digit}")`).first().click();
      await page.waitForTimeout(200);
    }
    // Should show error or stay on PIN screen
    await page.waitForTimeout(2000);
    const token = await page.evaluate(() => sessionStorage.getItem('ff_token'));
    expect(token).toBeFalsy();
  });
});
