# REPO AUDIT — Season 4 Deploy
## Sprint: ff-season4-deploy-v1
## Date: 2026-03-22
## Author: Jim (Backend Lead)

---

## What We're Deploying

`fairway_forward_season-4.html` is a complete, production-quality single-file web app. It is **3,014 lines** of HTML, CSS, and JavaScript. It is the canonical frontend.

---

## Architecture Discovered in Audit

### It is fully self-contained — no backend required for v1 deploy

| Layer | How It Works |
|-------|-------------|
| Data persistence | `localStorage` only — 4 keys (`ff_season_2026_v2`, `ff_coach_pin_season`, `ff_asst_pin_season`, `ff_program_setup`) |
| Auth | Client-side PIN (4-digit, stored in localStorage) |
| AI calls | Direct browser → Anthropic API (`https://api.anthropic.com/v1/messages`) |
| No server needed | Zero API routes required for v1 |

**Implication: this app can go live on Vercel as a static file TODAY. No backend. No Supabase. No Twilio. Those are Sprint 2 work.**

---

## Screens Identified

| Screen ID | Role | Notes |
|-----------|------|-------|
| `screen-welcome` | Landing — role selection | Coach / Player / Parent / Fan |
| `screen-setup` | First-run coach setup | Program name, school, coach name |
| `screen-pin` | PIN entry | 4-digit keypad |
| `screen-player-picker` | Player login selector | Shows roster names |
| `screen-parent-entry` | Parent name entry | Links to player |
| `screen-coach` | Full coach dashboard | 8 tabs (roster, events, lineup, carpool, tryouts, swing notes, videos, scores) |
| `screen-player` | Player view | Own scores, upcoming events, swing notes |
| `screen-parent` | Parent view | Linked player data, events, carpool |

---

## Coach Dashboard Tabs

| Tab ID | Feature | Data Source |
|--------|---------|------------|
| `cp-roster` | 2026 Roster (Varsity/JV) | localStorage `roster` array |
| `cp-events` | Events management | localStorage `events` array |
| `cp-lineup` | Lineup + broadcast | localStorage `lineups` |
| `cp-carpool` | Carpool board | localStorage `carpool` |
| `cp-tryout` | Tryouts 2026 | localStorage `tryoutRoster` |
| `cp-notes` | Swing note generator | Calls Anthropic API |
| `cp-videos` | Teaching library | localStorage `ff_videos_2026` |
| `cp-scores` | Season scores | localStorage rounds data |

---

## Critical Finding: Direct Anthropic API Calls

The app makes 2 direct fetch calls to `https://api.anthropic.com/v1/messages`:

1. **Swing note generation** (line ~1550) — uses `claude-sonnet-4-20250514`, `max_tokens: 650`
2. **A second AI call** (line ~2764) — needs closer inspection

**These require an Anthropic API key.** Currently the key must be pasted into the app by the user. This is acceptable for a private coach tool but needs to be documented.

---

## Pre-flight Answers (CONFIRMED)

| Question | Answer |
|----------|--------|
| Domain | Vercel subdomain (`*.vercel.app`) — confirmed ✅ |
| Twilio | Account ready — credentials needed next session ✅ |
| Head coach phone | 317-679-4056 ✅ |
| Canonical HTML file | `fairway_forward_season-4.html` ✅ |

---

## Risks

| Risk | Severity | Notes |
|------|----------|-------|
| API key exposed in browser | 🟡 Medium | Coach-only tool, private URL — acceptable for v1 |
| localStorage data not portable across devices | 🟡 Medium | Coach pins a device; Supabase migration is Sprint 2 |
| Direct Anthropic API calls bypass proxy | 🟢 Low | Works fine; Sprint 2 routes through Vercel for key security |

---

## What Sprint 1 Does NOT Change

- No refactoring of the HTML
- No conversion to components
- No backend wiring (that's Sprint 2)
- No localStorage → Supabase migration (Sprint 2)
- The app ships exactly as-is, just deployed

---

*Sprint: ff-season4-deploy-v1 | Author: Jim | Date: 2026-03-22*
