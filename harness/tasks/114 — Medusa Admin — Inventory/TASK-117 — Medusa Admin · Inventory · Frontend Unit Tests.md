# TASK-117: Medusa Admin · Inventory · Frontend Unit Tests

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
Write unit tests for the custom `inventory-alert.tsx` admin widget, covering correct rendering of stock status indicators (red/amber/green), threshold logic, and edge cases such as zero stock and missing threshold configuration.

---

## Sub Tasks
- [x] Status indicator tests — Out of Stock (red), Low Stock (amber), In Stock (green) label rendering
- [x] Threshold logic — boundary conditions (available = threshold, above, below)
- [x] Default threshold = 5 when metadata has no `low_stock_threshold`
- [x] Threshold from `item.metadata.low_stock_threshold` takes precedence
- [x] Edge case — zero stock triggers Out of Stock
- [x] Edge case — missing / null metadata falls back to default threshold
- [x] Edge case — `available_quantity` null falls back to `stocked − reserved`
- [x] Edge case — reserved exceeds stocked (available clamped to 0)
- [x] Alert message text for each status (restock / unit count / absent)
- [x] `data-testid` attributes: `stock-status-badge`, `low-stock-threshold-input`, `save-threshold-btn`

---

## Acceptance Criteria
- [x] "Out of Stock" badge renders when available_quantity is 0 or calculated available is 0
- [x] "Low Stock" badge renders when 0 < available ≤ threshold
- [x] "In Stock" badge renders when available > threshold
- [x] Default threshold of 5 used when metadata is null or missing the key
- [x] Threshold pre-filled from `metadata.low_stock_threshold` when set
- [x] Alert message absent for in_stock; restock message for out_of_stock; unit-count message for low_stock
- [x] stock bar shows 0% / 50% / 100% for the corresponding available/stocked ratios
- [x] All three `data-testid` attributes verified present on correct elements
- [x] 44 tests passing in the widget test suite

---

## Technical Notes
- All unit tests were written as part of TASK-116 (`inventory-alert.test.tsx`). TASK-117 shares the same test file — no additional file needed.
- Tests run under `@jest-environment jsdom`; global `fetch` mocked per-test for save-threshold scenarios.
- Color testing (red/amber/green) is done via label text ("Out of Stock", "Low Stock", "In Stock") on the `stock-status-badge` element rather than computed CSS, which is unreliable in jsdom.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/__tests__/inventory-alert.test.tsx   ← created in TASK-116 (44 tests)
```

---

## API Endpoints
N/A — this task has no API endpoints

---

## UI Screens
- **inventory-alert widget** — Medusa Admin inventory detail page, `inventory_item.details.side.before` zone

---

## Related Test Cases
- `inventory-alert.test.tsx` — 44 tests

## Dependencies
- **Blocked by:** TASK-114
- **Blocks:** None

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Inventory/TASK-117 — Medusa Admin · Inventory · Frontend Unit Tests.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-05-05 | Completed. All 44 widget unit tests written as part of TASK-116 cover the full TASK-117 scope: Out of Stock / Low Stock / In Stock status rendering, threshold boundary conditions, default threshold fallback, zero stock and missing metadata edge cases, available_quantity null fallback, alert messages per status, stock bar percentage, and all data-testid attributes. 44 tests passing. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-05-05 | 0 | Covered entirely by TASK-116 test file |

---

## Review Notes
- **—**
