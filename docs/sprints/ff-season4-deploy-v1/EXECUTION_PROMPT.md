# EXECUTION PROMPT — Season 4 Deploy
## Sprint: ff-season4-deploy-v1
## Hand this to Claude Code OR work from it directly

---

## Attention Anchoring Protocol

Before any decision, re-read:
1. `docs/sprints/ff-season4-deploy-v1/SPEC.md` — Live Status + Attention Anchor
2. `docs/sprints/ff-season4-deploy-v1/DEVLOG.md` — last entries

After every 10 tool calls: Am I still just deploying the file as-is? If I'm editing HTML — STOP.

**The goal in one sentence:** Get `fairway_forward_season-4.html` live at a Vercel URL so David can open it on his phone today.

---

## What This Is

`fairway_forward_season-4.html` is a complete, self-contained coaching app. It requires:
- Zero backend
- Zero database
- Zero build step
- Just Vercel serving it as a static file

Do not modify the HTML. Do not add dependencies. Do not refactor. Deploy it as-is.

---

## The 6 Epics (work in order)

```
E1 → Create GitHub repo, add HTML as public/index.html
E2 → Connect repo to Vercel
E3 → Confirm first deploy, smoke test on desktop
E4 → Mobile QA on David's phone
E5 → GitHub Desktop setup + David handoff
E6 → Full smoke test, close sprint
```

---

## Epic 1 — Exact Steps

### Step 1: GitHub
1. github.com → New repository
   - Name: `fairway-forward`
   - Visibility: Private
   - Initialize with README: Yes
   - Default branch: main

2. Create folder structure:
```
public/
  index.html   ← PASTE the full contents of fairway_forward_season-4.html
.gitignore     ← contents below
README.md      ← "Fairway Forward — Bishop Chatard Boys Golf"
```

`.gitignore`:
```
node_modules/
.env
.env.local
.vercel/
.DS_Store
```

3. Add David as collaborator: Settings → Collaborators → invite David's GitHub username

4. Create `preview` branch: Branch dropdown → type "preview" → Create branch

### Build Gate: Repo at github.com/{owner}/fairway-forward, public/index.html committed (~3014 lines)

---

## Epic 2 — Vercel Steps

1. vercel.com → Add New → Project
2. Import `fairway-forward` from GitHub
3. Settings:
   - Framework Preset: **Other** (critical — not Next.js)
   - Root Directory: `/`
   - Build Command: **(leave empty)**
   - Output Directory: `public`
4. Click Deploy

### Build Gate: Vercel shows "Building..." or "Ready" — project linked

---

## Epic 3 — First Deploy Verification

1. Wait for Vercel "Ready" status (usually ~30 seconds for static files)
2. Click the generated URL
3. Verify on desktop:
   - Welcome screen loads with 4 role buttons
   - Coach button → PIN/setup screen
   - Complete setup (any name, any PIN) → Coach dashboard loads
   - All 8 bottom nav tabs tap without errors
   - Browser console: no red errors

**Record the URL:**
```
PRODUCTION URL: https://_________________________________.vercel.app
```

### Build Gate: App loads, coach dashboard reachable, no console errors

---

## Epic 4 — Mobile QA

Text or share the URL with David. Have him:
1. Open on iPhone Safari
2. Welcome screen → Coach → setup → PIN → dashboard
3. Confirm: no horizontal overflow, PIN keypad full-width, nav tabs tappable

Note any visual issues to fix in a future sprint. Do NOT fix them now.

### Build Gate: David reaches coach dashboard on his phone

---

## Epic 5 — David Handoff

### GitHub Desktop Setup
1. David downloads: desktop.github.com
2. Installs and signs in with GitHub
3. Clones `fairway-forward`
4. Jim walks David through: edit → commit → push → watch Vercel → live

### DAVID_GUIDE.md
Create `DAVID_GUIDE.md` in the repo root with:

```markdown
# Fairway Forward — How to Update the App

## Your Production URL
https://_________________________.vercel.app

## How to Make Changes

1. Open GitHub Desktop on your computer
2. Make sure Current Branch = main
3. Open public/index.html in TextEdit (Mac) or Notepad (Windows)
4. Find what you want to change, save the file
5. In GitHub Desktop: write a short description → "Commit to main" → "Push origin"
6. Wait about 30 seconds — your change is live at the URL above

## Safe Mode (Preview First)

1. Switch to preview branch in GitHub Desktop
2. Make your change → commit → push to preview
3. You'll get a test URL to check first
4. Happy with it? Switch to main → merge → push

## Something Broke?

Text Jim: [Jim's number]
He can undo any change in 2 minutes.
```

Commit `DAVID_GUIDE.md` and push.

### Build Gate: David pushes a change himself, it goes live without Jim's help

---

## Epic 6 — Full Smoke Test

Check every item in SPEC.md Acceptance Criteria.

After all pass:
- Update SPEC.md Live Status to ✅ Complete
- Add DEVLOG entry with production URL, time, and notes
- Text David the URL one final time: "You're live. This is your URL: [URL]"

---

## Post-Execution: What to Tell Claude Desktop

Report back using this format:
```
Sprint: ff-season4-deploy-v1
Status: COMPLETE / BLOCKED
Production URL: https://______.vercel.app
Gate results: [any failures or notes]
Time: [total time]
Notes: [anything unexpected]
Ready for: ff-backend-v1 (Sprint 2) when you say go
```

---

## Known Limitations (Not Bugs — Sprint 2 Work)

| Limitation | Accepted for Now |
|------------|-----------------|
| Data in localStorage (device-specific) | Yes |
| API key entered manually by coach | Yes |
| 4-digit client-side PIN (not server auth) | Yes |
| No multi-device sync | Yes |

---

*Sprint: ff-season4-deploy-v1 | Author: Claude Desktop PM | Date: 2026-03-22*
