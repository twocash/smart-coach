# Migration Plan — smart-coach wiring sprint

## What changed (branch: `wiring-sprint`)

This branch takes the vibe-coded prototype and wires it into a functional app.

### Bug fixes
- **Frontend JS syntax error** — unescaped apostrophe in `isn't` (line 1079 of index.html) was breaking ALL JavaScript in the app. Nothing interactive worked.
- **players.js select query** — `'*, parents(')'` corrupted string → fixed to `'*, parents(*)'`
- **Carpool seat counting** — fragile nested count replaced with explicit two-query approach

### Routing overhaul
- Split sub-path handlers into their own files so `vercel dev` works locally:
  - `api/auth/setup.js`, `api/auth/me.js`
  - `api/players/parents.js`
  - `api/carpool/offer.js`, `api/carpool/claim.js`
- Original files trimmed to only handle their base route
- `vercel.json` updated with explicit routes for sub-paths

### Infrastructure
- `.gitignore` added (was missing — node_modules, .env, .vercel)
- `lib/config.js` — extracted hardcoded season `'2026'` to shared constant
- `scripts/seed.js` — idempotent seed script with anonymized test data
- `playwright.config.js` + `tests/` — 18 E2E tests covering all user flows
- `package.json` — added scripts (`dev`, `test`, `seed`) and Playwright devDep

### Database
- Schema created in Supabase (9 tables: users, players, parents, events, lineups, rsvps, parent_signups, carpool_offers, carpool_riders)
- Coach user seeded (PIN: 1234)
- 6 anonymized test players, 3 events, 2 parents

## How to merge

**This branch should replace main.** The original main had the same code but with:
- Broken JavaScript (the `isn't` bug meant nothing worked in the browser)
- No `.gitignore`
- No database schema
- No test infrastructure

### Steps for repo owner (dbonco):

1. **Add collaborator**: Settings → Collaborators → add `twocash`
2. **Or accept PR**: We can open a PR from `twocash/smart-coach:wiring-sprint` → `dbonco/smart-coach:main`
3. **After merge**, set env vars in Vercel (if not already done):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY` (optional, for swing notes)

## Local dev setup (after merge)

```bash
npm install
# Copy .env.example or set these in .env:
#   SUPABASE_URL=https://yusrwimbayrclpbxlpyw.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard>
#   JWT_SECRET=<any strong string>
npm run seed     # populate test data
npm run dev      # starts vercel dev on port 3000
npm test         # runs 18 Playwright E2E tests
```

## Test data (anonymized)

| ID | Player | Squad | Parent | Phone |
|----|--------|-------|--------|-------|
| 1 | Player Alpha | V | Parent Alpha | 317-555-0101 |
| 2 | Player Bravo | V | Parent Bravo | 317-555-0102 |
| 3 | Player Charlie | V | — | — |
| 4 | Player Delta | V | — | — |
| 5 | Player Echo | JV | — | — |
| 6 | Player Foxtrot | JV | — | — |

**Coach PIN: 1234**
