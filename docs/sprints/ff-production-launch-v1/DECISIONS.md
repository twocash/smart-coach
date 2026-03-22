# DECISIONS — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1

---

## ADR-001: Keep HTML as Static Files (No Next.js Conversion)

**Status:** Accepted

**Context:** The frontend exists as complete static HTML files. Converting to Next.js would add framework overhead, require David to understand React, and extend the build timeline by days.

**Decision:** Serve HTML files from Vercel's `public/` directory. Use Vercel serverless functions in `api/` for backend. Auth token stored in `localStorage`, passed as `X-FF-Token` header on every `fetch`.

**Consequences:**
- ✅ Launch today instead of next week
- ✅ David can edit HTML directly; no build step for content changes
- ✅ Zero framework lock-in on the frontend
- ⚠️ No SSR; coach tool loads with a spinner until token resolves
- ⚠️ If frontend complexity grows significantly, Next.js migration becomes Sprint 2 work

**Alternatives Rejected:**
- Next.js: Too much overhead for today's goal
- SvelteKit: Even more rewrite work

---

## ADR-002: Custom PIN Auth (No Supabase Auth)

**Status:** Accepted

**Context:** The user base is small (~30 people max), controlled, and has no self-serve signup. Supabase Auth adds complexity (magic links, OAuth, email confirmation) that doesn't fit the model. Coaches manage access; users don't self-register.

**Decision:** Custom 6-digit PIN system. PIN hashed with bcrypt (12 rounds). PIN delivered via Twilio SMS. Session token is a UUID stored in `sessions` table and `localStorage`.

**Consequences:**
- ✅ Coach controls all access (matches "D1 program" philosophy)
- ✅ No email required for players/parents
- ✅ Simple to understand and debug
- ⚠️ No "forgot password" self-service; coach must regenerate PIN
- ⚠️ PIN delivery depends on Twilio uptime

**Alternatives Rejected:**
- Supabase Auth: Overkill, doesn't fit the controlled-access model
- Magic links: Require email, adds complexity for young athletes

---

## ADR-003: bcryptjs Over bcrypt

**Status:** Accepted

**Context:** `bcrypt` requires native bindings which can fail on Vercel's serverless Node environment. `bcryptjs` is pure JavaScript, slower but negligible for PIN hashing (single comparison per login), and works everywhere.

**Decision:** Use `bcryptjs` at 12 rounds.

**Alternatives Rejected:**
- `bcrypt`: Native bindings cause intermittent Vercel deploy failures

---

## ADR-004: Service Role Key at API Layer (RLS Policies Deferred)

**Status:** Accepted

**Context:** RLS is enabled on all tables in the schema but full policy definitions are marked as deferred. For v1, all API routes use the Supabase service role key (server-side only) and enforce scope in JavaScript via `applyScopeFilter()`.

**Decision:** Service role key in API routes. `applyScopeFilter()` + `can()` enforce access in code. RLS policies defined after v1 ships.

**Consequences:**
- ✅ Unblocks launch; no waiting on RLS policy authoring
- ✅ Scope logic is readable and debuggable in JS
- ⚠️ Service role key bypasses RLS — must NEVER reach the browser
- ⚠️ A bug in `applyScopeFilter()` could expose data; RLS policies would be a second safety layer

**Mitigation:** Service role key is only in Vercel env vars. Never in source. Never in `public/` directory.

---

## ADR-005: Single `lib/supabase.js` Client Instance

**Status:** Accepted

**Context:** Each serverless function is stateless. Rather than creating a Supabase client inline in every route, one shared module creates a single client using the service role key.

**Decision:** `lib/supabase.js` exports `supabase` as a singleton. All routes import from this module.

**Consequences:**
- ✅ Single place to update client config
- ✅ Consistent service role key usage
- ✅ Easy to mock in future tests

---

## ADR-006: `preview` Branch for David's CI/CD Safety Net

**Status:** Accepted

**Context:** David is non-technical. A direct push to `main` going live immediately is a risk — he might accidentally break something and not know how to revert.

**Decision:** Create a `preview` branch. Vercel auto-generates a preview URL for any non-main branch push. David can see changes before merging. Merge to `main` via GitHub Desktop (button click, no commands).

**Consequences:**
- ✅ David has a safety net for content changes
- ✅ Jim can review before production if needed
- ✅ Vercel handles preview URL generation automatically; no config needed

---

*Sprint: ff-production-launch-v1 | Author: Jim | Date: 2026-03-22*
