# SPRINTS — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1
## Target: Same-day production launch

---

## Epic Map

| Epic | Name | Est. Time | Gate |
|------|------|-----------|------|
| E0 | Pre-flight | 15 min | All 4 open questions answered |
| E1 | Repo Scaffold | 20 min | Repo exists, packages install, HTML in `public/` |
| E2 | Supabase | 30 min | Schema deployed, seed verified, keys in hand |
| E3 | Lib Layer | 30 min | `resolveSession()` works against real Supabase |
| E4 | Auth Routes | 45 min | Full PIN→token→me flow works end-to-end |
| E5 | Data Routes | 60 min | Roster, rounds, events, swing notes, blog wired |
| E6 | Public Routes | 20 min | `/api/public/feed` returns 200, no auth |
| E7 | Vercel Deploy | 30 min | Live URL, smoke tests pass |
| E8 | CI/CD Handoff | 20 min | David edits file, pushes, sees it live |
| E9 | QA | 30 min | All 11 checklist items pass |

**Total estimated time: ~5.5 hours**

---

## Epic 0 — Pre-flight

### Attention Checkpoint
Before starting, verify:
- [ ] SPEC.md Live Status = Phase 0 — Pre-flight
- [ ] Goal alignment confirmed (re-read Attention Anchor)

### Story 0.1: Resolve Open Questions
**Task:** Get answers from David (or whoever has them) for all 4 blocking questions.

