# TASK-052: Storefront — Customer Account Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athul |
| **Status** | ✅ Done |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Story Points** | 5 |
| **PRD Reference** | harness/prd.md §account |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-04-23 |
| **Due Date** | — |
| **Created** | 2026-04-23 |
| **Completed** | 2026-04-23 |

---

## Description
Write unit tests (Vitest + React Testing Library) for all customer account components, and Playwright e2e integration tests for all account pages. Covers the full account feature built in TASK-050: dashboard, orders, addresses, settings, wishlist, and account navigation. Also patches the account dashboard with an `account-session-state` testid required by the pre-existing login e2e spec.

---

## Sub Tasks
- [x] Write `OrderStatusBadge.test.tsx` — all 4 status variants
- [x] Write `AccountNav.test.tsx` — nav links, active states, sign-out flow
- [x] Write `ProfileForm.test.tsx` — read-only display, edit mode, validation, save, cancel
- [x] Write `AddressForm.test.tsx` — add/edit modes, field validation, PIN format, submit/cancel
- [x] Write `AddressBook.test.tsx` — CRUD operations, set-default, empty state
- [x] Write `WishlistGrid.test.tsx` — grid display, remove, empty state, product links
- [x] Write `e2e/account/helpers.ts` — shared `loginAndGoTo` and `assertRedirectsToLogin` utilities
- [x] Write `e2e/account/dashboard.spec.ts` — auth guard redirect, session state, summary cards
- [x] Write `e2e/account/orders.spec.ts` — order list, status badges, order detail page
- [x] Write `e2e/account/addresses.spec.ts` — add/edit/delete/set-default flows
- [x] Write `e2e/account/settings.spec.ts` — profile view/edit/validate/save
- [x] Write `e2e/account/wishlist.spec.ts` — grid display, remove, empty state
- [x] Write `e2e/account/navigation.spec.ts` — all nav links, sign-out with cookie verification
- [x] Patch `account/page.tsx` — add `account-session-state` testid

---

## Acceptance Criteria
- [x] All 6 account component unit test files exist and pass with zero failures
- [x] Every account component is tested: `OrderStatusBadge`, `AccountNav`, `ProfileForm`, `AddressForm`, `AddressBook`, `WishlistGrid`
- [x] E2e specs cover auth guard (redirect to `/login` when unauthenticated) for every account page
- [x] E2e specs cover CRUD flows for addresses and wishlist
- [x] E2e specs cover sign-out with `tt_session` cookie verification
- [x] `pnpm --filter=storefront test --run` shows 455 passing, 0 failed (excluding pre-existing `medusa.test.ts` build error)
- [x] No `any` types in test files
- [x] All tests use `data-testid` selectors — no fragile class/role queries for account-specific assertions

---

## Technical Notes
- `ProfileForm.onSubmit` has a 600 ms artificial delay (`setTimeout`). Tests avoid fake timers entirely and use `waitFor({ timeout: 3000 })` to handle the async state update without coupling to internal timer implementation.
- `AddressBook` "Default" badge text and "Set Default" button both contain the word "default". Tests assert on the presence/absence of `data-testid="set-default-{id}"` rather than `.toHaveTextContent(/default/i)` on the whole card to avoid false matches.
- `AccountNav` sign-out calls `logout()` server action then `router.push('/login')`. Tests mock both `@/lib/auth/actions` and `next/navigation` to verify both calls happen in order.
- E2e account tests share the `loginAndGoTo` helper which registers a unique user per test to avoid session conflicts between parallel runs.
- The pre-existing `medusa.test.ts` failure (`@TreasureTrove/utils` package resolution) is a workspace build issue predating this task and is not caused by these changes.

---

## Files Created / Modified
```
CREATED:
- apps/storefront/src/components/account/OrderStatusBadge.test.tsx
- apps/storefront/src/components/account/AccountNav.test.tsx
- apps/storefront/src/components/account/ProfileForm.test.tsx
- apps/storefront/src/components/account/AddressForm.test.tsx
- apps/storefront/src/components/account/AddressBook.test.tsx
- apps/storefront/src/components/account/WishlistGrid.test.tsx
- apps/storefront/e2e/account/helpers.ts
- apps/storefront/e2e/account/dashboard.spec.ts
- apps/storefront/e2e/account/orders.spec.ts
- apps/storefront/e2e/account/addresses.spec.ts
- apps/storefront/e2e/account/settings.spec.ts
- apps/storefront/e2e/account/wishlist.spec.ts
- apps/storefront/e2e/account/navigation.spec.ts

MODIFIED:
- apps/storefront/src/app/account/page.tsx  (added account-session-state testid)
```

---

## Test Coverage Added

**Unit tests — 55 new cases (Vitest + RTL):**

| File | Tests | What's covered |
|------|-------|----------------|
| `OrderStatusBadge.test.tsx` | 4 | All 4 status variants render with correct testid and text |
| `AccountNav.test.tsx` | 8 | All nav links + hrefs, active state logic, sign-out flow |
| `ProfileForm.test.tsx` | 9 | Read-only display, edit toggle, field pre-fill, email disabled, validation, save, cancel, data update |
| `AddressForm.test.tsx` | 8 | Add/Edit titles, pre-fill, defaults, required validation, PIN regex, onSave/onCancel |
| `AddressBook.test.tsx` | 11 | Render cards, default badge, set-default, empty state, add, cancel, delete, edit, edit-save |
| `WishlistGrid.test.tsx` | 11 | Render items, names, prices, original price, no-image placeholder, product links, remove (hover + mobile), empty state |

**E2e tests — ~50 cases (Playwright):**

| File | Tests | What's covered |
|------|-------|----------------|
| `dashboard.spec.ts` | 7 | Auth guard, dashboard render, session state, summary cards, recent orders, view-all link, nav presence |
| `orders.spec.ts` | 9 | Auth guard, orders list, all 4 mock rows, status badges, order row link, detail page render + content |
| `addresses.spec.ts` | 10 | Auth guard, address cards, default badge, add form, cancel, add submit, delete, set-default, edit form pre-fill, edit save |
| `settings.spec.ts` | 9 | Auth guard, settings render, read-only data, edit button, pre-fill, email disabled, validation, cancel, save + data update |
| `wishlist.spec.ts` | 7 | Auth guard, grid render, all 4 items, names, sale price, remove, product links, empty state |
| `navigation.spec.ts` | 7 | All nav links navigate correctly, sign-out clears cookie, post-signout redirect |

---

## Dependencies
- **Blocked by:** TASK-050 (Customer Account Frontend)
- **Blocks:** —

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-23 | Completed. 6 unit test files + 6 e2e spec files + helpers written. 455 Vitest tests passing (0 failures in account suite). ~50 Playwright e2e tests written covering all account pages and flows. Dashboard patched with `account-session-state` testid. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-23 | 2 | Unit tests + e2e specs + dashboard patch |

---

## Review Notes
- **—**
