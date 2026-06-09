# TASK-084: Storefront · Materials Showcase · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-04 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-04 |

---

## Description
Wire the Materials Showcase storefront pages to live Payload CMS and Medusa v2 APIs, replacing all mock data, and run Playwright E2E tests covering the materials listing page, individual material story pages, sustainability rating display, and related products filtered by `wood_type` metadata from Medusa.

---

## Sub Tasks
- [x] Define `StorefrontMaterialStory` interface and Lexical richtext helpers in `payload.ts`
- [x] Add `getMaterialStories()`, `getMaterialStoryBySlug()`, and `getAllMaterialStorySlugs()` live Payload API functions
- [x] Add `metadata` field to internal `MedusaProduct` interface in `medusa.ts`
- [x] Add `getRelatedProductsByWoodType(woodType)` to `medusa.ts` — filters Medusa products by `metadata.wood_type`
- [x] Update `MaterialCard` component to use `StorefrontMaterialStory` from `@/lib/payload`
- [x] Update `MaterialDetail` component to use `StorefrontMaterialStory` from `@/lib/payload`
- [x] Update `RelatedProductsByMaterial` component to use `HomepageProduct` from `@/lib/medusa`
- [x] Wire `/materials` listing page to live Payload API (async, `revalidate: 86400`)
- [x] Wire `/materials/[slug]` detail page to live Payload + Medusa APIs (parallel `Promise.all`)
- [x] Write Playwright E2E tests — 31 tests across 7 describe blocks

---

## Acceptance Criteria
- [x] Materials Listing Page (`/materials`) fetches data from Payload CMS REST API — no mock data
- [x] Individual Material Story Page (`/materials/[slug]`) fetches material story from Payload CMS REST API
- [x] Related products on detail page fetched from Medusa filtered by `metadata.wood_type`
- [x] ISR `revalidate` set to `86400` (24 hr) on both pages per architecture spec
- [x] `getMaterialStories()` and `getMaterialStoryBySlug()` gracefully return empty/null when CMS is offline
- [x] `getRelatedProductsByWoodType()` gracefully returns empty array when Medusa is offline
- [x] `generateStaticParams` uses live Payload slugs with fallback to the 5 known wood type slugs
- [x] Playwright E2E tests cover materials listing page structure and card rendering
- [x] Playwright E2E tests cover individual material story page structure
- [x] Playwright E2E tests cover sustainability rating display (visible, leaf icons, label)
- [x] Playwright E2E tests cover related products section (heading, "Made with" label, product links)
- [x] Playwright E2E tests cover ISR revalidation webhook (401 guards, 200 with correct paths)
- [x] Playwright E2E tests cover 404 edge case and back-navigation

---

## Technical Notes
- `StorefrontMaterialStory` is defined in `@/lib/payload` and used by all materials UI components — replaces `MockMaterialStory` from `payload.mock`
- `title` is derived from `woodType` (capitalized) since the Payload `material-stories` collection has no separate title field (`useAsTitle: 'woodType'`)
- `shortDescription` and `description` (string[]) are extracted from the Lexical richtext `description` field via `extractParagraphTexts()` — first paragraph becomes `shortDescription`
- `featuredImage` resolved from Payload Media object or plain string URL via `resolveFeaturedImage()`
- Related products fetch Medusa `/store/products?limit=50` and filter client-side by `p.metadata.wood_type` — graceful empty return if Medusa offline or no products match
- All E2E tests use `test.skip()` when CMS/Medusa are offline so they never fail in environments without running services

---

## Files to Create/Modify
```
apps/storefront/src/lib/payload.ts                                     (modified)
apps/storefront/src/lib/medusa.ts                                      (modified)
apps/storefront/src/components/materials/MaterialCard.tsx              (modified)
apps/storefront/src/components/materials/MaterialDetail.tsx            (modified)
apps/storefront/src/components/materials/RelatedProductsByMaterial.tsx (modified)
apps/storefront/src/app/materials/page.tsx                             (modified)
apps/storefront/src/app/materials/[slug]/page.tsx                      (modified)
apps/storefront/e2e/materials/materials.spec.ts                        (created)
```

---

## API Endpoints
| Method | Endpoint | Used for |
|--------|----------|----------|
| GET | `/api/material-stories?sort=woodType&limit=10&depth=1` | Materials listing page |
| GET | `/api/material-stories?where[slug][equals]={slug}&depth=1&limit=1` | Individual material story |
| GET | `/api/material-stories?limit=10&depth=0` | `generateStaticParams` slugs |
| GET | `/store/products?limit=50` | Related products (filtered client-side by `metadata.wood_type`) |

---

## UI Screens
- **Materials Listing Page** (`/materials`) — grid of material cards from live Payload CMS
- **Individual Material Story Page** (`/materials/[slug]`) — full material story with related products from live Medusa

---

## Related Test Cases
- `apps/storefront/e2e/materials/materials.spec.ts` — 31 Playwright E2E tests

## Dependencies
- **Blocked by:** TASK-082 (Frontend), TASK-083 (Backend)
- **Blocks:** TASK-085 (Frontend Unit Tests), TASK-086 (Backend Unit Tests), TASK-087 (Frontend Performance Testing), TASK-088 (Backend Performance Testing), TASK-089 (Security & Vulnerability Testing)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Materials Showcase/TASK-084 — Storefront · Materials Showcase · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-04 | Task completed. Wired `/materials` and `/materials/[slug]` to live Payload CMS + Medusa v2 APIs. Added `StorefrontMaterialStory` type with Lexical richtext adapter, `getMaterialStories` / `getMaterialStoryBySlug` / `getAllMaterialStorySlugs` to `payload.ts`, `getRelatedProductsByWoodType` to `medusa.ts`. Updated `MaterialCard`, `MaterialDetail`, `RelatedProductsByMaterial` to use live types. Created 31 Playwright E2E tests across 7 describe blocks covering listing, detail, sustainability rating, related products, ISR webhook, and 404 edge cases. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
