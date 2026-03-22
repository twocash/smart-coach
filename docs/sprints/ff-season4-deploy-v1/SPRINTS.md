# SPRINTS — Season 4 Deploy
## Sprint: ff-season4-deploy-v1
## Target: Live URL in under 2 hours

---

## Epic Map

| Epic | Name | Est. | Gate |
|------|------|------|------|
| E1 | Repo + File | 20 min | Repo exists, HTML committed to `public/` |
| E2 | Vercel Connect | 15 min | Vercel project created, linked to GitHub |
| E3 | First Deploy | 10 min | Live URL — app loads on desktop |
| E4 | Mobile QA | 15 min | David opens URL on phone, completes setup |
| E5 | David Handoff | 20 min | David has GitHub Desktop, can push, sees preview |
| E6 | Smoke Test | 15 min | All acceptance criteria checked |

**Total estimated time: ~95 minutes**

---

## Epic 1 — Repo + File

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Confirmed: we are deploying as-is, zero changes to HTML

### Story 1.1: Create GitHub Repo
- [ ] Go to github.com → New repository
- [ ] Name: `fairway-forward`
- [ ] Owner: David's GitHub account (or Jim's if David doesn't have one yet)
- [ ] Visibility: **Private**
- [ ] Initialize with README: yes
- [ ] Default branch: `main`

### Story 1.2: Create Repo Structure
Create these files directly in GitHub web UI or via GitHub Desktop:

```
fairway-forward/
├── public/
│   └── index.html          ← paste contents of fairway_forward_season-4.html here
├── .gitignore              ← see below
└── README.md               ← update with one line: "Fairway Forward — Bishop Chatard Boys Golf"
```

`.gitignore` contents:
```
node_modules/
.env
.env.local
.vercel/
.DS_Store
```

### Story 1.3: Add David as Collaborator
- [ ] GitHub repo → Settings → Collaborators → Add David's GitHub username
- [ ] David accepts invitation

### Story 1.4: Create Preview Branch
- [ ] In GitHub: Branch dropdown → type `preview` → Create branch
- [ ] This gives David a safe sandbox before hitting `main`

### Build Gate
```
Repo exists at github.com/{owner}/fairway-forward
public/index.html is committed (should be ~3,014 lines)
```

---

## Epic 2 — Vercel Connect

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Epic 1 build gate passed

### Story 2.1: Create Vercel Account (if needed)
- [ ] vercel.com → Sign up with GitHub

### Story 2.2: Import Repository
- [ ] Vercel dashboard → Add New → Project
- [ ] Import `fairway-forward` from GitHub
- [ ] Framework Preset: **Other** (not Next.js — this is static HTML)
- [ ] Root Directory: leave as `/`
- [ ] Build Command: leave **empty** (no build step)
- [ ] Output Directory: `public`
- [ ] Click Deploy

### Story 2.3: Verify Project Settings
- [ ] Settings → General → Framework = "Other"
- [ ] Settings → Git → Production Branch = `main`
- [ ] Preview branches: Vercel auto-enables — confirm `preview` branch gets a preview URL