- [ ] Domain confirmed (even if it's `*.vercel.app` for now)
- [ ] Twilio: new account created OR existing SID/token in hand
- [ ] Head coach real phone number
- [ ] JV coach real phone number (or skip for now)
- [ ] HTML file audit: confirm `v3.html` or whichever is canonical

### Story 0.2: Update Spec with Decisions
- [ ] Update SPEC.md Live Status to Phase 1
- [ ] Record confirmed domain in ARCHITECTURE.md

### Build Gate
Pre-flight is complete when there are zero open blocking questions.

---

## Epic 1 — Repo Scaffold

### Attention Checkpoint
Before starting:
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Pre-flight checklist complete

### Story 1.1: Create GitHub Repo
**Task:** Create repo, add Jim as collaborator, add David as collaborator.
- [ ] Repo created (David owns it — his GitHub account)
- [ ] Jim has push access
- [ ] `main` branch is default
- [ ] `preview` branch created

### Story 1.2: Project Files
**Task:** Scaffold the bare minimum to install dependencies and deploy.

Create these files:
- [ ] `package.json` with `name`, `version`, `dependencies`: `@supabase/supabase-js`, `bcryptjs`, `twilio`
- [ ] `.gitignore`: `node_modules/`, `.env`, `.env.local`, `.vercel/`
- [ ] `.env.example`: All 7 required vars, values as `REPLACE_ME`
- [ ] `vercel.json`: `{}` (empty for now; add rewrites later if needed)

### Story 1.3: Move HTML Files to `public/`
**Task:** Copy all HTML files into `public/` with clean functional names.
- [ ] `public/index.html` (public feed — fan facing)
- [ ] `public/coach.html` (coach tool)
- [ ] `public/season.html` (season schedule)
- [ ] `public/tryouts.html` (prospect intake)
- [ ] Audit: remove or archive any superseded versions

### Story 1.4: Create `ff-api.js`
**Task:** Write the auth helper that David's HTML files import. This is the ONLY new JS the frontend needs.

```js
// public/js/ff-api.js
const FF_TOKEN_KEY = 'ff_token';

export function getToken() {
  return localStorage.getItem(FF_TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(FF_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(FF_TOKEN_KEY);
}

export async function ffFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'X-FF-Token': token } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    window.location.href = '/login.html';
    return;
  }
  return res;
}
```

- [ ] `public/js/ff-api.js` created
- [ ] All HTML files updated to import `ff-api.js` (add `<script type="module" src="/js/ff-api.js">`)

### Build Gate
```bash
npm install  # should complete with no errors
ls public/   # should show index.html, coach.html, season.html, tryouts.html, js/ff-api.js
```

---

## Epic 2 — Supabase

### Attention Checkpoint
Before starting:
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Epic 1 build gate passed

### Story 2.1: Create Supabase Project
- [ ] Project name: `fairway-forward`
- [ ] Region: us-east-1
- [ ] Save `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to secure notepad

### Story 2.2: Deploy Schema
- [ ] Open SQL Editor in Supabase dashboard
- [ ] Paste `fairway_forward_schema.sql` in full
- [ ] Execute
- [ ] Verify: 12 tables listed in Table Editor

### Story 2.3: Verify Seed Data
```sql
SELECT COUNT(*) FROM lesson_focuses;  -- expect 10
SELECT code, title FROM lesson_focuses ORDER BY sort_order;
SELECT role, first_name, phone FROM users;  -- expect 2 rows
```
- [ ] 10 lesson focus rows confirmed
- [ ] 2 coach rows confirmed

### Story 2.4: Update Coach Phone Numbers
```sql
UPDATE users SET phone = '+1XXXXXXXXXX' WHERE role = 'coach_head';
UPDATE users SET phone = '+1XXXXXXXXXX' WHERE role = 'coach_jv';
```
- [ ] Head coach phone updated to real number
- [ ] JV coach phone updated (or marked TBD)

### Build Gate
All 4 story checkboxes above complete. Keys saved.

---

## Epic 3 — Lib Layer

### Attention Checkpoint
Before starting:
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Supabase keys in hand
- [ ] Epic 2 build gate passed

### Story 3.1: `lib/supabase.js`
- [ ] Creates `createClient` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Exports single `supabase` instance
- [ ] Does NOT use `SUPABASE_ANON_KEY` (service role only, server-side)

### Story 3.2: `lib/auth.js`
- [ ] `resolveSession(token)` — queries `sessions` table, validates expiry, fetches user, touches `last_seen_at`
- [ ] `withAuth(handler)` — wrapper that extracts `X-FF-Token`, calls `resolveSession`, attaches user to context, returns 401 if missing/invalid
- [ ] Returns `null` (not throws) for invalid/expired sessions

### Story 3.3: `lib/scope.js`
- [ ] `applyScopeFilter(query, user)` — returns query with appropriate `.eq('squad', ...)` or identity filter based on role
- [ ] `can(user, flag)` — returns `user.access_flags[flag] === true`

### Story 3.4: `lib/twilio.js`
- [ ] `sendPin(phone, pin)` — sends SMS using Twilio client
- [ ] Message format: `"Your Fairway Forward access PIN is: {PIN}. Bishop Chatard Boys Golf."`
- [ ] Returns `{ success: true }` or `{ success: false, error }`

### Build Gate
No live test yet (needs Vercel to run). Code review: does `resolveSession` correctly return null for expired sessions? Does `withAuth` correctly return 401 when resolveSession returns null?

---

## Epic 4 — Auth Routes

### Attention Checkpoint
Before starting:
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Lib layer complete (Epic 3)
- [ ] **This is the keystone epic. Everything else depends on this working.**

### Story 4.1: `POST /api/auth/verify-pin`
**This is the most important route in the system.**

Logic:
1. Accept `{ user_id, pin }` in body
2. Fetch active PIN record for `user_id`
3. `bcrypt.compare(pin, pin_hash)`
4. On failure: increment `failed_attempts`; if ≥ 10, set `status = 'locked'`; return 401
5. On success: set `pins.status = 'active'`, set `claimed_at`
6. `INSERT sessions` with `crypto.randomUUID()` token, 30-day expiry
7. Return `{ token }`

- [ ] Route created
- [ ] Handles missing user_id (400)
- [ ] Handles no active PIN for user (401)
- [ ] Handles wrong PIN (401 + increment attempts)
- [ ] Handles locked PIN (423 Locked)
- [ ] Returns token on success (200)

### Story 4.2: `POST /api/auth/logout`
- [ ] Accepts `X-FF-Token` header
- [ ] Sets `sessions.expires_at = now()` for that token
- [ ] Returns 200

### Story 4.3: `GET /api/auth/me`
- [ ] Uses `withAuth` wrapper
- [ ] Returns `{ id, role, squad_scope, access_flags, first_name, last_name }`
- [ ] Returns 401 with no/invalid token

### Story 4.4: PIN Management Routes
- [ ] `POST /api/pins/generate` — generates random 6-digit PIN, hashes, inserts, calls `sendPin()`. `coach_head` only.
- [ ] `POST /api/pins/expire` — sets `status = 'expired'`. `coach_head` only.
- [ ] `POST /api/pins/unlock` — sets `status = 'active'`, resets `failed_attempts = 0`. `coach_head` only.

### Build Gate (after Epic 7 deploy — run these then)
```bash
# No token → 401
curl -s https://your-domain.vercel.app/api/auth/me | jq .
# → {"error":"No session token"}

# Wrong PIN → 401
curl -s -X POST https://your-domain.vercel.app/api/auth/verify-pin \
  -H "Content-Type: application/json" \
  -d '{"user_id":"COACH_UUID","pin":"000000"}' | jq .
# → {"error":"Invalid PIN"}
```

---

## Epic 5 — Data Routes

### Attention Checkpoint
Before starting:
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Auth routes deployed and passing smoke tests (Epic 4 gate)

### Story 5.1: Roster Routes
- [ ] `GET /api/roster` — `withAuth`, `applyScopeFilter`, return players with profile
- [ ] `POST /api/roster` — `coach_head` only, creates user + player_profile
- [ ] `GET /api/roster/:id/profile` — `withAuth`, scoped
- [ ] `PATCH /api/roster/:id/profile` — coaches only, scoped

### Story 5.2: Rounds Routes
- [ ] `GET /api/rounds` — `withAuth`, `applyScopeFilter`
- [ ] `POST /api/rounds` — coaches only, `can(user, 'can_enter_scores')` check; schema trigger handles weight
- [ ] `GET /api/rounds/:player_id` — `withAuth`, scoped

### Story 5.3: Events Routes
- [ ] `GET /api/events` — `withAuth`, `applyScopeFilter`
- [ ] `POST /api/events` — `can(user, 'can_manage_events')` check
- [ ] `PATCH /api/events/:id` — same permission check

### Story 5.4: Swing Notes Routes
- [ ] `GET /api/swing-notes/:player_id` — `withAuth`, scoped
- [ ] `POST /api/swing-notes` — `can(user, 'can_generate_swing_notes')`
- [ ] `PATCH /api/swing-notes/:id/approve` — coaches only; sets `approved = true`, `sent_at = now()`

### Story 5.5: Blog Routes
- [ ] `GET /api/blog` — coaches see all; others see published only
- [ ] `POST /api/blog` — coaches only; creates with `status = 'draft'`
- [ ] `PATCH /api/blog/:id/publish` — `can(user, 'can_approve_blog_posts')` = `coach_head` only

### Build Gate
Manual test after deploy: Create a round via API. SELECT from `rounds` table in Supabase — confirm `weight` and `weighted_score` are set by trigger.

---

## Epic 6 — Public Routes

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Epic 5 complete

### Story 6.1: `GET /api/public/feed`
- [ ] No auth required
- [ ] Returns `{ posts: [...], events: [...] }`
- [ ] `posts`: status = 'published', ordered by `published_at DESC`
- [ ] `events`: future dates, ordered by `date ASC`

### Story 6.2: `GET /api/public/standings`
- [ ] No auth required
- [ ] Returns players where `public_profile_opt_in = true`
- [ ] Includes `weighted_avg`, `tournament_avg` only — no sensitivity data

### Story 6.3: `GET /api/public/schedule`
- [ ] No auth required
- [ ] Returns all events ordered by date

### Build Gate
```bash
curl https://your-domain.vercel.app/api/public/feed
# → 200, {"posts":[],"events":[]}
```

---

## Epic 7 — Vercel Deploy

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] All code committed and pushed to main
- [ ] Epic 6 complete

### Story 7.1: Create Vercel Project
- [ ] Import GitHub repo in Vercel dashboard
- [ ] Framework: Other (not Next.js)
- [ ] Root directory: `/` (default)
- [ ] Build command: none (or `npm install`)
- [ ] Output directory: `public`

### Story 7.2: Set Environment Variables
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`
- [ ] `FF_SESSION_SECRET`

### Story 7.3: Initial Deploy + Smoke Tests
- [ ] Deploy triggered (push to main or manual in dashboard)
- [ ] `GET /api/public/feed` → 200
- [ ] `GET /api/auth/me` (no token) → 401
- [ ] No 500 errors in Vercel function logs

### Story 7.4: Custom Domain (if confirmed)
- [ ] Add domain in Vercel dashboard
- [ ] Update DNS (CNAME to `cname.vercel-dns.com`)
- [ ] Wait for SSL cert (~2 min)

### Build Gate
Live URL returns correct responses on all 3 smoke tests.

---

## Epic 8 — David's CI/CD Handoff

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Production URL is live (Epic 7 complete)

### Story 8.1: GitHub Desktop Setup for David
- [ ] Install GitHub Desktop on David's machine
- [ ] Clone the repo
- [ ] Walk David through: open file in editor → save → commit → push → watch Vercel deploy

### Story 8.2: Preview Branch Workflow
- [ ] Show David: switch to `preview` branch → make change → push → preview URL appears in Vercel
- [ ] Show David: merge preview to main via GitHub Desktop → production updates

### Story 8.3: `DAVID_GUIDE.md`
- [ ] Plain-English guide in repo root
- [ ] Covers: editing HTML files, committing, pushing, checking deploy status
- [ ] Screenshots or GIFs of GitHub Desktop UI
- [ ] "What to do if something breaks" section

### Build Gate
David successfully edits `public/index.html` (add a comment), commits, pushes, and sees the deploy complete in Vercel dashboard without Jim's help.

---

## Epic 9 — QA

### Attention Checkpoint
- [ ] Re-read SPEC.md Acceptance Criteria (all of them)
- [ ] All previous epics complete

Run every item in the QA checklist from the build brief.

### Story 9.1: Auth QA
- [ ] Generate PIN for head coach → receives SMS → enters PIN → gets token ✅
- [ ] Wrong PIN → 401, `failed_attempts` increments ✅
- [ ] 10 wrong PINs → `status = 'locked'` ✅
- [ ] Token → `GET /api/auth/me` → correct role + flags ✅
- [ ] Logout → token invalid ✅

### Story 9.2: Access Control QA
- [ ] JV coach token cannot GET Varsity player profile ✅
- [ ] JV coach CAN enter scores for JV players ✅
- [ ] Player token: own data only ✅
- [ ] `/api/public/feed` → 200, no token ✅

### Story 9.3: Data QA
- [ ] Tournament round → weight=3, weighted_score correct ✅
- [ ] opt-in player → appears in `/api/public/standings` ✅
- [ ] opt-out player → NOT in standings ✅

### Story 9.4: Blog QA
- [ ] AI post created → status = 'draft' ✅
- [ ] Head coach publishes → status = 'published' → appears in `/api/public/feed` ✅
- [ ] JV coach cannot publish → 403 ✅

### Build Gate
All acceptance criteria in SPEC.md checked. Sprint complete.

---

## Live Status Update After Each Epic

After completing each epic, update SPEC.md Live Status:
```
Current Phase: Epic N complete — moving to Epic N+1
Last Updated: {ISO timestamp}
Next Action: {specific first task of next epic}
```

---

*Sprint: ff-production-launch-v1 | Author: Jim | Date: 2026-03-22*
