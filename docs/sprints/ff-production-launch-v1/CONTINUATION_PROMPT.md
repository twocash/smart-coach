# CONTINUATION PROMPT — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1

---

## Instant Orientation

**Project:** fairway-forward (root: wherever this repo lives)
**Sprint:** ff-production-launch-v1
**Current Phase:** Phase 0 — Pre-flight (planning complete, execution not yet started)
**Status:** 🟡 In Progress — 4 blockers must resolve before Epic 1
**Next Action:** Get answers to 4 open questions in REPO_AUDIT.md, then begin Epic 1 (Repo Scaffold)

---

## Context Reconstruction

### Read These First (In Order)
1. `docs/sprints/ff-production-launch-v1/SPEC.md` — Live Status + Attention Anchor + Goals
2. `docs/sprints/ff-production-launch-v1/DEVLOG.md` — most recent entries
3. `docs/sprints/ff-production-launch-v1/SPRINTS.md` — current epic

### What This Project Is
Fairway Forward is a D1-style golf coaching platform for Bishop Chatard HS Boys Golf in Indianapolis. The head coach (David) is the primary user — he is non-technical. The system manages player profiles, swing notes, scores, events, and a public feed for fans.

### Stack Decisions (do not re-litigate without reading DECISIONS.md)
- Frontend: Static HTML served from Vercel `public/` — no Next.js conversion
- Auth: Custom PIN system via Twilio SMS — no Supabase Auth
- Backend: Node serverless functions in Vercel `api/` directory
- Database: Supabase Postgres — schema is complete and ready to deploy
- PIN hashing: `bcryptjs` (not `bcrypt` — no native bindings)
- Scope enforcement: JavaScript in API routes (service role key) — RLS policies deferred

### Key Decisions Made
- Static HTML stays static (ADR-001)
- Custom PIN auth, not Supabase Auth (ADR-002)
- bcryptjs over bcrypt (ADR-003)
- Service role key at API layer, RLS policies deferred (ADR-004)
- Single `lib/supabase.js` client (ADR-005)
- `preview` branch for David's safety net (ADR-006)

### What's Done
- [x] All 9 sprint artifacts written to disk
- [x] Schema SQL ready to deploy (`fairway_forward_schema.sql`)
- [x] HTML files built (need organizing into `public/` and `ff-api.js` added)

### What's Pending (in order)
- [ ] E0: Resolve 4 pre-flight blockers (domain, Twilio, phones, HTML canonical)
- [ ] E1: Repo scaffold (package.json, .gitignore, public/, ff-api.js)
- [ ] E2: Supabase project + schema deploy
- [ ] E3: Lib layer (supabase.js, auth.js, scope.js, twilio.js)
- [ ] E4: Auth routes (verify-pin, logout, me, pin management) ← KEYSTONE
- [ ] E5: Data routes (roster, rounds, events, swing-notes, blog)
- [ ] E6: Public routes (feed, standings, schedule)
- [ ] E7: Vercel deploy + smoke tests
- [ ] E8: David's CI/CD handoff
- [ ] E9: Full QA checklist

---

## Resume Instructions

1. Read `SPEC.md` (Live Status + Attention Anchor)
2. Read `DEVLOG.md` (last 3 entries for current state)
3. Check which epic is active in `SPRINTS.md`
4. Resolve any open blockers before writing code
5. Work epics in order — never skip a build gate

---

## Attention Anchor

**We are building:** Production deployment of Fairway Forward — static HTML + Vercel API routes + Supabase, PIN auth via Twilio, live today.
**Success looks like:** David logs in with a PIN texted to his phone, generates a swing note, enters a score — from a real URL — before end of day.
**We are NOT:** Converting to Next.js. Using Supabase Auth. Building a mobile app. Defining RLS policies.

---

## Critical Files (Quick Reference)
| File | Purpose |
|------|---------|
| `fairway_forward_schema.sql` | Deploy this to Supabase — complete, ready |
| `lib/auth.js` | `resolveSession()` + `withAuth()` — keystone of the auth layer |
| `api/auth/verify-pin.js` | Most important route — full reference impl in EXECUTION_PROMPT.md |
| `public/js/ff-api.js` | Only new JS the frontend needs — token header wrapper |
| `EXECUTION_PROMPT.md` | Self-contained handoff with all reference code |

---

*Sprint: ff-production-launch-v1 | Author: Jim | Date: 2026-03-22*
