# SPEC — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1
## Tier: Sprint (1 day, full 9 artifacts)

---

## Live Status

| Field | Value |
|-------|-------|
| **Current Phase** | Phase 0 — Pattern Check / Pre-flight |
| **Status** | 🟡 In Progress |
| **Blocking Issues** | Domain unconfirmed · Coach phone numbers are placeholders · Twilio account unconfirmed |
| **Last Updated** | 2026-03-22T00:00:00Z |
| **Next Action** | Resolve 4 open questions in REPO_AUDIT, then begin Epic 1 |
| **Attention Anchor** | Re-read this block before every epic transition |

---

## Attention Anchor

**Re-read this block before every major decision.**

- **We are building:** A production deployment of Fairway Forward — static HTML frontend + Node API routes on Vercel, backed by Supabase, with PIN-based auth delivered via Twilio SMS.
- **Success looks like:** David (head coach, non-technical) can log in with a PIN, generate swing notes, enter scores, and manage events — from a live URL — on the same day this sprint runs.
- **We are NOT:** Converting HTML to Next.js. Building a mobile app. Implementing Supabase Auth. Writing automated tests. Deploying RLS policies beyond service-role enforcement.
- **Current phase:** Phase 0 — Pre-flight
- **Next action:** Confirm 4 open questions, then scaffold repo and run Epic 1.

---

## Goal

Push Fairway Forward to production today. The frontend is built. The schema is ready. The work is wiring the auth layer, building API routes, provisioning Supabase + Vercel, and giving David a CI/CD workflow he can use without a terminal.

This is a D1-style golf coaching platform for Bishop Chatard HS Boys Golf. The head coach is the primary user. Everything else serves that user.

---

## Non-Goals

- No Next.js conversion (static HTML stays static HTML)
- No Supabase Auth (custom PIN system only)
- No automated test suite (manual QA checklist for launch)
- No RLS policy definitions beyond enabling RLS on tables (API layer enforces scope)
- No mobile app
- No fan-facing login (public routes are open, no auth)
- No AI swing note generation wired in Sprint 1 (coach tool UI wires to API; AI call stubbed)

---

## Acceptance Criteria

### Auth
- [ ] Head coach receives PIN via SMS
- [ ] Head coach enters PIN → receives session token
- [ ] Session token resolves correct role + access_flags on `/api/auth/me`
- [ ] Wrong PIN increments `failed_attempts`; 10 failures locks the PIN
- [ ] `/api/auth/logout` invalidates session token

### Access Control
- [ ] JV coach token cannot read Varsity player profiles
- [ ] Player token reads only their own data
- [ ] `/api/public/feed` returns 200 with zero auth headers (fan access)

### Data
- [ ] Round entered with type `tournament` gets weight=3, weighted_score calculated automatically
- [ ] Player with `public_profile_opt_in = true` appears in public standings
- [ ] Player with opt-in = false does NOT appear

### CI/CD (David's workflow)
- [ ] David can edit an HTML file on GitHub web UI → push → Vercel deploys automatically
- [ ] David has a `preview` branch that generates a preview URL before hitting `main`
- [ ] No terminal required for David at any point post-launch

### Smoke Tests
- [ ] `GET /api/public/feed` → 200, empty array
- [ ] `GET /api/auth/me` with no token → 401
- [ ] `POST /api/auth/verify-pin` with wrong PIN → 401
- [ ] `POST /api/auth/verify-pin` with correct PIN → 200 + session token

---

## Patterns Extended

| Requirement | Existing Pattern | Extension Approach |
|-------------|------------------|-------------------|
| Session resolution | None (greenfield) | CREATE `lib/auth.js` — this becomes the canonical pattern |
| Scope filtering | None (greenfield) | CREATE `lib/scope.js` — called by every protected route |
| Supabase client | None (greenfield) | CREATE `lib/supabase.js` — single instance, service role |
| Frontend API auth | None (greenfield) | CREATE `public/js/ff-api.js` — token header wrapper |

## New Patterns Proposed

All patterns are new (greenfield). No duplication risk.

---

## Canonical Source Audit

| Capability Needed | Canonical Home | Current Approach | Recommendation |
|-------------------|----------------|------------------|----------------|
| PIN hashing | `api/auth/verify-pin.js` using bcrypt | Not yet built | CREATE |
| Session token generation | `api/auth/verify-pin.js` using crypto.randomUUID | Not yet built | CREATE |
| Session token resolution | `lib/auth.js` → `resolveSession()` | Not yet built | CREATE |
| Scope enforcement | `lib/scope.js` → `applyScopeFilter()` | Not yet built | CREATE |
| SMS delivery | `lib/twilio.js` → `sendPin()` | Not yet built | CREATE |
| Supabase queries | `lib/supabase.js` (server only) | Not yet built | CREATE |

---

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@supabase/supabase-js` | latest | Database client |
| `bcryptjs` | latest | PIN hashing (pure JS, no native dep issues on Vercel) |
| `twilio` | latest | SMS delivery |

**Note:** Use `bcryptjs` (not `bcrypt`) — no native bindings, works cleanly on Vercel serverless.

---

*Sprint: ff-production-launch-v1 | Author: Jim | Date: 2026-03-22*
