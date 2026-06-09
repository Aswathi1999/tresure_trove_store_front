# TASK-082: Storefront · Materials Showcase · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Lijina-p |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-27 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-27 |

---

## Description
Build all Materials Showcase screens for the Storefront (Next.js 15). This includes a Materials Listing Page displaying a grid of the 5 wood types (Teak, Walnut, Oak, Mango, Rosewood) and an Individual Material Story Detail Page per wood type. All screens must be fully functional UI with mock data for sustainability rating, origin, rich text description, featured image, and related products. No real API calls yet — use mock data that will be replaced in TASK-084.

---

## Sub Tasks
- [x] Create mock data file with 5 material stories (teak, walnut, oak, mango, rosewood) including sustainability rating, origin, description, image, and related product stubs
- [x] Build MaterialCard component (image, name, origin, sustainability rating badge)
- [x] Build SustainabilityRating component (1–5 scale visual indicator)
- [x] Build Materials Listing Page (`/materials`) — responsive grid of 5 MaterialCards with ISR export
- [x] Build MaterialDetail component (featured image, full rich text description, origin, sustainability rating)
- [x] Build RelatedProductsByMaterial component (product card grid stub with mock products)
- [x] Build Individual Material Story Page (`/materials/[slug]`) with ISR export and `generateStaticParams` for 5 slugs
- [x] Add `data-testid` attributes to all interactive and key display elements
- [x] Ensure all images use `next/image` with CloudFront domain placeholder

---

## Acceptance Criteria
- [x] Materials Listing Page (`/materials`) renders a grid of 5 wood type cards with name, origin country, featured image, and sustainability rating
- [x] Each MaterialCard links to `/materials/[slug]` using the wood type slug
- [x] SustainabilityRating component visually renders a 1–5 scale (e.g., leaf icons or numbered indicators) and accepts a numeric prop
- [x] Individual Material Story Page (`/materials/[slug]`) renders full content: featured image, origin, sustainability rating, rich text description, and related products section
- [x] RelatedProductsByMaterial component renders a grid of mock product cards with image, name, and price placeholders
- [x] `generateStaticParams` returns all 5 wood type slugs so pages are statically generated at build time
- [x] Pages export `export const revalidate = 3600` (ISR — 1 hour) as per architecture rules
- [x] All images use `next/image` — no `<img>` tags
- [x] No real API calls are made — all data sourced from `src/lib/materials.mock.ts`
- [x] All interactive and key display elements have `data-testid` attributes
- [x] Pages and components are mobile-first and responsive using Tailwind CSS v4 utility classes
- [x] No `"use client"` directive on page components — pages remain Server Components

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/materials/page.tsx
apps/storefront/src/app/materials/[slug]/page.tsx
apps/storefront/src/components/materials/MaterialCard.tsx
apps/storefront/src/components/materials/MaterialDetail.tsx
apps/storefront/src/components/materials/SustainabilityRating.tsx
apps/storefront/src/components/materials/RelatedProductsByMaterial.tsx
apps/storefront/src/lib/materials.mock.ts
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **Materials Listing Page** (`/materials`) — grid of 5 wood type MaterialCards
- **Individual Material Story Page** (`/materials/[slug]`) — full material story with featured image, origin, sustainability rating, rich text, and related products

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-084 (Integration Testing), TASK-085 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Materials Showcase/TASK-082 — Storefront · Materials Showcase · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-27 | Task completed. Built materials.mock.ts with 5 wood types (teak, walnut, oak, mango, rosewood) + 6 mock product stubs. Built SustainabilityRating (1–5 Leaf icons), MaterialCard, MaterialDetail (hero image with overlaid title, origin + rating meta bar, paragraph body), RelatedProductsByMaterial (3-up product grid). Built /materials listing page and /materials/[slug] detail page with generateStaticParams, notFound() guard, and ISR. All data-testids in place, no real API calls. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
