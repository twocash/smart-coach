# Fairway Forward — Smart Coach
**High School Boys Golf · Coaching Platform**
*Designed by David Boncosky · Built by Jim Calhoun*

---

## What This Is

D1 coaching on a D3 budget.

Fairway Forward gives a high school golf coach the same tools that Division 1 programs use to develop players — individual performance tracking, a sloped rating system calibrated for developing golfers, structured event management, and direct parent communication — without the staff, the budget, or the infrastructure that college programs take for granted.

The platform is built around Coach Boncosky's philosophy: every player deserves a coaching experience that tracks and encourages growth both on the course and in character throughout the season. The system uses a weighted tryout average and sloped rating model adapted from collegiate-level player evaluation, applied at the high school level where it can shape habits early.

Equally important is the parent layer. Stronger communication between the coaching staff and families builds stronger bonds with the school and the program. Parents aren't just spectators — they're coordinating carpool, confirming attendance, and staying connected to their son's development in real time.

Three dashboards, one app:
- **Coach** — roster management, lineup builder, copy-ready SMS texts, carpool board, sloped player ratings
- **Player** — status, RSVP, parent contact linking, carpool claims
- **Parent** — event signup, attendance confirmation, "bringing" offers, carpool coordination

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Static HTML + vanilla JS | Single-file SPA (`public/index.html`), no framework |
| Backend | Vercel serverless functions | Node.js API routes, ES modules |
| Database | Supabase Postgres | Managed, server-side access via service role key |
| Auth | Custom PIN + JWT | PBKDF2-SHA512 hashing, 30-day token expiry |
| SMS | Twilio (demo tier) | Magic link onboarding for players and parents |
| AI | Anthropic Claude | Swing note generation (coach-only, future) |
| Tests | Playwright | E2E test suite |

## Security — What's In Place

This is a working prototype in active use. Security has been built in from the start, not bolted on after:

| Feature | Implementation | Status |
|---------|---------------|--------|
| PIN hashing | PBKDF2-SHA512 with per-user random salt (100K iterations) | **Live** |
| Session tokens | HS256 JWT with 30-day expiry, localStorage persistence | **Live** |
| Role-based access | Server-side guards on every mutation endpoint (coach/player/parent) | **Live** |
| Player-scoped writes | Players can only RSVP for themselves, only add parents to own profile | **Live** |
| Coach-only mutations | Event creation, lineup changes, roster edits require coach token | **Live** |
| Input sanitization | Phone numbers stripped to digits, validated length before DB write | **Live** |
| No PII in source | Seed data is anonymized, real data lives only in production Supabase | **Live** |
| Row-Level Security | Supabase RLS policies | **Planned** |
| HTTPS everywhere | Vercel enforces TLS on all endpoints | **Live** |

## Demo vs. Production

This app is currently deployed as a **functional demo** to validate the coaching workflow with real users before investing in production infrastructure.

### What "demo" means here

| Concern | Demo (current) | Production (planned) |
|---------|---------------|---------------------|
| **SMS delivery** | Free-tier Twilio trial — works but has carrier limits and "Sent from Twilio" branding | Twilio turnkey API (paid tier) — branded sender, delivery receipts, compliance |
| **Database access** | Service role key (bypasses RLS) — acceptable because all endpoints enforce role checks server-side | Row-Level Security (RLS) policies — defense-in-depth at the database layer |
| **Auth flow** | Custom JWT + PIN — simple, works, no third-party dependency | Same flow, hardened with rate limiting and token rotation |
| **Monitoring** | Console logs + Vercel function logs | Structured logging, error alerting |

### The migration plan

The path from demo to production is deliberate, not a rewrite:

1. **Twilio upgrade** — Swap the free trial API for Twilio's turnkey messaging API. Same endpoints, same flow — just a credential and sender config change. Gives us branded SMS, delivery tracking, and opt-out compliance.

2. **Row-Level Security** — Add Supabase RLS policies so the database itself enforces access rules. Today, every API route already checks `session.role` before allowing writes — RLS adds a second lock on the same door. Even if an endpoint had a bug, the database would reject unauthorized rows.

3. **Rate limiting** — Add per-IP and per-token rate limits on auth endpoints to prevent PIN brute-forcing.

The server-side role checks, PIN hashing, and scoped writes don't change — they're already production-grade. The demo tier is about *infrastructure* limits, not *security* shortcuts.

## Project Structure

```
smart-coach/
├── api/                    # Vercel serverless routes
│   ├── auth.js             #   PIN verify → JWT
│   ├── auth/setup.js       #   First-time PIN creation
│   ├── auth/me.js          #   Token validation
│   ├── players.js          #   Roster queries + updates
│   ├── players/parents.js  #   Parent contact management
│   ├── events.js           #   Event CRUD
│   ├── lineups.js          #   Lineup toggle
│   ├── rsvps.js            #   Player RSVP
│   ├── signups.js          #   Parent attendance signup
│   ├── carpool.js          #   Carpool board (GET)
│   ├── carpool/offer.js    #   Add ride offer
│   ├── carpool/claim.js    #   Claim a seat
│   └── swing-note.js       #   AI swing notes (future)
├── lib/
│   ├── db.js               # Supabase client init
│   ├── jwt.js              # JWT sign/verify (HS256)
│   └── config.js           # Season config
├── public/
│   └── index.html          # Single-file SPA (all three dashboards)
├── scripts/
│   └── seed.js             # Anonymized test data
├── tests/                  # Playwright E2E suite
├── docs/                   # Sprint specs + roadmap
├── vercel.json             # Routing + build config
└── package.json            # Dependencies (just Supabase client)
```

## Running Locally

```bash
npm install
vercel link          # Connect to Vercel project
vercel env pull      # Pull environment variables
npm run seed         # Seed test data (anonymized)
npm run dev          # http://localhost:3000
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access (never exposed to client) |
| `JWT_SECRET` | Token signing secret |
| `ANTHROPIC_API_KEY` | Claude API key (swing notes) |
| `FF_SEASON` | Current season identifier |

## API Endpoints

All endpoints require `Authorization: Bearer <token>` except initial auth.

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| POST | `/api/auth` | Public | Verify PIN, get JWT |
| POST | `/api/auth/setup` | Token | First-time PIN creation |
| GET | `/api/auth/me` | Token | Validate session |
| GET | `/api/players` | Token | Full roster with parents |
| PATCH | `/api/players?id=` | Coach | Update squad/average |
| POST | `/api/players/parents` | Coach, Player | Add parent contact |
| DELETE | `/api/players/parents?id=` | Coach, Player | Remove parent |
| GET | `/api/events` | Token | List events |
| POST | `/api/events` | Coach | Create event |
| DELETE | `/api/events?id=` | Coach | Delete event |
| GET | `/api/lineups?event_id=` | Token | Get lineup |
| POST | `/api/lineups` | Coach | Add/remove from lineup |
| GET | `/api/rsvps?event_id=` | Token | Get RSVPs |
| POST | `/api/rsvps` | Player | RSVP for event |
| GET | `/api/signups?event_id=` | Token | Get parent signups |
| POST | `/api/signups` | Parent | Attendance + bring |
| GET | `/api/carpool?event_id=` | Token | Carpool board |
| POST | `/api/carpool/offer` | Coach | Add ride offer |
| POST | `/api/carpool/claim` | Token | Claim seat |

---

*"The game of golf will teach you more about character development than lowering your scores."*