### Build Gate
Vercel project created, first deploy triggered (may still be building — that's fine, Epic 3 confirms it).

---

## Epic 3 — First Deploy

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Vercel project connected (Epic 2 done)

### Story 3.1: Confirm Deploy Completed
- [ ] Vercel dashboard shows green "Ready" status
- [ ] Copy the production URL (format: `fairway-forward-{hash}.vercel.app` or `fairway-forward.vercel.app`)
- [ ] **Save this URL** — this is what David gets

### Story 3.2: Desktop Smoke Test
Open the URL on a desktop browser:
- [ ] Welcome screen loads (role selection: Coach / Player / Parent / Fan)
- [ ] Click "Coach" → PIN screen appears
- [ ] First-run: setup screen appears (program name, school)
- [ ] Complete setup → PIN entry works → Coach dashboard loads
- [ ] All 8 bottom nav tabs are tappable and render content
- [ ] No JavaScript errors in browser console

### Story 3.3: Note the Production URL
```
PRODUCTION URL: https://_________________________.vercel.app
```
Write it here and in DEVLOG.md.

### Build Gate
App loads on desktop, coach dashboard is accessible, no console errors.

---

## Epic 4 — Mobile QA

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Production URL confirmed (Epic 3)

### Story 4.1: iPhone Test (David's device)
- [ ] Text or share the URL with David
- [ ] David opens on iPhone Safari
- [ ] Welcome screen renders correctly (no overflow, no horizontal scroll)
- [ ] PIN keypad is full-width and tappable
- [ ] Coach dashboard loads — bottom nav is visible and tappable
- [ ] Roster tab renders player cards

### Story 4.2: Android Test (if available)
- [ ] Same flow on Chrome Android

### Story 4.3: AI Feature Smoke Test
- [ ] In coach dashboard → Swing Note tab
- [ ] Note: this requires an Anthropic API key — coach pastes their key
- [ ] If key available: test generates a note
- [ ] If key not available: confirm the UI renders correctly without crashing

### Build Gate
David can open the app on his phone and reach the coach dashboard.

---

## Epic 5 — David Handoff

### Attention Checkpoint
- [ ] Re-read SPEC.md Attention Anchor
- [ ] Mobile QA passed (Epic 4)

### Story 5.1: GitHub Desktop Setup
- [ ] Download GitHub Desktop: desktop.github.com
- [ ] Install on David's machine
- [ ] Sign in with David's GitHub account
- [ ] Clone `fairway-forward` repo to his computer

### Story 5.2: Walk David Through the Workflow
Show him — do not just tell him — this exact sequence:
1. Open `public/index.html` in a text editor (TextEdit on Mac, Notepad on Windows)
2. Make a tiny visible change (add a space, change a word in the HTML)
3. Save the file
4. Open GitHub Desktop → it shows the changed file
5. Write a commit message: "test: update welcome text"
6. Click "Commit to main"
7. Click "Push origin"
8. Watch Vercel dashboard → deployment completes in ~30 seconds
9. Refresh the live URL — change is live

### Story 5.3: Show Preview Branch Workflow
1. In GitHub Desktop: Current Branch → `preview`
2. Make a change → commit → push
3. Vercel creates a preview URL (David sees it in Vercel dashboard or email)
4. David approves → GitHub Desktop → "Create Pull Request" or "Merge into main"

### Story 5.4: Create DAVID_GUIDE.md
Create `DAVID_GUIDE.md` in the repo root:

```markdown
# Fairway Forward — How to Update the App

## Your Production URL
https://_________________________.vercel.app

## How to Make Changes

1. Open GitHub Desktop
2. Make sure you're on the `main` branch
3. Find and open `public/index.html` in your text editor
4. Make your change and save
5. In GitHub Desktop: write what you changed → "Commit to main" → "Push origin"
6. Wait 30 seconds → your change is live

## If You Want to Preview First (Safe Mode)

1. Switch to `preview` branch in GitHub Desktop
2. Make your change → commit → push
3. You'll get a preview link from Vercel
4. When it looks right: switch to `main`, merge, push

## If Something Breaks

Text Jim at [Jim's number]. He can roll back any change instantly.

## Your Vercel Dashboard

vercel.com — sign in with GitHub — shows all deployments and their status
```

### Build Gate
David successfully makes and pushes a change without Jim's help. Change appears live within 60 seconds.

---

## Epic 6 — Full Smoke Test

### Attention Checkpoint
- [ ] Re-read SPEC.md Acceptance Criteria (all of them)
- [ ] All previous epics complete

### Story 6.1: Run Every Acceptance Criterion

- [ ] `fairway_forward_season-4.html` is live at Vercel URL
- [ ] App loads on mobile (tested on David's iPhone)
- [ ] First-run setup completes (coach name, school, PIN)
- [ ] Coach dashboard accessible after PIN entry
- [ ] AI swing note feature renders (key entry UI works)
- [ ] All 8 coach tabs render: Roster, Events, Lineup, Carpool, Tryouts, Swing Notes, Videos, Scores
- [ ] David successfully logged in on his device ✅
- [ ] GitHub repo exists, David is a collaborator ✅
- [ ] Push to `main` = auto-deploy (confirmed in Epic 5)
- [ ] `preview` branch has its own Vercel preview URL

### Story 6.2: Document Production URL
- [ ] URL recorded in DEVLOG.md
- [ ] URL in DAVID_GUIDE.md
- [ ] URL texted to David

### Story 6.3: Update SPEC.md Live Status
```
Current Phase: Sprint Complete ✅
Status: ✅ Complete
Blocking Issues: None
Next Action: Begin ff-backend-v1 (Sprint 2) when ready
```

### Build Gate
All acceptance criteria checked. Sprint complete.

---

## Post-Sprint: What Stays Broken (Intentionally)

These are known limitations of the v1 deploy. They are Sprint 2 work, not Sprint 1 bugs:

| Limitation | Sprint 2 Fix |
|------------|-------------|
| Data lives in localStorage — device-specific | Migrate to Supabase |
| Anthropic API key must be entered manually | Route through Vercel API proxy |
| No real PIN auth — client-side only | Supabase + Twilio PIN system |
| No multi-device sync | Supabase real-time |

---

*Sprint: ff-season4-deploy-v1 | Author: Jim (PM: Claude Desktop) | Date: 2026-03-22*
