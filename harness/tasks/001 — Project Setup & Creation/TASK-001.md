# TASK-001: Project Setup & Creation

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | 5 |
| **PRD Reference** | harness/prd.md |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-04-10 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-10 |

---

## Description
Scaffold the full Treasure Trove monorepo from scratch. Set up the pnpm workspace with Turborepo, initialise all three apps (Next.js 15 storefront, Medusa v2 backend, Payload CMS v3), create all shared packages (ui, types, utils, config), configure TypeScript, ESLint, Prettier, and Husky pre-commit hooks. Set up local infrastructure (PostgreSQL, Redis) and verify all apps start without errors.

---

## Sub Tasks
- [ ] Initialise pnpm workspace with `pnpm-workspace.yaml`
- [ ] Set up Turborepo (`turbo.json`) with build, dev, lint, type-check, clean pipeline
- [ ] Scaffold `apps/storefront` — Next.js 15 + TypeScript + Tailwind CSS v4 + App Router
- [ ] Scaffold `apps/backend` — Medusa v2 + TypeScript + PostgreSQL + Redis
- [ ] Scaffold `apps/cms` — Payload CMS v3 + TypeScript + @payloadcms/db-postgres
- [ ] Create `packages/ui` — shared React component library skeleton
- [ ] Create `packages/types` — shared TypeScript types package
- [ ] Create `packages/utils` — shared utility functions package
- [ ] Create `packages/config` — shared ESLint, Tailwind, tsconfig configs
- [ ] Configure TypeScript strict mode across all apps and packages (`tsconfig.base.json`)
- [ ] Configure ESLint v9 + Prettier v3 with shared base config
- [ ] Set up Husky + lint-staged pre-commit hooks
- [ ] Configure `.env.example` files for all three apps
- [ ] Set up PostgreSQL (shared `TreasureTrove_db`) and Redis locally
- [ ] Run Medusa migrations and verify backend starts on port 9000
- [ ] Verify Payload CMS starts on port 3001
- [ ] Verify Next.js storefront starts on port 3000
- [ ] Seed Medusa Admin user: admin@treasuretrove.com / Admin@123
- [ ] Seed Payload Admin user: admin@treasuretrove.com / Admin@123

---

## Acceptance Criteria
- [ ] `pnpm install` from repo root installs all dependencies with no errors
- [ ] `pnpm dev` starts all three apps in parallel via Turborepo
- [ ] `pnpm build` completes successfully for all apps (Turborepo cached)
- [ ] `pnpm lint` passes with no errors across all apps and packages
- [ ] `pnpm type-check` passes in strict mode across all apps and packages
- [ ] Next.js storefront accessible at http://localhost:3000
- [ ] Medusa API accessible at http://localhost:9000/health
- [ ] Medusa Admin accessible at http://localhost:9000/app
- [ ] Payload CMS API accessible at http://localhost:3001/api
- [ ] Payload Admin accessible at http://localhost:3001/admin
- [ ] PostgreSQL `TreasureTrove_db` created with Medusa and Payload tables
- [ ] Redis running and connected to Medusa
- [ ] All `.env.example` files committed, `.env` files git-ignored
- [ ] Husky pre-commit hook runs lint-staged on changed files
- [ ] No TypeScript errors (`strict: true`) in any app or package

---

## Technical Notes
- **Package manager:** pnpm v9 only — never npm or yarn
- **Node version:** 20 LTS minimum
- **Database:** Single shared PostgreSQL v16 instance — Medusa uses unprefixed tables, Payload uses `payload_*` prefix
- **Turborepo:** `build` task has `dependsOn: ["^build"]` so packages build before apps
- **Tailwind CSS v4:** Uses new `@import "tailwindcss"` syntax — no `tailwind.config.js` required for base setup
- **Payload + Medusa shared DB:** Set `DATABASE_URL` and `DATABASE_URI` to the same PostgreSQL connection string

---

## Files to Create/Modify
```
CREATE:
- pnpm-workspace.yaml
- turbo.json
- package.json (root)
- tsconfig.base.json
- .eslintrc.base.js
- .prettierrc
- .gitignore
- .husky/pre-commit
- lint-staged.config.js
- apps/storefront/ (full Next.js 15 scaffold)
- apps/backend/ (full Medusa v2 scaffold)
- apps/cms/ (full Payload CMS v3 scaffold)
- packages/ui/
- packages/types/
- packages/utils/
- packages/config/
- apps/storefront/.env.example
- apps/backend/.env.example
- apps/cms/.env.example
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **Route:** http://localhost:3001/admin — Payload Admin login

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** All other tasks (TASK-002 through TASK-177)

---

## Claude Code Context
```
Provide Claude Code with these files:
1. harness/claude.md (rules and standards)
2. harness/tasks/TASK-001.md (this file)
3. harness/architecture.md (system context)
4. harness/docs/env-setup.md (environment setup guide)
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-10 | Completed. Full monorepo scaffolded: pnpm workspace + Turborepo, all three apps (storefront/backend/cms), all four packages (ui/types/utils/config). Medusa DB migrated, admin user seeded (admin@treasuretrove.com / Admin@123). Husky pre-commit hooks configured. All .env.example files committed. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
