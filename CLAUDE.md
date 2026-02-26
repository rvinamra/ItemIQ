# ItemIQ Website - Claude Instructions

> **Read this file completely before taking any action.**

---

## Project Overview

ItemIQ marketing website — showcases the ItemIQ transaction intelligence API through interactive demos, survey data, and lead generation. Built as a single-page React app hosted on GitHub Pages.

**Tech Stack:**
- Frontend: React 18 + Vite 6 + Tailwind CSS 3
- UI Library: shadcn/ui (60+ components) + Radix UI
- Animations: Framer Motion
- Charts: Recharts
- Forms: React Hook Form + Zod
- Backend Services: Base44 SDK (waitlist/data), EmailJS (email delivery)
- Hosting: GitHub Pages (custom domain: itemiq.io)
- Routing: React Router DOM 7 (with 404.html SPA workaround)

---

## Critical: Existing Infrastructure

### Git Repository (ALREADY EXISTS - DO NOT CREATE NEW ONES)

| Component | Repository | URL |
|-----------|------------|-----|
| Website | ItemIQ | https://github.com/rvinamra/ItemIQ.git |

### Related Repositories

| Component | Repository | URL |
|-----------|------------|-----|
| Backend | itemiq-backend | https://github.com/rvinamra/itemiq-backend.git |
| Frontend App | itemiq-frontend | https://github.com/rvinamra/itemiq-frontend.git |

### Deployment URLs

| Service | URL | Platform |
|---------|-----|----------|
| Marketing Website | https://www.itemiq.io | GitHub Pages |
| Backend API | https://web-production-d3aa07.up.railway.app | Railway |
| Frontend App | https://itemiq-frontend.vercel.app | Vercel |

---

## Operational Rules

### Before Any Action

```
STOP AND CHECK:
1. Have I read this CLAUDE.md fully?
2. Am I about to create something that already exists?
3. Do I understand the current project structure?
→ If unsure about any of these, READ THE FILES FIRST.
```

### Before Implementing

```
ASSUMPTIONS I'M MAKING:
1. [assumption]
2. [assumption]
→ State these explicitly. Don't silently fill in ambiguous requirements.
```

### Before Deploying/Pushing

```
PRE-PUSH CHECKLIST:
1. [ ] Tested locally - `npm run dev` starts without errors
2. [ ] Tested the specific feature/page affected
3. [ ] No hardcoded secrets or localhost URLs for production
4. [ ] Build succeeds - `npm run build` completes without errors
5. [ ] Correct git remote (→ ItemIQ repo)
```

---

## Code Standards

### Core Principles
- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Lazy Fixes**: Find root causes. No temporary patches. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

### Do
- Keep changes surgical and focused
- Test locally before pushing to production
- Surface uncertainty early — ask rather than guess
- Push back on bad ideas with clear reasoning
- Prefer boring, obvious solutions over clever ones

### Do Not
- Create new repos without explicit instruction
- Remove code/comments you don't fully understand
- "Clean up" code orthogonal to the task
- Make production changes without local testing
- Silently pick one interpretation when requirements are ambiguous
- Over-engineer simple fixes
- Use temporary workarounds instead of real solutions

### After Changes

```
CHANGES MADE:
- [file]: [what changed and why]

NOT TOUCHED (intentionally):
- [file]: [reason]

POTENTIAL CONCERNS:
- [any risks or things to verify]
```

---

## Workflow Rules

### 1. Plan Mode for Complex Tasks
- Use plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, **STOP and re-plan immediately** — don't keep pushing
- Write detailed specs upfront to reduce ambiguity

### 2. Verification Before Done
- Never mark a task complete without proving it works
- Run `npm run dev` and visually verify in the browser
- Ask yourself: "Would a staff engineer approve this?"

### 3. Self-Improvement Loop
- After ANY correction from user: update CLAUDE.md with the pattern and prevention rule
- Ruthlessly iterate until mistake rate drops
- Review Lessons Learned section at session start

### 4. Autonomous Bug Fixing
- When given a bug report with clear error messages: just fix it
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Note: For ambiguous requirements, still ask rather than guess

### 5. Task Management
1. Write plan with checkable items
2. Verify plan before starting implementation
3. Mark items complete as you go
4. High-level summary at each step
5. Capture lessons after corrections

---

## Project Structure

