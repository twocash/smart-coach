import { test, expect } from '@playwright/test';
import { captureErrors } from './helpers/auth.js';

test.describe('Parent Flow', () => {
  test('setup parent PIN and login via API', async ({ page }) => {
    const errors = captureErrors(page);
    await page.goto('/');
    // Get coach token
    const coachResp = await page.request.post('/api/auth', {
      data: { role: 'coach', pin: '1234' }
    });
    const { token: coachToken } = await coachResp.json();
    // Setup PIN for Parent Alpha (phone: 3175550101)
    const setupResp = await page.request.post('/api/auth/setup', {
      data: { role: 'parent', identifier: '3175550101', pin: '4321' },
      headers: { Authorization: `Bearer ${coachToken}` }
    });
    const setupBody = await setupResp.json();
    expect(setupBody.ok).toBe(true);
    // Login as parent
    const loginResp = await page.request.post('/api/auth', {
      data: { role: 'parent', identifier: '3175550101', pin: '4321' }
    });
    const loginBody = await loginResp.json();
    expect(loginBody.ok).toBe(true);
    expect(loginBody.user.role).toBe('parent');
    expect(loginBody.user.name).toBe('Parent Alpha');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('parent can signup for event', async ({ page }) => {
    await page.goto('/');
    const loginResp = await page.request.post('/api/auth', {
      data: { role: 'parent', identifier: '3175550101', pin: '4321' }
    });
    const { token } = await loginResp.json();
    const headers = { Authorization: `Bearer ${token}` };
    // Get events
    const events = await (await page.request.get('/api/events', { headers })).json();
    const event = events[0];
    // Signup
    const signupResp = await page.request.post('/api/signups', {
      headers,
      data: { event_id: event.id, attending: true, bring: 'Gatorade' }
    });
    expect(signupResp.ok()).toBeTruthy();
    // Verify
    const checkResp = await page.request.get(`/api/signups?event_id=${event.id}`, { headers });
    const signups = await checkResp.json();
    expect(signups.some(s => s.attending === true && s.bring === 'Gatorade')).toBeTruthy();
  });

  test('carpool offer and claim flow', async ({ page }) => {
    await page.goto('/');
    // Get coach token
    const coachResp = await page.request.post('/api/auth', {
      data: { role: 'coach', pin: '1234' }
    });
    const { token: coachToken } = await coachResp.json();
    const headers = { Authorization: `Bearer ${coachToken}` };
    const events = await (await page.request.get('/api/events', { headers })).json();
    const event = events[0];
    // Coach creates offer
    const offerResp = await page.request.post('/api/carpool/offer', {
      headers,
      data: { event_id: event.id, driver_name: 'Coach Smith', driver_phone: '3175550199', seats_total: 3, is_coach: true }
    });
    expect(offerResp.ok()).toBeTruthy();
    const { offer } = await offerResp.json();
    // Parent claims seat
    const parentLogin = await (await page.request.post('/api/auth', {
      data: { role: 'parent', identifier: '3175550101', pin: '4321' }
    })).json();
    const claimResp = await page.request.post('/api/carpool/claim', {
      headers: { Authorization: `Bearer ${parentLogin.token}` },
      data: { offer_id: offer.id, rider_name: 'Parent Alpha', rider_phone: '3175550101' }
    });
    expect(claimResp.ok()).toBeTruthy();
    // Verify carpool state
    const carpoolResp = await page.request.get(`/api/carpool?event_id=${event.id}`, { headers });
    const offers = await carpoolResp.json();
    const coachOffer = offers.find(o => o.id === offer.id);
    expect(coachOffer.carpool_riders).toHaveLength(1);
    expect(coachOffer.carpool_riders[0].rider_name).toBe('Parent Alpha');
  });
});
