import { test, expect } from '@playwright/test';
import { loginAsCoach, captureErrors } from './helpers/auth.js';

test.describe('Event Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsCoach(page);
  });

  test('events API returns seeded events', async ({ page }) => {
    const errors = captureErrors(page);
    const token = await page.evaluate(() => localStorage.getItem('ff_token'));
    const resp = await page.request.get('/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(resp.ok()).toBeTruthy();
    const events = await resp.json();
    expect(events.length).toBeGreaterThanOrEqual(3);
    const names = events.map(e => e.name);
    expect(names).toContain('vs Cathedral');
    expect(names).toContain('City Championship');
    expect(names).toContain('Range Session');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('create and delete event via API', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('ff_token'));
    const headers = { Authorization: `Bearer ${token}` };
    // Create
    const createResp = await page.request.post('/api/events', {
      headers,
      data: { type: 'match', name: 'Test Match', location: 'Test Course', date: '2026-05-01', tee_time: '2:00 PM' }
    });
    expect(createResp.ok()).toBeTruthy();
    const created = await createResp.json();
    expect(created.ok).toBe(true);
    expect(created.event.name).toBe('Test Match');
    // Verify it appears
    const listResp = await page.request.get('/api/events', { headers });
    const events = await listResp.json();
    expect(events.some(e => e.name === 'Test Match')).toBeTruthy();
    // Delete
    const delResp = await page.request.delete(`/api/events?id=${created.event.id}`, { headers });
    expect(delResp.ok()).toBeTruthy();
    // Verify deleted
    const afterResp = await page.request.get('/api/events', { headers });
    const after = await afterResp.json();
    expect(after.some(e => e.name === 'Test Match')).toBeFalsy();
  });
});
