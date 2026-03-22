# MIGRATION MAP — Season 4 Deploy
## Sprint: ff-season4-deploy-v1

---

## Files to Create (in order)

| Order | File | Action | Source |
|-------|------|--------|--------|
| 1 | `public/index.html` | CREATE — paste season-4 HTML | `fairway_forward_season-4.html` |
| 2 | `.gitignore` | CREATE | See EXECUTION_PROMPT.md |
| 3 | `README.md` | UPDATE | One line: "Fairway Forward — Bishop Chatard Boys Golf" |
| 4 | `DAVID_GUIDE.md` | CREATE | See EXECUTION_PROMPT.md for content |
| 5 | `docs/pm-workflow/PM_WORKFLOW.md` | CREATE | Already written |
| 6 | `docs/sprints/...` | CREATE | All sprint artifacts |

## No Files to Delete
This is a greenfield repo. Nothing to remove.

## No Files to Modify
The HTML ships as-is. Zero edits.

## Rollback Plan
Greenfield deploy — nothing to roll back to. If Vercel deploy fails:
1. Check Vercel build logs
2. Verify Output Directory = `public` in Vercel settings
3. Verify `public/index.html` exists in repo
4. Re-deploy

---

# INDEX — ff-season4-deploy-v1

## Read Order (for any fresh session)

| # | File | When to Read |
|---|------|-------------|
| 1 | `SPEC.md` | Every session start — Live Status + Attention Anchor |
| 2 | `DEVLOG.md` | Every session start — recent history |
| 3 | `SPRINTS.md` | When working epics |
| 4 | `EXECUTION_PROMPT.md` | The working document — use during build |
| 5 | `CONTINUATION_PROMPT.md` | Fresh context window handoff |
| 6 | `ARCHITECTURE.md` | When making structural decisions |
| 7 | `DECISIONS.md` | When questioning a choice |
| 8 | `MIGRATION_MAP.md` | Tracking file changes |
| 9 | `REPO_AUDIT.md` | Context on what was audited |

## Sprint Status
- [ ] E1: GitHub repo + file
- [ ] E2: Vercel connect
- [ ] E3: First deploy
- [ ] E4: Mobile QA
- [ ] E5: David handoff
- [ ] E6: Smoke test ✅

---

*Sprint: ff-season4-deploy-v1 | PM: Claude Desktop | Date: 2026-03-22*
