import { test, expect } from '@playwright/test';
import { captureErrors } from './helpers/auth.js';

test.describe('Lineup Management', () => {
  test('add and remove player from lineup via API', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto('/');
    // Get coach token
    const coachResp = await page.request.post('/api/auth', {
      data: { role: 'coach', pin: '1234' }
    });
    const { token } = await coachResp.json();
    const headers = { Authorization: `Bearer ${token}` };
    // Get an event and a player
    const events = await (await page.request.get('/api/events', { headers })).json();
    const players = await (await page.request.get('/api/players', { headers })).json();
    const event = events[0];
    const player = players[0];
    // Add to lineup
    const addResp = await page.request.post('/api/lineups', {
      headers,
      data: { event_id: event.id, player_id: player.id }
    });
    expect(addResp.ok()).toBeTruthy();
    // Verify in lineup
    const lineupResp = await page.request.get(`/api/lineups?event_id=${event.id}`, { headers });
    const lineup = await lineupResp.json();
    expect(lineup).toContain(player.id);
    // Remove from lineup
    const removeResp = await page.request.post('/api/lineups', {
      headers,
      data: { event_id: event.id, player_id: player.id, action: 'remove' }
    });
    expect(removeResp.ok()).toBeTruthy();
    // Verify removed
    const afterResp = await page.request.get(`/api/lineups?event_id=${event.id}`, { headers });
    const after = await afterResp.json();
    expect(after).not.toContain(player.id);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
});
