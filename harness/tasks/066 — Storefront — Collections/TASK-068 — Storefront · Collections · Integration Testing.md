# TASK-068: Storefront · Collections · Integration Testing

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
Wire the collection landing pages to the real Medusa Collections API, replacing mock data from TASK-066 with live SDK calls implemented in TASK-067. Write Playwright E2E tests covering all collection screens, filter interactions, breadcrumb navigation, and edge cases (empty collection, not-found handle).

---

## Sub Tasks
- [x] Update `collections/[handle]/page.tsx` to call `getCollectionByHandle(handle)` and `getProductsByCollection(collectionId)` from `medusa.ts`
- [x] Add `toMockProduct()` mapper — converts `HomepageProduct` → `MockProduct` (parsing `priceValue` from formatted price string) so existing components remain unchanged
- [x] Graceful fallback — if Medusa collection not found, fall back to `getCollectionMock(handle)`; if both null, `notFound()`
- [x] Supplemental UI data (subtitle, heroImageUrl) sourced from mock when not in Medusa metadata
- [x] Add `data-testid="collection-page"` and `data-testid="collection-product-count"` to the page
- [x] Write Playwright E2E tests in `e2e/collections/collections.spec.ts`

---

## Acceptance Criteria
- [x] Collection page uses `getCollectionByHandle` + `getProductsByCollection` from `medusa.ts` for all live data
- [x] Page renders correctly when Medusa is not seeded (falls back to mock data)
- [x] `notFound()` called only when both Medusa and mock return null (truly unknown handle)
- [x] `revalidate = 3600` on the collection page
- [x] All five collection handles render without error: `living-room`, `dining`, `bedroom`, `home-office`, `outdoor`
- [x] Price range filter reduces grid, empty state shown when all filtered out
- [x] Clear filters button restores the grid
- [x] Material filter buttons present and update result count
- [x] Breadcrumb navigation works (Home → Collections → collection page)
- [x] Unknown handle returns 404
- [x] All E2E tests pass

---

## Technical Notes
- `HomepageProduct` (from Medusa SDK) lacks `priceValue`, `material`, `inStock` — `toMockProduct()` maps these: `priceValue` parsed from formatted string, `material: ''` (no material data in Medusa list endpoint), `inStock: true` (inventory not in list view)
- Material filter buttons remain visible but selecting one shows 0 results for real products (no material tags mapped); this is expected at this stage
- Skeleton loading (600ms) in `CollectionProductGrid` requires `waitFor` helper in E2E tests
- E2E price-range tests drive the slider via `evaluate()` + `dispatchEvent('input')` — `fill()` alone doesn't trigger React state updates on range inputs

---

## Files Created/Modified
```
apps/storefront/src/app/collections/[handle]/page.tsx   (wired to Medusa API, fallback to mock, new data-testids)
apps/storefront/e2e/collections/collections.spec.ts     (NEW — 20 Playwright E2E tests)
```

---

## API Endpoints
- `GET /store/collections?handle=<handle>` — fetch single collection by handle
- `GET /store/products?collection_id[]=<id>&limit=50` — fetch products for a collection

---

## UI Screens
- Collection Hero
- Collection Product Grid
- Filter Sidebar (price range, material)
- Empty Collection state
- Breadcrumb Navigation
- 404 for unknown handle

---

## Related Test Cases
- `e2e/collections/collections.spec.ts` — 20 Playwright E2E tests

## Dependencies
- **Blocked by:** TASK-066, TASK-067
- **Blocks:** TASK-071, TASK-072, TASK-073

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Collections/TASK-068 — Storefront · Collections · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-29 | Completed — page wired to Medusa API with graceful mock fallback, toMockProduct mapper added, 20 Playwright E2E tests written covering hero, breadcrumb, grid, filters, empty state, all 5 handles, and 404 edge case |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-29 | 1 | API wiring, fallback strategy, mapper, E2E tests |

---

## Review Notes
- **—**
