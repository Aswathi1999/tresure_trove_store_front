# TASK-109: Medusa Admin · Orders · Frontend Unit Tests

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
Write unit tests for the custom Medusa Admin order timeline widget (`order-timeline.tsx`). Tests should verify that the widget correctly renders timeline events in chronological order, handles empty state gracefully, and formats timestamps and event labels accurately for each order status transition type.

---

## Sub Tasks
- [x] Tests for all 7 event types: order_placed, payment_captured, fulfillment_created, shipped, delivered, note, cancelled
- [x] Chronological sort — verify events appear in timestamp order
- [x] Timestamp formatting — verify formatted date strings render alongside event labels
- [x] Full lifecycle test — all event types visible in a single render
- [x] Loading state and fetch failure graceful handling
- [x] Notes fetch from `/admin/notes` API
- [x] Add Internal Note — submit, clear, in-flight state, error handling

---

## Acceptance Criteria
- [x] All 7 event label types render correctly based on order data
- [x] Events appear in chronological (ascending timestamp) order
- [x] Formatted timestamp (year/month visible) shown for each event
- [x] Full lifecycle: Order Placed → Payment Captured → Fulfillment Created → Shipped → Delivered renders in order
- [x] Cancelled order: Order Cancelled appears as the last event after it is set
- [x] 6-event count badge shows correctly for complete lifecycle + 1 note
- [x] Loading indicator shows before fetch resolves and hides after
- [x] Notes fetched from API are rendered as Note Added events with author name
- [x] Save Note POST sends correct payload (resource_id, resource_type, value)
- [x] 42 tests passing in the widget test suite

---

## Technical Notes
- Tests built on top of `order-timeline.test.tsx` created in TASK-108 (32 tests). TASK-109 added 10 more: timestamp formatting (4), full lifecycle scenarios (4), and event count badge/sort assertions.
- Widget tests require `@jest-environment jsdom` override — global `fetch` mocked per-test.
- Timestamp assertions use `/2026/` regex match rather than exact locale string to avoid timezone-dependent failures.
- `screen.getAllByRole('listitem')` used to assert chronological index ordering across events.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/__tests__/order-timeline.test.tsx   ← extended (+10 tests)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **order-timeline widget** — Medusa Admin order detail page, `order.details.side.before` zone

---

## Related Test Cases
- `order-timeline.test.tsx` — 42 tests total

## Dependencies
- **Blocked by:** TASK-106
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Orders/TASK-109 — Medusa Admin · Orders · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-05 | Completed. 32 widget tests were already written as part of TASK-108. Added 10 more tests specifically for TASK-109 acceptance criteria: timestamp formatting for all major event types (4 tests), full lifecycle all-7-events render (1 test), 6-event count badge (1 test), full chronological sort assertion (1 test), cancelled-as-last-event (1 test), plus 2 supporting tests. 42 tests total, all passing. Full backend suite: 630 tests across 29 suites. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-05 | 0.5 | Extended order-timeline test suite with timestamp and lifecycle tests |

---

## Review Notes
- **—**
