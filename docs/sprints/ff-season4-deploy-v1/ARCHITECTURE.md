# ARCHITECTURE — Season 4 Deploy
## Sprint: ff-season4-deploy-v1

---

## v1 Architecture (Static Deploy — This Sprint)

```
User's Browser
    ↓  HTTPS
Vercel CDN
    └── public/index.html   ← the entire app, 3,014 lines
            ↓
        localStorage         ← all data (device-specific)
            ↓
        Anthropic API        ← direct browser calls for AI features
```

Simple. Fast. No moving parts.

---

## Repo Structure (Target State After Sprint 1)

```
fairway-forward/              ← Private GitHub repo
├── public/
│   └── index.html           ← fairway_forward_season-4.html, unchanged
├── docs/
│   ├── pm-workflow/
│   │   └── PM_WORKFLOW.md
│   └── sprints/
│       ├── ROADMAP.md
│       └── ff-season4-deploy-v1/
│           └── [9 artifacts]
├── DAVID_GUIDE.md           ← plain English, how to update the app
├── .gitignore
└── README.md
```

---

## v2 Architecture (Backend Wiring — Sprint 2)

```
User's Browser
    ↓  HTTPS
Vercel Edge
    ├── public/index.html        ← same HTML file, gets ff-api.js added
    └── api/
        ├── auth/verify-pin.js   ← real PIN auth via Supabase + Twilio
        ├── ai/swing-note.js     ← Anthropic API proxy (key stays server-side)
        └── [other routes]
                ↓
        Supabase (Postgres)      ← replaces localStorage
```

Sprint 2 upgrades:
- localStorage → Supabase (real data persistence, multi-device)
- Direct Anthropic API call → API proxy (key secured server-side)
- 4-digit client PIN → Twilio SMS PIN system

---

## Vercel Configuration (Sprint 1)

| Setting | Value | Why |
|---------|-------|-----|
| Framework | Other | Not Next.js — static HTML |
| Build command | (empty) | No build step needed |
| Output directory | `public` | Where index.html lives |
| Production branch | `main` | Auto-deploy on push |
| Preview branches | All branches | Vercel default — gives David safety net |

---

*Sprint: ff-season4-deploy-v1 | PM: Claude Desktop | Date: 2026-03-22*
