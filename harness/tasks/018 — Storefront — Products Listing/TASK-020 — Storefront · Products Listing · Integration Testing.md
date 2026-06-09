# TASK-020: Storefront · Products Listing · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Claude Code |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-22 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-22 |

---

## Description
Replace all mock product list functions with real Medusa JS SDK v2 calls and wire the filter, sort, and pagination state to live API query params. Write Playwright E2E tests covering the full products listing flow including filtering, sorting, pagination, and edge cases.

---

## Sub Tasks
- [x] Extend `getProducts()` with material, maxPrice, inStock params
- [x] Update products page to read all filter searchParams and pass to `getProducts()`
- [x] Add `data-testid` attributes to ProductCard, FilterSidebar, SortToolbar, Pagination, and page
- [x] Write Playwright E2E tests — 52 tests, 42 passed, 10 skipped (pagination/card tests skip when no products seeded)

---

## Acceptance Criteria
- [x] `getProducts()` wired to material (client-side tag filter), maxPrice (client-side price filter), inStock (client-side inventory filter), sort (server-side order param), and page (server-side offset)
- [x] FilterSidebar URL params (`material`, `maxPrice`, `inStock`) are read server-side and applied on each render
- [x] Sort and pagination params (`sort`, `page`) continue to work as before
- [x] Playwright E2E tests cover page structure, sort, material filters, in-stock filter, price range, clear filters, pagination, product cards, and edge cases
- [x] All tests pass with 0 failures (10 skip gracefully when backend has no seeded products)

---

## Technical Notes
- Client-side filters (material, maxPrice, inStock) fetch up to 200 products and paginate in-memory so count accuracy is maintained for the filtered set
- Material matching compares tag values case-insensitively (`p.tags.some(t => t.value.toLowerCase() === mat)`)
- maxPrice from URL is in INR rupees; Medusa stores prices in paise — conversion: `maxPrice * 100`
- inStock filter checks `variant.inventory_quantity > 0`; defaults to `true` if quantity is absent from API response
- Pagination tests skip gracefully when fewer than 12 products exist in the backend

---

## Files to Create/Modify
```
apps/storefront/src/lib/medusa.ts                         — extended getProducts(), added inventory_quantity to MedusaProduct
apps/storefront/src/app/products/page.tsx                 — reads material, maxPrice, inStock from searchParams
apps/storefront/src/components/products/ProductCard.tsx   — data-testid="product-card-{id}"
apps/storefront/src/components/products/FilterSidebar.tsx — data-testid on sidebar, buttons, toggle, slider, count
apps/storefront/src/components/products/SortToolbar.tsx   — data-testid on toolbar, select, results count
apps/storefront/src/components/products/Pagination.tsx    — data-testid on container and page buttons
apps/storefront/e2e/products/products.spec.ts             — 52 Playwright E2E tests (NEW)
```

---

## API Endpoints
- `GET /store/products?limit=&offset=&order=` — server-side pagination and sort
- Material, maxPrice, inStock applied client-side after fetch

---

## UI Screens
- `/products` — Products listing with filter sidebar, sort toolbar, grid, pagination

---

## Related Test Cases
- `e2e/products/products.spec.ts` — 52 tests across 9 suites

## Dependencies
- **Blocked by:** TASK-018 (Frontend), TASK-019 (Backend)
- **Blocks:** TASK-023 (Frontend Performance Testing), TASK-024 (Backend Performance Testing), TASK-025 (Security & Vulnerability Testing)

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Products Listing/TASK-020 — Storefront · Products Listing · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-22 | Task started. Extended `getProducts()` with material, maxPrice, inStock params. Updated products page to pass all filter searchParams. Added `data-testid` to all products listing components. Created `e2e/products/products.spec.ts` with 52 E2E tests. First run: 2 failures (breadcrumb strict-mode, price label strict-mode) — fixed selector scoping. Final run: 42 passed, 10 skipped, 0 failed. Task completed. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-22 | 1 | Integration wiring + data-testid attributes + 52 E2E tests |

---

## Review Notes
- 10 pagination/product-card tests skip automatically when the Medusa backend has fewer than 12 products seeded — they will activate once seed data is in place
- Client-side filtering for material/maxPrice/inStock is intentional: Medusa store API does not support tag-value filtering or price-range filtering natively at the store level without a region context
