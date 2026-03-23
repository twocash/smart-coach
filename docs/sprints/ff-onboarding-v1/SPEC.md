# Sprint 4: Zero-Friction Onboarding & Auth Hardening

## Goal
Eliminate manual PIN distribution by building a self-serve SMS invite flow, establish persistent sessions, and introduce automated account recovery.

## Context
Currently the coach must manually set PINs for every player and parent via API calls, then verbally communicate them. There's no self-service onboarding, no notifications, no "forgot PIN" flow, and sessions don't survive closing the browser tab. This sprint solves all of that.

---

## Epic 1: Data Layer & Token Management

Establish the secure infrastructure for single-use magic links without cluttering the core user tables.

### Task 1.1: Create `join_tokens` Table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Default `gen_random_uuid()` |
| `token` | text (unique) | Hashed random string |
| `role` | text | `'player'` or `'parent'` |
| `target_id` | UUID | References `players.id` or `parents.id` |
| `expires_at` | timestamptz | 24-hour TTL from creation |
| `used_at` | timestamptz (nullable) | Set on use, prevents replay |
| `created_at` | timestamptz | Default `now()` |

**Logic:** Tokens expire after 24 hours and invalidate immediately upon use.

### Task 1.2: Add `onboarding_status` to Players and Parents

Add enum column to `players` and `parents` tables:
- `pending_invite` — on roster but no invite sent
- `invited` — SMS sent, waiting for PIN setup
- `active` — PIN set, fully onboarded

Gives coach immediate visual feedback on who's actually in the system.

---

## Epic 2: The Invite Service (API & Integrations)

Build endpoints to generate magic links and dispatch SMS via Twilio.

### Task 2.1: `POST /api/invites/send`

- **Auth:** Coach only
- **Payload:** `{ target_id, role, phone_number }`
- **Action:**
  1. Generate secure random token
  2. Insert into `join_tokens` with 24-hour expiry
  3. Send SMS via Twilio: *"Coach has invited you to Fairway Forward. Tap here to set your PIN and view the lineup: https://[domain]/join?token=[token]"*
  4. Update `onboarding_status` → `invited`

### Task 2.2: `GET /api/invites/verify`

- **Auth:** Public (no token required)
- **Payload:** `?token=[token]`
- **Action:** Validate token existence and expiration
- **Returns:** `{ valid: true, name, role }` for frontend personalization
- **Errors:** Expired or used tokens return clear message

### Task 2.3: `POST /api/auth/join`

- **Auth:** Public (requires valid token in payload)
- **Payload:** `{ token, new_pin }`
- **Action:**
  1. Validate token (exists, not expired, not used)
  2. Hash new PIN (same PBKDF2 as existing auth)
  3. Create/update `users` record, link to player/parent
  4. Mark token as used (`used_at = now()`)
  5. Update `onboarding_status` → `active`
  6. Return standard JWT session token (auto-login on PIN set)

---

## Epic 3: Frontend — Player/Parent Experience

Create frictionless mobile-first landing pages for new users.

### Task 3.1: `/join` Routing Logic

- Intercept users arriving with `?token=` parameter
- Show loading state while calling `GET /api/invites/verify`
- Invalid/expired: *"This link has expired. Please ask Coach for a new one."*
- Valid: proceed to PIN setup

### Task 3.2: PIN Setup Screen

- Display *"Welcome to Fairway Forward, [Name]"*
- Clean 4-digit keypad to enter PIN
- Confirm PIN (enter twice)
- On success: auto-login, redirect to player/parent dashboard

### Task 3.3: Session Storage Migration

- Move JWT from `sessionStorage` to `localStorage`
- Add token validity check on app load → auto-authenticate
- Users stay logged in across tab closures
- Add explicit "Log Out" confirmation since logout is now a deliberate action

---

## Epic 4: Frontend — Coach Experience

Give the coach a simple dashboard to manage invites without legacy IDs.

### Task 4.1: Roster "Invite" Actions

- Visual indicator next to players/parents missing a PIN (badge/icon)
- Color coding: red = `pending_invite`, yellow = `invited`, green = `active`
- 1-tap "Send Invite" button → triggers `POST /api/invites/send`
- Toast confirmation: *"Invite sent to [phone]"*

### Task 4.2: Bulk Invite (Optional — High Value)

- "Select All Pending" → send SMS to entire un-invited roster at once
- Confirmation dialog: *"Send invites to 12 players?"*
- Progress indicator during batch send

---

## Epic 5: Account Recovery (Forgot PIN)

Keep the coach out of IT support.

### Task 5.1: "Forgot PIN?" Flow

- Add "Forgot PIN?" link on login screen
- User enters phone number
- If phone exists in DB: generate 6-digit OTP (short-lived, ~10 min)
- SMS OTP to user's phone
- OTP stored in new `otp_codes` table (phone, code_hash, expires_at, used_at)

### Task 5.2: `POST /api/auth/reset`

- **Payload:** `{ phone, otp, new_pin }`
- **Action:** Verify OTP, hash new PIN, update user record
- **Return:** JWT token (auto-login after reset)

---

## Architecture Notes

By isolating invite logic into a dedicated `join_tokens` table, we avoid polluting the core `users` table with half-created accounts or plaintext setup codes. This sets the stage for a future migration to native Supabase Auth (if desired) — the custom JWT issuance in `POST /api/auth/join` can eventually be swapped for Supabase's native OTP endpoints without changing the frontend UX.

## Dependencies

- **Twilio account + credentials** — `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Sprint 2 complete** ✅
- **Domain for SMS links** — currently `smart-coach-wheat.vercel.app` (or custom domain)

## New Files (Estimated)

| File | Purpose |
|------|---------|
| `api/invites/send.js` | Generate token + send SMS |
| `api/invites/verify.js` | Validate magic link token |
| `api/auth/join.js` | Set PIN via magic link |
| `api/auth/reset.js` | Forgot PIN + OTP flow |
| `lib/twilio.js` | Twilio SMS client wrapper |
| `lib/tokens.js` | Token generation + validation helpers |
| `tests/08-invite-flow.spec.js` | E2E: invite → join → login |
| `tests/09-forgot-pin.spec.js` | E2E: forgot PIN → OTP → reset |

## Database Changes

```sql
-- join_tokens table
CREATE TABLE join_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('player', 'parent')),
  target_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- otp_codes table
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- onboarding status
ALTER TABLE players ADD COLUMN onboarding_status TEXT DEFAULT 'pending_invite'
  CHECK (onboarding_status IN ('pending_invite', 'invited', 'active'));
ALTER TABLE parents ADD COLUMN onboarding_status TEXT DEFAULT 'pending_invite'
  CHECK (onboarding_status IN ('pending_invite', 'invited', 'active'));
```
