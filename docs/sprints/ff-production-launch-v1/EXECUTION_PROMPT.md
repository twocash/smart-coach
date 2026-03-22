# EXECUTION PROMPT — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1
## Version: 1.0 | Date: 2026-03-22

---

## Who This Is For

Any engineer (or Claude Code session) picking up this sprint fresh. This document is self-contained. You can execute the entire sprint from this file alone, using the other artifacts for reference.

---

## Attention Anchoring Protocol

**Before any major decision, re-read:**
1. `docs/sprints/ff-production-launch-v1/SPEC.md` — Live Status + Attention Anchor
2. `docs/sprints/ff-production-launch-v1/DEVLOG.md` — Last 3 entries

**After every 10 tool calls:**
- Ask: Am I still pursuing the stated goal?
- If uncertain: re-read SPEC.md Goals and Acceptance Criteria

**Before committing:**
- Verify: Does this change satisfy the relevant Acceptance Criteria?

**The goal in one sentence:** Get David (non-technical head coach) logged in and coaching from a live URL today.

---

## Context

**Project:** Fairway Forward — D1-style golf coaching platform for Bishop Chatard HS Boys Golf
**Stack:** Static HTML (Vercel) + Node serverless functions (Vercel API routes) + Supabase (Postgres) + Twilio SMS
**Auth:** Custom PIN system — no Supabase Auth
**Database:** Schema is complete and ready to deploy (`fairway_forward_schema.sql`)
**Frontend:** HTML files are complete — they need `ff-api.js` added and a live API to call

---

## Pre-Execution Checklist

Before writing any code, confirm these are resolved:

```bash
# These must be answered — see REPO_AUDIT.md open questions
echo "1. Domain confirmed?"
echo "2. Twilio account ready (SID + token + phone number)?"
echo "3. Coach phone numbers in hand?"
echo "4. Canonical HTML file confirmed?"
```

If any are unresolved: stop, resolve them, then proceed.

---

## Execution Order

Work epics in strict order. Each epic has a build gate — do not proceed to the next epic until the gate passes.

```
E0 Pre-flight       → all open questions answered
E1 Repo Scaffold    → npm install succeeds, HTML in public/
E2 Supabase         → schema deployed, seed verified, keys saved
E3 Lib Layer        → resolveSession() + withAuth() + scope helpers + twilio
E4 Auth Routes      → PIN→token→me flow works end-to-end
E5 Data Routes      → roster, rounds, events, swing-notes, blog
E6 Public Routes    → /api/public/* returns 200, no auth
E7 Vercel Deploy    → live URL, smoke tests pass
E8 CI/CD Handoff    → David can push and see it live
E9 QA               → all acceptance criteria checked
```

---

## Key Code: The Lib Layer

These three files are the foundation. Get them right before touching any route.

### `lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### `lib/auth.js`
```js
import { supabase } from './supabase.js'

export async function resolveSession(token) {
  if (!token) return null

  const { data: session, error } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()

  if (error || !session) return null
  if (new Date(session.expires_at) < new Date()) return null

  const { data: user } = await supabase
    .from('users')
    .select('id, role, squad_scope, access_flags, first_name, last_name')
    .eq('id', session.user_id)
    .single()

  if (!user) return null

  await supabase
    .from('sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('token', token)

  return user
}

export function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers['x-ff-token']
    if (!token) return res.status(401).json({ error: 'No session token' })
    const user = await resolveSession(token)
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' })
    req.user = user
    return handler(req, res)
  }
}
```

### `lib/scope.js`
```js
export function applyScopeFilter(query, user) {
  if (user.role === 'coach_head' || user.role === 'admin') return query
  if (user.squad_scope === 'jv') return query.eq('squad', 'jv')
  if (user.squad_scope === 'varsity') return query.eq('squad', 'varsity')
  return query.eq('user_id', user.id)
}

export function can(user, flag) {
  return user.access_flags?.[flag] === true
}
```

