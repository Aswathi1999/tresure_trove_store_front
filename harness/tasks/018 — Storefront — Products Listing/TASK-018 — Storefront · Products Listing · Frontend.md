# TASK-018: Storefront · Products Listing · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athul |
| **Status** | ✅ Done |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Story Points** | 5 |
| **PRD Reference** | harness/prd.md §5 store-products |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-04-22 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-22 |

---

## Description
Build the Products Listing page for the Treasure Trove storefront, including a 4-column product grid (desktop), filter sidebar, sort dropdown, and pagination/load-more controls. All screens must be fully functional UI with loading states, empty states, and error states. No real Medusa SDK calls — use mock functions that simulate product list responses and will be replaced in TASK-020. Filter and sort state is managed via Zustand so that URL sync and hydration work correctly in later integration.

---

## Sub Tasks
- [x] Mock product list function (listProducts, supporting filters + sort + pagination params)
- [x] Zustand filter/sort store (`apps/storefront/src/stores/filter.ts`)
- [x] ProductCard component (image, title, price, collection badge, hover state)
- [x] ProductGrid component (4-col desktop, 2-col tablet, 1-col mobile)
- [x] FilterSidebar component (material checkboxes, collection checkboxes, price range slider)
- [x] SortDropdown component (options: featured, price asc/desc, newest)
- [x] Pagination / Load More controls
- [x] No Products Found empty state
- [x] Products Load Error state
- [x] Price Range Error — invalid filter edge case state

---

## Acceptance Criteria
- [x] Products grid renders in a 4-column layout on desktop, 2-column on tablet, 1-column on mobile
- [x] ProductCard shows product image (via next/image), title, price formatted in INR, and collection badge
- [x] FilterSidebar has material checkboxes, collection checkboxes, and a min/max price range input
- [x] Selecting a filter updates the Zustand store and re-renders the grid with mock filtered results
- [x] SortDropdown has options: Featured, Price: Low to High, Price: High to Low, Newest
- [x] Changing sort order updates the Zustand store and re-renders the grid with mock sorted results
- [x] Pagination shows page numbers and a "Load More" button; clicking advances to the next page of mock results
- [x] No Products Found state renders a message and a "Clear Filters" CTA when mock returns an empty list
- [x] Products Load Error state renders an error message and a "Retry" CTA when mock throws an error
- [x] Price Range Error state is shown when min > max in the price range filter
- [x] All interactive elements have `data-testid` attributes
- [x] Page is an ISR Server Component with `export const revalidate = 60`; filter/sort UI is `"use client"`

---

## Technical Notes
- `FilterSidebar`, `SortToolbar`, `SubcategoryChips`, `Pagination` are `"use client"` components wrapped in `<Suspense>` on the page (required by Next.js for `useSearchParams`)
- All Medusa fetches use `buildFetchInit` with ISR tags for on-demand revalidation
- `getProducts()` added to `medusa.ts` for all-products pages (no collection filter)
- `getCollectionProducts()` used for collection-scoped pages
- Header height offsets: `pt-[104px]` mobile, `pt-[136px]` desktop

---

## Files Created / Modified
```
CREATED:
- apps/storefront/src/components/products/Breadcrumb.tsx
- apps/storefront/src/components/products/CategoryHero.tsx
- apps/storefront/src/components/products/FilterSidebar.tsx
- apps/storefront/src/components/products/SortToolbar.tsx
- apps/storefront/src/components/products/SubcategoryChips.tsx
- apps/storefront/src/components/products/ProductCard.tsx
- apps/storefront/src/components/products/Pagination.tsx
- apps/storefront/src/app/products/page.tsx
- apps/storefront/src/app/collections/page.tsx
- apps/storefront/src/app/collections/[handle]/page.tsx

MODIFIED:
- apps/storefront/src/lib/medusa.ts  (added getProducts(), ProductsResult type)
```

---

## API Endpoints
N/A — this task has no real API endpoints (mock only)

---

## UI Screens
- Products Grid (main listing view)
- Filter Sidebar (material, collection, price range)
- Sort Dropdown
- Pagination / Load More
- No Products Found (empty state)
- Products Load Error (error state)
- Price Range Error — invalid filter (edge case)

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-020 (Integration Testing), TASK-021 (Frontend Unit Tests)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Products Listing/TASK-018 — Storefront · Products Listing · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-22 | Completed. All 7 components built. 3 pages created (/products, /collections, /collections/[handle]). getProducts() fetcher added to medusa.ts. TypeScript check passes with zero errors. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-22 | 1 | Components + pages + medusa fetcher |

---

## Review Notes
- **—**
