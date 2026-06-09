# TASK-060: Storefront · Search · Integration Testing

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
Wire the Search UI to the real Medusa Search API via the Medusa JS SDK, replacing all mock data with live search calls. Write Playwright E2E tests covering the full search journey: typing a query, seeing live autocomplete, navigating to results, and verifying the no-results state.

---

## Sub Tasks
- [x] Add `SearchProduct` type to `medusa.ts` (extends `HomepageProduct` with `priceAmount`, optional `category`/`material`)
- [x] Add `searchProducts(query, limit)` server function to `medusa.ts` — calls `GET /store/products?q=<query>` with `revalidate: 0`
- [x] Add `getSearchSuggestions(query)` client-safe function to `medusa.ts` — bare fetch (no Next.js cache headers), returns top 5
- [x] Update `search.mock.ts` to re-export `SearchProduct` from `medusa.ts`; fix optional `category`/`material` in filter functions
- [x] Update `stores/search.ts` — `fetchSuggestions` is now async and calls `getSearchSuggestions` instead of mock
- [x] Update `search/page.tsx` — fetch `initialProducts` server-side via `searchProducts(q)`, pass as prop to `SearchResults`
- [x] Update `SearchResults.tsx` — accept `initialProducts` prop, remove mock import, compute filter options dynamically from actual results, guard optional `category`/`material` in filter logic
- [x] Add `data-testid="navbar-search-trigger"` to Navbar search open button
- [x] Write Playwright E2E tests in `e2e/search/search.spec.ts`

---

## Acceptance Criteria
- [x] Typing in the search bar triggers a real API call to `GET /store/products?q=<query>&limit=5`
- [x] Autocomplete suggestions come from the live Medusa API (falls back gracefully when DB is empty)
- [x] Search results page fetches products server-side via `searchProducts(q)` on every request
- [x] No-results state renders when the API returns zero products
- [x] Category and material filters render dynamically from actual product data (hidden when data has none)
- [x] Price sort works off real `priceAmount` values extracted from INR variant prices
- [x] All E2E tests pass: overlay open/close, typing, clear, Escape, Enter navigation, autocomplete, keyboard selection, results page, no-results state

---

## Technical Notes
- `SearchProduct` defined in `medusa.ts` (not `search.mock.ts`) to avoid circular imports — `search.mock.ts` re-exports it
- `category` and `material` are optional in `SearchProduct` — real API products don't carry them; mock data still has full values
- `getSearchSuggestions` omits `next` cache options since it runs client-side from the Zustand store
- `searchProducts` uses `revalidate: 0` so search results are never stale
- `priceAmount` extracted from INR variant price (paise ÷ 100 = rupees)
- Collections page `[handle]/page.tsx` bugfix applied in same session: wired up `getAllCollectionHandles`, `getCollectionMock`, `CollectionHero`, `CollectionFilter`, `CollectionProductGrid` imports that were missing

---

## Files Created/Modified
```
apps/storefront/src/lib/medusa.ts               (SearchProduct type + searchProducts + getSearchSuggestions)
apps/storefront/src/lib/search.mock.ts          (re-exports SearchProduct from medusa.ts; optional field guards)
apps/storefront/src/stores/search.ts            (fetchSuggestions → async real API call)
apps/storefront/src/app/search/page.tsx         (server-side fetch, passes initialProducts)
apps/storefront/src/components/search/SearchResults.tsx  (initialProducts prop, dynamic filters)
apps/storefront/src/components/layout/Navbar.tsx         (data-testid on search trigger)
apps/storefront/e2e/search/search.spec.ts       (NEW — 13 Playwright E2E tests)
apps/storefront/src/app/collections/[handle]/page.tsx    (bugfix — wired missing imports)
```

---

## API Endpoints
- `GET /store/products?q=<query>` — full-text product search (page-level fetch)
- `GET /store/products?q=<query>&limit=5` — autocomplete suggestions (client-side, from Zustand store)

---

## UI Screens
- **Search Bar with Autocomplete Overlay** — live suggestions from real API
- **Search Results Page** — server-rendered product grid with dynamic filters
- **No Results State** — renders when API returns zero products

---

## Related Test Cases
- `e2e/search/search.spec.ts` — 13 Playwright E2E tests

## Dependencies
- **Blocked by:** TASK-058, TASK-059
- **Blocks:** TASK-063, TASK-064, TASK-065

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Search/TASK-060 — Storefront · Search · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-29 | Completed — SearchProduct type moved to medusa.ts, searchProducts + getSearchSuggestions added, Zustand store wired to real API, search page fetches server-side, SearchResults uses initialProducts with dynamic filters, 13 Playwright E2E tests written, Navbar search trigger testid added, collections page missing-import bugfix applied |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-29 | 1 | Full integration — API wiring, store update, page + component refactor, E2E tests |

---

## Review Notes
- **—**