```
itemiq-website/
├── CLAUDE.md              ← YOU ARE HERE - read first
├── src/
│   ├── main.jsx           ← React app entry point
│   ├── App.jsx            ← Main app wrapper with router
│   ├── index.css          ← Global styles (Tailwind + CSS vars)
│   ├── api/
│   │   ├── base44Client.js    ← Base44 SDK initialization
│   │   ├── entities.js        ← Entity exports
│   │   └── entities/          ← Individual entity definitions
│   ├── config/
│   │   └── emailjs.js         ← EmailJS configuration
│   ├── contexts/
│   │   └── AuthContext.jsx        ← Auth state provider (sessionStorage)
│   ├── pages/
│   │   ├── index.jsx          ← Route definitions + auth gate
│   │   ├── LoginPage.jsx      ← Full-screen login page
│   │   ├── Layout.jsx         ← Main layout with sidebar nav
│   │   ├── Home.jsx           ← Landing page
│   │   ├── ProcessTransactions.jsx ← AI normalization demo
│   │   ├── StatementsDemo.jsx     ← Credit card statement demo
│   │   └── SurveyInsights.jsx     ← Survey data visualization
│   ├── components/
│   │   ├── home/              ← Homepage components (Hero, HowItWorks, etc.)
│   │   ├── process/           ← Transaction processing components
│   │   ├── itemiq_analytics/  ← Analytics components (HealthScore)
│   │   └── ui/                ← 60+ shadcn/ui components
│   ├── hooks/
│   │   └── use-mobile.jsx
│   └── lib/
│       └── utils.js           ← Utility functions (cn, etc.)
├── dist/                      ← Built production files
├── src-index.html             ← Vite build entry point
├── index.html                 ← SPA routing workaround for GitHub Pages
├── 404.html                   ← GitHub Pages 404 redirect
├── vite.config.js             ← Vite build configuration
├── tailwind.config.js         ← Tailwind CSS config
├── package.json               ← Dependencies & scripts
└── README.md
```

---

## Key Integration Details

### Base44 SDK
- App ID: `68d9ca8713f69a066d1f404d`
- Auth: Currently disabled (`requiresAuth: false`)
- Entities: Transaction, MerchantProfile, CorporateExpense, Waitlist

### EmailJS
- Service: `service_itemiq`
- Public Key: `qg1Bg5jcs_3lTEAFT`
- Templates: `template_waitlist`, `template_contact`
- Recipients: vinamravr1@gmail.com, sberhalter@gmail.com, cjmullhaupt@gmail.com

### Authentication Gate
- Client-side login gate — all site content hidden until authenticated
- Credentials: Member ID `itemiq_test` / Password `svcholdings_ITEMIQ` (hardcoded in `src/contexts/AuthContext.jsx`)
- Uses `sessionStorage` — session clears when browser tab closes
- Auth version check (`itemiq_auth_v`) forces re-login when credentials change (bump `AUTH_VERSION` constant)
- Login page styled to match itemiq-frontend app (light theme, text-based logo)

### GitHub Pages SPA Routing
- `404.html` catches all 404s and redirects with query params
- `index.html` reads query params and uses `history.replaceState`
- This enables direct links to routes (e.g., `itemiq.io/StatementsDemo`)

---

## Common Gotchas

1. **Vite entry point**: Build uses `src-index.html` (not `index.html`) — see `vite.config.js` rollupOptions
2. **GitHub Pages SPA**: The `index.html` at root is the SPA redirect handler, NOT the Vite entry
3. **Asset paths**: Must use relative paths (`base: './'` in vite.config) for GitHub Pages
4. **Path aliases**: `@/*` maps to `./src/*` — configured in both `vite.config.js` and `jsconfig.json`
5. **Manual deployment**: Build → copy dist assets to root → update index.html → push to git

---

## When Confused

If you encounter inconsistencies or unclear requirements:

1. **STOP** — Don't proceed with a guess
2. **Name** the specific confusion
3. **Ask** the clarifying question
4. **Wait** for resolution before continuing

Bad: Silently picking one interpretation and hoping it's right.
Good: "I see X in file A but Y in file B. Which takes precedence?"

---

## Contacts

- **Developer email**: vinamravr1@gmail.com
- **Support email**: support@itemiq.io

---

*Last updated: February 26, 2026*
