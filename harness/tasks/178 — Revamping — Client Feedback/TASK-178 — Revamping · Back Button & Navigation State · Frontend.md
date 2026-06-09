# TASK-178: Revamping · Back Button & Navigation State · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | High |
| **Sprint** | Sprint 2 — Revamping |
| **Story Points** | — |
| **PRD Reference** | Client Feedback #1 |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-12 |
| **Due Date** | — |
| **Created** | 2026-05-12 |
| **Completed** | 2026-05-12 |

---

## Description
When a user navigates from a product listing page (e.g. search results for "lamp", filtered products, a collection page) to a product detail page, clicking the browser back button must return them to the exact same listing page with all state preserved — search query, applied filters, sort order, and scroll position. Currently, pressing back either redirects to the homepage or loses all browsing context (filters reset, scroll jumps to top, search term clears). This is a critical UX regression for an ecommerce platform.

The fix requires persisting navigation state (search params, scroll position, active filters) across route transitions using URL search params as the source of truth, combined with Next.js `scroll={false}` where applicable and `ScrollRestorer` for scroll position.

---

## Sub Tasks
- [ ] Audit all product listing pages (`/products`, `/collections/[handle]`, `/search`) — confirm all active filters, sort order, and search query are encoded in URL search params (not component state), so the URL fully represents the page state
- [ ] Fix `FilterSidebar.tsx` and `SortToolbar.tsx` — ensure filter and sort changes use `router.push` with updated search params rather than local `useState`, so the URL is always the source of truth
- [ ] Fix `SearchBar.tsx` and search page — ensure `q` param is preserved in URL so back navigation restores the search query automatically
- [ ] Verify `ScrollRestorer.tsx` is mounted in the root layout and correctly restores `scrollY` on back navigation for all listing pages
- [ ] Audit `Pagination.tsx` — ensure page number is a URL param (`?page=N`) not component state, so back navigation lands on the correct paginated page
- [ ] Add `scroll={false}` to all `<Link>` components that navigate from a listing card to a detail page, so Next.js does not reset scroll before the back-navigation restorer can act
- [ ] Test the full round-trip: apply filter → sort → paginate → click product → press back → verify all state is restored exactly
- [ ] Test on mobile (iOS Safari, Android Chrome) where back-navigation behaviour differs from desktop

---

## Acceptance Criteria
- [ ] Navigating to a PDP from search results and pressing back restores the search query, scroll position, and all applied filters exactly
- [ ] Navigating to a PDP from a filtered collection page and pressing back restores the collection, applied filters, sort order, and scroll position
- [ ] Paginated results are restored — user lands on page 3 (or whichever page they left) not page 1
- [ ] No redirect to homepage occurs on back navigation from any product or collection page
- [ ] URL search params are the single source of truth for all filter, sort, search, and page state — no duplicated local state
- [ ] `ScrollRestorer` correctly restores `scrollY` within 100ms of back navigation on both desktop and mobile
- [ ] TypeScript strict mode — no `any` types introduced
- [ ] No regressions in existing filter, sort, and search functionality

---

## Technical Notes
- All filter/sort/search state must live in URL params — never in `useState` — so Next.js router handles restoration automatically on back navigation
- Use `useSearchParams()` (read) and `router.replace()` (write) for filter mutations, not `router.push()`, to avoid polluting the browser history stack with every filter change
- `ScrollRestorer.tsx` at `apps/storefront/src/components/ui/ScrollRestorer.tsx` already exists — verify it is wired into `apps/storefront/src/app/layout.tsx`
- `scroll={false}` on `<Link>` tells Next.js not to scroll to top on navigation, letting the scroll restorer handle position on back

---

## Files to Create/Modify
```
apps/storefront/src/components/products/FilterSidebar.tsx       (modify — URL params as state)
apps/storefront/src/components/products/SortToolbar.tsx         (modify — URL params as state)
apps/storefront/src/components/products/Pagination.tsx          (verify — page param in URL)
apps/storefront/src/components/layout/SearchBar.tsx             (modify — preserve q param)
apps/storefront/src/components/products/ProductCard.tsx         (modify — scroll={false} on Link)
apps/storefront/src/components/ui/ScrollRestorer.tsx            (verify — wired in layout)
apps/storefront/src/app/layout.tsx                              (verify — ScrollRestorer mounted)
apps/storefront/src/app/products/page.tsx                       (verify — reads all params from URL)
apps/storefront/src/app/collections/[handle]/page.tsx           (verify — reads params from URL)
apps/storefront/src/app/search/page.tsx                         (verify — q param in URL)
```

---

## API Endpoints
N/A — this task is purely frontend routing and state management.

---

## UI Screens
- Product listing page → PDP → Back → restored listing page
- Search results page → PDP → Back → restored search results
- Collection page with filters → PDP → Back → restored collection + filters

---

## Related Test Cases
- E2E: `e2e/products/TC-018-products.spec.ts` — extend with back-navigation round-trip
- E2E: `e2e/search/TC-019-search.spec.ts` — extend with search → PDP → back
- E2E: `e2e/collections/TC-014-collections.spec.ts` — extend with filter → PDP → back

## Dependencies
- **Blocked by:** None
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/178 — Revamping — Client Feedback/TASK-178 — Revamping · Back Button & Navigation State · Frontend.md
harness/architecture.md
apps/storefront/src/components/products/FilterSidebar.tsx
apps/storefront/src/components/products/SortToolbar.tsx
apps/storefront/src/components/ui/ScrollRestorer.tsx
apps/storefront/src/app/layout.tsx
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-12 | Completed. Five files changed: (1) `FilterSidebar.tsx` — `router.push` → `router.replace` for filter and clear-all mutations; (2) `SortToolbar.tsx` — `router.push` → `router.replace` for sort changes; (3) `ProductCard.tsx` — added `scroll={false}` to Link; (4) `CollectionFilter.tsx` — fully migrated from Zustand store to URL params (`useSearchParams` + `router.replace`), local `draggingPrice` state for smooth slider UX with `useEffect` sync; (5) `CollectionProductGrid.tsx` — removed Zustand store dependency, reads `material` and `maxPrice` from URL params, added `scroll={false}` to all product Links. `ScrollRestorer.tsx` and `layout.tsx` were verified correct and needed no changes. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-12 | 0.5 | Implementation session with Claude Code |

---

## Review Notes
- **—**
