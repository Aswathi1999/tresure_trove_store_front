# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

> For full project rules, coding standards, and architecture details, read `harness/AGENTS.md` first. For task-specific context, read `harness/tasks/TASK-XXX.md`.

---

## Project

**Treasure Trove** is a luxury furniture ecommerce platform — a pnpm monorepo with Turborepo.

```
apps/storefront/   ← Next.js 15 + React 19 — customer-facing store (deployed to Vercel)
apps/backend/      ← Medusa v2 — commerce API (deployed to EC2 via PM2)
apps/cms/          ← Payload CMS v3 — editorial content (deployed to EC2 via PM2)
packages/ui/       ← @TreasureTrove/ui — shared React components
packages/types/    ← @TreasureTrove/types — shared TypeScript types
packages/utils/    ← @TreasureTrove/utils — pure utility functions
packages/config/   ← @TreasureTrove/config — ESLint, Tailwind, tsconfig
```

---

## Commands

```bash
# Run all apps in parallel
pnpm dev

# Run a single app
pnpm dev --filter=storefront
pnpm dev --filter=backend
pnpm dev --filter=cms

# Build / lint / type-check (always from repo root)
pnpm build
pnpm lint
pnpm type-check
pnpm clean
```

**Local ports:** Storefront :3000 · Medusa API :9000 · Medusa Admin :9000/app · Payload CMS :3001 · Payload Admin :3001/admin

---

## Architecture

**Data ownership:**
- Commerce data (products, variants, prices, cart, orders) → **Medusa only**
- Editorial content (blog, material stories, homepage) → **Payload CMS only**
- All media → uploaded via Payload → stored in AWS S3 (private) → served via CloudFront CDN

**Storefront data flow:**
- Medusa data: `@/lib/medusa.ts` (Medusa JS SDK) → Server Components → ISR pages
- Payload data: `@/lib/payload.ts` (REST client) → Server Components → ISR pages
- Never fetch either API from client components

**Cart state:** Zustand store at `@/stores/cart.ts`

**ISR revalidation:** Payload triggers a webhook to the storefront `afterChange` on every published document. Never remove these hooks.

**Shared DB:** PostgreSQL `TreasureTrove_db` — Medusa uses unprefixed tables, Payload uses `payload_*` prefix.

---

## Key Rules

- **pnpm only** — never npm or yarn; always install from repo root
- **No `any`** — use `unknown` with type guards
- **No `<img>`** — always `next/image`
- **No client-side API calls** — fetch Medusa/Payload in Server Components or Server Actions
- **No inline styles** — Tailwind utility classes only
- **No S3 URLs in DB** — always store/serve CloudFront URLs via `generateFileURL`
- **No `"use client"` on pages** — only on components that need cart state, forms, drawers
- **No prop drilling beyond 2 levels** — use Zustand or React Context
- **No `console.log` committed** — use Winston logger in backend
- **No hardcoded prices** — always use smallest currency unit (paise for INR)

---

## Git

```
main              ← production (protected)
develop           ← integration branch
feature/TASK-XXX  ← feature branches from develop
bugfix/BUG-XXX    ← bug branches from develop
```

Squash merge only. Conventional commits required: `feat(scope):`, `fix(scope):`, `chore:`, `docs:`

---

## Reference Docs

| File | When to read |
|------|-------------|
| `harness/AGENTS.md` | Full coding standards and rules |
| `harness/architecture.md` | System design, deployment, data flows |
| `harness/prd.md` | Product requirements and feature specs |
| `harness/docs/db-schema.md` | Database / Payload schema work |
| `harness/docs/design-tokens.md` | Building UI components |
| `harness/docs/env-setup.md` | Environment setup |
| `harness/tasks/TASK-XXX.md` | Current task details |
