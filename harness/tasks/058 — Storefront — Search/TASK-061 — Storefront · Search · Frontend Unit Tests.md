# TASK-061: Storefront · Search · Frontend Unit Tests

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
Write Vitest + Testing Library unit tests for all Search UI components, covering the SearchBar debounce behaviour, AutocompleteDropdown rendering and keyboard navigation, SearchResults grid rendering with mock data, and the NoResults empty state component.

---

## Sub Tasks
- [x] `NoResults.test.tsx` — 6 tests: container renders, query echoed in heading, all 5 browse links, correct hrefs, helper text, special characters
- [x] `AutocompleteDropdown.test.tsx` — 12 tests: hidden when closed, hidden when empty, renders when open, item count, title/price/image display, selectedIndex highlight, click navigates, closeDropdown called, setQuery called, onClose prop
- [x] `SearchBar.test.tsx` — 20 tests: renders input, placeholder, no clear when empty, clear visible when query set, value from store, setQuery on change, fetchSuggestions after 300ms debounce, debounce reset on rapid typing, clear calls setQuery('') + closeDropdown, Enter navigates, Enter with suggestion uses suggestion title, submit calls closeDropdown + onClose, blank query does not navigate, ArrowDown/ArrowUp moveSelection, Escape closeDropdown + onClose, autoFocus
- [x] `SearchResults.test.tsx` — 19 tests: heading with query, result count (plural + singular), empty → NoResults, product cards rendered, results grid, sort select, price low-to-high, price high-to-low, category filter shown/hidden, category click filters + deselects, material filter shown/hidden, material toggle + deselect, price range slider, price range filters products

---

## Acceptance Criteria
- [x] All 57 unit tests pass (`vitest run`)
- [x] `SearchBar` debounce is verified with fake timers (`vi.useFakeTimers`)
- [x] `AutocompleteDropdown` render conditions (open + non-empty) are tested
- [x] `SearchResults` category, material, and price filters are all tested
- [x] `NoResults` browse links and query echo are tested
- [x] `next/image`, `next/navigation`, `@/stores/search`, and `@/components/products/ProductCard` are mocked to keep tests isolated

---

## Technical Notes
- Zustand store mocked via `vi.mock('@/stores/search')` with mutable `mockState` reassigned in `beforeEach` — avoids store state leaking between tests
- `fetchSuggestions` debounce tested with `vi.useFakeTimers()` + `vi.advanceTimersByTime(300)` wrapped in `act()`
- `NoResults` heading uses `&lsquo;`/`&rsquo;` (curly quotes) — test uses `/No results for.*query/i` regex instead of straight-quote string
- `ProductCard` mocked as a `<div data-testid="product-card-{id}">` stub so SearchResults tests focus on grid logic, not card internals
- `autoFocus` test relies on jsdom's focus tracking via `document.activeElement`

---

## Files Created
```
apps/storefront/src/components/search/NoResults.test.tsx          (6 tests)
apps/storefront/src/components/search/AutocompleteDropdown.test.tsx  (12 tests)
apps/storefront/src/components/layout/SearchBar.test.tsx          (20 tests)
apps/storefront/src/components/search/SearchResults.test.tsx      (19 tests)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **—**

---

## Related Test Cases
- 57 Vitest unit tests across 4 files

## Dependencies
- **Blocked by:** TASK-058
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Search/TASK-061 — Storefront · Search · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-29 | Completed — 57 unit tests written and passing across NoResults (6), AutocompleteDropdown (12), SearchBar (20), SearchResults (19) |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-29 | 1 | All four test files written; one quote-entity fix needed on NoResults heading assertion |

---

## Review Notes
- **—**
