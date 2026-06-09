# TASK-114: Medusa Admin · Inventory · Frontend

## Meta
| Field | Value |
|-------|-------|
| **Assignee** | Lijina-p |
| **Status** | ✅ Done |
| **Priority** | — |
| **Sprint** | Sprint 1 |
| **Story Points** | — |
| **PRD Reference** | — |
| **Architecture Ref** | — |
| **Start Date** | 2026-04-28 |
| **Due Date** | — |
| **Created** | 2026-04-09 |
| **Completed** | 2026-04-28 |

---

## Description
Configure and extend the Medusa Admin UI for inventory management across Treasure Trove product variants and stock locations. The built-in Medusa inventory module provides the inventory table and stock level views per variant SKU. This task covers enabling and verifying the built-in inventory UI, configuring low stock alert visibility via a custom admin widget, and ensuring multi-location inventory views are accessible and correctly labelled for Treasure Trove warehouse locations.

---

## Sub Tasks
- [x] Verify Medusa Admin built-in inventory UI is accessible at `/app/inventory`
- [x] Confirm inventory table displays all variant SKUs with current stock levels per location
- [x] Confirm stock location list is visible and correctly labelled in Admin UI
- [x] Build custom `inventory-alert.tsx` admin widget to surface low stock threshold alerts on the inventory detail page
- [x] Widget must display current stock level, configured low stock threshold, and a visual indicator (red/amber/green) per variant
- [x] Verify manual stock adjustment flow works via built-in Admin UI (adjust quantity per location)
- [x] Verify multi-location inventory view — stock levels per location shown per variant
- [x] Confirm all inventory UI interactions (search, filter by location, adjust stock) work end-to-end in local dev
- [x] Add `data-testid` attributes to custom widget interactive elements

---

## Acceptance Criteria
- [x] Inventory table at `/app/inventory` lists all product variants with SKU, stock quantity per location, and reserved quantity
- [x] Searching by SKU or product name filters the inventory table correctly
- [x] Selecting a variant opens the inventory detail view showing per-location stock levels
- [x] Custom low stock alert widget renders on the inventory detail page when stock is at or below the configured threshold
- [x] Widget displays a red indicator for out-of-stock, amber for low stock, and green for adequate stock
- [x] Manual stock adjustment modal allows incrementing or decrementing stock per location and saves correctly
- [x] Multi-location inventory view correctly shows separate stock rows per warehouse location
- [x] Custom widget has `data-testid` on the stock status badge and adjustment trigger
- [x] No console errors in Medusa Admin when viewing inventory pages

---

## Technical Notes
- Inventory module is built into Medusa v2 by default — no `medusa-config.ts` changes required.
- Widget reads `stocked_quantity`, `reserved_quantity`, `available_quantity` from the `AdminInventoryItem` API response.
- Low stock threshold stored in `inventory_item.metadata.low_stock_threshold` (default: 5). Updated via `POST /admin/inventory-items/:id`.
- Status logic: `available <= 0` → red (Out of Stock), `available <= threshold` → amber (Low Stock), `available > threshold` → green (In Stock).
- Brand colours applied: primary gold `#695e31`, brand orange `#B45A3C`, cream `#FAF6EE`, warm borders `#cdc6b7`.
- `data-testid` attributes: `stock-status-badge`, `low-stock-threshold-input`, `save-threshold-btn`.

---

## Files to Create/Modify
```
apps/backend/src/admin/widgets/inventory-alert.tsx   ← created
```

---

## API Endpoints
N/A — this task covers Admin UI configuration and custom widget; no new API routes

---

## UI Screens
- **—**

---

## Related Test Cases
—

## Dependencies
- **Blocked by:** None
- **Blocks:** TASK-116, TASK-117

---

## Claude Code Context
```
harness/claude.md
harness/tasks/Medusa Admin — Inventory/TASK-114 — Medusa Admin · Inventory · Frontend.md
harness/architecture.md
harness/prd.md
```

---

## Progress Log
| Date | Update |
|------|--------|
| 2026-04-28 | Completed. Verified built-in inventory UI at `/app/inventory` (SKU table, per-location stock, search, filter, manual adjustment, multi-location view). Built `inventory-alert.tsx` widget (zone: `inventory_item.details.side.before`) showing stocked/reserved/available counts, animated stock bar, red/amber/green status badge, configurable low stock threshold saved to item metadata via Admin API. `data-testid` on status badge, threshold input, and save button. Brand colours from UI reference: gold `#695e31`, orange `#B45A3C`, cream `#FAF6EE`. |

---

## Time Log
| Date | Hours | Note |
|------|-------|------|
| 2026-04-28 | 1 | Inventory alert widget |

---

## Review Notes
- **—**
