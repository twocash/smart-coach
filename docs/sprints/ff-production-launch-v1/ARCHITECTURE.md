# ARCHITECTURE — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1

---

## 1. System Overview

```
Browser (David / coaches / players / parents)
        ↓  HTTPS
Vercel Edge
  ├── /public/**         → static HTML files (no auth)
  ├── /api/public/**     → public JSON routes (no auth)
  └── /api/**            → protected routes (X-FF-Token header)
        ↓  service role key (never in browser)
Supabase (Postgres)
        ↓
Twilio SMS  ←  PIN delivery only
```

---

## 2. Repository Structure (Target)

```
fairway-forward/
├── public/
│   ├── index.html                ← public feed (fan-facing, no auth)
│   ├── coach.html                ← coach tool (swing notes)
│   ├── season.html               ← season schedule + scores
│   ├── tryouts.html              ← prospect intake
│   └── js/
│       └── ff-api.js             ← auth helper (token in localStorage)
│
├── api/
│   ├── auth/
│   │   ├── verify-pin.js         ← POST: accept PIN → return session token
│   │   ├── logout.js             ← POST: invalidate session token
│   │   └── me.js                 ← GET: return current user from token
│   ├── pins/
│   │   ├── generate.js           ← POST: create PIN + send SMS (coach_head only)
│   │   ├── expire.js             ← POST: expire a PIN manually
│   │   └── unlock.js             ← POST: unlock a locked PIN
│   ├── roster/
│   │   ├── index.js              ← GET all / POST create player
│   │   └── [id]/
│   │       └── profile.js        ← GET / PATCH player profile
│   ├── rounds/
│   │   ├── index.js              ← GET all / POST new round
│   │   └── [player_id].js        ← GET all rounds for player
│   ├── events/
│   │   ├── index.js              ← GET all / POST create event
│   │   └── [id].js               ← PATCH event
│   ├── swing-notes/
│   │   ├── [player_id].js        ← GET notes for player
│   │   ├── index.js              ← POST save note
│   │   └── [id]/approve.js       ← PATCH mark approved + sent
│   ├── blog/
│   │   ├── index.js              ← GET all / POST create post
│   │   └── [id]/publish.js       ← PATCH publish (coach_head only)
│   └── public/
│       ├── feed.js               ← GET published posts + upcoming events (no auth)
│       ├── standings.js          ← GET public standings (opt-in players only)
│       └── schedule.js           ← GET season schedule
│
├── lib/
│   ├── supabase.js               ← single Supabase client (service role, server only)
│   ├── auth.js                   ← resolveSession() + withAuth() middleware
│   ├── scope.js                  ← applyScopeFilter() + can() helpers
│   └── twilio.js                 ← sendPin() SMS helper
│
├── docs/
│   └── sprints/
│       ├── ROADMAP.md
│       ├── CONTINUATION_PROMPT.md
│       └── ff-production-launch-v1/
│           └── [9 artifacts]
│
├── .env.example                  ← template only, never real keys
├── .gitignore                    ← node_modules, .env
├── package.json
└── vercel.json                   ← rewrites if needed (likely not required)
```

---

## 3. Auth Flow

```
Coach/Player                    Vercel API              Supabase
     |                               |                      |
     |  POST /api/pins/generate      |                      |
     |  (head coach only)            |                      |
     |------------------------------>|                      |
     |                               | INSERT pins          |
     |                               |--------------------->|
     |                               |                      |
     |                    Twilio SMS: "Your PIN: 847291"
     |<-- SMS ----------------------|                      |
     |                               |                      |
     |  POST /api/auth/verify-pin    |                      |
     |  { user_id, pin: "847291" }   |                      |
     |------------------------------>|                      |
     |                               | SELECT pin_hash      |
     |                               | bcrypt.compare()     |
     |                               |--------------------->|
     |                               | INSERT sessions      |
     |                               |--------------------->|
     |  { token: "uuid-..." }        |                      |
     |<------------------------------|                      |
     |                               |                      |
     |  GET /api/auth/me             |                      |
     |  X-FF-Token: uuid-...         |                      |
     |------------------------------>|                      |
     |                               | resolveSession(token)|
     |                               | → user + role        |
     |  { id, role, access_flags }   |--------------------->|
     |<------------------------------|                      |
```

---

## 4. Scope Enforcement Model

Every protected route calls `applyScopeFilter(query, user)` before executing.

| Role | Can See |
|------|---------|
| `coach_head` | Everything (squad_scope = 'all') |
| `coach_jv` | JV only |
| `player` | Own data only |
| `parent` | Linked player's data only |
| `fan` | Public routes only, no auth |

Access flags gate specific actions:
```js
can(user, 'can_enter_scores')        // Enter a round
can(user, 'can_generate_swing_notes') // Use coach tool
can(user, 'can_approve_blog_posts')   // Publish to feed
```

---

## 5. Session Token Lifecycle

- **Created:** On successful PIN verify
- **Storage:** Client stores in `localStorage` as `ff_token`
- **Sent:** Every API call includes `X-FF-Token: {token}` header
- **Resolved:** `resolveSession(token)` on every protected route
- **Expiry:** 30 days from creation (configurable in schema)
- **Invalidated:** `POST /api/auth/logout` sets `expires_at = now()`
- **Locked:** 10 failed PIN attempts sets `pins.status = 'locked'`

---

## 6. Environment Variables

| Variable | Used In | Notes |
|----------|---------|-------|
| `SUPABASE_URL` | `lib/supabase.js` | From Supabase dashboard |
| `SUPABASE_ANON_KEY` | `lib/supabase.js` | Public key (still server-side only here) |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase.js` | Never in browser, never in source |
| `TWILIO_ACCOUNT_SID` | `lib/twilio.js` | From Twilio console |
| `TWILIO_AUTH_TOKEN` | `lib/twilio.js` | From Twilio console |
| `TWILIO_PHONE_NUMBER` | `lib/twilio.js` | Purchased Twilio number (+1...) |
| `FF_SESSION_SECRET` | Future signing | `openssl rand -hex 32` |

---

## 7. David's CI/CD Architecture

```
David edits HTML (GitHub web UI or GitHub Desktop)
        ↓  commit + push to main
GitHub triggers Vercel webhook
        ↓  auto-build (~30s)
Live at production URL — no action required
        
David wants to preview before shipping:
        ↓  push to preview branch
Vercel creates preview URL automatically
        ↓  David approves in GitHub Desktop
Merge to main → auto-deploys
```

**David never touches:**
- Terminal / command line
- Supabase dashboard (player/score management is in the app)
- Vercel dashboard (after initial setup by Jim)
- `.env` files

---

*Sprint: ff-production-launch-v1 | Author: Jim | Date: 2026-03-22*
