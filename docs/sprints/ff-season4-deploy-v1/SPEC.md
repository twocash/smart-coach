# SPEC — Season 4 Deploy
## Sprint: ff-season4-deploy-v1
## Tier: Sprint (same-day)

---

## Live Status

| Field | Value |
|-------|-------|
| **Current Phase** | Phase 0 — Pre-flight complete, ready for Epic 1 |
| **Status** | 🟡 In Progress |
| **Blocking Issues** | None — all pre-flight questions answered |
| **Last Updated** | 2026-03-22T00:00:00Z |
| **Next Action** | Epic 1 — Create GitHub repo, push season-4 HTML to `public/` |
| **Attention Anchor** | Re-read before every epic transition |

---

## Attention Anchor

- **We are building:** A live Vercel deployment of `fairway_forward_season-4.html` so David can use the app from any device today.
- **Success looks like:** David opens a URL on his phone, completes first-run setup, pins a coach PIN, and is in the coach dashboard — from the production URL.
- **We are NOT:** Refactoring the HTML. Adding a backend. Migrating to Supabase. Changing any functionality.
- **Current phase:** Pre-flight complete — Epic 1 next.
- **Next action:** Create GitHub repo, add `fairway_forward_season-4.html` as `public/index.html`.

---

## Goal

`fairway_forward_season-4.html` is complete and working. The only thing between David and a live coaching tool is a Vercel deploy. This sprint makes that happen in under 2 hours.

The app is self-contained: localStorage for data, 4-digit PIN for auth, direct Anthropic API calls for AI. No backend required for v1.

---

## Non-Goals

- No backend wiring (Sprint 2)
- No Supabase (Sprint 2)
- No Twilio (Sprint 2 — PIN is client-side for now)
- No HTML refactoring
- No automated tests
- No custom domain (Vercel subdomain is correct for now)

---

## Confirmed Pre-flight Values

| Item | Value |
|------|-------|
| Domain | `*.vercel.app` subdomain |
| Head coach phone | 317-679-4056 |
| Canonical file | `fairway_forward_season-4.html` |
| Twilio | Ready (credentials in next session) |

---

## Acceptance Criteria

- [ ] `fairway_forward_season-4.html` is live at a Vercel URL
- [ ] App loads on mobile (iPhone + Android)
- [ ] First-run setup completes (coach name, school, PIN)
- [ ] Coach dashboard is accessible after PIN entry
- [ ] Swing note AI feature works (Anthropic API key entered by coach)
- [ ] All 8 coach tabs render correctly
- [ ] David successfully logs in on his device
- [ ] GitHub repo exists, David is a collaborator
- [ ] Push to `main` = auto-deploy (David's CI/CD)
- [ ] `preview` branch exists with Vercel preview URL

---

## Patterns Extended

This is a static file deploy. No patterns to audit — there is no existing codebase.

| Requirement | Pattern | Approach |
|-------------|---------|----------|
| Static HTML deploy | None (new) | `public/index.html` → Vercel static serving |
| CI/CD for non-technical user | None (new) | GitHub Desktop → push to main → auto-deploy |

---

*Sprint: ff-season4-deploy-v1 | Author: Jim | Date: 2026-03-22*
