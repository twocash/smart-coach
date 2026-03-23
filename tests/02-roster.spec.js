import { test, expect } from '@playwright/test';
import { loginAsCoach, captureErrors } from './helpers/auth.js';

test.describe('Roster Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsCoach(page);
    await page.goto('/');
    // Wait for coach dashboard to render with data loaded
    await expect(page.locator('#screen-coach')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.p-card').first()).toBeVisible({ timeout: 10000 });
  });

  test('displays seeded players', async ({ page }) => {
    const errors = captureErrors(page);
    const body = await page.textContent('body');
    expect(body).toContain('Alpha');
    expect(body).toContain('Bravo');
    expect(body).toContain('Charlie');
    expect(body).toContain('Delta');
    expect(body).toContain('Echo');
    expect(body).toContain('Foxtrot');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('shows tryout averages', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toContain('36.5');
    expect(body).toContain('38.2');
  });

  test('players API returns correct data', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('ff_token'));
    const resp = await page.request.get('/api/players', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const players = await resp.json();
    expect(players).toHaveLength(6);
    const varsity = players.filter(p => p.squad === 'v');
    const jv = players.filter(p => p.squad === 'jv');
    expect(varsity).toHaveLength(4);
    expect(jv).toHaveLength(2);
  });

  test('player has linked parent', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('ff_token'));
    const resp = await page.request.get('/api/players', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const players = await resp.json();
    const jake = players.find(p => p.last === 'Alpha');
    expect(jake.parents.length).toBeGreaterThanOrEqual(1);
    expect(jake.parents.some(p => p.name === 'Parent Alpha')).toBeTruthy();
  });
});
