# Claude Code Rules — Treasure Trove Furniture Store

> **Read this file FIRST before touching any code.**
> This is the single source of truth for project rules, coding standards, and development workflow.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Project** | Treasure Trove Furniture Store |
| **Client** | Treasure Trove Atelier |
| **Type** | Full Stack Headless Ecommerce |
| **Industry** | Luxury Furniture / Ecommerce |
| **Repo** | Treasure Trove-org/Treasure Trove-store |
| **Monorepo Tool** | pnpm + Turborepo |
| **Sprint Duration** | 2 weeks |
| **Current Sprint** | Sprint 1 — Setup & Design System |

---

## Team

| Name | Role | Responsibility |
|------|------|----------------|
| — | Developer | Full stack — storefront, backend, CMS |
| — | Designer | UI/UX — Treasure Trove brand design system |
| — | Client | Content, product data, approvals |

---

## Monorepo Structure

```
Treasure Trove/
├── apps/
│   ├── storefront/        ← Next.js 15 — customer-facing store
│   ├── backend/           ← Medusa v2 — commerce API
│   └── cms/               ← Payload CMS v3 — editorial content
├── packages/
│   ├── ui/                ← @Treasure Trove/ui — shared React components
│   ├── types/             ← @Treasure Trove/types — shared TypeScript types
│   ├── utils/             ← @Treasure Trove/utils — shared utility functions
│   └── config/            ← @Treasure Trove/config — ESLint, Tailwind, tsconfig
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Tech Stack Rules

### Storefront — apps/storefront

- **Next.js 15** with TypeScript — App Router only, no Pages Router
- **React 19** — Server Components by default, `"use client"` only when necessary
- **Tailwind CSS v4** — no CSS modules, no styled-components, no inline styles
- **Framer Motion v11** — for animations and scroll reveals only
- **Medusa JS SDK v2** — for ALL commerce data (products, cart, orders, customers)
- **Payload REST API** — for ALL CMS data (blog posts, material stories, homepage)
- **next/image** — for ALL images with CloudFront CDN domain configured
- **React Hook Form + Zod** — for ALL forms (checkout, account, contact)
- **Zustand** — for client-only UI state (cart drawer open/close, filters)
- **Lucide React** — for icons. No other icon library

### Backend — apps/backend

- **Medusa v2** with TypeScript — no JavaScript files
- **Node.js 20 LTS** — minimum version
- **PostgreSQL 16** — shared with Payload CMS (separate table prefixes)
- **Redis 7** — for sessions and cache via Medusa's built-in modules
- **MikroORM** — used internally by Medusa — do not bypass
- **Razorpay** — for INR payments (India region)
- **Stripe** — for USD/AED payments (international regions)
- **Winston** — for structured logging (JSON format)

### CMS — apps/cms

- **Payload CMS v3** with TypeScript — no JavaScript files
- **@payloadcms/db-postgres** — PostgreSQL adapter (shared DB as backend)
- **@payloadcms/richtext-lexical** — rich text editor for blog and material stories
- **@payloadcms/plugin-cloud-storage + s3Adapter** — ALL media stored in AWS S3
- **CloudFront CDN** — `generateFileURL` always returns CloudFront URL, never S3 URL

### Shared / Tooling

- **pnpm v9** — package manager. Never npm, never yarn
- **Turborepo v2** — build orchestration and caching
- **TypeScript v5** — strict mode in all apps and packages
- **ESLint v9 + Prettier v3** — pre-commit hook via husky + lint-staged
- **Conventional Commits** — `feat:`, `fix:`, `chore:`, `docs:`

---

## Coding Standards

### TypeScript

- Strict mode: `strict: true` in all tsconfig files
- No `any` — use `unknown` and type guards
- Interfaces for data shapes, types for unions/intersections
- Use `as const` objects instead of TypeScript enums
- Always handle `null | undefined` explicitly
- Use `@Treasure Trove/types` for shared types across apps — never redefine

### Naming Conventions

```
Files:           kebab-case     → product-card.tsx, format-price.ts
Components:      PascalCase     → ProductCard.tsx, CartDrawer.tsx
Functions:       camelCase      → formatPrice(), getCloudFrontUrl()
Constants:       UPPER_SNAKE    → REVALIDATE_SECONDS, MAX_CART_ITEMS
Types:           PascalCase     → Product, BlogPost, MaterialStory
DB tables:       snake_case     → payload_blog_posts, payload_media
DB columns:      snake_case     → created_at, published_at, wood_type
API routes:      kebab-case     → /store/products, /api/blog-posts
Env vars:        UPPER_SNAKE    → DATABASE_URL, S3_BUCKET, CLOUDFRONT_URL
Turbo tasks:     lowercase      → build, dev, lint, type-check, clean
```

### File Size Limits

- Components: Max 200 lines — extract sub-components if larger
- Services / Hooks: Max 300 lines — split into focused files if larger
- Single function: Max 50 lines — extract helpers if larger
- Payload collection configs: Max 150 lines — split fields into separate files if larger

### Import Order

```typescript
// 1. Node / external packages
import { notFound } from 'next/navigation'
import Image from 'next/image'

