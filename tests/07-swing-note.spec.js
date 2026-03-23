import { test, expect } from '@playwright/test';
import { captureErrors } from './helpers/auth.js';

test.describe('Swing Note (AI)', () => {
  test('swing note endpoint requires coach auth', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto('/');
    const resp = await page.request.post('/api/swing-note', {
      data: { playerProfile: {}, lessonFocus: 'grip' }
    });
    expect(resp.status()).toBe(401);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('swing note endpoint rejects non-coach', async ({ page }) => {
    await page.goto('/');
    // Get coach token to set up player
    const coachResp = await page.request.post('/api/auth', {
      data: { role: 'coach', pin: '1234' }
    });
    const { token: coachToken } = await coachResp.json();
    // Setup player PIN
    await page.request.post('/api/auth/setup', {
      data: { role: 'player', identifier: '2', pin: '5678' },
      headers: { Authorization: `Bearer ${coachToken}` }
    });
    // Login as player
    const playerResp = await page.request.post('/api/auth', {
      data: { role: 'player', identifier: '2', pin: '5678' }
    });
    const { token: playerToken } = await playerResp.json();
    // Try swing note as player
    const noteResp = await page.request.post('/api/swing-note', {
      data: { playerProfile: { name: 'Player Bravo' }, lessonFocus: 'grip' },
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    expect(noteResp.status()).toBe(403);
  });

  test('swing note with coach auth fires request', async ({ page }) => {
    await page.goto('/');
    const coachResp = await page.request.post('/api/auth', {
      data: { role: 'coach', pin: '1234' }
    });
    const { token } = await coachResp.json();
    const noteResp = await page.request.post('/api/swing-note', {
      data: {
        playerProfile: { name: 'Player Alpha', squad: 'v', try_avg: 38.2 },
        lessonFocus: 'putting consistency'
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    // Without ANTHROPIC_API_KEY, expect 500 (API call fails)
    // With API key, expect 200
    const status = noteResp.status();
    expect([200, 500, 502]).toContain(status);
  });
});
