# TASK-011: Storefront · Homepage · Backend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Akshay |
| **Status** | ✅ Done |
| **Priority** | P0 |
| **Sprint** | Sprint 1 |
| **Story Points** | NaN |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-14 |
| **Due Date** | 2026-04-14 |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-14 |

---

## Description
Set up the backend data layer that powers the homepage: verify the Medusa v2 store products and collections endpoints are correctly configured and seeded with sample data, create the Payload CMS global schema for homepage content (hero, marquee, brand philosophy), and initialise the storefront SDK and REST clients. This task establishes the real data sources that TASK-012 will wire into the frontend components.

---

## Sub Tasks
- [ ] Verify Medusa store products endpoint (`GET /store/products`) returns product list with images, prices, and variants
- [ ] Verify Medusa store collections endpoint (`GET /store/collections`) returns collections with handle and thumbnail
- [ ] Seed Medusa with at least 4 sample products and 4 sample collections for homepage display
- [ ] Create Payload CMS `HomepageContent` global schema in `apps/cms/src/globals/HomepageContent.ts`
- [x] Add hero fields to global: headline (text), subtext (text), CTA label (text), CTA link (text), background image (upload relationship)
- [x] Add marquee fields: array of announcement strings with order control
- [x] Add brand philosophy fields: heading (text), body (richText), supporting image (upload relationship)
- [ ] Seed Payload CMS HomepageContent global with sample content via Payload admin
- [x] Initialise Medusa JS SDK v2 client in `apps/storefront/src/lib/medusa.ts`
- [x] Initialise Payload REST client in `apps/storefront/src/lib/payload.ts` with `next.revalidate` tags
- [x] Configure `next/image` domains to include `cdn.treasuretrove.in` in `next.config.ts`
- [x] Configure Payload afterChange hook on HomepageContent global to trigger ISR revalidation on the storefront

---

## Acceptance Criteria
- [ ] `GET /store/products?limit=4` returns products with `title`, `thumbnail`, `variants[].prices`, and `handle`
- [ ] `GET /store/collections` returns collections with `title`, `handle`, and `thumbnail`
- [x] Payload `HomepageContent` global is accessible via `GET /api/globals/homepage-content` and returns all hero, marquee, and brand philosophy fields
- [x] Medusa SDK client in `apps/storefront/src/lib/medusa.ts` is initialised with `NEXT_PUBLIC_MEDUSA_BACKEND_URL` and publishable key from environment
- [x] Payload REST client in `apps/storefront/src/lib/payload.ts` wraps fetch with `next: { revalidate: 60, tags: ['homepage'] }`
- [x] Payload afterChange hook on HomepageContent triggers a `revalidateTag('homepage')` call to the storefront revalidation endpoint
- [x] `next/image` is configured to allow `cdn.treasuretrove.in` as a remote image hostname
- [x] All secrets and URLs are loaded from environment variables — no hardcoded values in source files

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/backend/src/ (verify Medusa store products endpoint configured)
apps/storefront/src/lib/medusa.ts
apps/storefront/src/lib/payload.ts
apps/cms/src/globals/HomepageContent.ts
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-012, TASK-014

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Homepage/TASK-011 — Storefront · Homepage · Backend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-14 | Created `HomepageContent.ts` global (hero, marquee, brand philosophy fields + ISR hook). Updated `payload.config.ts` to use new global (slug: `homepage-content`). Added `getHomepageContent` helper to `payload.ts` with `revalidate: 60, tags: ['homepage']`. Medusa SDK client, `next/image` config, and revalidation hook were already in place. Manual steps outstanding: seed Medusa products/collections and Payload HomepageContent via admin. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
