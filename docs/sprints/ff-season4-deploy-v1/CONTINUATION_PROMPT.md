# CONTINUATION PROMPT — Season 4 Deploy
## Sprint: ff-season4-deploy-v1

---

## Instant Orientation

**Sprint:** ff-season4-deploy-v1
**Status:** 🟡 In Progress
**Current Phase:** Ready for Epic 1
**Next Action:** Create GitHub repo → commit `fairway_forward_season-4.html` as `public/index.html`

---

## Context Reconstruction

### Read These First (in order)
1. `docs/sprints/ff-season4-deploy-v1/SPEC.md`
2. `docs/sprints/ff-season4-deploy-v1/DEVLOG.md`
3. `docs/sprints/ff-season4-deploy-v1/SPRINTS.md` (current epic)

### What We're Doing
Deploying `fairway_forward_season-4.html` as a static file on Vercel. The app is complete and self-contained — localStorage for data, 4-digit PIN auth, direct Anthropic API calls. No backend needed for Sprint 1.

### Key Decisions (do not re-litigate)
- Ship HTML as-is, zero modifications (ADR-S4-001)
- No backend for Sprint 1 (ADR-S4-002)
- Private GitHub repo (ADR-S4-003)
- Vercel output dir = `public` (ADR-S4-004)

### Confirmed Values
- Domain: Vercel subdomain (no custom domain needed)
- Head coach phone: 317-679-4056
- Canonical file: `fairway_forward_season-4.html` → goes in `public/index.html`

### What's Done
- [x] All sprint planning artifacts complete
- [x] Pre-flight confirmed

### What's Pending
- [ ] E1: GitHub repo + public/index.html
- [ ] E2: Vercel project connect
- [ ] E3: First deploy + desktop smoke test
- [ ] E4: Mobile QA (David's phone)
- [ ] E5: GitHub Desktop + David handoff
- [ ] E6: Full smoke test + close sprint

---

## Resume Instructions

1. Read SPEC.md (Attention Anchor)
2. Check DEVLOG.md for last entry
3. Pick up at the first unchecked epic in SPRINTS.md
4. Use EXECUTION_PROMPT.md as the working guide

---

## Attention Anchor

**We are building:** A live Vercel URL for `fairway_forward_season-4.html`
**Success looks like:** David opens the URL on his iPhone and reaches the coach dashboard
**We are NOT:** Editing the HTML, building a backend, or adding any code

---

*Sprint: ff-season4-deploy-v1 | PM: Claude Desktop | Date: 2026-03-22*
