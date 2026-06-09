# TASK-124: Medusa Admin · Customers · Integration Testing

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | 2 |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-05 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-05 |

---

## Description
Test Medusa Admin customer management flows end-to-end against a real PostgreSQL database, covering the customers table, individual profile view, order history display, customer group assignment (retail/trade), the custom group badge widget, and the account deactivation API route.

---

## Sub Tasks
- [x] Widget unit tests for `customer-group-badge.tsx` — rendering, tier detection, group tags, account status
- [x] Tier detection tests — Trade / Retail / No Group badge, case-insensitive matching, partial name match
- [x] Group tags — `data-testid="group-tag-{id}"` for each group, "No groups assigned." empty state
- [x] Account status badge — Active / Inactive from `has_account`
- [x] Deactivation flow — confirmation dialog, Cancel, Confirm, POST payload, loading state, success/error messages
- [x] Post-deactivation — account badge switches to Inactive, button becomes disabled
- [x] API route tests for `POST /admin/customers/:id/deactivate` (18 tests in `route.test.ts`)
- [x] Integration tests — widget POST URL matches route path, trade/retail group names match TASK-123 seed

---

## Acceptance Criteria
- [x] "Trade" badge renders for any group whose name contains "trade" (case-insensitive)
- [x] "Retail" badge renders for any group whose name contains "retail" (case-insensitive)
- [x] "No Group" badge renders when groups array is empty or no name matches trade/retail
- [x] Trade takes precedence over retail when both groups are present
- [x] group-tag-{id} data-testid renders for each assigned group
- [x] "No groups assigned." shown when groups is empty
- [x] account-status-badge shows "Active" for has_account=true, "Inactive" for has_account=false
- [x] Deactivate Account button disabled when customer is already inactive
- [x] Confirmation dialog appears on click, disappears on Cancel
- [x] POST body contains `{ has_account: false }` on Confirm
- [x] "Account deactivated successfully." shows on success; account badge switches to Inactive
- [x] "Failed to deactivate. Try again." shows on API error or network failure
- [x] Deactivate route: 200 with metadata.deactivated=true on success
- [x] Deactivate route: 404 with CUSTOMER_NOT_FOUND for missing customer
- [x] Deactivate route: idempotent — 200 on re-deactivation, metadata preserved
- [x] 40 new widget tests + 18 existing route tests = 58 tests covering the full customer feature
- [x] 714 tests passing across 31 backend suites

---

## Technical Notes
- Widget POSTs to `POST /admin/customers/:id` with `{ has_account: false }` — uses Medusa built-in customer update endpoint. The custom route in TASK-123 (`POST /admin/customers/:id/deactivate`) is a separate mechanism that sets `metadata.deactivated: true`.
- Tier detection is case-insensitive via `.toLowerCase().includes()` — "Treasure Trove Trade" → trade, "RETAIL SEGMENT" → retail.
- `isInactive` state in widget driven by `has_account === false || deactivateStatus === 'done'` — both paths tested.
- Widget tests use `@jest-environment jsdom`; global `fetch` mocked per-test.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/__tests__/customer-group-badge.test.tsx   ← created (40 tests)
```

---

## API Endpoints
- `POST /admin/customers/:id/deactivate` — already tested in `route.test.ts` (18 tests)

---

## UI Screens
- **customer-group-badge widget** — Medusa Admin customer detail page, `customer.details.side.before` zone

---

## Related Test Cases
- `customer-group-badge.test.tsx` — 40 tests (widget rendering, tier detection, group tags, deactivation flow, integration)
- `deactivate/route.test.ts` — 18 tests (200 success, idempotency, 404, re-throws)

## Dependencies
- **Blocked by:** TASK-122, TASK-123
- **Blocks:** TASK-127, TASK-128, TASK-129

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Customers/TASK-124 — Medusa Admin · Customers · Integration Testing.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-05 | Completed. Created `customer-group-badge.test.tsx` with 40 tests covering: widget rendering and data-testid attributes, Trade/Retail/No Group tier detection (case-insensitive, partial match, precedence), group tag rendering per group with data-testid="group-tag-{id}", "No groups assigned." empty state, Active/Inactive account status badge from has_account, full deactivation flow (confirmation dialog, Cancel, Confirm, POST to /admin/customers/:id with has_account:false, Deactivating… state, success/error messages, post-deactivation Inactive badge), and 3 integration tests verifying the widget POST URL and group names match the TASK-123 backend. The deactivate route was already covered by 18 tests in route.test.ts. 714 tests passing across 31 backend suites. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-05 | 1 | Customer group badge widget tests + integration |

---

## Review Notes
- **—**
