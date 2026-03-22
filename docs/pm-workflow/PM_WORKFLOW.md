# FAIRWAY FORWARD — Claude Desktop PM Workflow
## How We Run This Project

---

## The Model

```
Claude Desktop (this session)
    = Project Manager + Architect + Sprint Planner

Jim (you)
    = Engineer — executes sprints, runs Claude Code, ships code

David
    = Client / End User — non-technical, golf coach
```

Claude Desktop plans. Jim builds. David uses.

**The handoff artifact is always `EXECUTION_PROMPT.md`.** Claude Desktop generates it. Jim drops it into a Claude Code session (or works from it directly). Claude Code executes the sprint and logs to `DEVLOG.md`. Jim reviews, smoke-tests, and reports back to Claude Desktop.

---

## Session Protocol

### Starting a New Session with Claude Desktop

Paste this at the top of every new Claude Desktop session:

```
I'm Jim, backend lead on Fairway Forward (Bishop Chatard Boys Golf).
Read these files in order before we do anything:
1. docs/sprints/ROADMAP.md
2. docs/sprints/{current-sprint}/SPEC.md (Live Status + Attention Anchor)
3. docs/sprints/{current-sprint}/DEVLOG.md (last 3 entries)

Current sprint: {sprint-name}
What we're doing today: {one sentence}
```

Claude Desktop will orient itself, confirm Live Status, and tell you what to do next.

---

### The Sprint Loop (repeat for every epic)

```
1. Claude Desktop generates EXECUTION_PROMPT.md for the epic
2. Jim opens Claude Code (or works directly)
3. Jim pastes EXECUTION_PROMPT.md as the first message
4. Claude Code executes: writes files, runs commands, verifies
5. Jim confirms: build gate passes? (yes/no + any notes)
6. Jim reports back to Claude Desktop: "Epic N done. [notes]"
7. Claude Desktop updates SPEC.md Live Status + DEVLOG
8. Claude Desktop generates next EXECUTION_PROMPT.md
9. Repeat
```

---

### Reporting Back (what Jim tells Claude Desktop after each epic)

```
Epic [N] complete.
Gate: PASS / FAIL
Notes: [anything unexpected — errors, decisions made, things that were different than planned]
Time: [how long it took]
Next: ready for Epic [N+1]
```

That's it. Claude Desktop handles the rest — updates artifacts, adjusts the plan if something changed, generates the next execution prompt.

---

### When Something Breaks

```
Epic [N] blocked.
Error: [paste the error]
File: [which file]
What I tried: [any attempts to fix]
```

Claude Desktop will diagnose, update the plan, and generate a revised EXECUTION_PROMPT.md for the fix.

---

## Artifact Ownership

| Artifact | Owned By | Updated When |
|----------|---------|-------------|
| SPEC.md | Claude Desktop | Every phase transition |
| SPRINTS.md | Claude Desktop | When scope changes |
| EXECUTION_PROMPT.md | Claude Desktop | Before every epic |
| DEVLOG.md | Jim (or Claude Code) | After every epic |
| ARCHITECTURE.md | Claude Desktop | When design changes |
| DECISIONS.md | Claude Desktop | When a new ADR is needed |
| CONTINUATION_PROMPT.md | Claude Desktop | At session end / before context fills |

---

## What Lives Where

```
fairway-forward/
├── docs/
│   ├── pm-workflow/
│   │   └── PM_WORKFLOW.md        ← this file
│   └── sprints/
│       ├── ROADMAP.md            ← initiative master plan
│       ├── CONTINUATION_PROMPT.md← initiative-level handoff
│       └── {sprint-name}/
│           └── [9 artifacts]
├── public/                       ← static HTML (what ships)
├── api/                          ← Vercel serverless routes
└── lib/                          ← shared backend modules
```

---

## The Golden Rule

**Claude Desktop never executes. Jim never plans.**

If Jim finds himself making architectural decisions mid-execution, stop and check in with Claude Desktop. If Claude Desktop finds itself writing file contents instead of planning, it should write an EXECUTION_PROMPT instead.

---

*Fairway Forward PM Workflow v1.0 | 2026-03-22*
