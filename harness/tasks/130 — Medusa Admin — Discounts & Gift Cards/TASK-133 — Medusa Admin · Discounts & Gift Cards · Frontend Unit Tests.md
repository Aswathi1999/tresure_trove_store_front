# TASK-133: Medusa Admin · Discounts & Gift Cards · Frontend Unit Tests

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | — |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | 1 |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-05-05 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-05-05 |

---

## Description
Unit tests for the custom Medusa Admin discount usage report widget (`discount-usage-report.tsx`), verifying that it correctly renders redemption counts, total discount values, and gift card liability from mocked API responses, and handles loading and empty states gracefully.

---

## Sub Tasks
- [x] Redemption counts render correctly from mocked promotions response
- [x] Total discount value calculated and displayed correctly (fixed-type only, paise→INR)
- [x] Gift card liability rendered correctly (active cards only, sum of balance)
- [x] Loading state shows "Loading…" and "—" dashes until fetch resolves
- [x] Empty state shows "No promotion codes found" when promotions array is empty
- [x] Error state renders error message when fetch fails

---

## Acceptance Criteria
- [x] Widget renders correct Total Redemptions count from mocked promotion usage_counts
- [x] Widget renders correct Discount Distributed in INR from fixed-type promotions only
- [x] Widget renders correct Gift Card Liability from non-disabled gift cards only
- [x] Loading indicators ("Loading…" / "—") shown while fetch is in flight
- [x] Empty state message shown when no promotions returned
- [x] Error message shown when fetch throws
- [x] 41 tests passing in the widget test suite

---

## Technical Notes
- All unit tests were written as part of TASK-132 (`discount-usage-report.test.tsx`). TASK-133 shares the same test file — no additional file needed.
- Widget has no `data` prop — tests mock `globalThis.fetch` directly with controlled promotion and gift card payloads.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/__tests__/discount-usage-report.test.tsx   ← created in TASK-132 (41 tests)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **discount-usage-report widget** — Medusa Admin promotions list page, `promotion.list.before` zone

---

## Related Test Cases
- `discount-usage-report.test.tsx` — 41 tests

## Dependencies
- **Blocked by:** TASK-130
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Discounts & Gift Cards/TASK-133 — Medusa Admin · Discounts & Gift Cards · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-05 | Completed. All 41 widget unit tests written as part of TASK-132 cover the full TASK-133 scope: redemption counts (sum, undefined treated as 0), discount distributed (fixed-only, INR formatting, excludes percentage/automatic), gift card liability (active-only sum, card count, excludes disabled), loading state ("Loading…" and "—" dashes), empty state ("No promotion codes found"), and error handling. 41 tests passing. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-05 | 0 | Covered entirely by TASK-132 test file |

---

## Review Notes
- **—**
