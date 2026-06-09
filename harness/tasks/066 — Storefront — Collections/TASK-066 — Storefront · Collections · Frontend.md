# TASK-066: Storefront · Collections · Frontend

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
| **Start Date** | 2026-04-24 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-24 |

---

## Description
Build all collection landing page UI for the Treasure Trove storefront using mock data. This includes the collection hero section, a product grid filtered to a collection, filter options within a collection, and breadcrumb navigation. Pages cover the five core collections — Living Room, Dining, Bedroom, Home Office, and Outdoor — plus edge case screens for empty and not-found states. No real API calls — use mock data from `collections.mock.ts` that will be replaced in TASK-068.

---

## Sub Tasks
- [x] Create mock data file `apps/storefront/src/lib/collections.mock.ts` with 5 collections and sample products
- [x] Build `CollectionHero.tsx` — full-width hero with collection title, subtitle, and background image
- [x] Build `CollectionProductGrid.tsx` — responsive product grid pre-filtered to a collection with loading skeleton
- [x] Build `CollectionFilter.tsx` — sidebar/inline filter panel (category, price range, material) with Zustand state
- [x] Build `Breadcrumb.tsx` shared UI component — Home › Collections › [Collection Name]
- [x] Build `apps/storefront/src/app/collections/[handle]/page.tsx` — wires all sub-components with mock data
- [x] Implement empty collection state UI (zero products in grid)
- [x] Implement collection not found state (404-style UI within page)
- [x] Add `data-testid` attributes to all interactive elements
- [x] Ensure all images use `next/image` with placeholder CloudFront domain

---

## Acceptance Criteria
- [x] Collection page renders for all five handles: `living-room`, `dining`, `bedroom`, `home-office`, `outdoor`
- [x] `CollectionHero` displays collection name, a short description, and a full-width hero image
- [x] `CollectionProductGrid` renders a responsive grid (2-col mobile, 3-col tablet, 4-col desktop) of products
- [x] Products displayed in the grid are scoped to the current collection (filtered by mock handle)
- [x] `CollectionFilter` panel supports filtering by material and price range; Zustand state updates the grid without page reload
- [x] `Breadcrumb` displays correct hierarchy: Home › Collections › [Collection Name]
- [x] Empty collection state displays a message and a CTA linking back to all collections
- [x] Collection not found state renders an appropriate message with a link home
- [x] All screens are mobile-first and use Tailwind CSS v4 utility classes only
- [x] No `<img>` tags — all images use `next/image`
- [x] All interactive elements have `data-testid` attributes
- [x] No real API calls — all data sourced from `collections.mock.ts`

---

## Technical Notes
- **—**

---

## Files to Create/Modify
```
apps/storefront/src/app/collections/[handle]/page.tsx
apps/storefront/src/components/collections/CollectionHero.tsx
apps/storefront/src/components/collections/CollectionProductGrid.tsx
apps/storefront/src/components/collections/CollectionFilter.tsx
apps/storefront/src/components/ui/Breadcrumb.tsx
apps/storefront/src/lib/collections.mock.ts
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- Collection Hero
- Collection Product Grid (filtered)
- Filter within Collection
- Breadcrumb Navigation
- Empty Collection (edge case)
- Collection Not Found (edge case)

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-068, TASK-069

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Collections/TASK-066 — Storefront · Collections · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-24 | Task completed. Built all collection UI with mock data — CollectionHero, CollectionProductGrid, CollectionFilter (Zustand), shared Breadcrumb, [handle]/page.tsx with not-found state. Also replaced TT placeholder logo with actual logo.jpg in Navbar, MobileHeader, Footer, and MobileSidebar. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| — | — | No time logged |

---

## Review Notes
- **—**
