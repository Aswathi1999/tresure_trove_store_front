# TASK-069: Storefront · Collections · Frontend Unit Tests

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
Write Vitest + Testing Library unit tests for all collection UI components built in TASK-066, covering rendering, filter state changes via Zustand, breadcrumb output, empty states, and prop-driven product grid variations.

---

## Sub Tasks
- [x] `CollectionHero.test.tsx` — 7 tests: container, title, subtitle, h1 role, image renders when provided, no img without imageUrl, fallback background div
- [x] `CollectionFilter.test.tsx` — 18 tests: desktop sidebar, price slider, all 7 material buttons, result count (total + filtered), aria-pressed states, click to select/deselect material, count updates, 0-match material, clear button hidden/visible, clear resets, mobile toggle, mobile panel open/close, mobile clear button
- [x] `CollectionProductGrid.test.tsx` — 25 tests: skeleton immediately, skeleton gone after 600ms (fake timers), grid renders, cards per product, title/price display, out-of-stock overlay, in-stock no overlay, badge shown/hidden, image rendered, placeholder when no image, empty state (empty array, filtered by material, filtered by price), store-driven material/price filtering
- [x] `getFilteredCount` pure function — 6 tests: no filter, material only, price only, combined, zero price, empty array

---

## Acceptance Criteria
- [x] All 50 unit tests pass (`vitest run`)
- [x] `CollectionHero` title, subtitle, and image/fallback all tested
- [x] `CollectionFilter` Zustand integration verified: material selection updates `aria-pressed` and result count
- [x] `CollectionFilter` mobile toggle opens/closes panel; clear button appears only when filters active
- [x] `CollectionProductGrid` skeleton loading tested with `vi.useFakeTimers()` + `vi.advanceTimersByTime(600)`
- [x] `CollectionProductGrid` store-driven filtering tested by setting `useCollectionFilterStore.setState()` directly
- [x] Empty state tested for empty array, all-material-filtered, and all-price-filtered scenarios
- [x] `getFilteredCount` pure function tested independently

---

## Technical Notes
- Zustand store reset via `useCollectionFilterStore.setState({ selectedMaterial: null, maxPrice: MAX_PRICE_DEFAULT })` in `beforeEach` — no module mock needed
- Skeleton delay handled with `vi.useFakeTimers()` / `vi.advanceTimersByTime(600)` wrapped in `act()`
- `next/image` mocked as `<img>` using same pattern as other test files in the project
- `CollectionFilter` renders both desktop and mobile filter content in jsdom (CSS media queries have no effect); tests target desktop sidebar content before opening mobile panel to avoid duplicate-element ambiguity
- `getFilteredCount` tested as a pure function import — no render needed

---

## Files Created
```
apps/storefront/src/components/collections/CollectionHero.test.tsx          (7 tests)
apps/storefront/src/components/collections/CollectionFilter.test.tsx         (18 tests)
apps/storefront/src/components/collections/CollectionProductGrid.test.tsx    (25 tests + 6 pure fn tests)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## Related Test Cases
- 50 Vitest unit tests across 3 files

## Dependencies
- **Blocked by:** TASK-066
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Collections/TASK-069 — Storefront · Collections · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-29 | Completed — 50 unit tests written and passing across CollectionHero (7), CollectionFilter (18), CollectionProductGrid (25 + 6 pure fn). All use real Zustand store with beforeEach reset; fake timers handle 600ms skeleton. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-29 | 1 | Three test files, 50 tests, all green first run |

---

## Review Notes
- **—**
