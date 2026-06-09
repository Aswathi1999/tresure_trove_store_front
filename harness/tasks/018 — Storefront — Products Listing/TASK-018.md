# TASK-018: Storefront — Products Listing Frontend

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
| **Created** | 2026-04-22 |
| **Completed** | 2026-04-22 |

---

## Description
Build the products listing pages and all supporting UI components for the Treasure Trove storefront. Covers the `/products`, `/collections`, and `/collections/[handle]` routes with a filter sidebar, sort toolbar, product grid, and pagination. All pages are Server Components using ISR. Filter and sort state is managed via URL search params.

---

## Sub Tasks
- [x] Create `Breadcrumb` component
- [x] Create `CategoryHero` component
- [x] Create `FilterSidebar` client component (price range, material, in-stock toggle)
- [x] Create `SortToolbar` client component (sort by, results count)
- [x] Create `SubcategoryChips` client component
- [x] Create `ProductCard` component
- [x] Create `Pagination` client component
- [x] Add `getProducts()` fetcher to `apps/storefront/src/lib/medusa.ts`
- [x] Create `/products/page.tsx` — all products listing
- [x] Create `/collections/page.tsx` — collections index
- [x] Create `/collections/[handle]/page.tsx` — dynamic collection listing

---

## Acceptance Criteria
- [x] `/products` renders a 4-col product grid on desktop, 2-col on mobile
- [x] `/collections/[handle]` resolves from homepage collection links (e.g. `/collections/decor`)
- [x] Filter sidebar updates URL params without full page reload
- [x] Sort toolbar updates URL params without full page reload
- [x] Pagination only renders when `totalPages > 1`
- [x] All pages are Server Components with `revalidate = 3600`
- [x] `pnpm type-check` passes with zero errors
- [x] No `any` types, no `<img>` tags, no inline styles

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

## API Endpoints Used
- `GET /store/products?limit=&offset=&order=` — all products with pagination
- `GET /store/products?collection_id=&limit=&offset=&order=` — collection products
- `GET /store/collections?handle=` — resolve collection by handle

---

## UI Screens
- `http://localhost:3000/products` — All products listing
- `http://localhost:3000/collections` — Collections index
- `http://localhost:3000/collections/[handle]` — e.g. `/collections/decor`, `/collections/lighting`

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** TASK-001 (project setup)
- **Blocks:** TASK-019 (Product Detail Page)

---

## Claude Code Context
```
Provide Claude Code with these files:
1. harness/claude.md (rules and standards)
2. harness/tasks/TASK-018.md (this file)
3. apps/storefront/src/lib/medusa.ts (fetchers)
4. apps/storefront/src/components/products/ (all components)
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
