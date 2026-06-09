# TASK-154: Payload CMS · Material Stories · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | — |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-29 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-29 |

---

## Description
Build the storefront materials listing page and individual material story detail page that display Payload CMS material story content to customers. Use mock Payload REST API responses — no live Payload API calls yet. The listing page shows a grid of `MaterialCard` components for the 5 wood types (Teak, Walnut, Oak, Mango, Rosewood). The detail page renders the material name, wood type label, sustainability rating (1–5 stars), featured image via CloudFront, and description paragraphs. All pages use Next.js ISR with `export const revalidate = 60`.

---

## Sub Tasks
- [x] Add `MockMaterialStory` interface + `WoodType` enum to `apps/storefront/src/lib/payload.mock.ts`
- [x] Add 5 material story fixtures to `payload.mock.ts` (Teak, Walnut, Oak, Mango, Rosewood)
- [x] Add `getMaterialStories()`, `getMaterialStoryBySlug()`, `getAllMaterialStorySlugs()` to `payload.mock.ts`
- [x] Build `MaterialCard` component — featured image (next/image), material name, wood type badge, origin, sustainability rating, short description, CTA link; all key elements have `data-testid`
- [x] Build `SustainabilityRating` component — renders 1–5 filled leaf icons; each leaf has `data-testid="leaf-{n}"`
- [x] Build `MaterialDetail` component — hero image, wood type badge, name, origin, sustainability rating, short description, description paragraphs; all key elements have `data-testid`
- [x] Build `RelatedProductsByMaterial` component — conditional product grid section
- [x] Build materials listing page `apps/storefront/src/app/materials/page.tsx` — ISR `revalidate = 60`, grid of MaterialCards, `data-testid="materials-listing-page"` + `data-testid="materials-grid"`
- [x] Build material detail page `apps/storefront/src/app/materials/[slug]/page.tsx` — ISR `revalidate = 60`, `generateStaticParams`, `notFound()` guard, `data-testid="material-story-page"`
- [x] Validate all images use `next/image`; no `"use client"` on page components

---

## Acceptance Criteria
- [x] Materials listing page renders a responsive 3-column grid of `MaterialCard` components from mock data covering all 5 wood types
- [x] Each `MaterialCard` displays featured image, material name, wood type badge, origin, and sustainability rating
- [x] Clicking a `MaterialCard` navigates to `/materials/[slug]`
- [x] Material detail page renders featured image full-width, material name, wood type badge, origin, sustainability rating, short description, and description paragraphs
- [x] `SustainabilityRating` correctly renders the correct number of filled leaf icons out of 5 for ratings 1–5
- [x] Listing page exports `export const revalidate = 60`
- [x] Detail page exports `export const revalidate = 60` and uses `generateStaticParams` with mock slugs for all 5 wood types
- [x] `notFound()` is called when a slug does not match any mock material story
- [x] No `"use client"` on page components — pages are Server Components
- [x] All key elements have `data-testid` attributes

---

## Technical Notes
- `MockMaterialStory` defined in `payload.mock.ts` to match the Payload CMS `materialStory` collection schema from the PRD (`id, title, slug, woodType, origin, sustainabilityRating, shortDescription, description[], featuredImage{url, alt}`)
- `materials.mock.ts` retained for `getRelatedProducts()` (product data, not material story data); detail page imports from both
- Images use `lh3.googleusercontent.com` in mock (working dev URLs); production will use `cdn.treasuretrove.in` via Payload's S3/CloudFront pipeline
- Wood type badge added to both `MaterialCard` and `MaterialDetail` showing the `woodType` enum value

---

## Files Created/Modified
```
apps/storefront/src/lib/payload.mock.ts            (added MockMaterialStory + WoodType + 5 fixtures + 3 functions)
apps/storefront/src/app/materials/page.tsx         (imports from payload.mock, revalidate=60, data-testid on grid)
apps/storefront/src/app/materials/[slug]/page.tsx  (imports from payload.mock, revalidate=60)
apps/storefront/src/components/materials/MaterialCard.tsx    (uses MockMaterialStory, wood type badge added)
apps/storefront/src/components/materials/MaterialDetail.tsx  (uses MockMaterialStory, wood type badge added, data-testid on short-description)
apps/storefront/src/components/materials/SustainabilityRating.tsx  (pre-existing, complete)
apps/storefront/src/components/materials/RelatedProductsByMaterial.tsx  (pre-existing, complete)
```

---

## API Endpoints
N/A — this task uses mock data only; real Payload REST wiring happens in TASK-156

---

## UI Screens
- **Materials Listing** — dark ink hero, 3-column responsive grid of MaterialCards
- **Material Detail** — full-width hero image with gradient overlay, metadata row, description body
- **SustainabilityRating** — 1–5 leaf icons (filled = brown, empty = outline)

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-156 (Integration Testing), TASK-157 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Payload CMS — Material Stories/TASK-154 — Payload CMS · Material Stories · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-29 | Completed — MockMaterialStory type + 5 fixtures added to payload.mock.ts, pages updated to use payload.mock with revalidate=60, MaterialCard + MaterialDetail updated to MockMaterialStory with wood type badges, all data-testid attributes verified |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-29 | 1 | Mock data, page wiring, component type updates, wood type badges |

---

## Review Notes
- **—**
