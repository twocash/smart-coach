# ROADMAP — Fairway Forward
## Initiative: Platform Launch + Season Operations
## Updated: 2026-03-22

---

## Sprint Map

### Sprint 1 — Season 4 Static Deploy (TODAY)
**Sprint:** `ff-season4-deploy-v1`
**Status:** 🟡 In Progress — Ready for Epic 1
**Est. time:** ~2 hours
**Goal:** `fairway_forward_season-4.html` live at a Vercel URL. David on his phone, in the coach dashboard, today.
**Scope:** GitHub repo, Vercel static deploy, GitHub Desktop handoff, David's CI/CD workflow.
**Backend:** NONE NEEDED — app is self-contained (localStorage + direct Anthropic API calls).

---

### Sprint 2 — Backend Wiring
**Sprint:** `ff-backend-v1` (planned)
**Status:** ⏸️ Not Started
**Goal:** Replace localStorage with Supabase. Replace client PIN with Twilio SMS. Proxy Anthropic API through Vercel (key secured server-side).
**Scope:**
- Supabase project + schema deploy (`fairway_forward_schema.sql` is ready)
- PIN auth system (Twilio SMS, 6-digit, bcryptjs)
- `lib/` layer: `supabase.js`, `auth.js`, `scope.js`, `twilio.js`
- All API routes from `ff-production-launch-v1` SPRINTS.md
- `ff-api.js` added to frontend (token header helper)
- Full QA from build brief checklist
**Dependencies:** Sprint 1 complete. Twilio credentials confirmed.

---

### Sprint 3 — AI Swing Note Wiring
**Sprint:** `ff-ai-notes-v1` (planned)
**Status:** ⏸️ Not Started
**Goal:** Wire swing note generation through Vercel API proxy. Coach reviews, edits, approves, sends. Notes saved to Supabase.
**Dependencies:** Sprint 2 complete. Anthropic API key in Vercel env vars.

---

### Sprint 4 — Player + Parent Onboarding
**Sprint:** `ff-onboarding-v1` (planned)
**Status:** ⏸️ Not Started
**Goal:** Streamline getting all players and parents into the system. Player view. Parent view.
**Dependencies:** Sprint 2 complete.

---

### Sprint 5 — Public Feed + Blog
**Sprint:** `ff-public-feed-v1` (planned)
**Status:** ⏸️ Not Started
**Goal:** Fan-facing public page. AI post-match recaps. Public standings.
**Dependencies:** Sprints 2 + 3 complete.

---

## PM Workflow

Claude Desktop = PM (plans, generates EXECUTION_PROMPT.md)
Jim = Engineer (executes sprints, reports back)
David = Client (uses the app, provides feedback)

See `docs/pm-workflow/PM_WORKFLOW.md` for the full session protocol.

---

*Initiative: Fairway Forward | PM: Claude Desktop | Date: 2026-03-22*
