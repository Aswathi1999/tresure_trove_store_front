# TASK-021: Storefront · Products Listing · Frontend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athul |
| **Status** | ✅ Done |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Story Points** | 3 |
| **PRD Reference** | harness/prd.md §5 store-products |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-04-23 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-23 |

---

## Description
Write Vitest + Testing Library unit tests for all Products Listing components — Breadcrumb, CategoryHero, ProductCard, FilterSidebar, SortToolbar, SubcategoryChips, and Pagination. All Next.js navigation hooks and image/link modules are mocked; tests cover render states, user interactions, and URL param updates.

---

## Sub Tasks
- [x] Write unit tests for `Breadcrumb` component
- [x] Write unit tests for `CategoryHero` component
- [x] Write unit tests for `ProductCard` component
- [x] Write unit tests for `FilterSidebar` component (material filter, in-stock toggle, price slider, clear all)
- [x] Write unit tests for `SortToolbar` component (results count, sort select, URL param push)
- [x] Write unit tests for `SubcategoryChips` component (chip rendering, active state, URL push)
- [x] Write unit tests for `Pagination` component (page buttons, prev/next disabled states, URL params)

---

## Acceptance Criteria
- [x] All 7 component test files created under `apps/storefront/src/components/products/`
- [x] 76 unit tests total — all passing
- [x] Client components mock `next/navigation` (useRouter, usePathname, useSearchParams)
- [x] Server components mock `next/image` and `next/link`
- [x] URL param updates verified via `pushMock` assertions
- [x] `pnpm test --filter=storefront` passes with zero failures in products test files

---

## Technical Notes
- Client components (FilterSidebar, SortToolbar, SubcategoryChips, Pagination) mock `next/navigation` via `vi.mock` with a stable `searchParamsRef` object mutated per test in `beforeEach`
- Price slider mouseup triggers `updateParam` — tested via `fireEvent.mouseUp`
- `toLocaleString('en-IN')` used for price display — matched with regex in tests

---

## Files Created
```
CREATED:
- apps/storefront/src/components/products/Breadcrumb.test.tsx      (8 tests)
- apps/storefront/src/components/products/CategoryHero.test.tsx    (7 tests)
- apps/storefront/src/components/products/ProductCard.test.tsx     (11 tests)
- apps/storefront/src/components/products/FilterSidebar.test.tsx   (16 tests)
- apps/storefront/src/components/products/SortToolbar.test.tsx     (12 tests)
- apps/storefront/src/components/products/SubcategoryChips.test.tsx (8 tests)
- apps/storefront/src/components/products/Pagination.test.tsx      (14 tests)
```

---

## API Endpoints
N/A — unit tests only, all API interactions mocked

---

## UI Screens
- **—**

---

## Related Test Cases
- TASK-020: Integration tests for Products Listing
- TASK-018: Frontend implementation being tested

## Dependencies
- **Blocked by:** TASK-018 (Frontend)
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Products Listing/TASK-021 — Storefront · Products Listing · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-23 | Completed. 7 test files created covering all products listing components. 76 tests, all passing. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-23 | 0.5 | All 7 component test files written and verified |

---

## Review Notes
- **—**
