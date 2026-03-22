# MIGRATION MAP — Fairway Forward Production Launch
## Sprint: ff-production-launch-v1

---

## Execution Order (strict — do not reorder)

### Pre-flight (before writing any code)
- [ ] Confirm domain with David
- [ ] Confirm Twilio account (new or existing)
- [ ] Get real coach phone numbers from David
- [ ] Confirm `v3.html` is canonical frontend (or audit all HTML files)

---

### Epic 1 — Repo Scaffold
| Action | File | Notes |
|--------|------|-------|
| CREATE | `package.json` | `bcryptjs`, `twilio`, `@supabase/supabase-js` |
| CREATE | `.gitignore` | `node_modules/`, `.env`, `.env.local` |
| CREATE | `.env.example` | Template only — never real keys |
| CREATE | `vercel.json` | Minimal config (may be empty `{}`) |
| CREATE | GitHub repo | David owns it; Jim has collaborator access |
| COPY | All HTML files → `public/` | Rename to functional names (coach.html, season.html, etc.) |
| CREATE | `public/js/ff-api.js` | Auth helper — the only JS David's HTML needs to import |

---

### Epic 2 — Supabase
| Action | Step | Notes |
|--------|------|-------|
| CREATE | Supabase project `fairway-forward` | Region: us-east-1 |
| RUN | `fairway_forward_schema.sql` in SQL Editor | Full schema, one shot |
| VERIFY | `lesson_focuses` = 10 rows | SELECT COUNT(*) FROM lesson_focuses |
| VERIFY | `users` = 2 rows | SELECT * FROM users |
| UPDATE | Coach phone numbers in `users` table | UPDATE users SET phone = '+1...' WHERE role = 'coach_head' |
| COPY | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Save to secure notepad before closing tab |

---

### Epic 3 — Lib Layer
| Action | File | Notes |
|--------|------|-------|
| CREATE | `lib/supabase.js` | Single client, service role key |
| CREATE | `lib/auth.js` | `resolveSession()` + `withAuth()` |
| CREATE | `lib/scope.js` | `applyScopeFilter()` + `can()` |
| CREATE | `lib/twilio.js` | `sendPin()` helper |

---

### Epic 4 — Auth Routes (the keystone)
| Action | File | Notes |
|--------|------|-------|
| CREATE | `api/auth/verify-pin.js` | POST — bcrypt compare, create session, return token |
| CREATE | `api/auth/logout.js` | POST — expire session |
| CREATE | `api/auth/me.js` | GET — resolve token → user |
| CREATE | `api/pins/generate.js` | POST — generate PIN, hash, send SMS (coach_head only) |
| CREATE | `api/pins/expire.js` | POST — manually expire (coach_head only) |
| CREATE | `api/pins/unlock.js` | POST — unlock locked PIN (coach_head only) |

---

### Epic 5 — Data Routes
| Action | File | Notes |
|--------|------|-------|
| CREATE | `api/roster/index.js` | GET all (scoped) / POST create player |
| CREATE | `api/roster/[id]/profile.js` | GET / PATCH player profile |
| CREATE | `api/rounds/index.js` | GET all / POST new round |
| CREATE | `api/rounds/[player_id].js` | GET rounds for one player |
| CREATE | `api/events/index.js` | GET all / POST create event |
| CREATE | `api/events/[id].js` | PATCH event |
| CREATE | `api/swing-notes/index.js` | POST save note |
| CREATE | `api/swing-notes/[player_id].js` | GET notes for player |
| CREATE | `api/swing-notes/[id]/approve.js` | PATCH approve + sent |
| CREATE | `api/blog/index.js` | GET all / POST draft |
| CREATE | `api/blog/[id]/publish.js` | PATCH publish (coach_head only) |

---

### Epic 6 — Public Routes (no auth)
| Action | File | Notes |
|--------|------|-------|
| CREATE | `api/public/feed.js` | Published posts + upcoming events |
| CREATE | `api/public/standings.js` | opt-in players only |
| CREATE | `api/public/schedule.js` | Season schedule |

---

### Epic 7 — Vercel Deploy
| Action | Step | Notes |
|--------|------|-------|
| CONNECT | GitHub repo → Vercel project | Framework: Other |
| SET | All env vars in Vercel dashboard | Never commit to source |
| DEPLOY | `vercel --prod` or push to main | First deploy |
| VERIFY | `GET /api/public/feed` → 200 | Fan access smoke test |
| VERIFY | `GET /api/auth/me` (no token) → 401 | Auth smoke test |

---

### Epic 8 — David's CI/CD Handoff
| Action | Step | Notes |
|--------|------|-------|
| INSTALL | GitHub Desktop on David's machine | Link to repo |
| CREATE | `preview` branch in GitHub | Vercel auto-creates preview URL |
| WALK | David through: edit → commit → push → see live | Full workflow demo |
| DOCUMENT | `DAVID_GUIDE.md` in repo root | Non-technical, plain English, screenshots |

---

### Epic 9 — QA Checklist (from build brief)
| Check | Method |
|-------|--------|
| Generate PIN for coach → SMS → login → session token | Manual, real phone |
| Wrong PIN → increments failed_attempts → locks at 10 | Manual |
| JV coach cannot see Varsity profiles | Manual |
| Player token reads own data only | Manual |
| /api/public/feed → 200, no headers | curl or browser |
| Tournament round gets weight=3 | Insert round, SELECT weighted_score |
| opt-in player appears in standings | Check public/standings |
| opt-out player does NOT appear | Check public/standings |
| AI-generated post = status draft | Insert, SELECT status |
| Head coach publishes → appears in feed | Manual |
| JV coach cannot publish | Manual, expect 403 |

---

## Rollback Plan

This is a greenfield deploy — no existing production system to protect.

If Supabase schema fails mid-run:
1. Drop the project and start fresh (schema is in source, re-run is trivial)

If Vercel deploy fails:
1. Check build logs in Vercel dashboard
2. Fix the failing file
3. Push to main — auto-redeploys

If Twilio fails to deliver PIN:
1. Head coach can see PIN hash in Supabase `pins` table (not useful directly)
2. Use Supabase dashboard to manually set `pins.status = 'active'` and create session row
3. File Twilio support ticket and switch to test credentials

---

*Sprint: ff-production-launch-v1 | Author: Jim | Date: 2026-03-22*
