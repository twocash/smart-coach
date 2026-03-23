// Test helpers for authentication flows

/**
 * Login as coach via API and set token in sessionStorage
 */
export async function loginAsCoach(page, pin = '1234') {
  const baseURL = page.url().startsWith('http') ? new URL(page.url()).origin : 'http://localhost:3000';
  const resp = await page.request.post(`${baseURL}/api/auth`, {
    data: { role: 'coach', pin }
  });
  const body = await resp.json();
  if (!body.token) throw new Error(`Coach login failed: ${JSON.stringify(body)}`);
  await page.evaluate(token => sessionStorage.setItem('ff_token', token), body.token);
  return body;
}

/**
 * Setup a player PIN via API (requires coach token)
 */
export async function setupPlayerPin(page, legacyId, pin, coachToken) {
  const baseURL = new URL(page.url()).origin;
  const resp = await page.request.post(`${baseURL}/api/auth/setup`, {
    data: { role: 'player', identifier: String(legacyId), pin },
    headers: { Authorization: `Bearer ${coachToken}` }
  });
  return resp.json();
}

/**
 * Setup a parent PIN via API (requires coach token)
 */
export async function setupParentPin(page, phone, pin, coachToken) {
  const baseURL = new URL(page.url()).origin;
  const resp = await page.request.post(`${baseURL}/api/auth/setup`, {
    data: { role: 'parent', identifier: phone, pin },
    headers: { Authorization: `Bearer ${coachToken}` }
  });
  return resp.json();
}

/**
 * Capture console errors and page errors
 */
export function captureErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    errors.push(`PAGE: ${err.message}`);
  });
  return errors;
}
