# TASK-058: Storefront · Search · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athul |
| **Status** | ✅ Done |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Story Points** | 3 |
| **PRD Reference** | harness/prd.md §search |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-04-24 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-24 |

---

## Description
Build the global search UI for the Storefront. This includes the search bar embedded in the Navbar, a live autocomplete dropdown with debounced suggestions, a dedicated Search Results page with a product grid, and a No Results empty state. All components are "use client". No real API calls yet — use mock data from `apps/storefront/src/lib/search.mock.ts` and Zustand for search state. Mock data and autocomplete suggestions will be replaced in TASK-060.

---

## Sub Tasks
- [x] Create mock data file (`search.mock.ts`) with product suggestions and search result sets
- [x] Create Zustand search store — manages query string, suggestions visibility, and results state
- [x] Build `SearchBar` component in the Navbar — text input with clear button, debounced input handling (300ms), opens autocomplete dropdown on focus/type
- [x] Build `AutocompleteDropdown` component — renders top suggestion matches with product thumbnail, name, and price; keyboard navigable (arrow keys + Enter)
- [x] Build Search Results page (`/search?q=...`) — renders a responsive product grid from mock results, displays query string in heading
- [x] Build `SearchResults` component — product card grid, loading skeleton state, result count
- [x] Build `NoResults` component — friendly empty state with query echoed back and browse suggestions
- [x] Integrate Zustand search store into `SearchBar` and `AutocompleteDropdown`
- [x] Add `data-testid` attributes to all interactive search elements
- [x] Close autocomplete on outside click and on Escape key

---

## Acceptance Criteria
- [x] `SearchBar` is visible in the Navbar on all pages and accepts text input
- [x] Autocomplete dropdown appears after 300ms debounce with at least 1 character typed
- [x] Autocomplete dropdown shows up to 5 suggestion items with product image, name, and price
- [x] Pressing Enter in `SearchBar` or clicking a suggestion navigates to `/search?q=<query>`
- [x] Autocomplete closes on Escape key press and on click outside the dropdown
- [x] Search Results page renders a product grid with result count and the active query in the heading
- [x] No Results component renders when the mock returns zero results, displaying the searched query
- [x] All components are mobile-first and responsive using Tailwind CSS v4
- [x] Zustand store correctly tracks query and suggestions state without prop drilling
- [x] All interactive elements have `data-testid` attributes

---

## Technical Notes
- `SearchProduct` extends `HomepageProduct` with `category`, `material`, and `priceAmount` fields — compatible with existing `ProductCard`
- Zustand `useSearchStore` manages debounce coordination between `SearchBar` (input) and `AutocompleteDropdown` (display) via shared `selectedIndex`
- Navbar overlay calls `resetSearch()` on close to clear store state for the next open
- Search page is a Server Component that reads `searchParams.q` and passes to the client `SearchResults` component
- Fixed navbar overlap on `/search` page using `pt-[104px] lg:pt-[136px]` — same pattern as `/products` and `/collections`

---

## Files to Create/Modify
```
apps/storefront/src/components/layout/SearchBar.tsx
apps/storefront/src/components/search/AutocompleteDropdown.tsx
apps/storefront/src/app/search/page.tsx
apps/storefront/src/components/search/SearchResults.tsx
apps/storefront/src/components/search/NoResults.tsx
apps/storefront/src/lib/search.mock.ts
apps/storefront/src/stores/search.ts (Zustand search store)
```

---

## API Endpoints
N/A — this task has no real API endpoints; all data is mocked

---

## UI Screens
- **Search Bar with Autocomplete Overlay** — global Navbar search with live dropdown suggestions
- **Search Results Page** — product grid with result count and active query heading
- **No Results State** — empty state with query echoed and browse prompts

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-060, TASK-061

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Storefront — Search/TASK-058 — Storefront · Search · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-24 | Task started and completed. Built search.mock.ts (12 products), Zustand search store, SearchBar, AutocompleteDropdown, SearchResults, NoResults, /search page. Integrated into Navbar overlay. Fixed navbar overlap on search page. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-24 | 2 | Full implementation — mock data, store, all components, page, Navbar integration |

---

## Review Notes
- **—**
