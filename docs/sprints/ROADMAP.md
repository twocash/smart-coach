# ROADMAP — Fairway Forward
## Initiative: Platform Launch + Season Operations
## Updated: 2026-03-23

---

## Sprint Map

### Sprint 1 — Season 4 Static Deploy
**Sprint:** `ff-season4-deploy-v1`
**Status:** ✅ Complete
**Goal:** HTML live at a Vercel URL.

---

### Sprint 2 — Backend Wiring
**Sprint:** `ff-backend-v1`
**Status:** ✅ Complete (2026-03-23)
**Goal:** Replace localStorage with Supabase. API routes. PIN auth. Vercel deploy.
**What shipped:**
- Supabase schema (9 tables) deployed
- All API routes wired: auth, players, events, lineups, RSVPs, signups, carpool, swing notes
- Sub-path routing fixed (split handlers for vercel dev compatibility)
- Frontend JS syntax bugs fixed (unescaped apostrophe, malformed select query)
- Carpool seat counting bug fixed
- Season config extracted from hardcoded values
- `.gitignore`, seed script, Playwright E2E suite (18 tests passing)
- Production deployed to https://smart-coach-wheat.vercel.app

---

### Sprint 3 — AI Swing Note Wiring
**Sprint:** `ff-ai-notes-v1`
**Status:** 🟡 Partially Complete
**What exists:** `api/swing-note.js` calls Anthropic Claude API with coach-only auth guard. Endpoint works.
**Remaining:** Frontend UI to trigger swing notes, review/edit/approve flow, save notes to Supabase.
**Dependencies:** `ANTHROPIC_API_KEY` env var set in Vercel.

---

### Sprint 4 — Zero-Friction Onboarding & Auth Hardening
**Sprint:** `ff-onboarding-v1`
**Status:** ⏸️ Not Started — **NEXT UP**
**Goal:** Eliminate manual PIN distribution. Self-serve SMS invite flow, persistent sessions, automated account recovery.
**Full spec:** `docs/sprints/ff-onboarding-v1/SPEC.md`
**Dependencies:** Sprint 2 complete ✅, Twilio credentials needed.

---

### Sprint 5 — Public Feed + Blog
**Sprint:** `ff-public-feed-v1`
**Status:** ⏸️ Not Started
**Goal:** Fan-facing public page. AI post-match recaps. Public standings.
**Dependencies:** Sprints 2 + 3 complete.

---

## Current UX Gaps (from Sprint 2 audit)

1. **Onboarding is manual** — Coach must know legacy IDs, manually set PINs, verbally communicate them. No self-service. → Addressed by Sprint 4.
2. **No notifications** — No SMS, email, or push. Lineup texts are copy-paste only. → Sprint 4 introduces Twilio SMS.
3. **Session doesn't persist** — `sessionStorage` clears on tab close. → Sprint 4 migrates to `localStorage`.
4. **No forgot PIN flow** — Coach is IT support for every lost PIN. → Sprint 4 adds OTP-based recovery.
5. **Parent linking is one-way** — Parents can't self-link to their kid. → Sprint 4 invite flow handles this.

---

## PM Workflow

Claude Desktop = PM (plans, generates EXECUTION_PROMPT.md)
Jim = Engineer (executes sprints, reports back)
David = Client (uses the app, provides feedback)

See `docs/pm-workflow/PM_WORKFLOW.md` for the full session protocol.

---

*Initiative: Fairway Forward | PM: Claude Desktop | Date: 2026-03-23*
