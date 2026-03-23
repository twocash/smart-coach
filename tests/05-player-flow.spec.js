import { test, expect } from '@playwright/test';
import { captureErrors } from './helpers/auth.js';

test.describe('Player Flow', () => {
  test('setup player PIN and login via API', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto('/');
    // Get coach token
    const coachResp = await page.request.post('/api/auth', {
      data: { role: 'coach', pin: '1234' }
    });
    const { token: coachToken } = await coachResp.json();
    // Setup PIN for Jake Mitchell (legacy_id: 1)
    const setupResp = await page.request.post('/api/auth/setup', {
      data: { role: 'player', identifier: '1', pin: '5678' },
      headers: { Authorization: `Bearer ${coachToken}` }
    });
    const setupBody = await setupResp.json();
    expect(setupBody.ok).toBe(true);
    // Login as player
    const loginResp = await page.request.post('/api/auth', {
      data: { role: 'player', identifier: '1', pin: '5678' }
    });
    const loginBody = await loginResp.json();
    expect(loginBody.ok).toBe(true);
    expect(loginBody.user.role).toBe('player');
    expect(loginBody.user.name).toContain('Jake');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('player can RSVP to event', async ({ page }) => {
    await page.goto('/');
    // Login as player
    const loginResp = await page.request.post('/api/auth', {
      data: { role: 'player', identifier: '1', pin: '5678' }
    });
    const { token, user } = await loginResp.json();
    const headers = { Authorization: `Bearer ${token}` };
    // Get events
    const events = await (await page.request.get('/api/events', { headers })).json();
    const event = events[0];
    // RSVP
    const rsvpResp = await page.request.post('/api/rsvps', {
      headers,
      data: { event_id: event.id, player_id: user.playerId, status: 'yes' }
    });
    expect(rsvpResp.ok()).toBeTruthy();
    // Verify RSVP
    const checkResp = await page.request.get(`/api/rsvps?event_id=${event.id}`, { headers });
    const rsvps = await checkResp.json();
    expect(rsvps.some(r => r.player_id === user.playerId && r.status === 'yes')).toBeTruthy();
  });
});
