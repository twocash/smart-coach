# DECISIONS — Season 4 Deploy
## Sprint: ff-season4-deploy-v1

---

## ADR-S4-001: Deploy As-Is, Zero HTML Modifications

**Status:** Accepted

**Context:** `fairway_forward_season-4.html` is 3,014 lines and complete. Any modification risks breaking working functionality and extends the timeline.

**Decision:** Ship the file exactly as received. No edits, no refactoring, no extraction.

**Consequences:**
- ✅ Live in 2 hours instead of a day
- ✅ Zero regression risk
- ⚠️ Direct Anthropic API calls from browser (acceptable for private coach tool)
- ⚠️ API key must be manually entered by coach

---

## ADR-S4-002: No Backend for Sprint 1

**Status:** Accepted

**Context:** The app uses `localStorage` for all data persistence and makes direct API calls to Anthropic. It requires zero server-side code to function. Building the backend now would delay David's access by 4+ hours.

**Decision:** Sprint 1 = static deploy only. Sprint 2 = backend wiring (Supabase, Twilio, API proxy).

**Consequences:**
- ✅ David has a working app today
- ✅ Clean separation: ship first, harden second
- ⚠️ Data is device-specific until Sprint 2
- ⚠️ No real server-side auth until Sprint 2

---

## ADR-S4-003: Private GitHub Repo

**Status:** Accepted

**Context:** The app contains coaching philosophy, player management logic, and will eventually contain player data. It should not be public.

**Decision:** Private GitHub repo. David is a collaborator. Jim has admin access.

---

## ADR-S4-004: Vercel Output Directory = `public`

**Status:** Accepted

**Context:** Vercel's default static serving requires specifying the output directory. `public/` is the conventional location.

**Decision:** Vercel project output directory set to `public`. Build command left empty (no build step for static HTML).

---

*Sprint: ff-season4-deploy-v1 | Author: Claude Desktop PM | Date: 2026-03-22*