### `lib/twilio.js`
```js
import twilio from 'twilio'

export async function sendPin(phone, pin) {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    await client.messages.create({
      body: `Your Fairway Forward access PIN is: ${pin}. Bishop Chatard Boys Golf.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
    return { success: true }
  } catch (error) {
    console.error('Twilio error:', error)
    return { success: false, error: error.message }
  }
}
```

---

## Key Code: PIN Verify Route

This is the keystone route. Reference implementation:

```js
// api/auth/verify-pin.js
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, pin } = req.body
  if (!user_id || !pin) return res.status(400).json({ error: 'user_id and pin required' })

  // Get active (or pending) PIN for user
  const { data: pinRecord } = await supabase
    .from('pins')
    .select('id, pin_hash, status, failed_attempts')
    .eq('user_id', user_id)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!pinRecord) return res.status(401).json({ error: 'No active PIN' })
  if (pinRecord.status === 'locked') return res.status(423).json({ error: 'PIN locked' })

  const match = await bcrypt.compare(String(pin), pinRecord.pin_hash)

  if (!match) {
    const newAttempts = pinRecord.failed_attempts + 1
    const newStatus = newAttempts >= 10 ? 'locked' : pinRecord.status
    await supabase
      .from('pins')
      .update({ failed_attempts: newAttempts, status: newStatus })
      .eq('id', pinRecord.id)
    return res.status(401).json({ error: 'Invalid PIN' })
  }

  // Success — mark PIN active + claimed
  await supabase
    .from('pins')
    .update({ status: 'active', claimed_at: new Date().toISOString(), failed_attempts: 0 })
    .eq('id', pinRecord.id)

  // Create session
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('sessions').insert({
    user_id,
    token,
    expires_at: expiresAt,
    ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    user_agent: req.headers['user-agent'],
  })

  return res.status(200).json({ token })
}
```

---

## Smoke Test Commands (run after Epic 7)

```bash
export BASE=https://your-live-url.vercel.app

# Public route — no auth, should 200
curl -s $BASE/api/public/feed | jq .

# Protected route — no token, should 401
curl -s $BASE/api/auth/me | jq .

# Wrong PIN — should 401
curl -s -X POST $BASE/api/auth/verify-pin \
  -H "Content-Type: application/json" \
  -d '{"user_id":"REPLACE_WITH_COACH_UUID","pin":"000000"}' | jq .

# Generate PIN (need a valid coach session first if you bootstrap manually)
# Or: insert a test PIN directly in Supabase SQL editor for initial login
```

### Bootstrap: First Coach Login (Manual)

Since the first PIN must be generated by a coach, but the coach has no session yet, use Supabase SQL editor to create the first PIN manually:

```sql
-- Generate PIN hash in node:
-- node -e "const b = require('bcryptjs'); b.hash('847291', 12).then(h => console.log(h));"

-- Insert the PIN
INSERT INTO pins (user_id, pin_hash, status, delivery_phone, sent_at)
VALUES (
  (SELECT id FROM users WHERE role = 'coach_head'),
  '$2a$12$REPLACE_WITH_REAL_HASH',
  'pending',
  '+1XXXXXXXXXX',
  NOW()
);
```

Then David enters PIN `847291` in the app → gets session token → can generate PINs for everyone else from the UI.

---

## Post-Epic Update Protocol

After completing each epic:
```bash
# 1. Update SPEC.md Live Status block
# Current Phase: Epic N complete → Epic N+1
# Last Updated: {ISO timestamp}
# Next Action: {first task of next epic}

# 2. Add DEVLOG entry
echo "## Epic N: {Name} — Complete\n**Time:** {duration}\n**Notes:** {any surprises}" \
  >> docs/sprints/ff-production-launch-v1/DEVLOG.md

# 3. ATTENTION ANCHOR: Re-read SPEC.md before starting next epic
```

---

*Sprint: ff-production-launch-v1 | Author: Jim | Date: 2026-03-22*
