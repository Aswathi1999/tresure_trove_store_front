# TASK-053: Storefront — Customer Account Frontend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Athul |
| **Status** | ✅ Done |
| **Priority** | P1 |
| **Sprint** | Sprint 1 |
| **Story Points** | 3 |
| **PRD Reference** | harness/prd.md §account |
| **Architecture Ref** | harness/architecture.md |
| **Start Date** | 2026-04-23 |
| **Due Date** | — |
| **Created** | 2026-04-23 |
| **Completed** | 2026-04-23 |

---

## Description
Write Vitest + React Testing Library unit tests for all six customer account components built in TASK-050. Covers `OrderStatusBadge`, `AccountNav`, `ProfileForm`, `AddressForm`, `AddressBook`, and `WishlistGrid`. Tests were co-delivered with TASK-052 (integration testing) on the same branch and are now documented here as a standalone task.

---

## Sub Tasks
- [x] Write `OrderStatusBadge.test.tsx` — all 4 status variants
- [x] Write `AccountNav.test.tsx` — nav links, active states, sign-out flow
- [x] Write `ProfileForm.test.tsx` — read-only display, edit mode, validation, save, cancel
- [x] Write `AddressForm.test.tsx` — add/edit modes, field validation, PIN format, submit/cancel
- [x] Write `AddressBook.test.tsx` — CRUD operations, set-default, empty state
- [x] Write `WishlistGrid.test.tsx` — grid display, remove, empty state, product links
- [x] Verify `pnpm --filter=storefront test --run` passes with 0 failures in account suite

---

## Acceptance Criteria
- [x] All 6 account component unit test files exist under `apps/storefront/src/components/account/`
- [x] Every account component is covered: `OrderStatusBadge`, `AccountNav`, `ProfileForm`, `AddressForm`, `AddressBook`, `WishlistGrid`
- [x] 51 unit tests total across the 6 files — 0 failures
- [x] No `any` types in test files
- [x] All tests use `data-testid` selectors — no fragile class/role queries for account-specific assertions
- [x] `pnpm --filter=storefront test --run` reports 455 passed, 0 failed (excluding pre-existing `medusa.test.ts` build error)

---

## Technical Notes
- `ProfileForm.onSubmit` has a 600 ms artificial delay (`setTimeout`). Tests use `waitFor({ timeout: 3000 })` to handle the async state without coupling to internal timer implementation.
- `AddressBook` "Default" badge and "Set Default" button both contain the word "default". Tests assert on `data-testid="set-default-{id}"` presence/absence rather than text content to avoid false matches.
- `AccountNav` sign-out calls `logout()` server action then `router.push('/login')`. Tests mock both `@/lib/auth/actions` and `next/navigation`.
- The pre-existing `medusa.test.ts` failure (`@TreasureTrove/utils` package resolution) is a workspace build issue predating this task.

---

## Files Created
```
CREATED:
- apps/storefront/src/components/account/OrderStatusBadge.test.tsx
- apps/storefront/src/components/account/AccountNav.test.tsx
- apps/storefront/src/components/account/ProfileForm.test.tsx
- apps/storefront/src/components/account/AddressForm.test.tsx
- apps/storefront/src/components/account/AddressBook.test.tsx
- apps/storefront/src/components/account/WishlistGrid.test.tsx
```

---

## Test Coverage Added

**Unit tests — 51 cases (Vitest + RTL):**

- `OrderStatusBadge.test.tsx` — 4 tests: all 4 status variants render with correct testid and text
- `AccountNav.test.tsx` — 8 tests: all nav links + hrefs, active state logic, sign-out flow
- `ProfileForm.test.tsx` — 9 tests: read-only display, edit toggle, field pre-fill, email disabled, validation, save, cancel, data update
- `AddressForm.test.tsx` — 8 tests: add/edit titles, pre-fill, defaults, required validation, PIN regex, onSave/onCancel
- `AddressBook.test.tsx` — 11 tests: render cards, default badge, set-default, empty state, add, cancel, delete, edit, edit-save
- `WishlistGrid.test.tsx` — 11 tests: render items, names, prices, original price, no-image placeholder, product links, remove (hover + mobile), empty state

---

## Dependencies
- **Blocked by:** TASK-050 (Customer Account Frontend)
- **Blocks:** —

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-23 | Completed. 6 unit test files written covering all account components. 51 Vitest tests passing (0 failures). Tests co-delivered with TASK-052 e2e integration tests. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-23 | 1 | Unit test files for all 6 account components |

---

## Review Notes
- **—**