// 2. Internal packages (workspace)
import { formatPrice } from '@Treasure Trove/utils'
import type { Product } from '@Treasure Trove/types'

// 3. App-level absolute imports
import { medusa } from '@/lib/medusa'
import { getPayloadCollection } from '@/lib/payload'

// 4. Relative imports
import { VariantSelector } from './VariantSelector'

// 5. Type-only imports (always last)
import type { PageProps } from '@/types/page'
```

---

## Architecture Rules

### Storefront Rules

1. **App Router only** — every page is a Server Component by default
2. `"use client"` only for: cart state, wishlist, form interactions, drawer/modal open state
3. **All Medusa data** fetched via `@/lib/medusa.ts` (Medusa JS SDK instance)
4. **All Payload data** fetched via `@/lib/payload.ts` (REST client with `next.revalidate`)
5. **Never call Payload API from a client component** — fetch in Server Components, pass as props
6. **Never call Medusa API from a client component** — use Server Components or Server Actions
7. Cart state lives in Zustand store at `@/stores/cart.ts` — never in component state
8. Forms always use React Hook Form + Zod — never raw `useState` for form fields
9. No prop drilling beyond 2 levels — use Zustand or React Context
10. All images must use `next/image` — never `<img>` tags in production
11. ISR revalidation via `export const revalidate = N` per page — see cache strategy in architecture.md
12. Shared UI components go in `packages/ui` ONLY if used by 2+ pages

### Backend (Medusa) Rules

1. Custom logic lives in `apps/backend/src/modules/` — never modify Medusa core
2. Use Medusa Workflows for multi-step operations (order fulfillment, refunds)
3. Use Medusa Subscribers for event-driven logic (send email on order placed)
4. Custom API routes go in `apps/backend/src/api/` — follow Medusa's route conventions
5. Never bypass MikroORM — no raw SQL, no direct DB connections from backend
6. All Medusa configuration in `medusa-config.ts` — never scattered across files
7. Environment variables always in `.env` — never hardcoded

### CMS (Payload) Rules

1. All content schemas defined in `apps/cms/src/collections/` — one file per collection
2. All singleton documents (homepage) in `apps/cms/src/globals/`
3. Access control functions in `apps/cms/src/access/` — never inline in collection config
4. Reusable rich text blocks in `apps/cms/src/blocks/`
5. **Every collection that has a published state MUST trigger ISR revalidation** via `afterChange` hook
6. **Never store the S3 URL** — always use `generateFileURL` to return CloudFront URL
7. Media collection MUST enforce `alt` text as required — accessibility + SEO
8. Payload and Medusa share `Treasure Trove_db` — Payload tables prefixed `payload_*`

### Media / S3 Rules

1. **All images go through Payload CMS media upload** — never upload directly to S3
2. S3 bucket `Treasure Trove-media` is private — never set public ACL
3. All image URLs served via CloudFront (`cdn.Treasure Trove.in`) — never expose S3 URLs to frontend
4. `next/image` domains config must include `cdn.Treasure Trove.in` only — not the S3 bucket URL
5. Image alt text is required on every upload — enforced in Payload schema with `required: true`
6. Accepted formats: JPG, JPEG, PNG, WEBP — validate in Payload media collection
7. Max file size: 10MB — validate in Payload media collection

### Shared Package Rules

1. `@Treasure Trove/types` — source of truth for all shared types. Auto-generate from Payload using `payload generate:types`
2. `@Treasure Trove/utils` — pure functions only. No side effects, no API calls
3. `@Treasure Trove/ui` — React components only. No Medusa SDK, no Payload client
4. `@Treasure Trove/config` — config files only. No runtime code
5. Packages must never depend on `apps/*` — only `apps/*` depend on `packages/*`

---

## API Standards

### Medusa Storefront API Response (already standardised by Medusa)

```json
{ "product": { "id": "prod_01...", "title": "Ōkura Lounge Chair", "handle": "okura-lounge-chair" } }
```

### Payload REST API Response

```json
{ "docs": [ { "id": "...", "title": "Why we use teak", "slug": "why-we-use-teak" } ], "totalDocs": 12, "page": 1 }
```

### Custom API Error Format (Medusa custom routes)

```json
{ "success": false, "error": { "code": "PRODUCT_NOT_FOUND", "message": "No product found with handle: xyz", "details": {} } }
```

### ISR Revalidation Webhook (Payload → Storefront)

```json
{ "slug": "why-we-use-teak", "type": "blog" }
```

### Standard HTTP Status Codes

- 200 Success | 201 Created | 204 Deleted
- 400 Validation Error | 401 Unauthorized | 403 Forbidden
- 404 Not Found | 409 Conflict | 500 Server Error

---

## Data Flow Rules

### Product Data (Commerce)

```
Medusa Admin → PostgreSQL (medusa_* tables) → Medusa API → Next.js ISR page
```

- Products, variants, prices, inventory, collections → **always from Medusa**
- Never store commerce data in Payload

### Editorial Content (CMS)

```
Payload Admin → PostgreSQL (payload_* tables) → Payload REST API → Next.js ISR page
```

- Blog posts, material stories, homepage content → **always from Payload**
- Never store editorial content in Medusa metadata

### Media / Images

```
Payload Admin upload → AWS S3 (private) → CloudFront CDN → next/image on storefront
```

- Every image URL in the database is a CloudFront URL (`cdn.Treasure Trove.in/...`)
- Never store S3 URLs in the database

---

## Environment Variables

### apps/backend/.env

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/Treasure Trove_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=
COOKIE_SECRET=
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:9000
PORT=9000
```

### apps/cms/.env

```bash
DATABASE_URI=postgres://postgres:postgres@localhost:5432/Treasure Trove_db
PAYLOAD_SECRET=
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET=Treasure Trove-media
CLOUDFRONT_URL=https://cdn.Treasure Trove.in
STOREFRONT_URL=http://localhost:3000
REVALIDATE_SECRET=
PORT=3001
```

### apps/storefront/.env.local

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
NEXT_PUBLIC_CLOUDFRONT_URL=https://cdn.Treasure Trove.in
REVALIDATE_SECRET=
```

---

## Local Development

### Ports

| Service | URL | Notes |
|---|---|---|
| Next.js Storefront | http://localhost:3000 | Customer store |
| Medusa API | http://localhost:9000 | Commerce API |
| Medusa Admin | http://localhost:9000/app | Admin dashboard |
| Payload CMS | http://localhost:3001 | CMS API |
| Payload Admin | http://localhost:3001/admin | Content editor |
| PostgreSQL | localhost:5432 | Shared — Treasure Trove_db |
| Redis | localhost:6379 | Sessions/cache |

### Start Commands

```bash
# From repo root — starts all apps in parallel
pnpm dev

# Individual apps
pnpm dev --filter=storefront
pnpm dev --filter=backend
pnpm dev --filter=cms

# Build all (Turborepo cached)
pnpm build

# Lint all
pnpm lint

# Type-check all
pnpm type-check

# Clean all build outputs
pnpm clean
```

### Default Admin Credentials

```
Medusa Admin:   admin@Treasure Trove.com  /  Admin@123
Payload Admin:  admin@Treasure Trove.com  /  Admin@123
```

---

## Git Workflow

- **main** → Production (protected — no direct push)
- **develop** → Integration branch
- **feature/TASK-XXX-description** → Feature branches from develop
- **bugfix/BUG-XXX-description** → Bug fix branches from develop
- Squash merge only — minimum 1 approval
- Conventional commit messages required:

```
feat(storefront): add variant selector to PDP
fix(cms): correct CloudFront URL generation in media collection
chore(deps): update Medusa to 2.1.0
docs(readme): add local dev setup steps
feat(backend): add custom Razorpay webhook handler
```

---

## Turborepo Pipeline

```json
{
  "pipeline": {
    "build":      { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev":        { "cache": false, "persistent": true },
    "lint":       { "dependsOn": ["^lint"] },
    "type-check": { "dependsOn": ["^type-check"] },
    "clean":      { "cache": false }
  }
}
```

- Always run `pnpm build` from repo root — never from individual app folders in CI
- Turborepo remote cache enabled via Vercel — `npx turbo link` to activate

---

## File References for Claude Code

```
ALWAYS READ:
1. harness/claude.md              ← This file (rules & standards)
2. harness/tasks/TASK-XXX.md      ← The specific task being worked on
3. harness/architecture.md        ← System design & full architecture

READ WHEN RELEVANT:
4. harness/prd.md                 ← Product requirements
5. harness/features.json          ← All modules, screens, flows
6. harness/docs/db-schema.md      ← When doing database / Payload schema work
7. harness/docs/api-contracts.md  ← When building API routes or Medusa SDK calls
8. harness/docs/env-setup.md      ← When setting up dev environment
9. harness/docs/design-tokens.md  ← When building UI components (colors, fonts, spacing)
```

---

## What Not To Do

- Don't use `any` type — use `unknown` with type guards
- Don't use `<img>` tags — use `next/image` always
- Don't call Medusa or Payload APIs in client components — use Server Components
- Don't use `useState` for API data — fetch in Server Components or use React Query
- Don't use `useState` for form fields — use React Hook Form
- Don't use CSS-in-JS or inline styles — use Tailwind utility classes
- Don't use `console.log` — use Winston logger in backend, remove before commit in frontend
- Don't store S3 URLs in the database — always store CloudFront URLs
- Don't upload images directly to S3 — always go through Payload media upload
- Don't expose the S3 bucket publicly — always serve through CloudFront OAC
- Don't prop drill beyond 2 levels — use Zustand or React Context
- Don't commit `.env` files — use `.env.example` only
- Don't run `pnpm install` in individual app folders — always from repo root
- Don't use `synchronize: true` in any ORM config — use migrations
- Don't hardcode prices — all prices in smallest currency unit (paise for INR)
- Don't use npm or yarn — pnpm only
- Don't skip ISR revalidation hooks in Payload afterChange — storefront depends on them
- Don't add `"use client"` to pages — keep pages as Server Components
- Don't fetch both Medusa and Payload in the same file unless it's a page component