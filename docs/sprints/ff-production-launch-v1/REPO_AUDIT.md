# REPO AUDIT — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1
## Date: 2026-03-22
## Author: Jim (Backend Lead)

---

## 1. What Exists Today

### Frontend — Static HTML Files (complete, in-hand)
| File | Purpose | Status |
|------|---------|--------|
| `fairway_forward_coach_tool.html` | Swing note generation UI for coaches | ✅ Built |
| `fairway_forward_season.html` | Season schedule, scores, events | ✅ Built |
| `fairway_forward_tryouts.html` | Prospect intake / tryout management | ✅ Built |
| `fairway_forward_v2.html` | Previous version (likely superseded) | ⚠️ Audit before deploy |
| `fairway_forward_v3.html` | Latest iteration | ✅ Built |

**Assessment:** HTML files are production-ready in structure. They currently call no live API — all data is static or mocked. Need one thin auth helper (`ff-api.js`) added before wiring to backend.

### Schema — Complete and Deployment-Ready
| File | Status |
|------|--------|
| `fairway_forward_schema.sql` | ✅ Complete — 12 tables, enums, triggers, indexes, RLS enabled, seed data |

**Seed data confirmed:**
- `lesson_focuses`: 10 rows (L01–L10) with cues, comp players, descriptions
- `users`: 2 rows (coach_head, coach_jv) with placeholder phone numbers

**Trigger coverage:**
- `trg_round_weight` — auto-sets weight (1/2/3) and weighted_score on insert/update
- `trg_*_updated_at` — auto-timestamps on users, player_profiles, blog_posts
- RLS enabled on all 12 tables; policies deferred to API layer (service role key pattern)

### Backend — Not Yet Wired
- No `lib/` directory exists
- No `api/` routes exist
- No Vercel project exists
- No Supabase project exists
- No Twilio account confirmed

### Infra — Not Yet Provisioned
| Service | Status |
|---------|--------|
| Supabase project | ❌ Not created |
| Vercel project | ❌ Not created |
| GitHub repo | ❌ Not created (David does not have this yet) |
| Twilio account | ❌ Status unknown — confirm with David |
| Domain | ❌ Not confirmed |

---

## 2. Technical Debt / Risks Identified

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Coach phone numbers are placeholders in schema seed | 🔴 High | Update before first PIN send — documented in MIGRATION_MAP |
| `fairway_forward_v2.html` vs `v3.html` — unclear which is canonical | 🟡 Medium | Audit filenames, rename to functional names before deploy |
| No `package.json` exists yet | 🟡 Medium | Scaffold in Epic 1 |
| Twilio account status unknown | 🟡 Medium | Confirm in pre-flight checklist |
| RLS policies not yet defined | 🟢 Low | Service role key enforces scope at API layer; acceptable for v1 |
| No test suite exists | 🟢 Low | Manual QA checklist covers launch; add automated tests post-launch |

---

## 3. Patterns Available to Extend

Since this is a greenfield backend, no existing patterns exist to conflict with.
The build brief defines the patterns. We are creating the canonical implementations.

| Capability | Canonical Home | Status |
|------------|---------------|--------|
| Session resolution | `lib/auth.js` → `resolveSession()` | CREATE |
| Scope filtering | `lib/scope.js` → `applyScopeFilter()` | CREATE |
| Supabase client | `lib/supabase.js` (single instance, service role) | CREATE |
| Auth middleware | Inline in each route using `withAuth()` wrapper | CREATE |
| Frontend API calls | `public/js/ff-api.js` (token header helper) | CREATE |

---

## 4. Open Questions (Block Launch Until Resolved)

- [ ] **Domain**: `fairwayforward.com`, `chatardgolf.com`, or `*.vercel.app` for now?
- [ ] **Twilio**: New account or existing?
- [ ] **Coach phones**: What are David's real phone numbers?
- [ ] **HTML canonical file**: Is `v3.html` the final version, or does David need to review?

---

*Audit completed: 2026-03-22 | Authored by: Jim | Sprint: ff-production-launch-v1*
