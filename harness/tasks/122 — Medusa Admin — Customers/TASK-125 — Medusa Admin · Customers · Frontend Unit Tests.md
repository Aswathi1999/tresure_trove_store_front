# TASK-125: Medusa Admin · Customers · Frontend Unit Tests

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
Write unit tests for the custom `customer-group-badge.tsx` admin widget, verifying that the correct badge colour and label renders for retail customers, trade customers, and customers with no assigned group.

---

## Sub Tasks
- [x] "Trade" badge label renders for trade group customers
- [x] "Retail" badge label renders for retail group customers
- [x] "No Group" badge label renders for customers with no assigned group
- [x] Case-insensitive tier detection — partial name match, uppercase
- [x] Trade takes precedence over retail when both groups are present
- [x] `data-testid="customer-group-badge"` present and carries correct label
- [x] Tier description text correct per status (interior designer / standard retail / no group)

---

## Acceptance Criteria
- [x] "Trade" badge renders when any group name contains "trade" (case-insensitive)
- [x] "Retail" badge renders when any group name contains "retail" (case-insensitive)
- [x] "No Group" badge renders when groups array is empty or no name matches
- [x] Trade badge takes precedence when both trade and retail groups are present
- [x] Partial group name match works — e.g. "Treasure Trove Trade" → Trade
- [x] `customer-group-badge` data-testid verified on the badge element
- [x] 40 tests passing in the widget test suite

---

## Technical Notes
- All unit tests were written as part of TASK-124 (`customer-group-badge.test.tsx`). TASK-125 shares the same test file — no additional file needed.
- Badge colour testing is done via label text ("Trade", "Retail", "No Group") on the `customer-group-badge` element; exact CSS colour assertions are unreliable in jsdom.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/__tests__/customer-group-badge.test.tsx   ← created in TASK-124 (40 tests)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **customer-group-badge widget** — Medusa Admin customer detail page, `customer.details.side.before` zone

---

## Related Test Cases
- `customer-group-badge.test.tsx` — 40 tests

## Dependencies
- **Blocked by:** TASK-122
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Customers/TASK-125 — Medusa Admin · Customers · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-05 | Completed. All 40 widget unit tests written as part of TASK-124 cover the full TASK-125 scope: Trade/Retail/No Group badge label rendering, case-insensitive and partial-name tier detection, Trade precedence over Retail, tier description text per status, and all data-testid attributes. 40 tests passing. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-05 | 0 | Covered entirely by TASK-124 test file |

---

## Review Notes
- **—**
